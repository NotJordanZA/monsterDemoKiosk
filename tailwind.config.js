/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rajdhani', 'Orbitron', 'monospace'],
        matrix: ['Orbitron', 'monospace'],
        cyber: ['Rajdhani', 'monospace'],
      },
      colors: {
        'cyber-green': '#00ff41',
        'cyber-cyan': '#00ffff',
        'cyber-purple': '#ff00ff',
        'cyber-orange': '#ff6600',
        'cyber-dark': '#000000',
        'cyber-gray': '#0a0a0a',
        'cyber-light-gray': '#1a1a1a',
        'cyber-border': '#00ff41',
        'cyber-glow': '#00ff4150',
        'matrix-green': '#00ff41',
        'wireframe': '#00ff41',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'neon-pulse-green': 'neon-pulse-green 3s ease-in-out infinite alternate',
        'neon-pulse-cyan': 'neon-pulse-cyan 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #39ff14, 0 0 10px #39ff14, 0 0 15px #39ff14' 
          },
          '100%': { 
            boxShadow: '0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14' 
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        bounceSubtle: {
          '0%, 100%': { 
            transform: 'translateY(0px)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': { 
            transform: 'translateY(-8px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
        },
        'neon-pulse-green': {
          '0%': { 
            boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41, 0 0 20px #00ff41, inset 0 0 5px #00ff41'
          },
          '100%': { 
            boxShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41, 0 0 40px #00ff41, inset 0 0 10px #00ff41'
          },
        },
        'neon-pulse-cyan': {
          '0%': { 
            boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff, inset 0 0 5px #00ffff'
          },
          '100%': { 
            boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff, inset 0 0 10px #00ffff'
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}