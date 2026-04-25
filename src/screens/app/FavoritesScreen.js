import React, { useEffect, useState } from 'react';
import {
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import styled from 'styled-components/native';
import { Heart, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onSnapshot, doc, updateDoc, arrayRemove } from 'firebase/firestore';

import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl, ImageSizes } from '../../services/api';

// ─── Styled ──────────────────────────────────────────────────────────────────

const Root = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
    padding-horizontal: 20px;
    padding-bottom: 16px;
`;

const BadgeRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
`;

const Badge = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 6px;
    background-color: ${({ theme }) => theme.colors.primaryGlow};
    border-radius: ${({ theme }) => theme.radius.full}px;
    padding-horizontal: 12px;
    padding-vertical: 5px;
`;

const BadgeText = styled.Text`
    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyMedium};
    font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
    letter-spacing: 1px;
    text-transform: uppercase;
`;

const PageTitle = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.display};
    font-size: ${({ theme }) => theme.typography.fontSize.xxxl}px;
    margin-bottom: 4px;
`;

const Subtitle = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
`;

// Card de favorito (linha horizontal)
const Card = styled.TouchableOpacity`
    flex-direction: row;
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.lg}px;
    margin-horizontal: 20px;
    margin-bottom: 12px;
    overflow: hidden;
`;

const PosterThumb = styled.Image`
    width: 80px;
    height: 120px;
`;

const PosterPlaceholder = styled.View`
    width: 80px;
    height: 120px;
    background-color: ${({ theme }) => theme.colors.surfaceElevated};
    align-items: center;
    justify-content: center;
`;

const PlaceholderEmoji = styled.Text`
    font-size: 24px;
`;

const CardBody = styled.View`
    flex: 1;
    padding: 14px 12px;
    justify-content: space-between;
`;

const CardTitle = styled.Text.attrs({ numberOfLines: 2 })`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.md}px;
    margin-bottom: 6px;
    flex-shrink: 1;
`;

const CardOverview = styled.Text.attrs({ numberOfLines: 2 })`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
    line-height: 18px;
    flex: 1;
`;

const CardMeta = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
`;

const CardMetaLeft = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

const StarRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 4px;
`;

const StarText = styled.Text`
    color: ${({ theme }) => theme.colors.star};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
`;

const YearText = styled.Text`
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
`;

const RemoveBtn = styled.TouchableOpacity`
    padding: 4px;
`;

// Empty state
const EmptyWrapper = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-horizontal: 40px;
`;

const EmptyEmoji = styled.Text`
    font-size: 52px;
    margin-bottom: 16px;
`;

const EmptyTitle = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
    text-align: center;
    margin-bottom: 8px;
`;

const EmptySubtitle = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    text-align: center;
    line-height: 22px;
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function FavoritesScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Listener em tempo real do Firestore ───────────────────────────────────
    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const unsub = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const favs = snap.data().favorites || [];
                // Filtra apenas objetos válidos (ignora IDs avulsos)
                setFavorites(favs.filter((f) => typeof f === 'object' && f.id));
            } else {
                setFavorites([]);
            }
            setLoading(false);
        });

        return unsub;
    }, [user]);

    // ── Remove favorito ───────────────────────────────────────────────────────
    const handleRemove = async (movie) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                favorites: arrayRemove(movie),
            });
        } catch (e) {
            console.error('Erro ao remover favorito:', e);
        }
    };

    // ── Renderização do card ──────────────────────────────────────────────────
    const renderItem = ({ item }) => {
        const posterUrl = getImageUrl(item.poster_path, ImageSizes.poster.small);
        const rating = item.vote_average?.toFixed(1) || '—';
        const year = item.release_date?.substring(0, 4) || '—';

        return (
        <Card
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MovieDetail', { movie: item })}
        >
            {posterUrl ? (
                <PosterThumb source={{ uri: posterUrl }} resizeMode="cover" />
                ) : (
                <PosterPlaceholder>
                    <PlaceholderEmoji>🎬</PlaceholderEmoji>
                </PosterPlaceholder>
            )}

            <CardBody>
                <CardTitle>{item.title}</CardTitle>
                <CardOverview>{item.overview || 'Sem sinopse disponível.'}</CardOverview>

                <CardMeta>
                    <CardMetaLeft>
                        <StarRow>
                            {/* Star icon inline */}
                            <StarText>★ {rating}</StarText>
                        </StarRow>
                        <YearText>{year}</YearText>
                    </CardMetaLeft>

                    <RemoveBtn
                        onPress={() => handleRemove(item)}
                        hitSlop={8}
                    >
                        <Heart size={18} color="#E91E63" fill="#E91E63" strokeWidth={2} />
                    </RemoveBtn>
                </CardMeta>
            </CardBody>
        </Card>
        );
    };

    return (
        <Root>
            <StatusBar barStyle="light-content" />

            <FlatList
                data={favorites}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
                ListHeaderComponent={
                    <Header style={{ paddingTop: insets.top + 12 }}>
                        <BadgeRow>
                            <Badge>
                                <Heart size={11} color="#E91E63" fill="#E91E63" />
                                <BadgeText>Sua Coleção</BadgeText>
                            </Badge>
                        </BadgeRow>
                        <PageTitle>Favoritos</PageTitle>
                        <Subtitle>
                        {favorites.length > 0
                            ? `${favorites.length} ${favorites.length === 1 ? 'filme salvo' : 'filmes salvos'} para assistir depois.`
                            : 'Sua lista está vazia.'}
                        </Subtitle>
                    </Header>
                }
                ListEmptyComponent={
                    loading ? (
                        <EmptyWrapper>
                            <ActivityIndicator size="large" color="#E91E63" />
                        </EmptyWrapper>
                    ) : (
                        <EmptyWrapper>
                            <EmptyEmoji>🍿</EmptyEmoji>
                            <EmptyTitle>Nenhum favorito ainda</EmptyTitle>
                            <EmptySubtitle>
                                Explore os filmes e toque no coração para salvar aqui.
                            </EmptySubtitle>
                        </EmptyWrapper>
                    )
                }
            />
        </Root>
    );
}
