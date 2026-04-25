import axios from 'axios';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_KEY || 'SUA_CHAVE_TMDB_AQUI';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';


export const ImageSizes = {
    poster: {
        small: 'w185',
        medium: 'w342',
        large: 'w500',
        original: 'original',
    },
    backdrop: {
        small: 'w300',
        medium: 'w780',
        large: 'w1280',
        original: 'original',
    },
    profile: {
        small: 'w45',
        medium: 'w185',
        large: 'h632',
        original: 'original',
    },
    };

    export const getImageUrl = (path, size = 'w500') => {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
};


const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    params: {
        api_key: TMDB_API_KEY,
        language: 'pt-BR',
        region: 'BR',
    },
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
        error.response?.data?.status_message ||
        error.message ||
        'Erro desconhecido';
        console.error('[API Error]', message, error.config?.url);
        return Promise.reject(new Error(message));
    }
);


// ENDPOINTS DE FILMES
/**
 *  Busca filmes populares
 *  @param {number} page 
 */
export const getPopularMovies = async (page = 1) => {
    const { data } = await api.get('/movie/popular', { params: { page } });
    return data; 
};

/**
 *  Busca filmes em cartaz
 *  @param {number} page
 */
export const getNowPlayingMovies = async (page = 1) => {
    const { data } = await api.get('/movie/now_playing', { params: { page } });
    return data;
};

/**
 *  Busca filmes mais bem avaliados
 *  @param {number} page
 */
export const getTopRatedMovies = async (page = 1) => {
    const { data } = await api.get('/movie/top_rated', { params: { page } });
    return data;
};

/**
 * Busca filmes em tendência (semana)
 */
export const getTrendingMovies = async () => {
    const { data } = await api.get('/trending/movie/week');
    return data;
};

/** 
 *  Busca detalhes completos de um filme
 *  @param {number|string} movieId
 */
export const getMovieDetails = async (movieId) => {
    const { data } = await api.get(`/movie/${movieId}`, {
        params: { append_to_response: 'credits,videos,similar,release_dates' },
    });
    return data;
};

/**
 * Busca filmes por texto
 *  @param {string} query 
 *  @param {number} page
 */
export const searchMovies = async (query, page = 1) => {
    if (!query || query.trim().length < 2) return { results: [], total_results: 0 };
    const { data } = await api.get('/search/movie', {
        params: { query: query.trim(), page, include_adult: false },
    });
    return data;
};

/**
 *  Busca filmes por gênero
 *  @param {number} genreId
 *  @param {number} page
 */
export const getMoviesByGenre = async (genreId, page = 1) => {
    const { data } = await api.get('/discover/movie', {
        params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
        },
    });
    return data;
};

/**
 * Busca lista de gêneros disponíveis
 */
export const getGenres = async () => {
    const { data } = await api.get('/genre/movie/list');
    return data.genres; 
};

/**
 *  Busca filmes similares
 *  @param {number|string} movieId
 *  @param {number} page
 */
export const getSimilarMovies = async (movieId, page = 1) => {
    const { data } = await api.get(`/movie/${movieId}/similar`, { params: { page } });
    return data;
};

export default api;
