import React, { useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, View, ActivityIndicator, Alert, StatusBar, } from 'react-native';
import styled from 'styled-components/native';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

// ─── Styled Components (compartilha o mesmo vocabulário do Login) ────────────

const Root = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

const BackdropImage = styled.Image`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    width: 100%;
    opacity: 0.45;
`;

const Inner = styled.View`
    flex: 1;
    padding-horizontal: ${({ theme }) => theme.spacing.screen}px;
    padding-top: 220px;
`;

const LogoRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
`;

const LogoBox = styled.View`
    width: 32px;
    height: 32px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 6px;
    align-items: center;
    justify-content: center;
`;

const LogoEmoji = styled.Text`
    font-size: 16px;
`;

const LogoText = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.md}px;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.widest}px;
`;

const Headline = styled.Text`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.display};
    font-size: ${({ theme }) => theme.typography.fontSize.xxxl}px;
    line-height: 44px;
    margin-bottom: 6px;
`;

const HeadlineAccent = styled.Text`
    color: ${({ theme }) => theme.colors.primary};
`;

const Subtitle = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    margin-bottom: 32px;
`;

const ToggleContainer = styled.View`
    flex-direction: row;
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.full}px;
    padding: 4px;
    margin-bottom: 28px;
`;

const ToggleBtn = styled.TouchableOpacity`
    flex: 1;
    padding-vertical: 10px;
    border-radius: ${({ theme }) => theme.radius.full}px;
    align-items: center;
    background-color: ${({ active, theme }) =>
        active ? theme.colors.primary : 'transparent'};
`;

const ToggleBtnText = styled.Text`
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyMedium};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    color: ${({ active, theme }) =>
        active ? theme.colors.textOnPrimary : theme.colors.textSecondary};
`;

const InputLabel = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyMedium};
    font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.widest}px;
    margin-bottom: 8px;
`;

const InputRow = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.lg}px;
    padding-horizontal: 16px;
    height: 54px;
    border-width: 1.5px;
    border-color: ${({ focused, theme }) =>
        focused ? theme.colors.primary : 'transparent'};
    margin-bottom: 16px;
`;

const StyledInput = styled.TextInput`
    flex: 1;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.base}px;
    margin-left: 10px;
`;

const EyeBtn = styled.TouchableOpacity`
    padding: 4px;
`;

const PrimaryButton = styled.TouchableOpacity`
    height: 54px;
    border-radius: ${({ theme }) => theme.radius.full}px;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.primary};
    margin-top: 4px;
    margin-bottom: 20px;
    shadow-color: ${({ theme }) => theme.colors.primary};
    shadow-offset: 0px 6px;
    shadow-opacity: 0.4;
    shadow-radius: 14px;
    elevation: 10;
`;

const PrimaryButtonText = styled.Text`
    color: ${({ theme }) => theme.colors.textOnPrimary};
    font-family: ${({ theme }) => theme.typography.fontFamily.bodyBold};
    font-size: ${({ theme }) => theme.typography.fontSize.md}px;
    letter-spacing: 0.3px;
`;

const LegalText = styled.Text`
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.xs}px;
    text-align: center;
    line-height: 17px;
    margin-bottom: 32px;
`;

const LegalLink = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration-line: underline;
`;

// ─── Component ───────

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [nameFocused, setNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const [loading, setLoading] = useState(false);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleRegister = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'Informe seu nome.');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Atenção', 'Informe seu e-mail.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Atenção', 'A senha precisa ter no mínimo 6 caracteres.');
            return;
        }

        Keyboard.dismiss();
        setLoading(true);

        try {
        // 1. Cria o usuário no Firebase Auth
        const { user } = await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );

        // 2. Atualiza o displayName no perfil Auth
        await updateProfile(user, { displayName: name.trim() });

        // 3. Cria documento do usuário no Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            favorites: [],
            createdAt: serverTimestamp(),
        });

        // onAuthStateChanged no navigator redireciona automaticamente
        } catch (error) {
            const messages = {
                'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
                'auth/invalid-email': 'E-mail inválido.',
                'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
                'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
            };
            Alert.alert('Erro ao cadastrar', messages[error.code] || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Root>
            <StatusBar barStyle="light-content" />

            <BackdropImage
                source={{ uri: 'https://image.tmdb.org/t/p/w780/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg' }}
                resizeMode="cover"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Inner>
                            <LogoRow>
                                <LogoBox>
                                    <LogoEmoji>🎬</LogoEmoji>
                                </LogoBox>
                                <LogoText>CINEMA</LogoText>
                            </LogoRow>

                            <Headline>
                                Filmes que{' '}
                                <HeadlineAccent>marcam</HeadlineAccent>
                                {'\n'}a vida.
                            </Headline>
                            <Subtitle>Crie sua conta e descubra novos filmes.</Subtitle>

                            
                            <ToggleContainer>
                                <ToggleBtn
                                active={false}
                                onPress={() => navigation.navigate('Login')}
                                >
                                    <ToggleBtnText active={false}>Entrar</ToggleBtnText>
                                </ToggleBtn>
                                
                                <ToggleBtn active={true}>
                                    <ToggleBtnText active={true}>Cadastrar</ToggleBtnText>
                                </ToggleBtn>
                            </ToggleContainer>

                            <InputLabel>NOME</InputLabel>
                            <InputRow focused={nameFocused}>
                                <User
                                    size={18}
                                    color={nameFocused ? '#E91E63' : '#5C6370'}
                                    strokeWidth={1.8}
                                />
                                <StyledInput
                                    placeholder="Seu nome"
                                    placeholderTextColor="#5C6370"
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    value={name}
                                    onChangeText={setName}
                                    onFocus={() => setNameFocused(true)}
                                    onBlur={() => setNameFocused(false)}
                                    onSubmitEditing={() => emailRef.current?.focus()}
                                />
                            </InputRow>

                            <InputLabel>E-MAIL</InputLabel>
                            <InputRow focused={emailFocused}>
                                <Mail
                                    size={18}
                                    color={emailFocused ? '#E91E63' : '#5C6370'}
                                    strokeWidth={1.8}
                                />
                                <StyledInput
                                    ref={emailRef}
                                    placeholder="voce@cinema.com"
                                    placeholderTextColor="#5C6370"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                />
                            </InputRow>

                            <InputLabel>SENHA</InputLabel>
                            <InputRow focused={passwordFocused}>
                                <Lock
                                    size={18}
                                    color={passwordFocused ? '#E91E63' : '#5C6370'}
                                    strokeWidth={1.8}
                                />
                                <StyledInput
                                    ref={passwordRef}
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor="#5C6370"
                                    secureTextEntry={!showPassword}
                                    returnKeyType="done"
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    onSubmitEditing={handleRegister}
                                />
                                <EyeBtn onPress={() => setShowPassword(v => !v)}>
                                {showPassword
                                    ? <Eye size={18} color="#5C6370" strokeWidth={1.8} />
                                    : <EyeOff size={18} color="#5C6370" strokeWidth={1.8} />
                                }
                                </EyeBtn>
                            </InputRow>

                            <PrimaryButton onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
                                {loading
                                ? <ActivityIndicator color="#fff" />
                                : <PrimaryButtonText>Criar conta</PrimaryButtonText>
                                }
                            </PrimaryButton>

                            <LegalText>
                                Ao continuar, você concorda com os{' '}
                                <LegalLink>Termos e Política de Privacidade</LegalLink>.
                            </LegalText>
                        </Inner>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Root>
    );
}
