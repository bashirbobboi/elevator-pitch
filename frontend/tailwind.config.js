/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'fade-in': 'simpleFadeIn 0.3s ease-out forwards',
  			'pulse-bar': 'pulseBar 1.5s ease-in-out infinite',
  			'pulse-bar-delay': 'pulseBarShort 1.5s ease-in-out 0.2s infinite',
  			'pulse-bar-delay2': 'pulseBar 1.5s ease-in-out 0.4s infinite',
  			'glow': 'glow 2s ease-in-out infinite',
  		},
  		keyframes: {
  			simpleFadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			pulseBar: {
  				'0%, 100%': { 
  					height: '24px',
  					opacity: '0.6'
  				},
  				'50%': { 
  					height: '12px',
  					opacity: '0.2'
  				}
  			},
  			pulseBarShort: {
  				'0%, 100%': { 
  					height: '16px',
  					opacity: '0.6'
  				},
  				'50%': { 
  					height: '8px',
  					opacity: '0.2'
  				}
  			},
  			glow: {
  				'0%, 100%': { 
  					opacity: '0.5',
  					transform: 'scale(1)'
  				},
  				'50%': { 
  					opacity: '0.8',
  					transform: 'scale(1.1)'
  				}
  			}
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
