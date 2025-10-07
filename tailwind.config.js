/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // MDNichrome font variants
        'mdnichrome-thin': ['MDNichromeTest-ThinOblique'],
        'mdnichrome-light': ['MDNichromeTest-LightOblique'],
        'mdnichrome-regular': ['MDNichromeTest-RegularOblique'],
        'mdnichrome-infra': ['MDNichromeTest-InfraOblique'],
        'mdnichrome-dark': ['MDNichromeTest-DarkOblique'],
        'mdnichrome-bold': ['MDNichromeTest-BoldOblique'],
        'mdnichrome-black': ['MDNichromeTest-BlackOblique'],
        'mdnichrome-ultra': ['MDNichromeTest-UltraOblique'],
        
        // SF Pro Rounded font variants
        'sf-pro-ultralight': ['SF-Pro-Rounded-Ultralight'],
        'sf-pro-thin': ['SF-Pro-Rounded-Thin'],
        'sf-pro-light': ['SF-Pro-Rounded-Light'],
        'sf-pro-regular': ['SF-Pro-Rounded-Regular'],
        'sf-pro-medium': ['SF-Pro-Rounded-Medium'],
        'sf-pro-semibold': ['SF-Pro-Rounded-Semibold'],
        'sf-pro-bold': ['SF-Pro-Rounded-Bold'],
        'sf-pro-heavy': ['SF-Pro-Rounded-Heavy'],
        'sf-pro-black': ['SF-Pro-Rounded-Black'],
        
        // Semantic font aliases
        'heading': ['SF-Pro-Rounded-Bold'],
        'heading-light': ['SF-Pro-Rounded-Semibold'],
        'body': ['SF-Pro-Rounded-Regular'],
        'body-light': ['SF-Pro-Rounded-Light'],
        'caption': ['SF-Pro-Rounded-Medium'],
        'display': ['MDNichromeTest-BoldOblique'],
        'display-artistic': ['MDNichromeTest-UltraOblique'],
      },
    },
  },
  plugins: [],
};
