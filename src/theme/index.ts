import { createTheme } from '@mantine/core';
import colors from './colors';

export const corporateTheme = createTheme({
  primaryColor: 'primary',
  colors: colors as any,
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
        color: 'primary',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
      },
    },
    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
        withBorder: true,
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        shadow: 'xl',
      },
    },
  },
});

export { colors };
