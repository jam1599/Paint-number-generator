import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Paper,
} from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        p: 4
      }}
    >
      <CircularProgress 
        size={80} 
        thickness={4} 
        sx={{ mb: 3 }} 
      />
      
      <Typography variant="h6" gutterBottom>
        {message}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        This may take 30-60 seconds depending on your image size and complexity.
      </Typography>

      <Paper elevation={1} sx={{ p: 2, width: '100%', maxWidth: 400 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Processing steps:
        </Typography>
        <LinearProgress sx={{ mb: 1 }} />
        <Typography variant="caption" color="text.secondary">
          • Analyzing image colors<br/>
          • Creating paint regions<br/>
          • Generating templates<br/>
          • Finalizing output
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoadingSpinner;
