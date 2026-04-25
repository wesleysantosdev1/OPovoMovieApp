import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Pressable, Animated, View } from 'react-native';
import styled from 'styled-components/native';
import { Heart, Star } from 'lucide-react-native';
import { getImageUrl, ImageSizes } from '../services/api';

// ─── Styled Components ──────────────────────────────────────────────────────

const CARD_RADIUS = 12;

const Wrapper = styled.View`
    flex: 1;
    margin: ${({ theme }) => theme.spacing.xs}px;
`;

const PosterContainer = styled.View`
    border-radius: ${CARD_RADIUS}px;
    overflow: hidden;
    background-color: ${({ theme }) => theme.colors.surface};
    aspect-ratio: 2/3;
    ${({ theme }) => `
        shadow-color: #000;
        shadow-offset: 0px 6px;
        shadow-opacity: 0.4;
        shadow-radius: 10px;
        elevation: 8;
    `}
`;

const PosterImage = styled.Image`
    width: 100%;
    height: 100%;
`;

const PosterPlaceholder = styled.View`
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.surfaceElevated};
    align-items: center;
    justify-content: center;
`;

const PlaceholderText = styled.Text`
    font-size: 32px;
`;

// Badge de nota — topo esquerdo
const RatingBadge = styled.View`
    position: absolute;
    top: 8px;
    left: 8px;
    flex-direction: row;
    align-items: center;
    background-color: rgba(15, 17, 23, 0.80);
    border-radius: 20px;
    padding: 4px 8px;
    gap: 3px;
`;

const RatingText = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
    letter-spacing: 0.2px;
`;

// Botão de coração — topo direito
const HeartButton = styled.Pressable`
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: rgba(15, 17, 23, 0.80);
    align-items: center;
    justify-content: center;
`;

// Título abaixo do poster
const TitleContainer = styled.View`
    margin-top: 6px;
    padding-horizontal: 2px;
`;

const Title = styled.Text.attrs({ numberOfLines: 2 })`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyMedium};
    font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
    line-height: 18px;
`;

// ─── Component ──────────────────────────────────────────────────────────────

const MovieCard = ({
    movie,
    onPress,
    isFavorite = false,
    onFavoriteToggle,
    style,
}) => {
    const [heartScale] = useState(new Animated.Value(1));
    const [imageError, setImageError] = useState(false);

    const posterUrl = getImageUrl(movie?.poster_path, ImageSizes.poster.medium);
    const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : '—';

    const handleHeartPress = useCallback(() => {
    // Animação de "pulse" no coração
    Animated.sequence([
        Animated.spring(heartScale, {
            toValue: 1.35,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }),
        Animated.spring(heartScale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 8,
        }),
    ]).start();

    onFavoriteToggle?.(movie);
    }, [movie, onFavoriteToggle, heartScale]);

    return (
        <Wrapper style={style}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPress?.(movie)}
            >
                <PosterContainer>
                    {posterUrl && !imageError ? (
                        <PosterImage
                        source={{ uri: posterUrl }}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                        />
                    ) : (
                        <PosterPlaceholder>
                            <PlaceholderText>🎬</PlaceholderText>
                        </PosterPlaceholder>
                    )}

                    {/* Badge de nota */}
                    <RatingBadge>
                        <Star size={10} color="#FFB300" fill="#FFB300" />
                        <RatingText>{rating}</RatingText>
                    </RatingBadge>

                    {/* Botão de favorito */}
                    <HeartButton onPress={handleHeartPress} hitSlop={8}>
                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <Heart
                                size={15}
                                color={isFavorite ? '#E91E63' : '#FFFFFF'}
                                fill={isFavorite ? '#E91E63' : 'transparent'}
                                strokeWidth={2}
                            />
                        </Animated.View>
                    </HeartButton>
                </PosterContainer>

                {/* Título */}
                <TitleContainer>
                    <Title>{movie?.title || movie?.name || '—'}</Title>
                </TitleContainer>
            </TouchableOpacity>
        </Wrapper>
    );
};

export default MovieCard;
