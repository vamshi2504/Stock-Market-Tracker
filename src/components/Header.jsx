import { Button, Box, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import { TrendingUp, Logout } from '@mui/icons-material';

const Header = ({logout}) => {
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        borderRadius: 2, 
        mb: 4,
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <TrendingUp sx={{ fontSize: 32, color: 'white' }} />
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              color: 'white',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Stock Market Tracker
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={logout}
          startIcon={<Logout />}
          sx={{ 
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Header