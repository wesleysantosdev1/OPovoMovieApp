import React, { useState } from 'react';
import { Alert, ActivityIndicator, StatusBar } from 'react-native';
import styled from 'styled-components/native';
import { LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';

import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

// ─── Styled ──────────────────────────────────────────────────────────────────

const Root = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

const Inner = styled.View`
    flex: 1;
    align-items: center;
    padding-horizontal: 24px;
`;

// Avatar com iniciais
const AvatarRing = styled.View`
    width: 100px;
    height: 100px;
    border-radius: 50px;
    padding: 3px;
    background-color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 16px;
    shadow-color: ${({ theme }) => theme.colors.primary};
    shadow-offset: 0px 6px;
    shadow-opacity: 0.5;
    shadow-radius: 16px;
    elevation: 12;
`;

const AvatarInner = styled.View`
    flex: 1;
    border-radius: 47px;
    background-color: ${({ theme }) => theme.colors.primaryDark};
    align-items: center;
    justify-content: center;
`;

const AvatarInitials = styled.Text`
    color: #ffffff;
    font-family: ${({ theme }) => theme.typography.fontFamily.display};
    font-size: ${({ theme }) => theme.typography.fontSize.xxl}px;
`;

const UserName = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.xl}px;
    margin-bottom: 4px;
    text-align: center;
`;

const UserEmail = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    margin-bottom: 40px;
    text-align: center;
`;

const Divider = styled.View`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.divider};
    margin-bottom: 40px;
`;

// Botão de sair
const SignOutButton = styled.TouchableOpacity`
    width: 100%;
    height: 54px;
    border-radius: ${({ theme }) => theme.radius.full}px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background-color: rgba(233, 30, 99, 0.12);
    border-width: 1.5px;
    border-color: ${({ theme }) => theme.colors.primary};
`;

const SignOutText = styled.Text`
    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.md}px;
`;

const AppVersion = styled.Text`
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
    text-align: center;
    margin-top: auto;
    margin-bottom: 16px;
    letter-spacing: 0.5px;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
    const email = user?.email || '';
    const initials = getInitials(displayName);

    const handleSignOut = () => {
        Alert.alert(
        'Sair da conta',
        'Tem certeza que deseja encerrar a sessão?',
        [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    setLoggingOut(true);
                    try {
                        await signOut(auth);
                    // onAuthStateChanged no navigation/index.js redireciona para Login
                    } catch (e) {
                        Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
                        setLoggingOut(false);
                    }
                },
            },
        ]
        );
    };

    return (
        <Root>
        <StatusBar barStyle="light-content" />

            <Inner style={{ paddingTop: insets.top + 40 }}>

                {/* Avatar */}
                <AvatarRing>
                    <AvatarInner>
                        <AvatarInitials>{initials}</AvatarInitials>
                    </AvatarInner>
                </AvatarRing>

                {/* Info do usuário */}
                <UserName>{displayName}</UserName>
                <UserEmail>{email}</UserEmail>

                <Divider />

                {/* Botão de sair */}
                <SignOutButton
                    onPress={handleSignOut}
                    disabled={loggingOut}
                    activeOpacity={0.8}
                >
                    {loggingOut ? (
                        <ActivityIndicator color="#E91E63" />
                    ) : (
                        <>
                            <LogOut size={20} color="#E91E63" strokeWidth={2} />
                            <SignOutText>Sair da conta</SignOutText>
                        </>
                    )}
                </SignOutButton>

                {/* Versão do app */}
                <AppVersion>CINEMA · v1.0 · Protótipo visual</AppVersion>
            </Inner>
        </Root>
    );
}
