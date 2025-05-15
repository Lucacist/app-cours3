import React from 'react';
import { ChakraProvider, Box, Container } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Config from './pages/Config';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Box minH="100vh" bg="gray.50">
                    <Navbar />
                    <Container maxW="container.xl" py={8}>
                      <Home />
                    </Container>
                  </Box>
                </ProtectedRoute>
              }
            />
            <Route
              path="/config"
              element={
                <AdminRoute>
                  <Navbar />
                  <Config />
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
