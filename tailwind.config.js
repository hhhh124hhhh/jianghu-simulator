/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // 背景色系
        background: {
          pure: '#000000',
          near: '#0a0a0a',
          dark: '#141414',
          hover: '#1e1e1e',
          elevated: '#282828',
        },
        // 金色系
        gold: {
          primary: '#d4af37',
          dark: '#b8860b',
          light: '#ffd700',
          bronze: '#cd7f32',
        },
        // 文字色
        text: {
          primary: '#e4e4e7',
          secondary: '#a1a1aa',
          tertiary: '#71717a',
        },
        // 五维数值色
        stats: {
          martial: {
            base: '#ef4444',
            hover: '#f87171',
          },
          fame: {
            base: '#f59e0b',
            hover: '#fbbf24',
          },
          network: {
            base: '#3b82f6',
            hover: '#60a5fa',
          },
          energy: {
            base: '#10b981',
            hover: '#34d399',
          },
          virtue: {
            base: '#a855f7',
            hover: '#c084fc',
          },
        },
        // 语义色
        semantic: {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#06b6d4',
        },
        // 边框色
        border: {
          subtle: 'rgba(255, 255, 255, 0.1)',
          moderate: 'rgba(255, 255, 255, 0.15)',
          strong: 'rgba(255, 255, 255, 0.2)',
        },
      },
      fontFamily: {
        title: ['ZCOOL XiaoWei', 'Ma Shan Zheng', 'Noto Serif SC', 'serif'],
        body: ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', '-apple-system', 'sans-serif'],
        numeric: ['Orbitron', 'Rajdhani', 'Roboto Mono', 'monospace'],
      },
      fontSize: {
        hero: '56px',
        h1: '40px',
        h2: '28px',
        h3: '20px',
        'body-lg': '18px',
        number: '32px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        'gold-glow': '0 0 24px rgba(212, 175, 55, 0.6)',
        'martial-glow': '0 0 12px rgba(239, 68, 68, 0.4)',
        'fame-glow': '0 0 12px rgba(245, 158, 11, 0.4)',
        'network-glow': '0 0 12px rgba(59, 130, 246, 0.4)',
        'energy-glow': '0 0 12px rgba(16, 185, 129, 0.4)',
        'virtue-glow': '0 0 12px rgba(168, 85, 247, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(212, 175, 55, 0.6)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
