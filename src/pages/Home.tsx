import {
  Container as ChakraContainer,
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

import { Container, Course } from '../types';

// Composant simplifié qui ignore le champ is_locked
const CourseButton = ({ course }: { course: Course }) => {
  return (
    <Button
      as="a"
      href={course.link}
      target="_blank"
      rel="noopener noreferrer"
      width="100%"
      variant="solid"
      colorScheme="blue"
    >
      {course.title}
    </Button>
  );
};

const Home = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'utilisateur connecté
        const userJson = localStorage.getItem('user');
        if (!userJson) {
          console.error('User not found in localStorage');
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(userJson);
        console.log('Utilisateur connecté:', user);
        
        // Récupérer les containers
        const { data: containersData, error: containersError } = await supabase
          .from('containers')
          .select('*')
          .order('created_at');
        
        if (containersError) {
          console.error('Erreur lors de la récupération des containers:', containersError);
        } else if (containersData) {
          console.log('Containers récupérés:', containersData.length);
          setContainers(containersData);
        }

        // Récupérer les cours accessibles à l'utilisateur
        if (user.role === 'admin') {
          // Les admins voient tous les cours
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .order('created_at');
          
          if (coursesError) {
            console.error('Erreur lors de la récupération des cours pour admin:', coursesError);
          } else if (coursesData) {
            console.log('Cours récupérés pour admin:', coursesData.length);
            setCourses(coursesData);
          }
        } else {
          // Les utilisateurs normaux voient uniquement les cours auxquels ils ont accès explicitement
          
          // 1. Récupérer tous les cours
          const { data: allCoursesData, error: allCoursesError } = await supabase
            .from('courses')
            .select('*');
          
          if (allCoursesError) {
            console.error('Erreur lors de la récupération de tous les cours:', allCoursesError);
            return;
          }
          
          // 2. Récupérer les accès spécifiques de l'utilisateur
          const { data: userCoursesData, error: userCoursesError } = await supabase
            .from('user_courses')
            .select('course_id')
            .eq('user_id', user.id);
          
          if (userCoursesError) {
            console.error('Erreur lors de la récupération des accès utilisateur:', userCoursesError);
            return;
          }
          
          // 3. Créer un ensemble des IDs de cours auxquels l'utilisateur a accès
          const userAccessibleCourseIds = new Set(
            userCoursesData?.map(item => item.course_id) || []
          );
          
          console.log('Accès utilisateur:', userAccessibleCourseIds.size, 'cours');
          
          // 4. Filtrer les cours selon la règle d'accès simplifiée :
          // - Un cours est accessible uniquement si l'utilisateur a un accès spécifique
          // - Le champ is_locked est ignoré
          const accessibleCourses = allCoursesData.filter(course => {
            // L'utilisateur ne voit que les cours auxquels il a explicitement accès
            return userAccessibleCourseIds.has(course.id);
          });
          
          console.log('Cours accessibles après filtrage:', accessibleCourses.length);
          setCourses(accessibleCourses);
        }
      } catch (error) {
        console.error('Erreur générale lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ChakraContainer maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Cours disponibles</Heading>
        
        {loading ? (
          <Text>Chargement des cours...</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {containers.map(container => (
              <Card key={container.id} bg={cardBg}>
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
                        Aucun cours dans cette catégorie
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </ChakraContainer>
  );
};

export default Home;
