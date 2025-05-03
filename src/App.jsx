import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './components/Dashboard';
import Login from './components/auth/login';
import Register from './components/auth/Register';
import { Button, Box } from '@mui/material';


const App = () => {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user) return <Dashboard />;

  return (
    <div>
      <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      maxWidth={400}
      mx="auto"
      mt={10}
      p={3}
      borderRadius={2}
      boxShadow={3}
    >
      {showRegister ? <Register /> : <Login />}
      <Button variant="text" onClick={() => setShowRegister(!showRegister)}>
        {showRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </Button>
      </Box>
    </div>
  );
};

export default App;