import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Box, Container, Paper, ThemeProvider, createTheme } from '@mui/material';
import StockChart from './StockChart';
import Header from './Header';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const Dashboard = () => {
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: 3
        }}
      >
        <Container maxWidth="xl">
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              backgroundColor: 'white',
              minHeight: '90vh'
            }}
          >
            <Header logout={logout}/>
            <StockChart />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
