import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

function AppTest() {
  return (
    <div className="App">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Paint by Numbers Generator - Test
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              This is a simplified test version to check if the app can render.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              If you see this, the basic React app is working!
            </Typography>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}

export default AppTest;
