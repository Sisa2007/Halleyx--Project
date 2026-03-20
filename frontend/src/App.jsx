import React from 'react';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <Box sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#0A0A14',
        position: 'relative',
        zIndex: 1,
      }}>
        <Sidebar />
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}>
          <Navbar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
            }}
          >
            <AppRoutes />
          </Box>
          <Footer />
        </Box>
      </Box>
    </NotificationProvider>
  );
}
