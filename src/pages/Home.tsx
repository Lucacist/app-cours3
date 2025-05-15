import { Stack, Heading, Text, Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Home = () => {
  const [connectionStatus, setConnectionStatus] = useState('Vérification...');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setConnectionStatus('Connexion à Supabase réussie ! ✅');
    } catch (error) {
      console.error('Erreur:', error);
      setConnectionStatus('Erreur de connexion à Supabase ❌');
    }
  };

  return (
    <Stack spacing={6} width="100%" maxW="600px" mx="auto" py={8}>
      <Heading textAlign="center">Mon Application React</Heading>
      <Box
        p={4}
        borderRadius="md"
        bg="white"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="lg" textAlign="center">{connectionStatus}</Text>
      </Box>
    </Stack>
  );
};

export default Home;
