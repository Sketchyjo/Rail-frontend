/**
 * Fonts Configuration
 *
 * This file manages all custom fonts used in the application.
 * It provides TypeScript types and mappings for safe font usage.
 */

export const FONT_FAMILIES = {
  // PramukhRounded font family (headings/display)
  PRAMUKH_ROUNDED: {
    EXTRALIGHT: 'PramukhRounded-Extralight',
    LIGHT: 'PramukhRounded-Light',
    SEMILIGHT: 'PramukhRounded-Semilight',
    REGULAR: 'PramukhRounded-Regular',
    SEMIBOLD: 'PramukhRounded-Semibold',
    BOLD: 'PramukhRounded-Bold',
    EXTRABOLD: 'PramukhRounded-Extrabold',
    BLACK: 'PramukhRounded-Black',
  },
  // Poppins font family (body/UI text)
  POPPINS: {
    THIN: 'Poppins-Thin',
    LIGHT: 'Poppins-Light',
    REGULAR: 'Poppins-Regular',
    MEDIUM: 'Poppins-Medium',
    BOLD: 'Poppins-Bold',
  },
} as const;

/**
 * Font file paths for dynamic loading
 */
export const FONT_FILES = {
  // PramukhRounded
  [FONT_FAMILIES.PRAMUKH_ROUNDED.EXTRALIGHT]: require('../assets/fonts/PramukhRounded-Extralight.otf'),
  [FONT_FAMILIES.PRAMUKH_ROUNDED.LIGHT]: require('../assets/fonts/PramukhRounded-Light.otf'),
  [FONT_FAMILIES.PRAMUKH_ROUNDED.SEMILIGHT]: require('../assets/fonts/PramukhRounded-Semilight.otf'),
  [FONT_FAMILIES.PRAMUKH_ROUNDED.REGULAR]: require('../assets/fonts/PramukhRounded-Regular.otf'),
  [FONT_FAMILIES.PRAMUKH_ROUNDED.SEMIBOLD]: require('../assets/fonts/PramukhRounded-Semibold.otf'),
  [FONT_FAMILIES.PRAMUKH_ROUNDED.BOLD]: require('../assets/fonts/PramukhRounded-Bold.otf'),
  [FONT_FAMILIES.PRAMUKH_ROUNDED.EXTRABOLD]: require('../assets/fonts/PramukhRounded-Extrabold.otf'),
  [FONT_FAMILIES.PRAMUKH_ROUNDED.BLACK]: require('../assets/fonts/PramukhRounded-Black.otf'),
  // Poppins
  [FONT_FAMILIES.POPPINS.THIN]: require('../assets/fonts/Poppins-Thin.otf'),
  [FONT_FAMILIES.POPPINS.LIGHT]: require('../assets/fonts/Poppins-Light.otf'),
  [FONT_FAMILIES.POPPINS.REGULAR]: require('../assets/fonts/Poppins-Regular.otf'),
  [FONT_FAMILIES.POPPINS.MEDIUM]: require('../assets/fonts/Poppins-Medium.otf'),
  [FONT_FAMILIES.POPPINS.BOLD]: require('../assets/fonts/Poppins-Bold.otf'),
} as const;

/**
 * Helper functions for font usage
 */
export const FontHelpers = {
  getAllFontNames: () => [
    ...Object.values(FONT_FAMILIES.PRAMUKH_ROUNDED),
    ...Object.values(FONT_FAMILIES.POPPINS),
  ],
};

/**
 * Default font configurations for common use cases
 */
export const FONT_PRESETS = {
  // Headings - PramukhRounded
  HEADING_PRIMARY: FONT_FAMILIES.PRAMUKH_ROUNDED.BLACK,
  HEADING_SECONDARY: FONT_FAMILIES.PRAMUKH_ROUNDED.BOLD,
  DISPLAY: FONT_FAMILIES.PRAMUKH_ROUNDED.BLACK,
  // Body/UI - Poppins
  BODY: FONT_FAMILIES.POPPINS.REGULAR,
  BODY_LIGHT: FONT_FAMILIES.POPPINS.LIGHT,
  BODY_MEDIUM: FONT_FAMILIES.POPPINS.MEDIUM,
  BODY_BOLD: FONT_FAMILIES.POPPINS.BOLD,
  BUTTON: FONT_FAMILIES.POPPINS.MEDIUM,
  CAPTION: FONT_FAMILIES.POPPINS.REGULAR,
  LABEL: FONT_FAMILIES.POPPINS.MEDIUM,
} as const;
