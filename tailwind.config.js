/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:   '#1B5FA8',
          orange: '#E8821A',
          yellow: '#F5C842',
          green:  '#4CAF6E',
          cream:  '#FFF8EE',
          navy:   '#0D2F55',
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        ui:      ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
