import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Button, Box, Typography } from '@mui/material';
import StockChart from './StockChart';

const Dashboard = () => {
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h4">📈 Stock Market Tracker</Typography>
        <Button variant="outlined" onClick={logout}>
          Logout
        </Button>
      </Box>
      <StockChart />
    </Box>
  );
};

export default Dashboard;
