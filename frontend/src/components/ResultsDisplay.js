import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
} from '@mui/material';
import { Download, Refresh, CheckCircle } from '@mui/icons-material';

const ResultsDisplay = ({ results, onDownload, onReset }) => {
  const [imageError, setImageError] = useState(false);

  if (!results) {
    return (
      <Alert severity="error">
        No results to display. Please try processing your image again.
      </Alert>
    );
  }

  const { file_id, settings_used } = results;
  const apiUrl = process.env.REACT_APP_API_URL || '';

  const fileDescriptions = {
    template: {
      title: 'Template.png',
      description: 'The numbered template for painting',
      icon: '🎨',
    },
    reference: {
      title: 'Reference.png',
      description: 'Color chart with numbered swatches',
      icon: '🎭',
    },
    solution: {
      title: 'Solution.png',
      description: 'The final colored result',
      icon: '✨',
    },
  };

  const handleDownload = async (filename) => {
    try {
      // Remove any double slashes and ensure correct path
      const downloadUrl = `${apiUrl}/download/${filename}`.replace(/([^:]\/)\/+/g, "$1");
      console.log('Downloading from:', downloadUrl); // Debug log
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        console.error('Download failed with status:', response.status);
        throw new Error(`Download failed with status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download the file. Please try again.');
    }
  };

  const handleImageError = () => {
    console.error('Image failed to load');
    setImageError(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CheckCircle color="success" sx={{ fontSize: 32 }} />
        <Typography variant="h4">
          Your Paint by Numbers is Ready!
        </Typography>
      </Box>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Successfully generated your paint-by-numbers template with {settings_used?.colors || ''} colors.
        </Alert>

        {/* Template Preview */}
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 4, 
            p: 2,
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {!imageError ? (
            <img 
              src={`${apiUrl}/download/${file_id}_template.png`}
              alt="Paint by Numbers Template"
              onError={handleImageError}
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: '4px',
                display: 'block',
                margin: '0 auto'
              }}
            />
          ) : (
            <Alert severity="error">
              Failed to load preview image. Don't worry - you can still download the files below.
            </Alert>
          )}
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Download Your Files
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {['reference', 'solution', 'template'].map((fileType) => (
          <Grid item xs={12} sm={4} key={fileType}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{fileDescriptions[fileType].icon}</span>
                  {fileDescriptions[fileType].title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {fileDescriptions[fileType].description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<Download />}
                  onClick={() => handleDownload(`${file_id}_${fileType}.png`)}
                >
                  DOWNLOAD
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'right' }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Refresh />}
          onClick={onReset}
        >
          CREATE ANOTHER
        </Button>
      </Box>

      {/* Processing Settings Display */}
      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Processing Settings Used
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`${settings_used?.colors || ''} Colors`} color="primary" />
          <Chip label={`Blur: ${settings_used?.blur || ''}`} color="secondary" />
          <Chip label={`Edge: ${settings_used?.edge || ''}`} color="info" />
          <Chip label={`Min Area: ${settings_used?.min_area || ''}px`} color="success" />
        </Box>
      </Paper>

      {/* How to Paint Instructions */}
      <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          How to Paint:
        </Typography>
        <ol>
          <li>Print the template and color reference</li>
          <li>Match paint colors to the numbered swatches</li>
          <li>Paint each numbered area with the corresponding color</li>
          <li>Use the solution image as a reference</li>
        </ol>
      </Paper>
    </Box>
  );
};

export default ResultsDisplay;
