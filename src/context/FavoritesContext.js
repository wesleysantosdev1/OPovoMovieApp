import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    setDoc,
    deleteDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [favIds, setFavIds]       = useState(new Set());
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        if (!user) {
            setFavorites([]);
            setFavIds(new Set());
            setLoading(false);
            return;
        }

        const colRef = collection(db, 'users', user.uid, 'favorites');

        const unsub = onSnapshot(
            colRef,
            (snap) => {
                const items = snap.docs.map((d) => d.data());
                setFavorites(items);
                setFavIds(new Set(items.map((m) => m.id)));
                setLoading(false);
            },
            (err) => {
                console.error('[Favorites] onSnapshot error:', err.message);
                setLoading(false);
            }
        );

        return unsub;
    }, [user]);

    const addFavorite = async (movie) => {
        if (!user) return;
        const payload = {
            id:           movie.id,
            title:        movie.title,
            poster_path:  movie.poster_path   ?? null,
            backdrop_path:movie.backdrop_path ?? null,
            overview:     movie.overview      ?? '',
            vote_average: movie.vote_average  ?? 0,
            release_date: movie.release_date  ?? '',
            runtime:      movie.runtime       ?? null,
            genres:       movie.genres?.map((g) => ({ id: g.id, name: g.name })) ?? [],
            savedAt:      serverTimestamp(),
        };
        await setDoc(
            doc(db, 'users', user.uid, 'favorites', String(movie.id)),
            payload
        );
    };

    const removeFavorite = async (movieId) => {
        if (!user) return;
        await deleteDoc(
            doc(db, 'users', user.uid, 'favorites', String(movieId))
        );
    };

    const toggleFavorite = async (movie) => {
        if (favIds.has(movie.id)) {
            await removeFavorite(movie.id);
        } else {
            await addFavorite(movie);
        }
    };

    return (
        <FavoritesContext.Provider
            value={{ favorites, favIds, loading, toggleFavorite, addFavorite, removeFavorite }}
        >
            {children}
        </FavoritesContext.Provider>
    );
    }

export function useFavorites() {
    return useContext(FavoritesContext);
}
