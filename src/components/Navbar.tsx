import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
         App Cours
        </Link>
        
        <button className="navbar-toggle" onClick={toggleMenu}>
          <span>☰</span>
        </button>
        
        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          
          <div className="navbar-nav">
            <Link to="/" className="navbar-link">
              Accueil
            </Link>
            
            {user?.role === 'admin' && (
              <Link to="/config" className="navbar-link">
                Configuration
              </Link>
            )}
            
            <button className="navbar-button" onClick={handleSignOut}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
