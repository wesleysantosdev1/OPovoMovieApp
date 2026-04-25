import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FlatList,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    Keyboard,
    StatusBar,
} from 'react-native';
import styled from 'styled-components/native';
import { Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';

import { getPopularMovies, searchMovies } from '../../services/api';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import MovieCard from '../../components/MovieCard';

const { width: SCREEN_W } = Dimensions.get('window');
const COLUMN_GAP = 8;
const H_PADDING = 16;
const CARD_WIDTH = (SCREEN_W - H_PADDING * 2 - COLUMN_GAP) / 2;

// ─── Styled ─────────────────────────────────────────────────────────────────

const Root = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
    padding-horizontal: ${H_PADDING}px;
    padding-bottom: 12px;
`;

const Greeting = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    margin-bottom: 2px;
`;

const Title = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.display};
    font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
    margin-bottom: 16px;
`;

const SearchRow = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.lg}px;
    padding-horizontal: 14px;
    height: 48px;
    border-width: 1.5px;
    border-color: ${({ focused, theme }) =>
        focused ? theme.colors.primary : 'transparent'};
`;

const SearchInput = styled.TextInput`
    flex: 1;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    margin-left: 10px;
`;

const ClearBtn = styled.TouchableOpacity`
    padding: 4px;
`;

const SectionRow = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-horizontal: ${H_PADDING}px;
    margin-top: 20px;
    margin-bottom: 12px;
`;

const SectionTitle = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
`;

const SectionCount = styled.Text`
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
`;

const EmptyContainer = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-top: 80px;
`;

const EmptyEmoji = styled.Text`
    font-size: 40px;
    margin-bottom: 12px;
`;

const EmptyText = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    text-align: center;
`;

const FooterLoader = styled.View`
    padding-vertical: 24px;
    align-items: center;
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [movies, setMovies] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [query, setQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searching, setSearching] = useState(false);

    const searchTimer = useRef(null);
    const isSearchMode = query.trim().length > 0;

    // ── Busca favoritos do usuário para marcar os corações ────────────────────
    useEffect(() => {
        if (!user) return;
        const loadFavorites = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const ids = (snap.data().favorites || []).map((f) =>
                        typeof f === 'object' ? f.id : f
                    );
                    setFavorites(new Set(ids));
                }
            } catch (e) {
                console.error('Erro ao carregar favoritos:', e);
            }
        };

        loadFavorites();
    }, [user]);

    // ── Carrega populares ─────────────────────────────────────────────────────
    const fetchPopular = useCallback(async (pageNum = 1) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const data = await getPopularMovies(pageNum);
            setTotalPages(data.total_pages);

            setMovies((prev) =>
                pageNum === 1 ? data.results : [...prev, ...data.results]
            );
        } catch (e) {
            console.error('Erro ao buscar populares:', e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchPopular(1);
    }, [fetchPopular]);

    // ── Busca por texto com debounce ──────────────────────────────────────────
    useEffect(() => {
        clearTimeout(searchTimer.current);

        if (!query.trim()) {
            setMovies([]);
            setPage(1);
            fetchPopular(1);
            return;
        }

        searchTimer.current = setTimeout(async () => {
            setSearching(true);
            try {
                const data = await searchMovies(query.trim());
                setMovies(data.results || []);
                setTotalPages(1); // busca não pagina nesta versão
            } catch (e) {
                console.error('Erro na busca:', e);
            } finally {
                setSearching(false);
            }
        }, 450);

        return () => clearTimeout(searchTimer.current);
    }, [query]);

    // ── Paginação (infinite scroll) ───────────────────────────────────────────
    const handleEndReached = () => {
        if (isSearchMode || loadingMore || page >= totalPages) return;
        const next = page + 1;
        setPage(next);
        fetchPopular(next);
    };

    // ── Toggle favorito ───────────────────────────────────────────────────────
    const handleFavoriteToggle = useCallback(
        async (movie) => {
            if (!user) return;

            const isFav = favorites.has(movie.id);
            const userRef = doc(db, 'users', user.uid);

            // Otimista: atualiza UI imediatamente
            setFavorites((prev) => {
                const next = new Set(prev);
                isFav ? next.delete(movie.id) : next.add(movie.id);
                return next;
            });

            try {
                await updateDoc(userRef, {
                    favorites: isFav ? arrayRemove(movie) : arrayUnion(movie),
                });
            } catch (e) {
                // Reverte em caso de erro
                setFavorites((prev) => {
                    const next = new Set(prev);
                    isFav ? next.add(movie.id) : next.delete(movie.id);
                    return next;
                });
                console.error('Erro ao atualizar favorito:', e);
            }
        },
        [user, favorites]
    );

    // ── Renderização ─────────────────────────────────────────────────────────
    const renderCard = useCallback(
        ({ item }) => (
            <MovieCard
                movie={item}
                isFavorite={favorites.has(item.id)}
                onPress={(m) => navigation.navigate('MovieDetail', { movie: m })}
                onFavoriteToggle={handleFavoriteToggle}
                style={{ width: CARD_WIDTH }}
            />
        ),
        [favorites, handleFavoriteToggle, navigation]
    );

    const ListHeader = (
        <>
        <SectionRow>
            <SectionTitle>
                {isSearchMode ? 'Resultados' : 'Populares agora'}
            </SectionTitle>
            <SectionCount>{movies.length} filmes</SectionCount>
        </SectionRow>
        </>
    );

    const firstName = user?.displayName?.split(' ')[0] || 'você';

    return (
        <Root>
            <StatusBar barStyle="light-content" />

            <FlatList
                data={movies}
                keyExtractor={(item) => String(item.id)}
                numColumns={2}
                renderItem={renderCard}
                columnWrapperStyle={{ paddingHorizontal: H_PADDING }}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.4}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                ListHeaderComponent={
                <>
                    {/* Header fixo acima da FlatList */}
                    <Header style={{ paddingTop: insets.top + 12 }}>
                        <Greeting>Olá, {firstName} 👋</Greeting>
                        <Title>O que assistir hoje?</Title>

                        {/* Barra de busca */}
                        <SearchRow focused={searchFocused}>
                            {searching ? (
                                <ActivityIndicator size="small" color="#E91E63" />
                                ) : (
                                <Search size={18} color={searchFocused ? '#E91E63' : '#5C6370'} strokeWidth={1.8} />
                            )}
                            <SearchInput
                                placeholder="Buscar filmes, gêneros..."
                                placeholderTextColor="#5C6370"
                                value={query}
                                onChangeText={setQuery}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                returnKeyType="search"
                                autoCorrect={false}
                            />
                            {query.length > 0 && (
                                <ClearBtn onPress={() => { setQuery(''); Keyboard.dismiss(); }}>
                                    <X size={16} color="#5C6370" strokeWidth={2} />
                                </ClearBtn>
                            )}
                        </SearchRow>
                    </Header>

                    {ListHeader}
                </>
                }
                ListEmptyComponent={
                    loading ? (
                        <EmptyContainer>
                            <ActivityIndicator size="large" color="#E91E63" />
                        </EmptyContainer>
                    ) : (
                        <EmptyContainer>
                            <EmptyEmoji>🎬</EmptyEmoji>
                            <EmptyText>Nenhum filme encontrado{'\n'}para "{query}"</EmptyText>
                        </EmptyContainer>
                    )
                }
                ListFooterComponent={
                    loadingMore ? (
                        <FooterLoader>
                            <ActivityIndicator size="small" color="#E91E63" />
                        </FooterLoader>
                    ) : null
                }
            />
        </Root>
    );
}
