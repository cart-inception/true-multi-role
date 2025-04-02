# UI Design Guidelines for Multi-RoleAI

This document outlines the UI design guidelines for the Multi-RoleAI application, based on a modern code editor aesthetic with a dark theme. These guidelines ensure a consistent, professional, and focused user experience throughout the application.

## Color Palette

### Background Colors

| Name | Hex Code | Description | Usage |
|------|----------|-------------|-------|
| `primaryBackground` | `#121212` | Very dark charcoal gray, almost black | Main application background, chrome areas |
| `secondaryBackground` | `#1E1E1E` | Slightly lighter dark gray | Content areas, main editor panes |
| `tertiaryBackground` | `#252526` | Subtle dark gray | Sidebars, panels, modals |
| `quaternaryBackground` | `#2D2D30` | Lighter dark gray | Hover states, selected items |
| `codeBackground` | `#1A1A1A` | Dark gray with slight warmth | Code blocks, terminal areas |

### Text Colors

| Name | Hex Code | Description | Usage |
|------|----------|-------------|-------|
| `primaryText` | `#F8F8F2` | Off-white | Main text content |
| `secondaryText` | `#CCCCCC` | Light gray | Secondary information, descriptions |
| `tertiaryText` | `#888888` | Medium gray | Placeholder text, disabled content |
| `commentText` | `#6A9955` | Muted green | Comments, help text |

### Accent Colors

| Name | Hex Code | Description | Usage |
|------|----------|-------------|-------|
| `accentBlue` | `#61DAFB` | Bright cyan/light blue | Primary actions, links, active states |
| `accentPurple` | `#C586C0` | Vivid magenta/purple | Secondary actions, keywords, decorative elements |
| `accentYellow` | `#DCDCAA` | Soft gold/yellow | Highlights, function names, notifications |
| `accentGreen` | `#4EC9B0` | Teal green | Success states, class names |
| `accentOrange` | `#CE9178` | Soft orange | Strings, warnings |
| `accentRed` | `#F44747` | Bright red | Errors, destructive actions |

### Border & Separator Colors

| Name | Hex Code | Description | Usage |
|------|----------|-------------|-------|
| `borderPrimary` | `#323232` | Dark gray | Primary borders |
| `borderSecondary` | `#474747` | Medium gray | Highlighted borders |
| `borderAccent` | `#264F78` | Dark blue | Focus borders |
| `divider` | `#2D2D2D` | Subtle gray | Separators, dividers |

## Typography

### Font Family

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
```

### Font Sizes

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## Spacing

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Border Radius

```css
--radius-sm: 0.125rem;  /* 2px */
--radius-md: 0.25rem;   /* 4px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-full: 9999px;  /* Fully rounded */
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
--shadow-outline: 0 0 0 3px rgba(97, 218, 251, 0.5); /* Based on accentBlue */
```

## Transitions

```css
--transition-fast: 150ms;
--transition-normal: 250ms;
--transition-slow: 350ms;
--transition-ease: cubic-bezier(0.4, 0, 0.2, 1);
```

## UI Components

### Buttons

#### Primary Button

```tsx
const PrimaryButton = styled.button`
  background-color: var(--accentBlue);
  color: var(--primaryText);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: none;
  transition: background-color var(--transition-fast) var(--transition-ease);
  
  &:hover {
    background-color: #7AE1FF; /* Lighter version of accentBlue */
  }
  
  &:focus {
    outline: none;
    box-shadow: var(--shadow-outline);
  }
  
  &:disabled {
    background-color: #2A5A6A; /* Darker, desaturated version of accentBlue */
    color: var(--tertiaryText);
    cursor: not-allowed;
  }
`;
```

#### Secondary Button

```tsx
const SecondaryButton = styled.button`
  background-color: var(--accentPurple);
  color: var(--primaryText);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: none;
  transition: background-color var(--transition-fast) var(--transition-ease);
  
  &:hover {
    background-color: #D39AD3; /* Lighter version of accentPurple */
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(197, 134, 192, 0.5); /* Based on accentPurple */
  }
  
  &:disabled {
    background-color: #5A3F59; /* Darker, desaturated version of accentPurple */
    color: var(--tertiaryText);
    cursor: not-allowed;
  }
`;
```

#### Ghost Button

```tsx
const GhostButton = styled.button`
  background-color: transparent;
  color: var(--secondaryText);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--borderPrimary);
  transition: all var(--transition-fast) var(--transition-ease);
  
  &:hover {
    background-color: var(--quaternaryBackground);
    color: var(--primaryText);
  }
  
  &:focus {
    outline: none;
    box-shadow: var(--shadow-outline);
  }
  
  &:disabled {
    color: var(--tertiaryText);
    border-color: var(--borderPrimary);
    cursor: not-allowed;
  }
`;
```

### Input Fields

```tsx
const Input = styled.input`
  background-color: var(--secondaryBackground);
  color: var(--primaryText);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--borderPrimary);
  transition: border-color var(--transition-fast) var(--transition-ease);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  
  &:hover {
    border-color: var(--borderSecondary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accentBlue);
    box-shadow: var(--shadow-outline);
  }
  
  &::placeholder {
    color: var(--tertiaryText);
  }
  
  &:disabled {
    background-color: var(--tertiaryBackground);
    color: var(--tertiaryText);
    cursor: not-allowed;
  }
`;
```

### Cards

```tsx
const Card = styled.div`
  background-color: var(--secondaryBackground);
  border-radius: var(--radius-lg);
  border: 1px solid var(--borderPrimary);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  
  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--borderSecondary);
  }
`;
```

### Navigation

```tsx
const NavItem = styled.a<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  color: ${props => props.active ? 'var(--accentBlue)' : 'var(--secondaryText)'};
  background-color: ${props => props.active ? 'var(--quaternaryBackground)' : 'transparent'};
  border-left: 3px solid ${props => props.active ? 'var(--accentBlue)' : 'transparent'};
  transition: all var(--transition-fast) var(--transition-ease);
  font-weight: ${props => props.active ? 'var(--font-medium)' : 'var(--font-normal)'};
  
  &:hover {
    color: var(--primaryText);
    background-color: var(--quaternaryBackground);
  }
`;
```

### Tabs

```tsx
const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderPrimary);
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: var(--space-2) var(--space-4);
  background-color: transparent;
  color: ${props => props.active ? 'var(--accentBlue)' : 'var(--secondaryText)'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--accentBlue)' : 'transparent'};
  font-weight: ${props => props.active ? 'var(--font-medium)' : 'var(--font-normal)'};
  transition: all var(--transition-fast) var(--transition-ease);
  
  &:hover {
    color: ${props => props.active ? 'var(--accentBlue)' : 'var(--primaryText)'};
  }
  
  &:focus {
    outline: none;
  }
`;
```

### Alerts and Notifications

```tsx
const Alert = styled.div<{ variant: 'info' | 'success' | 'warning' | 'error' }>`
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-left: 4px solid var(${props => {
    switch (props.variant) {
      case 'info': return '--accentBlue';
      case 'success': return '--accentGreen';
      case 'warning': return '--accentYellow';
      case 'error': return '--accentRed';
    }
  }});
  background-color: var(--tertiaryBackground);
  color: var(--primaryText);
  
  & > .title {
    font-weight: var(--font-medium);
    color: var(${props => {
      switch (props.variant) {
        case 'info': return '--accentBlue';
        case 'success': return '--accentGreen';
        case 'warning': return '--accentYellow';
        case 'error': return '--accentRed';
      }
    }});
  }
`;
```

### Code Blocks

```tsx
const CodeBlock = styled.pre`
  background-color: var(--codeBackground);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--borderPrimary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  overflow-x: auto;
  
  & .keyword {
    color: var(--accentPurple);
  }
  
  & .string {
    color: var(--accentOrange);
  }
  
  & .function {
    color: var(--accentYellow);
  }
  
  & .comment {
    color: var(--commentText);
  }
  
  & .variable {
    color: var(--accentBlue);
  }
  
  & .type {
    color: var(--accentGreen);
  }
`;
```

## TypeScript Theme Definition

```typescript
// theme.ts
export const theme = {
  colors: {
    // Background colors
    primaryBackground: '#121212',
    secondaryBackground: '#1E1E1E',
    tertiaryBackground: '#252526',
    quaternaryBackground: '#2D2D30',
    codeBackground: '#1A1A1A',
    
    // Text colors
    primaryText: '#F8F8F2',
    secondaryText: '#CCCCCC',
    tertiaryText: '#888888',
    commentText: '#6A9955',
    
    // Accent colors
    accentBlue: '#61DAFB',
    accentPurple: '#C586C0',
    accentYellow: '#DCDCAA',
    accentGreen: '#4EC9B0',
    accentOrange: '#CE9178',
    accentRed: '#F44747',
    
    // Border colors
    borderPrimary: '#323232',
    borderSecondary: '#474747',
    borderAccent: '#264F78',
    divider: '#2D2D2D',
  },
  
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  
  borderRadius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    outline: '0 0 0 3px rgba(97, 218, 251, 0.5)',
  },
  
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Type definition for the theme
export type Theme = typeof theme;

// React context for theme
import { createContext, useContext } from 'react';

export const ThemeContext = createContext<Theme>(theme);

export const useTheme = () => useContext(ThemeContext);
```

## CSS Variables Implementation

```tsx
// GlobalStyles.tsx
import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  :root {
    /* Background colors */
    --primaryBackground: ${theme.colors.primaryBackground};
    --secondaryBackground: ${theme.colors.secondaryBackground};
    --tertiaryBackground: ${theme.colors.tertiaryBackground};
    --quaternaryBackground: ${theme.colors.quaternaryBackground};
    --codeBackground: ${theme.colors.codeBackground};
    
    /* Text colors */
    --primaryText: ${theme.colors.primaryText};
    --secondaryText: ${theme.colors.secondaryText};
    --tertiaryText: ${theme.colors.tertiaryText};
    --commentText: ${theme.colors.commentText};
    
    /* Accent colors */
    --accentBlue: ${theme.colors.accentBlue};
    --accentPurple: ${theme.colors.accentPurple};
    --accentYellow: ${theme.colors.accentYellow};
    --accentGreen: ${theme.colors.accentGreen};
    --accentOrange: ${theme.colors.accentOrange};
    --accentRed: ${theme.colors.accentRed};
    
    /* Border colors */
    --borderPrimary: ${theme.colors.borderPrimary};
    --borderSecondary: ${theme.colors.borderSecondary};
    --borderAccent: ${theme.colors.borderAccent};
    --divider: ${theme.colors.divider};
    
    /* Typography */
    --font-primary: ${theme.typography.fontFamily.primary};
    --font-mono: ${theme.typography.fontFamily.mono};
    
    --text-xs: ${theme.typography.fontSize.xs};
    --text-sm: ${theme.typography.fontSize.sm};
    --text-base: ${theme.typography.fontSize.base};
    --text-lg: ${theme.typography.fontSize.lg};
    --text-xl: ${theme.typography.fontSize.xl};
    --text-2xl: ${theme.typography.fontSize['2xl']};
    --text-3xl: ${theme.typography.fontSize['3xl']};
    --text-4xl: ${theme.typography.fontSize['4xl']};
    
    --font-normal: ${theme.typography.fontWeight.normal};
    --font-medium: ${theme.typography.fontWeight.medium};
    --font-semibold: ${theme.typography.fontWeight.semibold};
    --font-bold: ${theme.typography.fontWeight.bold};
    
    --leading-none: ${theme.typography.lineHeight.none};
    --leading-tight: ${theme.typography.lineHeight.tight};
    --leading-normal: ${theme.typography.lineHeight.normal};
    --leading-relaxed: ${theme.typography.lineHeight.relaxed};
    
    /* Spacing */
    --space-1: ${theme.spacing[1]};
    --space-2: ${theme.spacing[2]};
    --space-3: ${theme.spacing[3]};
    --space-4: ${theme.spacing[4]};
    --space-5: ${theme.spacing[5]};
    --space-6: ${theme.spacing[6]};
    --space-8: ${theme.spacing[8]};
    --space-10: ${theme.spacing[10]};
    --space-12: ${theme.spacing[12]};
    --space-16: ${theme.spacing[16]};
    
    /* Border Radius */
    --radius-sm: ${theme.borderRadius.sm};
    --radius-md: ${theme.borderRadius.md};
    --radius-lg: ${theme.borderRadius.lg};
    --radius-xl: ${theme.borderRadius.xl};
    --radius-full: ${theme.borderRadius.full};
    
    /* Shadows */
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    --shadow-xl: ${theme.shadows.xl};
    --shadow-inner: ${theme.shadows.inner};
    --shadow-outline: ${theme.shadows.outline};
    
    /* Transitions */
    --transition-fast: ${theme.transitions.fast};
    --transition-normal: ${theme.transitions.normal};
    --transition-slow: ${theme.transitions.slow};
    --transition-ease: ${theme.transitions.ease};
  }
  
  body {
    background-color: var(--primaryBackground);
    color: var(--primaryText);
    font-family: var(--font-primary);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    margin: 0;
    padding: 0;
  }
  
  /* Additional global styles */
  a {
    color: var(--accentBlue);
    text-decoration: none;
    transition: color var(--transition-fast) var(--transition-ease);
    
    &:hover {
      color: #7AE1FF; /* Lighter version of accentBlue */
    }
  }
  
  ::selection {
    background-color: rgba(97, 218, 251, 0.3); /* Based on accentBlue */
    color: var(--primaryText);
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--primaryBackground);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--borderPrimary);
    border-radius: var(--radius-full);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--borderSecondary);
  }
`;
```

## Usage Example

```tsx
// App.tsx
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyles } from './GlobalStyles';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {/* Your application components */}
    </ThemeProvider>
  );
};

export default App;
```

## Accessibility Considerations

- Ensure sufficient contrast between text and background colors (WCAG AA compliance)
- Provide focus styles for keyboard navigation
- Use semantic HTML elements
- Include appropriate ARIA attributes where necessary
- Test with screen readers and keyboard navigation

## Responsive Design

- Use relative units (rem) for typography and spacing
- Implement responsive breakpoints for different screen sizes
- Consider touch targets for mobile devices (minimum 44x44px)
- Test UI components across different viewport sizes

## Best Practices

1. Maintain consistency by using the defined color palette and design tokens
2. Use the provided component styles as a foundation
3. Follow the dark theme aesthetic with high contrast and vibrant accents
4. Keep the UI clean and focused, avoiding visual clutter
5. Prioritize readability, especially for text-heavy content
6. Use animations and transitions sparingly and purposefully
7. Ensure all interactive elements have clear hover and focus states
8. Test UI components for accessibility and responsiveness
