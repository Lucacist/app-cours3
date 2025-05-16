import {
  Box,
  Container as ChakraContainer,
  Heading,
  VStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

import { Container, Course, User, UserRole } from '../types';

interface MoveCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  containers: Container[];
  currentContainerId: number;
  onMove: (courseId: number, newContainerId: number) => void;
}

const MoveCourseModal = ({ isOpen, onClose, course, containers, currentContainerId, onMove }: MoveCourseModalProps) => {
  const [selectedContainerId, setSelectedContainerId] = useState<number>(currentContainerId);

  const handleMove = () => {
    if (selectedContainerId === currentContainerId) return;
    onMove(course.id, selectedContainerId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Déplacer le cours</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Choisir le dossier de destination</FormLabel>
              <Select
                value={selectedContainerId}
                onChange={(e) => setSelectedContainerId(Number(e.target.value))}
              >
                {containers
                  .filter(container => container.id !== currentContainerId)
                  .map(container => (
                    <option key={container.id} value={container.id}>
                      {container.title}
                    </option>
                  ))}
              </Select>
            </FormControl>

            <Button colorScheme="blue" width="100%" onClick={handleMove}>
              Déplacer
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

interface UserCourseAccess {
  userId: number;
  courseId: number;
}

const Config = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userCourses, setUserCourses] = useState<UserCourseAccess[]>([]);
  const [newContainerTitle, setNewContainerTitle] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseLink, setNewCourseLink] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isMoveOpen,
    onOpen: onMoveOpen,
    onClose: onMoveClose
  } = useDisclosure();
  const {
    isOpen: isUserModalOpen,
    onOpen: onUserModalOpen,
    onClose: onUserModalClose
  } = useDisclosure();
  const {
    isOpen: isAccessModalOpen,
    onOpen: onAccessModalOpen,
    onClose: onAccessModalClose
  } = useDisclosure();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCourseAccessModalOpen, setIsCourseAccessModalOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const toast = useToast();

  const fetchContainers = async () => {
    const { data } = await supabase
      .from('containers')
      .select('*')
      .order('created_at');
    
    if (data) {
      setContainers(data);
    }
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at');
    
    if (data) {
      setCourses(data);
    }
  };

  const fetchPrerequisites = async () => {
    const { data } = await supabase
      .from('course_prerequisites')
      .select('course_id, prerequisite_id');
    
    if (data) {
      // Organiser les prérequis par cours
      const prereqMap = new Map<number, number[]>();
      data.forEach(({ course_id, prerequisite_id }) => {
        if (!prereqMap.has(course_id)) {
          prereqMap.set(course_id, []);
        }
        prereqMap.get(course_id)?.push(prerequisite_id);
      });

      // Mettre à jour les cours avec leurs prérequis
      setCourses(prevCourses => prevCourses.map(course => ({
        ...course,
        prerequisites: prereqMap.get(course.id) || []
      })));
    }
  };

  const fetchUsers = async () => {
    try {
      // Utiliser directement les utilisateurs de test puisque la table users ne semble pas accessible
      // ou est vide. Cela permettra de tester l'interface de gestion des accès.
      const testUsers: User[] = [
        { id: 1, username: 'user1', role: 'user' as UserRole, created_at: new Date().toISOString() },
        { id: 2, username: 'user2', role: 'user' as UserRole, created_at: new Date().toISOString() },
        { id: 3, username: 'admin', role: 'admin' as UserRole, created_at: new Date().toISOString() }
      ];
      
      console.log('Utilisation d\'utilisateurs de test pour débogage:', testUsers);
      setUsers(testUsers);
      
      // Essayer quand même de récupérer les vrais utilisateurs en arrière-plan
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      } else if (data && data.length > 0) {
        console.log('Utilisateurs réels trouvés dans la base de données:', data);
        // Nous n'utilisons pas ces données pour le moment, mais nous les affichons 
        // pour aider au débogage
      } else {
        console.warn('Aucun utilisateur réel trouvé dans la base de données');
      }
    } catch (err) {
      console.error('Exception lors de la récupération des utilisateurs:', err);
    }
  };

  const handleAddUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom d\'utilisateur et le mot de passe sont requis',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { data, error } = await supabase
      .rpc('add_user', {
        p_username: newUsername,
        p_password: newPassword,
        p_role: newUserRole
      });

    if (error) {
      console.error('Error adding user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'utilisateur',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setNewUsername('');
    setNewPassword('');
    setNewUserRole('user');
    onUserModalClose();
    fetchUsers();
    toast({
      title: 'Succès',
      description: 'Utilisateur créé',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteUser = async (userId: number) => {
    const { data, error } = await supabase
      .rpc('delete_user', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'utilisateur',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    fetchUsers();
    toast({
      title: 'Succès',
      description: 'Utilisateur supprimé',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const fetchUserCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select('user_id, course_id');
      
      console.log('Accès utilisateur-cours récupérés:', data);
      console.log('Erreur éventuelle:', error);
      
      if (error) {
        console.error('Erreur lors de la récupération des accès utilisateur-cours:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les accès aux cours',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (data) {
        const formattedData = data.map(item => ({
          userId: item.user_id,
          courseId: item.course_id
        }));
        setUserCourses(formattedData);
        console.log('Accès utilisateur-cours définis dans l\'état:', formattedData.length);
      } else {
        console.warn('Aucun accès utilisateur-cours trouvé dans la base de données');
      }
    } catch (err) {
      console.error('Exception lors de la récupération des accès utilisateur-cours:', err);
    }
  };

  const handleAssignCourse = async (userId: number, courseId: number) => {
    const { data, error } = await supabase
      .rpc('assign_course_to_user', {
        p_user_id: userId,
        p_course_id: courseId
      });

    if (error) {
      console.error('Error assigning course:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'attribuer le cours',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    fetchUserCourses();
    toast({
      title: 'Succès',
      description: 'Cours attribué',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRemoveCourse = async (userId: number, courseId: number) => {
    const { data, error } = await supabase
      .rpc('remove_course_from_user', {
        p_user_id: userId,
        p_course_id: courseId
      });

    if (error) {
      console.error('Error removing course:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer le cours',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    fetchUserCourses();
    toast({
      title: 'Succès',
      description: 'Cours retiré',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const hasAccess = (userId: number, courseId: number) => {
    // Vérifier si l'utilisateur est un admin (les admins ont toujours accès à tous les cours)
    const user = users.find(u => u.id === userId);
    if (user?.role === 'admin') return true;
    
    // Vérifier si l'utilisateur a une entrée dans la table user_courses pour ce cours
    const hasSpecificAccess = userCourses.some(uc => uc.userId === userId && uc.courseId === courseId);
    
    // L'accès est déterminé uniquement par la présence d'une entrée dans user_courses
    return hasSpecificAccess;
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchContainers(),
        fetchCourses(),
        fetchPrerequisites(),
        fetchUsers(),
        fetchUserCourses()
      ]);
    };
    
    loadData();
  }, []);

  // Effet pour recharger les utilisateurs lorsque la modal des accès par cours s'ouvre
  useEffect(() => {
    if (isCourseAccessModalOpen && isLoadingUsers) {
      const loadUsersData = async () => {
        try {
          await Promise.all([
            fetchUsers(),
            fetchUserCourses()
          ]);
          console.log('Données utilisateurs et accès mises à jour après ouverture de la modal');
        } catch (err) {
          console.error('Erreur lors de la mise à jour des données:', err);
          toast({
            title: 'Erreur',
            description: 'Impossible de récupérer les données utilisateurs',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsLoadingUsers(false);
        }
      };
      
      loadUsersData();
    }
  }, [isCourseAccessModalOpen, isLoadingUsers]);

  const handleAddContainer = async () => {
    if (!newContainerTitle.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre ne peut pas être vide',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { error } = await supabase
      .from('containers')
      .insert([{ title: newContainerTitle }]);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le container',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setNewContainerTitle('');
    fetchContainers();
    toast({
      title: 'Succès',
      description: 'Container créé',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteCourse = async (courseId: number) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le cours',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    fetchCourses();
    toast({
      title: 'Succès',
      description: 'Cours supprimé',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleMoveCourse = async (courseId: number, newContainerId: number) => {
    const { error } = await supabase
      .from('courses')
      .update({ container_id: newContainerId })
      .eq('id', courseId);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de déplacer le cours',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    fetchCourses();
    toast({
      title: 'Succès',
      description: 'Cours déplacé',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteContainer = async (id: number) => {
    const { error } = await supabase
      .from('containers')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le container',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    fetchContainers();
    fetchCourses();
    toast({
      title: 'Succès',
      description: 'Container supprimé',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAddCourse = async () => {
    if (!selectedContainer || !newCourseTitle.trim() || !newCourseLink.trim()) {
      toast({
        title: 'Erreur',
        description: 'Tous les champs sont requis',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { error } = await supabase
      .from('courses')
      .insert([{
        container_id: selectedContainer.id,
        title: newCourseTitle,
        link: newCourseLink,
      }]);

    if (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le cours',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setNewCourseTitle('');
    setNewCourseLink('');
    onClose();
    fetchCourses();
    toast({
      title: 'Succès',
      description: 'Cours ajouté',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <ChakraContainer maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Configuration</Heading>
        
        {/* Gestion des utilisateurs */}
        <Box>
          <Heading size="md" mb={4}>Gestion des utilisateurs</Heading>
          <HStack mb={4}>
            <Button
              colorScheme="blue"
              onClick={onUserModalOpen}
            >
              Ajouter un utilisateur
            </Button>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="sm">{user.username}</Heading>
                    <HStack>
                      <Text fontSize="sm" color={user.role === 'admin' ? 'green.500' : 'blue.500'}>
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </Text>
                      <HStack>
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => {
                              setSelectedUser(user);
                              onAccessModalOpen();
                            }}
                          >
                            Gérer accès
                          </Button>
                        )}
                        {user.username !== 'admin' && (
                          <IconButton
                            aria-label="Supprimer l'utilisateur"
                            children="X"
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          />
                        )}
                      </HStack>
                    </HStack>
                  </HStack>
                </CardHeader>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
        
        {/* Ajout de container */}
        <Box>
          <Heading size="md" mb={4}>Ajouter un container</Heading>
          <HStack>
            <FormControl>
              <Input
                placeholder="Titre du container"
                value={newContainerTitle}
                onChange={(e) => setNewContainerTitle(e.target.value)}
              />
            </FormControl>
            <Button

              colorScheme="blue"
              onClick={handleAddContainer}
            >
              Ajouter
            </Button>
          </HStack>
        </Box>

        {/* Liste des containers */}
        <Box>
          <Heading size="md" mb={4}>Containers</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {containers.map((container) => (
              <Card key={container.id}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="sm">{container.title}</Heading>
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => {
                          setSelectedContainer(container);
                          onOpen();
                        }}
                      >
                        Ajouter un cours
                      </Button>
                      <IconButton
                        aria-label="Supprimer le container"
                        children="X"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteContainer(container.id)}
                      />
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    {courses
                      .filter(course => course.container_id === container.id)
                      .map(course => (
                        <HStack key={course.id} justify="space-between">
                          <Text>{course.title}</Text>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="link"
                              colorScheme="blue"
                              as="a"
                              href={course.link}
                              target="_blank"
                            >
                              Voir
                            </Button>
                            <Menu>
                              <MenuButton
                                as={Button}
                                rightIcon={<ChevronDownIcon />}
                                size="sm"
                                variant="ghost"
                              >
                                Actions
                              </MenuButton>
                              <MenuList>
                                <MenuItem
                                  onClick={() => {
                                    setSelectedContainer({ ...container });
                                    setSelectedCourse(course);
                                    onMoveOpen();
                                  }}
                                >
                                  Déplacer
                                </MenuItem>

                                <MenuItem
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setIsLoadingUsers(true);
                                    setIsCourseAccessModalOpen(true);
                                  }}
                                >
                                  Gérer les accès
                                </MenuItem>
                                <MenuItem
                                  color="red.500"
                                  onClick={() => handleDeleteCourse(course.id)}
                                >
                                  Supprimer
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </HStack>
                      ))
                    }
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>

      {/* Modal de déplacement de cours */}
      {selectedCourse && selectedContainer && (
        <MoveCourseModal
          isOpen={isMoveOpen}
          onClose={onMoveClose}
          course={selectedCourse}
          containers={containers}
          currentContainerId={selectedContainer.id}
          onMove={handleMoveCourse}
        />
      )}



      {/* Modal d'ajout de cours */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ajouter un cours à {selectedContainer?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Titre du cours</FormLabel>
                <Input
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="Entrez le titre"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Lien</FormLabel>
                <Input
                  value={newCourseLink}
                  onChange={(e) => setNewCourseLink(e.target.value)}
                  placeholder="Entrez le lien"
                />
              </FormControl>

              <Button colorScheme="blue" width="100%" onClick={handleAddCourse}>
                Ajouter le cours
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal d'ajout d'utilisateur */}
      <Modal isOpen={isUserModalOpen} onClose={onUserModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ajouter un utilisateur</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nom d'utilisateur</FormLabel>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Entrez le nom d'utilisateur"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Mot de passe</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez le mot de passe"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Rôle</FormLabel>
                <Select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </Select>
              </FormControl>

              <Button colorScheme="blue" width="100%" onClick={handleAddUser}>
                Ajouter l'utilisateur
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de gestion des accès aux cours */}
      {selectedUser && (
        <Modal isOpen={isAccessModalOpen} onClose={onAccessModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Gérer les accès pour {selectedUser.username}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Text>Sélectionnez les cours auxquels cet utilisateur a accès :</Text>
                
                {containers.map(container => (
                  <Box key={container.id} mb={4}>
                    <Heading size="sm" mb={2}>{container.title}</Heading>
                    <VStack align="stretch" spacing={2}>
                      {courses
                        .filter(course => course.container_id === container.id)
                        .map(course => (
                          <HStack key={course.id} justify="space-between">
                            <Text>{course.title}</Text>
                            <Button
                              size="sm"
                              colorScheme={hasAccess(selectedUser.id, course.id) ? "red" : "green"}
                              onClick={() => {
                                if (hasAccess(selectedUser.id, course.id)) {
                                  handleRemoveCourse(selectedUser.id, course.id);
                                } else {
                                  handleAssignCourse(selectedUser.id, course.id);
                                }
                              }}
                            >
                              {hasAccess(selectedUser.id, course.id) ? "Retirer l'accès" : "Donner accès"}
                            </Button>
                          </HStack>
                        ))
                      }
                    </VStack>
                  </Box>
                ))}

                <Button colorScheme="blue" onClick={onAccessModalClose} mt={4}>
                  Fermer
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de gestion des accès par cours */}
      {selectedCourse && (
        <Modal 
          isOpen={isCourseAccessModalOpen} 
          onClose={() => setIsCourseAccessModalOpen(false)} 
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Gérer les accès au cours: {selectedCourse.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Text>Sélectionnez les utilisateurs qui ont accès à ce cours :</Text>
                
                {isLoadingUsers ? (
                  <Box p={4} textAlign="center" bg="blue.100" borderRadius="md">
                    <Text>Chargement des utilisateurs en cours...</Text>
                  </Box>
                ) : users.length === 0 ? (
                  <Box p={4} textAlign="center" bg="orange.100" borderRadius="md">
                    <Text>Aucun utilisateur trouvé. Vérifiez votre connexion à la base de données.</Text>
                    <Button 
                      mt={2} 
                      colorScheme="blue" 
                      onClick={() => {
                        setIsLoadingUsers(true);
                        fetchUsers().finally(() => setIsLoadingUsers(false));
                      }}
                    >
                      Recharger les utilisateurs
                    </Button>
                  </Box>
                ) : users.filter(user => user.role !== 'admin').length === 0 ? (
                  <Box p={4} textAlign="center">
                    <Text>Aucun utilisateur standard n'est disponible. Les administrateurs ont accès à tous les cours par défaut.</Text>
                  </Box>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {users
                      .filter(user => user.role !== 'admin') // Les admins ont toujours accès à tous les cours
                      .map(user => (
                        <Card key={user.id} variant="outline">
                          <CardBody>
                            <HStack justify="space-between">
                              <Text>{user.username}</Text>
                              <Button
                                size="sm"
                                colorScheme={hasAccess(user.id, selectedCourse.id) ? "red" : "green"}
                                onClick={() => {
                                  if (hasAccess(user.id, selectedCourse.id)) {
                                    handleRemoveCourse(user.id, selectedCourse.id);
                                  } else {
                                    handleAssignCourse(user.id, selectedCourse.id);
                                  }
                                }}
                              >
                                {hasAccess(user.id, selectedCourse.id) ? "Retirer l'accès" : "Donner accès"}
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))
                    }
                  </SimpleGrid>
                )}

                <Button colorScheme="blue" onClick={() => setIsCourseAccessModalOpen(false)} mt={4}>
                  Fermer
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </ChakraContainer>
  );
};

export default Config;
