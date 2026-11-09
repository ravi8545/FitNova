/**
 * FitNova design tokens (Tailwind side).
 *
 * Single source of truth for colour. The same values are exposed as CSS
 * variables in src/styles/index.css - keep the two files in sync.
 */

// Brand green in the Tailwind 50-950 shape, so legacy `emerald-*`, `green-*`
// and `teal-*` classes automatically render in the FitNova green.
const brandGreen = {
  50: '#EEFBEF',
  100: '#D3F7D6',
  200: '#A5EEAB',
  300: '#6BE274',
  400: '#35D440',
  500: '#2BAF34',
  600: '#218928',
  700: '#1A6D20',
  800: '#16561B',
  900: '#124517',
  950: '#08260B',
};

// One violet scale so `purple-*` and `violet-*` are the same colour.
const violet = {
  50: '#F5F3FF',
  100: '#EDE9FE',
  200: '#DDD6FE',
  300: '#C4B5FD',
  400: '#A78BFA',
  500: '#8B5CF6',
  600: '#7C3AED',
  700: '#6D28D9',
  800: '#5B21B6',
  900: '#4C1D95',
  950: '#2E1065',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- surfaces -------------------------------------------------------
        bg: '#090D16', //         page background
        background: '#090D16', //  alias
        sidebar: '#090D16',
        inset: '#0B111A', //      inputs, wells, quiet bands
        panel: '#0D141C', //      cards, panels, modals
        card: '#0D141C', //       alias of panel
        panel2: '#121B26', //     hover / raised surfaces
        cardHover: '#121B26',
        line: '#162230', //       chrome dividers (sidebar, top bar)
        cardBorder: '#1E2D42', //  card + input borders

        // --- text -----------------------------------------------------------
        muted: '#94A3B8',
        textMuted: '#94A3B8',
        textDim: '#64748B',

        // --- brand + accents ------------------------------------------------
        brand: '#2BAF34',
        primary: {
          DEFAULT: '#2BAF34',
          light: '#35D440',
          dark: '#218928',
          glow: 'rgba(43, 175, 52, 0.25)',
          muted: 'rgba(43, 175, 52, 0.12)',
        },
        // DEFAULT only: Tailwind merges these with its own shade scales, so
        // `text-amber-500` etc. keep working while `bg-amber` is on-brand.
        amber: { DEFAULT: '#F59E0B' },
        sky: { DEFAULT: '#3B82F6' },
        rose: { DEFAULT: '#EF4444' },
        violet,
        purple: violet,
        emerald: brandGreen,
        green: brandGreen,
        teal: brandGreen,
        accent: {
          blue: '#3B82F6',
          yellow: '#F59E0B',
          purple: '#8B5CF6',
          red: '#EF4444',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(43, 175, 52, 0.35)',
        'glow-card': '0 8px 30px rgba(0, 0, 0, 0.6)',
        'glow-subtle': '0 0 15px rgba(43, 175, 52, 0.15)',
      },
    },
  },
  plugins: [],
};
