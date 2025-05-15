import { Box, Button, Container, Flex, HStack, Text, Heading } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  return (
    <Box bg="blue.500" py={4}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <Heading size="md" color="white">
            Mon App
          </Heading>
          <Flex align="center" gap={4}>
            <HStack spacing={4} align="center">
              <Flex align="center" gap={2}>
                <Text color="white">{user?.username}</Text>
                <Text color="white" fontSize="sm" opacity={0.8}>
                  ({user?.role})
                </Text>
              </Flex>
              <Button
                as={Link}
                to="/"
                variant="ghost"
                colorScheme="whiteAlpha"
                size="sm"
              >
                Accueil
              </Button>
              {user?.role === 'admin' && (
                <Button
                  as={Link}
                  to="/config"
                  variant="ghost"
                  colorScheme="whiteAlpha"
                  size="sm"
                >
                  Configuration
                </Button>
              )}
              <Button
                colorScheme="whiteAlpha"
                variant="solid"
                size="sm"
                onClick={handleSignOut}
              >
                Déconnexion
              </Button>
            </HStack>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;
