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

const CourseButton = ({ course }: { course: Course }) => {
  if (course.is_locked) {
    return (
      <Tooltip label="Ce cours n'est pas encore disponible" placement="top" hasArrow>
        <Button width="100%" variant="outline" colorScheme="gray" isDisabled leftIcon={<LockIcon />}>
          {course.title}
        </Button>
      </Tooltip>
    );
  }

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
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ChakraContainer maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Cours disponibles</Heading>
        
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
      </VStack>
    </ChakraContainer>
  );
};

export default Home;
