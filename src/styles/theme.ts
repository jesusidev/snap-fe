import { Button, Card, createTheme, Text } from '@mantine/core';
import { breakpoints } from '~/styles/breakpoints';
import { color } from '~/styles/colors';
import buttonStyles from './Button.module.css';
import cardStyles from './Card.module.css';
import textStyles from './Text.module.css';

export const theme = createTheme({
  colors: {
    brand: color.brand,
  },
  primaryColor: 'brand',
  primaryShade: 5,
  fontFamily: "'Inter', system-ui, sans-serif",
  headings: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontWeight: '600',
  },
  breakpoints: {
    xs: breakpoints.mobile,
    sm: breakpoints.mobile,
    md: breakpoints.tablet,
    lg: breakpoints.laptop,
    xl: breakpoints.desktop,
  },
  components: {
    Button: Button.extend({
      defaultProps: { variant: 'filled' },
      classNames: buttonStyles,
    }),
    Card: Card.extend({
      classNames: cardStyles,
    }),
    Text: Text.extend({
      classNames: textStyles,
    }),
  },
});
