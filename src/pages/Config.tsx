import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type User = {
  id: number;
  username: string;
  role: string;
};

const Config = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, username, role')
        .order('id');
      
      if (data) {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Configuration</Heading>
        
        <Box>
          <Heading size="md" mb={4}>Liste des utilisateurs</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Nom d'utilisateur</Th>
                <Th>Rôle</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td>{user.username}</Td>
                  <Td>{user.role}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Text color="gray.600">
            Cette page n'est accessible qu'aux administrateurs.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Config;
