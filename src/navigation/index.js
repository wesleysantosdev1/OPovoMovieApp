import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { Film, Heart, User } from 'lucide-react-native';

import { auth } from '../config/firebase';
import theme from '../theme/theme';

// ─── Screens ───────────────────────────────────────────────────────────────
// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// App
import HomeScreen from '../screens/app/HomeScreen';
import FavoritesScreen from '../screens/app/FavoritesScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import MovieDetailScreen from '../screens/app/MovieDetailScreen';

// ─── Navigators ────────────────────────────────────────────────────────────
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Auth Navigator ─────────────────────────────────────────────────────────
function AuthNavigator() {
    return (
        <AuthStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: theme.colors.background },
        }}
        >
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

// ─── Bottom Tabs ────────────────────────────────────────────────────────────
function BottomTabs() {
    return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
            backgroundColor: theme.colors.tabBarBackground,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
            },
            tabBarActiveTintColor: theme.colors.tabBarActive,
            tabBarInactiveTintColor: theme.colors.tabBarInactive,
            tabBarLabelStyle: {
            fontSize: theme.typography.fontSize.xs,
            fontFamily: theme.typography.fontFamily.bodyMedium,
            marginTop: 2,
            },
            tabBarIcon: ({ color, size, focused }) => {
            const iconSize = focused ? size + 2 : size;

            if (route.name === 'FilmesTab') {
                return <Film size={iconSize} color={color} strokeWidth={focused ? 2.5 : 1.8} />;
            }
            if (route.name === 'FavoritosTab') {
                return (
                    <Heart
                        size={iconSize}
                        color={color}
                        strokeWidth={focused ? 2.5 : 1.8}
                        fill={focused ? color : 'transparent'}
                    />
                );
            }
            if (route.name === 'PerfilTab') {
                return <User size={iconSize} color={color} strokeWidth={focused ? 2.5 : 1.8} />;
            }
            },
        })}
        >
            <Tab.Screen
                name="FilmesTab"
                component={HomeScreen}
                options={{ tabBarLabel: 'Filmes' }}
            />
            <Tab.Screen
                name="FavoritosTab"
                component={FavoritesScreen}
                options={{ tabBarLabel: 'Favoritos' }}
            />
            <Tab.Screen
                name="PerfilTab"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Perfil' }}
            />
        </Tab.Navigator>
    );
}

// ─── App Navigator (Stack com Tabs + Detail) ────────────────────────────────
function AppNavigator() {
    return (
        <AppStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.background },
            }}
        >
            <AppStack.Screen name="MainTabs" component={BottomTabs} />
            <AppStack.Screen
                name="MovieDetail"
                component={MovieDetailScreen}
                options={{
                    animation: 'slide_from_bottom',
                    presentation: 'transparentModal',
                }}
            />
        </AppStack.Navigator>
    );
}

// ─── Loading Splash ─────────────────────────────────────────────────────────
function LoadingScreen() {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );
}

// ─── Root Navigator ─────────────────────────────────────────────────────────
export default function RootNavigation() {
    const [user, setUser] = useState(null); 

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log("USUÁRIO ATUAL:", firebaseUser ? "Logado" : "Deslogado");
            setUser(firebaseUser ?? null); // null = não autenticado
        });
        console.log("Firebase respondeu!")
        return unsubscribe;
    }, []);

    if (user === undefined) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                primary: theme.colors.primary,
                background: theme.colors.background,
                card: theme.colors.surface,
                text: theme.colors.textPrimary,
                border: theme.colors.border,
                notification: theme.colors.primary,
                },
                fonts: theme.fonts,
            }}
        >
            {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

// ─── Route Names (para tipagem e uso nas screens) ────────────────────────────
export const Routes = {
    // Auth
    Login: 'Login',
    Register: 'Register',

    // App
    MainTabs: 'MainTabs',
    MovieDetail: 'MovieDetail',

    // Tabs
    FilmesTab: 'FilmesTab',
    FavoritosTab: 'FavoritosTab',
    PerfilTab: 'PerfilTab',
};
