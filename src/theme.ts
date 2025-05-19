import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      // ... autres nuances
    },
  },
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
  },
  components: {
    Button: {
      // Styles de base pour tous les boutons
      baseStyle: {
        fontWeight: 'bold',
      },
      // Variantes personnalisées
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.600' },
        },
        secondary: {
          bg: 'gray.200',
          color: 'gray.800',
          _hover: { bg: 'gray.300' },
        },
      },
    },
    // Personnaliser d'autres composants...
  },
});

export default theme;
