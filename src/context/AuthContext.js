import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined); 

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser ?? null);
        });
        return unsub;
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
