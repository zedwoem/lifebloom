import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "#bccac0", // outline-variant
        input: "#eaedff", // surface-container
        ring: "#006948", // primary
        background: "#FFFDF5", // Soft Cream canvas
        foreground: "#131b2e", // Deep Charcoal neutral text
        primary: {
          DEFAULT: "#006948", // Sage Green accent
          foreground: "#ffffff",
          container: "#00855d",
          'on-container': "#f5fff7",
        },
        secondary: {
          DEFAULT: "#904d00", // Muted Clay Orange
          foreground: "#ffffff",
          container: "#fe932c",
          'on-container': "#663500",
        },
        tertiary: {
          DEFAULT: "#585d60",
          foreground: "#ffffff",
          container: "#707579",
        },
        muted: {
          DEFAULT: "#eaedff",
          foreground: "#3d4a42",
        },
        accent: {
          DEFAULT: "#fe932c",
          foreground: "#663500",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#131b2e",
        },
        surface: {
          DEFAULT: "#FFFDF5",
          container: "#eaedff",
          low: "#f2f3ff",
          lowest: "#ffffff",
          high: "#e2e7ff",
          highest: "#dae2fd",
          dim: "#d2d9f4",
          bright: "#faf8ff",
          variant: "#dae2fd",
        },
        'on-surface': "#131b2e",
        'on-surface-variant': "#3d4a42",
        'brand-blue': "#131b2e",
        'brand-blue-dark': "#0a0e1a",
        'brand-slate': "#585d60",
        'brand-slate-light': "#f2f3ff",
        'brand-green': "#006948",
        'brand-green-dark': "#005238",
        'brand-green-light': "#e6f4ef",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        '2xl': "1rem",
        '3xl': "1.5rem", // 24px pebble radius
        full: "9999px",
      },
      spacing: {
        'touch-target': "52px", // non-negotiable elder touch target
        'gutter-mobile': "16px",
        'gutter-desktop': "32px",
        'margin-mobile': "20px",
        'margin-desktop': "48px",
        'container-max': "1120px",
        'article-max': "720px",
        unit: "4px",
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['18px', '1.6'], // Dynamic baseline typography
        lg: ['20px', '1.6'],
        xl: ['24px', '1.3'],
        '2xl': ['32px', '1.25'],
        '3xl': ['48px', '1.2'],
      },
      boxShadow: {
        'soft-ambient': "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

export default config
