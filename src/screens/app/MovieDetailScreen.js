import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Dimensions, StatusBar, ActivityIndicator, TouchableOpacity, View, } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, Clock, Calendar, Heart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMovieDetails, getImageUrl, ImageSizes } from '../../services/api';
import { useFavorites } from '../../context/FavoritesContext';

const { width: W, height: H } = Dimensions.get('window');
const BACKDROP_HEIGHT = H * 0.52;

// ─── Styled ─────────

const Root = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

const BackdropWrapper = styled.View`
    width: ${W}px;
    height: ${BACKDROP_HEIGHT}px;
`;

const BackdropImage = styled.Image`
    width: 100%;
    height: 100%;
`;

const BackdropPlaceholder = styled.View`
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.surface};
`;

// Botão voltar — topo esquerdo
const TopBar = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-horizontal: 16px;
`;

const CircleBtn = styled.TouchableOpacity`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: rgba(15, 17, 23, 0.7);
    align-items: center;
    justify-content: center;
`;

// Conteúdo abaixo do backdrop
const Content = styled.View`
    flex: 1;
    padding-horizontal: 20px;
    padding-top: 20px;
`;

const GenreRow = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
`;

const GenreBadge = styled.View`
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.full}px;
    padding-horizontal: 10px;
    padding-vertical: 4px;
`;

const GenreText = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyMedium};
    font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
`;

const MovieTitle = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.display};
    font-size: ${({ theme }) => theme.typography.fontSize.xxl + 4}px;
    line-height: 40px;
    margin-bottom: 16px;
`;

// Card de metadados (nota, duração, lançamento)
const MetaCard = styled.View`
    flex-direction: row;
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.lg}px;
    margin-bottom: 24px;
    overflow: hidden;
`;

const MetaItem = styled.View`
    flex: 1;
    align-items: center;
    padding-vertical: 14px;
    gap: 4px;
`;

const MetaDivider = styled.View`
    width: 1px;
    background-color: ${({ theme }) => theme.colors.border};
    margin-vertical: 12px;
`;

const MetaLabel = styled.Text`
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyMedium};
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
`;

const MetaValue = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.md}px;
`;

// Sinopse
const SectionLabel = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.lg}px;
    margin-bottom: 10px;
`;

const Synopsis = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    line-height: 24px;
`;

// Botão favoritar (único CTA da tela)
const FavButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 54px;
    border-radius: ${({ theme }) => theme.radius.full}px;
    margin-top: 28px;
    margin-bottom: 16px;
    background-color: ${({ isFav, theme }) =>
        isFav ? theme.colors.surfaceElevated : theme.colors.primary};
    border-width: ${({ isFav }) => (isFav ? '1.5px' : '0px')};
    border-color: ${({ isFav, theme }) =>
        isFav ? theme.colors.primary : 'transparent'};
    shadow-color: ${({ isFav, theme }) =>
        isFav ? 'transparent' : theme.colors.primary};
    shadow-offset: 0px 6px;
    shadow-opacity: 0.4;
    shadow-radius: 14px;
    elevation: ${({ isFav }) => (isFav ? 0 : 8)};
`;

const FavButtonText = styled.Text`
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.md}px;
    color: ${({ isFav, theme }) =>
        isFav ? theme.colors.primary : theme.colors.textOnPrimary};
`;

// ─── Helpers ──────────────

const fmt = {
    duration: (m) => !m ? '—' : `${Math.floor(m / 60)}h ${m % 60}m`,
    year: (d) => d?.substring(0, 4) ?? '—',
};

// ─── Component ─────────────

export default function MovieDetailScreen({ route, navigation }) {
    const { movie: routeMovie } = route.params;
    const insets = useSafeAreaInsets();
    const { favIds, toggleFavorite } = useFavorites();
    const [toggling, setToggling] = useState(false);
    const [movie, setMovie] = useState(routeMovie);

    const backdropUrl = getImageUrl(
        movie?.backdrop_path ?? movie?.poster_path,
        ImageSizes.backdrop.large
    );

    // ── Carrega detalhes completos ──────
    useEffect(() => {
        const load = async () => {
            try {
                const details = await getMovieDetails(routeMovie.id);
                setMovie(details);
            } catch (e) {
                console.error('Erro ao carregar detalhes:', e);
            }
        };
        load();
    }, [routeMovie.id]);

    // ── Toggle favorito no Firestore ────────
    const handleToggle = async () => {
        if (toggling) return;
        setToggling(true);
        try {
            await toggleFavorite(movie);
        } finally {
            setToggling(false);
        }
    };


    const rating = movie?.vote_average?.toFixed(1) || '—';
    const duration = fmt.duration(movie?.runtime);
    const year = fmt.year(movie?.release_date);
    const genres = movie?.genres?.slice(0, 3) || [];
    const synopsis =
        movie?.overview ||
        'Sinopse não disponível para este título.';
    const isFavorite = favIds.has(movie.id);

    return (
        <Root>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

                {/* Backdrop com gradiente */}
                <BackdropWrapper>
                    {backdropUrl ? (
                        <BackdropImage source={{ uri: backdropUrl }} resizeMode="cover" />
                    ) : (
                        <BackdropPlaceholder />
                    )}

                    {/* Gradiente escuro de baixo para cima */}
                    <LinearGradient
                        colors={['transparent', 'rgba(15,17,23,0.6)', '#0F1117']}
                        locations={[0, 0.6, 1]}
                        style={{
                            position: 'absolute',
                            left: 0, right: 0, bottom: 0,
                            height: BACKDROP_HEIGHT * 0.55,
                        }}
                    />

                    {/* Gradiente do topo para botões */}
                    <LinearGradient
                        colors={['rgba(15,17,23,0.7)', 'transparent']}
                        style={{
                            position: 'absolute',
                            left: 0, right: 0, top: 0,
                            height: 120,
                        }}
                    />

                    {/* Barra de navegação */}
                    <TopBar style={{ paddingTop: insets.top + 8 }}>
                        <CircleBtn onPress={() => navigation.goBack()}>
                            <ArrowLeft size={20} color="#fff" strokeWidth={2} />
                        </CircleBtn>
                        {/* Sem botão de compartilhar, conforme solicitado */}
                        <View style={{ width: 40 }} />
                    </TopBar>
                </BackdropWrapper>

                {/* Conteúdo principal */}
                <Content>
                    {/* Gêneros */}
                    {genres.length > 0 && (
                        <GenreRow>
                            {genres.map((g) => (
                                <GenreBadge key={g.id}>
                                    <GenreText>{g.name}</GenreText>
                                </GenreBadge>
                            ))}
                        </GenreRow>
                    )}

                    {/* Título */}
                    <MovieTitle>{movie?.title}</MovieTitle>

                    {/* Metadados */}
                    <MetaCard>
                        <MetaItem>
                            <Star size={16} color="#FFB300" fill="#FFB300" />
                            <MetaLabel>Nota</MetaLabel>
                            <MetaValue>{rating}</MetaValue>
                        </MetaItem>

                        <MetaDivider />

                        <MetaItem>
                            <Clock size={16} color="#E91E63" strokeWidth={2} />
                            <MetaLabel>Duração</MetaLabel>
                            <MetaValue>{duration}</MetaValue>
                        </MetaItem>

                        <MetaDivider />

                        <MetaItem>
                            <Calendar size={16} color="#E91E63" strokeWidth={2} />
                            <MetaLabel>Lançamento</MetaLabel>
                            <MetaValue>{year}</MetaValue>
                        </MetaItem>
                    </MetaCard>

                    {/* Sinopse */}
                    <SectionLabel>Sinopse</SectionLabel>
                    <Synopsis>{synopsis}</Synopsis>

                    {/* Botão de favoritar */}
                    <FavButton
                        isFav={isFavorite}
                        onPress={handleToggle}
                        disabled={toggling}
                        activeOpacity={0.85}
                    >
                        {toggling  ? (
                            <ActivityIndicator color={isFavorite ? '#E91E63' : '#fff'} />
                            ) : (
                            <>
                                <Heart
                                    size={20}
                                    color={isFavorite ? '#E91E63' : '#fff'}
                                    fill={isFavorite ? '#E91E63' : 'transparent'}
                                    strokeWidth={2}
                                />
                                <FavButtonText isFav={isFavorite}>
                                    {isFavorite ? 'Salvo nos favoritos' : 'Adicionar aos favoritos'}
                                </FavButtonText>
                            </>
                        )}
                    </FavButton>
                </Content>
            </ScrollView>
        </Root>
    );
}
