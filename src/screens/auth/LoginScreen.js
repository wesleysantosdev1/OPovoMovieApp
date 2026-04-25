import React, { useState, useRef } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    View,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import styled from 'styled-components/native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

// ─── Styled Components ──────────────────────────────────────────────────────

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

const BackdropGradient = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 320px;
    background-color: transparent;
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

// Toggle Login/Cadastrar
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

// Inputs
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

const ForgotBtn = styled.TouchableOpacity`
    align-self: flex-end;
    margin-top: -8px;
    margin-bottom: 24px;
`;

const ForgotText = styled.Text`
    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.sm}px;
`;

// CTA Button
const PrimaryButton = styled.TouchableOpacity`
    height: 54px;
    border-radius: ${({ theme }) => theme.radius.full}px;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.primary};
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
`;

const LegalLink = styled.Text`
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration-line: underline;
`;

// ─── Component ──────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [loading, setLoading] = useState(false);

    const passwordRef = useRef(null);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Atenção', 'Preencha e-mail e senha.');
            return;
        }

        Keyboard.dismiss();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        // onAuthStateChanged no navigator cuida do redirecionamento
        } catch (error) {
            const messages = {
                'auth/user-not-found': 'Usuário não encontrado.',
                'auth/wrong-password': 'Senha incorreta.',
                'auth/invalid-email': 'E-mail inválido.',
                'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.',
                'auth/invalid-credential': 'Credenciais inválidas.',
            };
            Alert.alert('Erro ao entrar', messages[error.code] || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Root>
        <StatusBar barStyle="light-content" />

        {/* Backdrop cinematográfico */}
        <BackdropImage
            source={{ uri: 'https://image.tmdb.org/t/p/w780/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg' }}
            resizeMode="cover"
        />

        {/* Gradiente overlay (simulado com LinearGradient ou View) */}
        <View
            style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 320,
            background: 'transparent',
            }}
            pointerEvents="none"
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
                        <Subtitle>Bem-vindo de volta. Continue assistindo.</Subtitle>

                        <ToggleContainer>
                            <ToggleBtn active={true}>
                                <ToggleBtnText active={true}>Entrar</ToggleBtnText>
                            </ToggleBtn>

                            <ToggleBtn
                            active={false}
                            onPress={() => navigation.navigate('Register')}
                            >
                                <ToggleBtnText active={false}>Cadastrar</ToggleBtnText>
                            </ToggleBtn>
                        </ToggleContainer>

                        <InputLabel>E-MAIL</InputLabel>
                        <InputRow focused={emailFocused}>
                            <Mail
                                size={18}
                                color={emailFocused ? '#E91E63' : '#5C6370'}
                                strokeWidth={1.8}
                            />
                            <StyledInput
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
                                onSubmitEditing={handleLogin}
                            />
                            <EyeBtn onPress={() => setShowPassword(v => !v)}>
                                {showPassword
                                    ? <Eye size={18} color="#5C6370" strokeWidth={1.8} />
                                    : <EyeOff size={18} color="#5C6370" strokeWidth={1.8} />
                                }
                            </EyeBtn>
                        </InputRow>

                        <ForgotBtn>
                            <ForgotText>Esqueci minha senha</ForgotText>
                        </ForgotBtn>

                        <PrimaryButton onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                            {loading
                            ? <ActivityIndicator color="#fff" />
                            : <PrimaryButtonText>Entrar agora</PrimaryButtonText>
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
