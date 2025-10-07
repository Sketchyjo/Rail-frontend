/**
 * Fonts Configuration
 * 
 * This file manages all custom fonts used in the application.
 * It provides TypeScript types and mappings for safe font usage.
 */

export const FONT_FAMILIES = {
  // MDNichrome font family (all oblique variants)
  MDNICHROME: {
    THIN: 'MDNichromeTest-ThinOblique',
    LIGHT: 'MDNichromeTest-LightOblique',
    REGULAR: 'MDNichromeTest-RegularOblique',
    INFRA: 'MDNichromeTest-InfraOblique',
    DARK: 'MDNichromeTest-DarkOblique',
    BOLD: 'MDNichromeTest-BoldOblique',
    BLACK: 'MDNichromeTest-BlackOblique',
    ULTRA: 'MDNichromeTest-UltraOblique',
  },
  
  // SF Pro Rounded font family
  SF_PRO_ROUNDED: {
    ULTRALIGHT: 'SF-Pro-Rounded-Ultralight',
    THIN: 'SF-Pro-Rounded-Thin',
    LIGHT: 'SF-Pro-Rounded-Light',
    REGULAR: 'SF-Pro-Rounded-Regular',
    MEDIUM: 'SF-Pro-Rounded-Medium',
    SEMIBOLD: 'SF-Pro-Rounded-Semibold',
    BOLD: 'SF-Pro-Rounded-Bold',
    HEAVY: 'SF-Pro-Rounded-Heavy',
    BLACK: 'SF-Pro-Rounded-Black',
  },
} as const;

/**
 * Font weight mappings for better semantic usage
 */
export const FONT_WEIGHTS = {
  // MDNichrome weights
  MDNICHROME: {
    100: FONT_FAMILIES.MDNICHROME.THIN,
    200: FONT_FAMILIES.MDNICHROME.LIGHT,
    300: FONT_FAMILIES.MDNICHROME.LIGHT,
    400: FONT_FAMILIES.MDNICHROME.REGULAR,
    500: FONT_FAMILIES.MDNICHROME.INFRA,
    600: FONT_FAMILIES.MDNICHROME.DARK,
    700: FONT_FAMILIES.MDNICHROME.BOLD,
    800: FONT_FAMILIES.MDNICHROME.BLACK,
    900: FONT_FAMILIES.MDNICHROME.ULTRA,
  },
  
  // SF Pro Rounded weights
  SF_PRO_ROUNDED: {
    100: FONT_FAMILIES.SF_PRO_ROUNDED.ULTRALIGHT,
    200: FONT_FAMILIES.SF_PRO_ROUNDED.THIN,
    300: FONT_FAMILIES.SF_PRO_ROUNDED.LIGHT,
    400: FONT_FAMILIES.SF_PRO_ROUNDED.REGULAR,
    500: FONT_FAMILIES.SF_PRO_ROUNDED.MEDIUM,
    600: FONT_FAMILIES.SF_PRO_ROUNDED.SEMIBOLD,
    700: FONT_FAMILIES.SF_PRO_ROUNDED.BOLD,
    800: FONT_FAMILIES.SF_PRO_ROUNDED.HEAVY,
    900: FONT_FAMILIES.SF_PRO_ROUNDED.BLACK,
  },
} as const;

/**
 * Font file paths for dynamic loading
 */
export const FONT_FILES = {
  // MDNichrome fonts
  [FONT_FAMILIES.MDNICHROME.THIN]: require('../assets/fonts/MDNichromeTest-ThinOblique.otf'),
  [FONT_FAMILIES.MDNICHROME.LIGHT]: require('../assets/fonts/MDNichromeTest-LightOblique.otf'),
  [FONT_FAMILIES.MDNICHROME.REGULAR]: require('../assets/fonts/MDNichromeTest-RegularOblique.otf'),
  [FONT_FAMILIES.MDNICHROME.INFRA]: require('../assets/fonts/MDNichromeTest-InfraOblique.otf'),
  [FONT_FAMILIES.MDNICHROME.DARK]: require('../assets/fonts/MDNichromeTest-DarkOblique.otf'),
  [FONT_FAMILIES.MDNICHROME.BOLD]: require('../assets/fonts/MDNichromeTest-BoldOblique.otf'),
  [FONT_FAMILIES.MDNICHROME.BLACK]: require('../assets/fonts/MDNichromeTest-BlackOblique.otf'),
  [FONT_FAMILIES.MDNICHROME.ULTRA]: require('../assets/fonts/MDNichromeTest-UltraOblique.otf'),
  
  // SF Pro Rounded fonts
  [FONT_FAMILIES.SF_PRO_ROUNDED.ULTRALIGHT]: require('../assets/fonts/SF-Pro-Rounded-Ultralight.otf'),
  [FONT_FAMILIES.SF_PRO_ROUNDED.THIN]: require('../assets/fonts/SF-Pro-Rounded-Thin.otf'),
  [FONT_FAMILIES.SF_PRO_ROUNDED.LIGHT]: require('../assets/fonts/SF-Pro-Rounded-Light.otf'),
  [FONT_FAMILIES.SF_PRO_ROUNDED.REGULAR]: require('../assets/fonts/SF-Pro-Rounded-Regular.otf'),
  [FONT_FAMILIES.SF_PRO_ROUNDED.MEDIUM]: require('../assets/fonts/SF-Pro-Rounded-Medium.otf'),
  [FONT_FAMILIES.SF_PRO_ROUNDED.SEMIBOLD]: require('../assets/fonts/SF-Pro-Rounded-Semibold.otf'),
  [FONT_FAMILIES.SF_PRO_ROUNDED.BOLD]: require('../assets/fonts/SF-Pro-Rounded-Bold.otf'),
  [FONT_FAMILIES.SF_PRO_ROUNDED.HEAVY]: require('../assets/fonts/SF-Pro-Rounded-Heavy.otf'),
  [FONT_FAMILIES.SF_PRO_ROUNDED.BLACK]: require('../assets/fonts/SF-Pro-Rounded-Black.otf'),
} as const;

/**
 * TypeScript types for font families
 */
export type MDNichromeFontVariant = keyof typeof FONT_FAMILIES.MDNICHROME;
export type SFProRoundedFontVariant = keyof typeof FONT_FAMILIES.SF_PRO_ROUNDED;
export type CustomFontFamily = 
  | typeof FONT_FAMILIES.MDNICHROME[MDNichromeFontVariant]
  | typeof FONT_FAMILIES.SF_PRO_ROUNDED[SFProRoundedFontVariant];

/**
 * Helper functions for font usage
 */
export const FontHelpers = {
  /**
   * Get MDNichrome font by weight
   */
  getMDNichromeByWeight: (weight: keyof typeof FONT_WEIGHTS.MDNICHROME) => {
    return FONT_WEIGHTS.MDNICHROME[weight];
  },
  
  /**
   * Get SF Pro Rounded font by weight
   */
  getSFProRoundedByWeight: (weight: keyof typeof FONT_WEIGHTS.SF_PRO_ROUNDED) => {
    return FONT_WEIGHTS.SF_PRO_ROUNDED[weight];
  },
  
  /**
   * Get all available font names as array
   */
  getAllFontNames: () => {
    return [
      ...Object.values(FONT_FAMILIES.MDNICHROME),
      ...Object.values(FONT_FAMILIES.SF_PRO_ROUNDED),
    ];
  },
};

/**
 * Default font configurations for common use cases
 */
export const FONT_PRESETS = {
  HEADING_PRIMARY: FONT_FAMILIES.SF_PRO_ROUNDED.BOLD,
  HEADING_SECONDARY: FONT_FAMILIES.SF_PRO_ROUNDED.SEMIBOLD,
  BODY_TEXT: FONT_FAMILIES.SF_PRO_ROUNDED.REGULAR,
  BODY_TEXT_LIGHT: FONT_FAMILIES.SF_PRO_ROUNDED.LIGHT,
  CAPTION: FONT_FAMILIES.SF_PRO_ROUNDED.MEDIUM,
  
  // Stylistic fonts
  DISPLAY_CREATIVE: FONT_FAMILIES.MDNICHROME.BOLD,
  DISPLAY_ARTISTIC: FONT_FAMILIES.MDNICHROME.ULTRA,
} as const;