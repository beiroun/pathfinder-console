// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Combobox,
  createTheme,
  DEFAULT_THEME,
  Input,
  InputWrapper,
  type MantineColorsTuple,
  type MantineTransition,
  Menu,
  Modal,
  NavLink,
  Paper,
  Popover,
  Table,
  Tooltip,
  virtualColor
} from '@mantine/core';

/*
 * Mantine theme of the console. Every brand colour is a
 * virtualColor: one tuple for the light scheme (index 6 = the canonical value), another for the dark one, built
 * from named roles for the deep-blue canvas and checked for contrast. Mantine reads a tuple by
 * index and reads different indexes per scheme: light - 6 text/outline/fill, 1-2 "light" backgrounds, 9 "light"
 * text; dark - 0 "light" text, 1 outline, 4 text and anchors, 5 fill, 6 its hover, 8 error/success, and the "light"
 * background is index 9 darkened by half.
 */

/** Blue of the logo, the primary colour: buttons, active controls, focus; index 7 is the blue as text (4.9:1). */
const brandLight: MantineColorsTuple = [
  '#F1F6F9',
  '#DEECF2',
  '#BFDDE9',
  '#91C8DF',
  '#63B7D9',
  '#37A9D7',
  '#2692BE',
  '#1C799F',
  '#176180',
  '#114A61'
];

/** Sky blue of the logo: the sign, highlights, the selected row (index 1), chart series. Never text, never a button. */
const skyLight: MantineColorsTuple = [
  '#F0F8FA',
  '#DBF0F5',
  '#B7E4F0',
  '#88D8EE',
  '#60D1F0',
  '#36CCF6',
  '#12C3F4',
  '#05A6D2',
  '#0485A9',
  '#036580'
];

/** Terracotta, the brand's accent: counters, attention, the active navigation item (index 7 as text). */
const accentLight: MantineColorsTuple = [
  '#F9F3F0',
  '#F3E4DD',
  '#ECCABB',
  '#E9B29A',
  '#E89A79',
  '#EB895F',
  '#E66C37',
  '#D44F15',
  '#AB4011',
  '#81300D'
];

/** Neutrals tuned so Mantine's slots land on the palette: 4 (default border) = hairline, 6 (dimmed) = dark grey. */
const grayLight: MantineColorsTuple = [
  '#F7F7F8',
  '#F1F2F3',
  '#EBECEE',
  '#E9EAEC',
  '#E6E7E9',
  '#A6A7AA',
  '#58595B',
  '#4A4B4D',
  '#3A3B3D',
  '#262728'
];

/**
 * Dark neutrals: the body (index 7) is the deep tone of the brand blue; surfaces, hover and borders are lighter
 * steps of the same hue. Mantine reads: 0 text, 1 secondary, 2 dimmed, 3 placeholder, 4 border, 5 hover, 6 surface,
 * 7 body, 8 sunken, 9 deep.
 */
const dark: MantineColorsTuple = [
  '#EFF3F5',
  '#CDDDE4',
  '#95B6C6',
  '#689CB6',
  '#2A586F',
  '#1D4458',
  '#153849',
  '#0E2A38',
  '#0B222D',
  '#091B24'
];

/** The slots Mantine reads from a colour tuple in the dark scheme, named. */
interface DarkSchemeColorRoles {
  /** Text of the "light" variant (badges, alerts): a tint readable on its own wash. */
  onWash: string;
  /** Border and text of the "outline" variant on the canvas. */
  outline: string;
  /** Text and anchors in this colour on the canvas and on paper. */
  text: string;
  /** Background of the "filled" variant (buttons). */
  filled: string;
  /** Hover of "filled" - on a dark canvas a hover lightens; also the text of a coloured Menu.Item. */
  filledHover: string;
  /** What Mantine reads as the error (red) or success (teal) colour. */
  semantic: string;
  /** Background of the "light" variant: the hue mixed into the canvas, so a pill sits on it, not under it. */
  wash: string;
}

/** Mantine derives the "light" background as index 9 darkened by half, so index 9 carries the wash doubled. */
function washSource(wash: string): string {
  const channels = [1, 3, 5].map(offset =>
    Math.min(255, parseInt(wash.slice(offset, offset + 2), 16) * 2)
  );
  return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

function darkSchemeTuple(roles: DarkSchemeColorRoles): MantineColorsTuple {
  return [
    roles.onWash,
    roles.outline,
    roles.onWash,
    roles.outline,
    roles.text,
    roles.filled,
    roles.filledHover,
    roles.filledHover,
    roles.semantic,
    washSource(roles.wash)
  ];
}

const brandDark = darkSchemeTuple({
  onWash: '#74B9D5',
  outline: '#4DA6CA',
  text: '#4DA6CA',
  filled: '#2692BE',
  filledHover: '#3C9DC4',
  semantic: '#3399C2',
  wash: '#15475E'
});

const skyDark = darkSchemeTuple({
  onWash: '#4BD1F7',
  outline: '#12C3F4',
  text: '#12C3F4',
  filled: '#12C3F4',
  filledHover: '#2AC9F5',
  semantic: '#12C3F4',
  wash: '#0F556D'
});

const accentDark = darkSchemeTuple({
  onWash: '#EE9873',
  outline: '#EA8153',
  text: '#EA8153',
  filled: '#E66C37',
  filledHover: '#E87B4B',
  semantic: '#E66C37',
  wash: '#4A3C38'
});

const grayDark = darkSchemeTuple({
  onWash: '#BBBCBE',
  outline: '#A6A7AA',
  text: '#A6A7AA',
  filled: '#A6A7AA',
  filledHover: '#AFB0B2',
  semantic: '#A6A7AA',
  wash: '#394D58'
});

const redDark = darkSchemeTuple({
  onWash: '#EC7F7F',
  outline: '#EB7B7B',
  text: '#E86767',
  filled: '#E03131',
  filledHover: '#E34646',
  semantic: '#E86767',
  wash: '#492C36'
});

const tealDark = darkSchemeTuple({
  onWash: '#5ECFAD',
  outline: '#12B886',
  text: '#12B886',
  filled: '#12B886',
  filledHover: '#2ABF92',
  semantic: '#12B886',
  wash: '#0F524E'
});

const yellowDark = darkSchemeTuple({
  onWash: '#F3A538',
  outline: '#F08C00',
  text: '#F08C00',
  filled: '#F08C00',
  filledHover: '#F2981A',
  semantic: '#F08C00',
  wash: '#4D4528'
});

const fontFamily = "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

/*
 * Motion of the floating layers: menus, dropdowns and popovers drop 4px
 * into place as they fade in, a modal rises 6px; leaving is quicker than coming. Mantine opens dropdowns of selects
 * instantly by default (duration 0) – here they move like every other layer.
 */
const EASE_OUT = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

const DROP_IN: MantineTransition = {
  in: { opacity: 1, transform: 'translateY(0)' },
  out: { opacity: 0, transform: 'translateY(-4px)' },
  transitionProperty: 'opacity, transform'
};

const RISE_IN: MantineTransition = {
  in: { opacity: 1, transform: 'translateY(0)' },
  out: { opacity: 0, transform: 'translateY(6px)' },
  transitionProperty: 'opacity, transform'
};

const FLOATING_TRANSITION = {
  transition: DROP_IN,
  duration: 160,
  exitDuration: 100,
  timingFunction: EASE_OUT
};

export const appTheme = createTheme({
  // An operator who asked the system for less motion gets none from Mantine either (motion.css stops the rest)
  respectReducedMotion: true,
  fontFamily,
  fontFamilyMonospace: "ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  headings: { fontFamily, fontWeight: '700' },
  fontSmoothing: true,
  white: '#FFFFFF',
  black: '#0A0A0A',
  colors: {
    brandLight,
    brandDark,
    brand: virtualColor({
      name: 'brand',
      light: 'brandLight',
      dark: 'brandDark'
    }),
    skyLight,
    skyDark,
    sky: virtualColor({ name: 'sky', light: 'skyLight', dark: 'skyDark' }),
    accentLight,
    accentDark,
    accent: virtualColor({
      name: 'accent',
      light: 'accentLight',
      dark: 'accentDark'
    }),
    grayLight,
    grayDark,
    gray: virtualColor({ name: 'gray', light: 'grayLight', dark: 'grayDark' }),
    // Mantine's own red, teal and yellow stay on the light canvas; only their dark halves are ours
    redLight: DEFAULT_THEME.colors.red,
    redDark,
    red: virtualColor({ name: 'red', light: 'redLight', dark: 'redDark' }),
    tealLight: DEFAULT_THEME.colors.teal,
    tealDark,
    teal: virtualColor({ name: 'teal', light: 'tealLight', dark: 'tealDark' }),
    yellowLight: DEFAULT_THEME.colors.yellow,
    yellowDark,
    yellow: virtualColor({
      name: 'yellow',
      light: 'yellowLight',
      dark: 'yellowDark'
    }),
    dark
  },
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: 'md',
  radius: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '9999px' },
  // Every step grows with the screen (--pf-fluid in tokens.css): the tighter values on a small laptop (1280×720),
  // Mantine's own on full HD, so the gaps and paddings of a page give a low screen to its content
  spacing: {
    xs: 'calc(0.5rem + var(--pf-fluid) / 8)',
    sm: 'calc(0.625rem + var(--pf-fluid) / 8)',
    md: 'calc(0.75rem + var(--pf-fluid) / 4)',
    lg: 'calc(1rem + var(--pf-fluid) / 4)',
    xl: 'calc(1.5rem + var(--pf-fluid) / 2)'
  },
  // Depth is the hairline and the paper, never a shadow
  shadows: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none' },
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
    xl: '1400px'
  },
  components: {
    Button: Button.extend({
      defaultProps: { radius: 'md' },
      styles: { root: { fontWeight: 500, letterSpacing: 0 } }
    }),
    Badge: Badge.extend({
      defaultProps: { radius: 'xl', variant: 'light' },
      // overflow visible on the root and the label: Mantine clips both with an ellipsis, which lets an auto-layout
      // table shrink a badge column below its text; status labels are short and must never be cut
      styles: {
        root: {
          fontWeight: 500,
          letterSpacing: '0.02em',
          textTransform: 'none',
          overflow: 'visible'
        },
        label: { overflow: 'visible' }
      }
    }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: 'sm', highlightOnHover: true },
      styles: {
        th: {
          fontWeight: 500,
          fontSize: '12px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--pf-ash)'
        }
      }
    }),
    Card: Card.extend({
      defaultProps: {
        withBorder: true,
        shadow: 'none',
        radius: 'lg',
        padding: 'lg'
      }
    }),
    Paper: Paper.extend({ defaultProps: { shadow: 'none', radius: 'lg' } }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'lg',
        overlayProps: { backgroundOpacity: 0.45, blur: 2 },
        transitionProps: {
          transition: RISE_IN,
          duration: 220,
          exitDuration: 160,
          timingFunction: EASE_OUT
        }
      },
      styles: {
        content: { border: '1px solid var(--mantine-color-default-border)' },
        title: { fontSize: '18px', fontWeight: 700 }
      }
    }),
    // Floating layers and fields on the dark canvas: a dropdown takes the paper, a field is sunken to the canvas
    Menu: Menu.extend({
      defaultProps: { transitionProps: FLOATING_TRANSITION },
      styles: { dropdown: { backgroundColor: 'var(--pf-paper)' } }
    }),
    Combobox: Combobox.extend({
      defaultProps: { transitionProps: FLOATING_TRANSITION },
      styles: { dropdown: { backgroundColor: 'var(--pf-paper)' } }
    }),
    Popover: Popover.extend({
      defaultProps: { transitionProps: FLOATING_TRANSITION }
    }),
    Input: Input.extend({
      styles: { input: { backgroundColor: 'var(--pf-field)' } }
    }),
    InputWrapper: InputWrapper.extend({
      styles: {
        label: {
          fontWeight: 500,
          fontSize: '13px',
          color: 'var(--pf-ink-soft)'
        }
      }
    }),
    Code: Code.extend({
      styles: {
        root: {
          backgroundColor: 'var(--pf-surface-alt)',
          border: '1px solid var(--pf-hairline)'
        }
      }
    }),
    Alert: Alert.extend({
      defaultProps: { variant: 'light', radius: 'md' },
      styles: { title: { fontWeight: 500 } }
    }),
    NavLink: NavLink.extend({ styles: { label: { fontSize: '14px' } } }),
    // Mantine opens tooltips by the mouse only: on a phone the exact time, the full role name and the like were out
    // of reach. A tap opens them, a tap elsewhere closes; the keyboard focus opens them too
    Tooltip: Tooltip.extend({
      defaultProps: {
        withArrow: false,
        events: { hover: true, focus: true, touch: true },
        // A tooltip opens toward its target from any side: a plain fade, no travel
        transitionProps: { transition: 'fade', duration: 120 }
      }
    })
  }
});
