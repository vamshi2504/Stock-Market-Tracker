import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { TextField, Button, Typography } from '@mui/material';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Registration successful!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>            
      <Typography variant="h5">Register</Typography>
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" fullWidth onClick={register}>
        Register
      </Button>
    </>
  );
};

export default Register;
