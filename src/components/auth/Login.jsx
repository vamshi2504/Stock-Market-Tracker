import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { TextField, Button, Box, Typography } from '@mui/material';
import Register from './Register';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Typography variant="h5">Login</Typography>
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
      <Button variant="contained" fullWidth onClick={login}>
        Login
      </Button>
    </>
  );
};

export default Login;
