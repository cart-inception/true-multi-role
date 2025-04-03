/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        primaryBackground: 'var(--primaryBackground)',
        secondaryBackground: 'var(--secondaryBackground)',
        tertiaryBackground: 'var(--tertiaryBackground)',
        quaternaryBackground: 'var(--quaternaryBackground)',
        codeBackground: 'var(--codeBackground)',
        
        // Text colors
        primaryText: 'var(--primaryText)',
        secondaryText: 'var(--secondaryText)',
        tertiaryText: 'var(--tertiaryText)',
        commentText: 'var(--commentText)',
        
        // Accent colors
        accentBlue: 'var(--accentBlue)',
        accentPurple: 'var(--accentPurple)',
        accentYellow: 'var(--accentYellow)',
        accentGreen: 'var(--accentGreen)',
        accentOrange: 'var(--accentOrange)',
        accentRed: 'var(--accentRed)',
        
        // Border colors
        borderPrimary: 'var(--borderPrimary)',
        borderSecondary: 'var(--borderSecondary)',
        borderAccent: 'var(--borderAccent)',
        divider: 'var(--divider)',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },
      fontWeight: {
        normal: 'var(--font-normal)',
        medium: 'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold: 'var(--font-bold)',
      },
      lineHeight: {
        none: 'var(--leading-none)',
        tight: 'var(--leading-tight)',
        normal: 'var(--leading-normal)',
        relaxed: 'var(--leading-relaxed)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'inner': 'var(--shadow-inner)',
        'outline': 'var(--shadow-outline)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
      },
      transitionTimingFunction: {
        'ease': 'var(--transition-ease)',
      },
    },
  },
  plugins: [],
};
