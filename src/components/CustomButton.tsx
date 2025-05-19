import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

// Composant de bouton personnalisé avec des styles par défaut
export const CustomButton = (props: ButtonProps) => {
  return (
    <Button
      bg="brand.500"
      color="white"
      fontWeight="bold"
      borderRadius="lg"
      _hover={{ bg: 'brand.600', transform: 'translateY(-2px)' }}
      _active={{ bg: 'brand.700' }}
      transition="all 0.2s"
      boxShadow="md"
      {...props}
    />
  );
};

// Variante secondaire
export const SecondaryButton = (props: ButtonProps) => {
  return (
    <Button
      bg="gray.100"
      color="gray.800"
      fontWeight="medium"
      borderRadius="lg"
      _hover={{ bg: 'gray.200' }}
      _active={{ bg: 'gray.300' }}
      {...props}
    />
  );
};

export default CustomButton;
