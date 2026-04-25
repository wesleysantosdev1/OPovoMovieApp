export const theme = {
    colors: {
        background: '#0F1117',
        surface: '#1C1F26',
        surfaceElevated: '#22262F',
        surfaceBorder: '#2A2E38',
        primary: '#E91E63',
        primaryDark: '#C2185B',
        primaryLight: '#F06292',
        primaryGlow: 'rgba(233, 30, 99, 0.25)',
        textPrimary: '#FFFFFF',
        textSecondary: '#9BA3B2',
        textMuted: '#5C6370',
        textOnPrimary: '#FFFFFF',
        star: '#FFB300',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        overlay: 'rgba(15, 17, 23, 0.85)',
        overlayLight: 'rgba(15, 17, 23, 0.5)',
        overlayGradient: 'rgba(15, 17, 23, 0)',
        border: '#2A2E38',
        divider: 'rgba(255,255,255,0.06)',
        tabBarBackground: '#13161D',
        tabBarActive: '#E91E63',
        tabBarInactive: '#5C6370',
    },

    typography: {
        fontFamily: {
        display: 'DMSerifDisplay_400Regular',
        body: 'DMSans_400Regular',
        bodyMedium: 'DMSans_500Medium',
        bodyBold: 'DMSans_700Bold',
        label: 'DMSans_400Regular',
        },
        fontSize: {
        xs: 11,
        sm: 13,
        base: 15,
        md: 17,
        lg: 20,
        xl: 24,
        xxl: 30,
        xxxl: 38,
        },
        lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
        },
        letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1.2,
        widest: 2,
        },
    },

    fonts: {
        regular: 'DMSans_400Regular',
        medium: 'DMSans_500Medium',
        semibold: 'DMSans_500Medium',
        bold: 'DMSans_700Bold',
        display: 'DMSerifDisplay_400Regular',
        label: 'DMSans_400Regular',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
        xxxl: 48,
        screen: 20,
    },

    radius: {
        sm: 6,
        md: 10,
        lg: 14,
        xl: 20,
        xxl: 28,
        full: 999,
    },

    shadows: {
        card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        },
        primary: {
        shadowColor: '#E91E63',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        },
        subtle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        },
    },

    animation: {
        duration: {
        fast: 150,
        normal: 250,
        slow: 400,
        },
    },
};

export default theme;
