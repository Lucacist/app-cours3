import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  VStack,
  Text,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Container {
  id: number;
  title: string;
  created_at: string;
}

interface Course {
  id: number;
  container_id: number;
  title: string;
  link: string;
}

const Home = () => {
  const [connectionStatus, setConnectionStatus] = useState('Vérification...');
  const [containers, setContainers] = useState<Container[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setConnectionStatus('Connexion à Supabase réussie ! ✅');
      } catch (error) {
        console.error('Erreur:', error);
        setConnectionStatus('Erreur de connexion à Supabase ❌');
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Récupérer les containers
      const { data: containersData } = await supabase
        .from('containers')
        .select('*')
        .order('created_at');
      
      if (containersData) {
        setContainers(containersData);
      }

      // Récupérer les cours
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('created_at');
      
      if (coursesData) {
        setCourses(coursesData);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Cours disponibles</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {containers.map((container) => (
            <Card key={container.id} bg={cardBg} shadow="md">
              <CardHeader>
                <Heading size="md">{container.title}</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  {courses
                    .filter(course => course.container_id === container.id)
                    .map(course => (
                      <Button
                        key={course.id}
                        as="a"
                        href={course.link}
                        target="_blank"
                        variant="outline"
                        colorScheme="blue"
                        justifyContent="flex-start"
                        leftIcon={<Text fontSize="sm">📚</Text>}
                      >
                        {course.title}
                      </Button>
                    ))
                  }
                  {courses.filter(course => course.container_id === container.id).length === 0 && (
                    <Text color="gray.500" fontSize="sm">
                      Aucun cours disponible
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default Home;
