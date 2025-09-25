tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'dark-bg': '#1a1a1a',
                'dark-surface': '#2d2d2d',
                'dark-border': '#404040',
                'dark-text': '#e5e5e5',
                'dark-text-secondary': '#a3a3a3',
                'primary': '#14b8a6'
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'slide-in': 'slideIn 0.3s ease-out',
                'slide-out': 'slideOut 0.3s ease-in'
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                slideIn: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                slideOut: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(100%)', opacity: '0' }
                }
            }
        }
    }
}