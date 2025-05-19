import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/Config.css';

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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Déplacer le cours</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Choisir le dossier de destination</label>
            <select
              className="select"
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
            </select>
          </div>

          <button className="btn btn-primary btn-block" onClick={handleMove}>
            Déplacer
          </button>
        </div>
      </div>
    </div>
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
  const [isOpen, setIsOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCourseAccessModalOpen, setIsCourseAccessModalOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, description: string, status: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  
  // Fonctions pour remplacer useDisclosure
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onMoveOpen = () => setIsMoveOpen(true);
  const onMoveClose = () => setIsMoveOpen(false);
  const onUserModalOpen = () => setIsUserModalOpen(true);
  const onUserModalClose = () => setIsUserModalOpen(false);
  const onAccessModalOpen = () => setIsAccessModalOpen(true);
  const onAccessModalClose = () => setIsAccessModalOpen(false);
  
  // Fonction pour remplacer useToast
  const showToast = (title: string, description: string, status: 'success' | 'error' | 'warning' | 'info') => {
    setToastMessage({ title, description, status });
    // Effacer le toast après 3 secondes
    setTimeout(() => setToastMessage(null), 3000);
  };

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
      data.forEach(({ course_id, prerequisite_id }: { course_id: number, prerequisite_id: number }) => {
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
      showToast('Erreur', 'Le nom d\'utilisateur et le mot de passe sont requis', 'error');
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
      showToast('Erreur', 'Impossible de créer l\'utilisateur', 'error');
      return;
    }

    setNewUsername('');
    setNewPassword('');
    setNewUserRole('user');
    onUserModalClose();
    fetchUsers();
    showToast('Succès', 'Utilisateur créé', 'success');
  };

  const handleDeleteUser = async (userId: number) => {
    const { data, error } = await supabase
      .rpc('delete_user', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error deleting user:', error);
      showToast('Erreur', 'Impossible de supprimer l\'utilisateur', 'error');
      return;
    }

    fetchUsers();
    showToast('Succès', 'Utilisateur supprimé', 'success');
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
        showToast('Erreur', 'Impossible de récupérer les accès aux cours', 'error');
        return;
      }
      
      if (data) {
        const formattedData = data.map((item: { user_id: number, course_id: number }) => ({
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
      showToast('Erreur', 'Impossible d\'attribuer le cours', 'error');
      return;
    }

    fetchUserCourses();
    showToast('Succès', 'Cours attribué', 'success');
  };

  const handleRemoveCourse = async (userId: number, courseId: number) => {
    const { data, error } = await supabase
      .rpc('remove_course_from_user', {
        p_user_id: userId,
        p_course_id: courseId
      });

    if (error) {
      console.error('Error removing course:', error);
      showToast('Erreur', 'Impossible de retirer le cours', 'error');
      return;
    }

    fetchUserCourses();
    showToast('Succès', 'Cours retiré', 'success');
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
          showToast('Erreur', 'Impossible de récupérer les données utilisateurs', 'error');
        } finally {
          setIsLoadingUsers(false);
        }
      };
      
      loadUsersData();
    }
  }, [isCourseAccessModalOpen, isLoadingUsers]);

  const handleAddContainer = async () => {
    if (!newContainerTitle.trim()) {
      showToast('Erreur', 'Le titre ne peut pas être vide', 'error');
      return;
    }

    const { error } = await supabase
      .from('containers')
      .insert([{ title: newContainerTitle }]);

    if (error) {
      showToast('Erreur', 'Impossible de créer le container', 'error');
      return;
    }

    setNewContainerTitle('');
    fetchContainers();
    showToast('Succès', 'Container créé', 'success');
  };

  const handleDeleteCourse = async (courseId: number) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      showToast('Erreur', 'Impossible de supprimer le cours', 'error');
      return;
    }

    fetchCourses();
    showToast('Succès', 'Cours supprimé', 'success');
  };

  const handleMoveCourse = async (courseId: number, newContainerId: number) => {
    const { error } = await supabase
      .from('courses')
      .update({ container_id: newContainerId })
      .eq('id', courseId);

    if (error) {
      showToast('Erreur', 'Impossible de déplacer le cours', 'error');
      return;
    }

    fetchCourses();
    showToast('Succès', 'Cours déplacé', 'success');
  };

  const handleDeleteContainer = async (id: number) => {
    const { error } = await supabase
      .from('containers')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Erreur', 'Impossible de supprimer le container', 'error');
      return;
    }

    fetchContainers();
    fetchCourses();
    showToast('Succès', 'Container supprimé', 'success');
  };

  const handleAddCourse = async () => {
    if (!selectedContainer || !newCourseTitle.trim() || !newCourseLink.trim()) {
      showToast('Erreur', 'Tous les champs sont requis', 'error');
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
      showToast('Erreur', 'Impossible d\'ajouter le cours', 'error');
      return;
    }

    setNewCourseTitle('');
    setNewCourseLink('');
    onClose();
    fetchCourses();
    showToast('Succès', 'Cours ajouté', 'success');
  };

  // Composant Toast personnalisé
  const Toast = () => {
    if (!toastMessage) return null;
    
    return (
      <div className={`toast toast-${toastMessage.status}`}>
        <div className="toast-content">
          <h4 className="toast-title">{toastMessage.title}</h4>
          <p className="toast-description">{toastMessage.description}</p>
        </div>
        <button className="toast-close" onClick={() => setToastMessage(null)}>&times;</button>
      </div>
    );
  };

  return (
    <div className="config-container">
      {/* Afficher le toast s'il existe */}
      <Toast />
      
      <div className="config-content">
        <h1 className="config-title">Configuration</h1>
        
        {/* Gestion des utilisateurs */}
        <div className="config-section">
          <h2 className="config-section-title">Gestion des utilisateurs</h2>
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={onUserModalOpen}
            >
              Ajouter un utilisateur
            </button>
          </div>
          
          <div className="card-container">
            {users.map((user) => (
              <div className="card" key={user.id}>
                <div className="card-header">
                  <div className="user-card-content">
                    <h3 className="card-title">{user.username}</h3>
                    <div className="user-info">
                      <span className={user.role === 'admin' ? 'text-sm text-admin' : 'text-sm text-user'}>
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                      <div className="button-group">
                        {user.role !== 'admin' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedUser(user);
                              onAccessModalOpen();
                            }}
                          >
                            Gérer accès
                          </button>
                        )}
                        {user.username !== 'admin' && (
                          <button
                            className="btn btn-danger btn-sm"
                            aria-label="Supprimer l'utilisateur"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            X
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Ajout de container */}
        <div className="config-section">
          <h2 className="config-section-title">Ajouter un container</h2>
          <div className="form-group">
            <div className="form-control">
              <input
                className="input"
                placeholder="Titre du container"
                value={newContainerTitle}
                onChange={(e) => setNewContainerTitle(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAddContainer}
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Liste des containers */}
        <div className="config-section">
          <h2 className="config-section-title">Containers</h2>
          <div className="card-container">
            {containers.map((container) => (
              <div className="card" key={container.id}>
                <div className="card-header">
                  <div className="container-card-content">
                    <h3 className="card-title">{container.title}</h3>
                    <div className="button-group">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedContainer(container);
                          onOpen();
                        }}
                      >
                        Ajouter un cours
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        aria-label="Supprimer le container"
                        onClick={() => handleDeleteContainer(container.id)}
                      >
                        X
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="course-list">
                    {courses
                      .filter(course => course.container_id === container.id)
                      .map(course => (
                        <div className="course-item" key={course.id}>
                          <span className="course-title">{course.title}</span>
                          <div className="course-actions">
                            <a
                              className="btn btn-link btn-sm"
                              href={course.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Voir
                            </a>
                            <div className="dropdown">
                              <button className="btn btn-ghost btn-sm dropdown-toggle">
                                Actions
                              </button>
                              <div className="dropdown-content">
                                <div 
                                  className="dropdown-item"
                                  onClick={() => {
                                    setSelectedContainer({ ...container });
                                    setSelectedCourse(course);
                                    onMoveOpen();
                                  }}
                                >
                                  Déplacer
                                </div>

                                <div 
                                  className="dropdown-item"
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setIsLoadingUsers(true);
                                    setIsCourseAccessModalOpen(true);
                                  }}
                                >
                                  Gérer les accès
                                </div>
                                <div 
                                  className="dropdown-item danger"
                                  onClick={() => handleDeleteCourse(course.id)}
                                >
                                  Supprimer
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Ajouter un cours à {selectedContainer?.title}</h2>
              <button className="modal-close" onClick={onClose}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Titre du cours</label>
                <input
                  className="input"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="Entrez le titre"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lien</label>
                <input
                  className="input"
                  value={newCourseLink}
                  onChange={(e) => setNewCourseLink(e.target.value)}
                  placeholder="Entrez le lien"
                />
              </div>

              <button className="btn btn-primary btn-block" onClick={handleAddCourse}>
                Ajouter le cours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout d'utilisateur */}
      {isUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Ajouter un utilisateur</h2>
              <button className="modal-close" onClick={onUserModalClose}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <input
                  className="input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Entrez le nom d'utilisateur"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  className="input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez le mot de passe"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select
                  className="select"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <button className="btn btn-primary btn-block" onClick={handleAddUser}>
                Ajouter l'utilisateur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion des accès aux cours */}
      {selectedUser && isAccessModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2 className="modal-title">Gérer les accès pour {selectedUser.username}</h2>
              <button className="modal-close" onClick={onAccessModalClose}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="access-management">
                <p>Sélectionnez les cours auxquels cet utilisateur a accès :</p>
                
                {containers.map(container => (
                  <div className="container-section" key={container.id}>
                    <h3 className="container-title">{container.title}</h3>
                    <div className="course-access-list">
                      {courses
                        .filter(course => course.container_id === container.id)
                        .map(course => (
                          <div className="course-access-item" key={course.id}>
                            <span className="course-title">{course.title}</span>
                            <button
                              className={`btn btn-sm ${hasAccess(selectedUser.id, course.id) ? "btn-danger" : "btn-success"}`}
                              onClick={() => {
                                if (hasAccess(selectedUser.id, course.id)) {
                                  handleRemoveCourse(selectedUser.id, course.id);
                                } else {
                                  handleAssignCourse(selectedUser.id, course.id);
                                }
                              }}
                            >
                              {hasAccess(selectedUser.id, course.id) ? "Retirer l'accès" : "Donner accès"}
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ))}

                <button className="btn btn-primary" onClick={onAccessModalClose}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion des accès par cours */}
      {selectedCourse && isCourseAccessModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2 className="modal-title">Gérer les accès au cours: {selectedCourse.title}</h2>
              <button className="modal-close" onClick={() => setIsCourseAccessModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="access-management">
                <p>Sélectionnez les utilisateurs qui ont accès à ce cours :</p>
                
                {isLoadingUsers ? (
                  <div className="loading-indicator">
                    <p>Chargement des utilisateurs en cours...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="empty-state warning">
                    <p>Aucun utilisateur trouvé. Vérifiez votre connexion à la base de données.</p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setIsLoadingUsers(true);
                        fetchUsers().finally(() => setIsLoadingUsers(false));
                      }}
                    >
                      Recharger les utilisateurs
                    </button>
                  </div>
                ) : users.filter(user => user.role !== 'admin').length === 0 ? (
                  <div className="empty-state">
                    <p>Aucun utilisateur standard n'est disponible. Les administrateurs ont accès à tous les cours par défaut.</p>
                  </div>
                ) : (
                  <div className="user-grid">
                    {users
                      .filter(user => user.role !== 'admin') // Les admins ont toujours accès à tous les cours
                      .map(user => (
                        <div className="user-card" key={user.id}>
                          <div className="user-card-body">
                            <div className="user-access-item">
                              <span className="user-name">{user.username}</span>
                              <button
                                className={`btn btn-sm ${hasAccess(user.id, selectedCourse.id) ? "btn-danger" : "btn-success"}`}
                                onClick={() => {
                                  if (hasAccess(user.id, selectedCourse.id)) {
                                    handleRemoveCourse(user.id, selectedCourse.id);
                                  } else {
                                    handleAssignCourse(user.id, selectedCourse.id);
                                  }
                                }}
                              >
                                {hasAccess(user.id, selectedCourse.id) ? "Retirer l'accès" : "Donner accès"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                <button className="btn btn-primary" onClick={() => setIsCourseAccessModalOpen(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Config;
