import {
  Container,
  Heading,
  VStack,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

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
  is_locked: boolean;
}

const CourseButton = ({ course }: { course: Course }) => {
  if (course.is_locked) {
    return (
      <Tooltip
        label="Ce cours n'est pas encore disponible"
        placement="top"
        hasArrow
      >
        <Button
          width="100%"
          variant="outline"
          colorScheme="gray"
          isDisabled
          justifyContent="flex-start"
          leftIcon={<LockIcon />}
        >
          {course.title}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      width="100%"
      as="a"
      href={course.link}
      target="_blank"
      variant="outline"
      colorScheme="blue"
      justifyContent="flex-start"
    >
      {course.title}
    </Button>
  );
};

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
                      <CourseButton key={course.id} course={course} />
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
