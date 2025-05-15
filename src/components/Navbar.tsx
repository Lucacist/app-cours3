import { Box, Flex, Heading, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <Box bg="blue.500" px={4} color="white">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Heading size="md" cursor="pointer" onClick={() => navigate('/')}>
          Mon App
        </Heading>
        <Flex gap={4}>
          <Button
            variant="ghost"
            _hover={{ bg: 'blue.600' }}
            onClick={() => navigate('/')}
          >
            Accueil
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
