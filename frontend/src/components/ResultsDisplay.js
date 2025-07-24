import React, { useCallback, useState } from 'react';
import { useEffect } from 'react';
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
import { Download, Refresh } from '@mui/icons-material';

/**
 * ResultsDisplay Component
 * Displays the results of the paint-by-numbers generation process including:
 * - Generated template preview
 * - Download options for template, reference, and solution files
 * - Processing settings used
 * - Instructions for painting
 * 
 * @param {Object} props
 * @param {Object} props.results - Contains file_id and settings used for generation
 * @param {Function} props.onDownload - Callback for download action
 * @param {Function} props.onReset - Callback to reset and create another image
 */


const ResultsDisplay = ({ results, onDownload, onReset }) => {
  // Track image loading errors for fallback display
  const [imageGenerated, setImageGenerated] = useState(false);

  const [imageError, setImageError] = useState(false);
// useEffect(() => {
//   let timeoutId = null;
//   let lastHeight = 0;

//   const sendHeight = () => {
//     const newHeight = document.body.scrollHeight;
//     if (window.parent && newHeight !== lastHeight) {
//       window.parent.postMessage(
//         { type: 'resize', height: newHeight },
//         '*'
//       );
//       lastHeight = newHeight;
//     }
//   };

//   const debouncedSendHeight = () => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(sendHeight, 100);
//   };

//   // Initial send
//   debouncedSendHeight();
//   window.addEventListener('resize', debouncedSendHeight);

//   const observer = new MutationObserver(debouncedSendHeight);
//   observer.observe(document.body, { childList: true, subtree: true });
//   observer.observe(document.documentElement, { childList: true, subtree: true });

//   return () => {
//     window.removeEventListener('resize', debouncedSendHeight);
//     observer.disconnect();
//     clearTimeout(timeoutId);
//   };
// }, []);
  const ResultsDisplay = ({ results, onDownload, onReset }) => {
  const [imageGenerated, setImageGenerated] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ... other code ...

  // ADD THIS EFFECT HERE:
  // 1. Resize the parent iframe whenever the content changes or images load
  useEffect(() => {
    const sendResize = () => {
      window.parent.postMessage({
        type: 'resize',
        height: document.body.scrollHeight
      }, '*');
    };

    sendResize(); // On mount/update

    // Attach to all images in this component
    const images = document.querySelectorAll('img');
    images.forEach(img => img.addEventListener('load', sendResize));

    return () => {
      images.forEach(img => img.removeEventListener('load', sendResize));
    };
  }, [results]); // Add more dependencies if needed (e.g., imageError)// Or [results, imageError, imageGenerated] if those affect content height
  }
  // Early return if no results available
  if (!results) {
    return (
      <Alert severity="error">
        No results to display. Please try processing your image again.
      </Alert>
    );
  }

  

  // Extract necessary data from results
  const { file_id, settings_used } = results;
  const apiUrl = process.env.REACT_APP_API_URL || '';

  // Define metadata for each downloadable file type
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

  /**
   * Handles the file download process
   * Creates a temporary anchor element to trigger the download
   * and cleans up after download starts
   * 
   * @param {string} filename - The name of the file to download
   */
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

  /**
   * Handles image loading errors
   * Sets error state to show fallback UI when preview image fails to load
   */
  const handleImageError = () => {
    console.error('Image failed to load');
    setImageError(true);
  };

return (

<Box
  sx={{
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: { xs: '32px', sm: '48px', md: '64px' },
    background: '#fff',
    minHeight: '1300px',     // <-- increase this!
    boxSizing: 'border-box',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(40,40,80,0.07)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  }}
>


      {/* Page Title */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '20px', sm: '32px', md: '40px' },
          textAlign: 'center',
          color: '#333333',
          fontWeight: 600,
          mb: { xs: 1, sm: 4 },
          textTransform: 'uppercase',
          px: { xs: 0.5, sm: 0 },
          lineHeight: { xs: 1.1, sm: 1.3 }
        }}
      >
        FREE PAINT BY NUMBERS GENERATOR
      </Typography>
      {/* Main Content Area */}
      <Box
        sx={{
          // Remove flexGrow, display: flex, flexDirection, and any overflow here!
          width: '100%',
        }}
      >
      {/* Success Message */}
      <Alert 
        severity="success" 
        sx={{ 
          mb: { xs: 1, sm: 3 },
          mx: { xs: 0, sm: 0 },
          '& .MuiAlert-message': {
            fontSize: { xs: '13px', sm: '16px' }
          },
          backgroundColor: '#E8F5E9',
          color: '#2E7D32',
          borderRadius: { xs: '5px', sm: '8px' }
        }}
      >
        Successfully generated your paint-by-numbers template with {settings_used?.colors || ''} colors.
      </Alert>
      {/* Template Preview */}
      <Paper 
  elevation={2} 
  sx={{ 
    mb: { xs: 2, sm: 4 }, 
    p: { xs: 0.5, sm: 2 },
    mx: { xs: 0, sm: 0 },
    borderRadius: { xs: '6px', sm: '12px' },
    backgroundColor: '#ffffff',

  }}
>
  {!imageError ? (
    <Box sx={{
      width: '100%',
      textAlign: 'center'
    }}>
      {/* <img
        src={`${apiUrl}/download/${file_id}_template.png`}
        alt="Paint by Numbers Template"
        onError={handleImageError}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: '6px',
          maxWidth: '800px',      // optional: cap the size for extra large images
          margin: '0 auto',
          display: 'block'
        }} */}

        <img
  src={`${apiUrl}/download/${file_id}_template.png`}
  alt="Paint by Numbers Template"
  onError={handleImageError}
  style={{
    width: '500px',         // fixed width
    height: '500px',        // fixed height
    objectFit: 'contain',   // or 'cover' for cropping
    borderRadius: '6px',
    margin: '0 auto',
    display: 'block'
  }}
      />
    </Box>
  ) : (
    <Alert 
      severity="error"
      sx={{
        m: 1,
        backgroundColor: '#FFF3F3',
        color: '#D32F2F',
        fontSize: { xs: '13px', sm: '16px' }
      }}
    >
      Failed to load preview image. Don't worry - you can still download the files below.
    </Alert>
  )}
</Paper>

      {/* Download Section */}
      <Box sx={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontSize: { xs: '20px', sm: '28px' },
            textAlign: 'center',
            color: '#333333',
            fontWeight: 500,
            mb: 2
          }}
        >
          Download Your Files
        </Typography>
        <Grid 
          container 
          spacing={{ xs: 1, sm: 3 }} 
          sx={{ 
            mb: 3,
            px: { xs: 0, sm: 0 }
          }}
        >
          {['reference', 'solution', 'template'].map((fileType) => (
            <Grid item xs={12} sm={4} key={fileType}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: '6px', sm: '12px' },
                transition: 'all 0.3s ease',
                border: '1px solid #E0E0E0',
                '&:hover': {
                  transform: { sm: 'translateY(-4px)' },
                  boxShadow: { sm: '0 8px 16px rgba(0,0,0,0.1)' },
                  borderColor: { sm: '#2196F3' }
                }
              }}>
                <CardContent sx={{ 
                  flexGrow: 1,
                  p: { xs: 1.5, sm: 3 }
                }}>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mb: 1,
                      fontSize: { xs: '16px', sm: '20px' },
                      fontWeight: 500
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{fileDescriptions[fileType].icon}</span>
                    {fileDescriptions[fileType].title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: '#666666',
                      fontSize: { xs: '13px', sm: '16px' },
                      lineHeight: 1.5
                    }}
                  >
                    {fileDescriptions[fileType].description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: { xs: 1.5, sm: 3 }, pt: 0, mt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    onClick={() => handleDownload(`${file_id}_${fileType}.png`)}
                    sx={{
                      py: 1.2,
                      textTransform: 'none',
                      fontSize: { xs: '15px', sm: '18px' },
                      borderRadius: '8px',
                      backgroundColor: '#2196F3',
                      '&:hover': {
                        backgroundColor: '#1976D2'
                      }
                    }}
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Create Another Button */}
      <Box sx={{ 
        mt: { xs: 3, sm: 5 }, 
        mb: { xs: 3, sm: 1 },
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Refresh />}
          onClick={onReset}
          sx={{
            py: 1.5,
            px: { xs: 3, sm: 6 },
            textTransform: 'uppercase',
            fontSize: { xs: '15px', sm: '18px' },
            fontWeight: 600,
            borderRadius: '8px',
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#388E3C'
            }
          }}
        >
          Create Another Image
        </Button>
      </Box>
      {/* Processing Settings Display */}
      {/* <Paper sx={{ 
        p: { xs: 1.5, sm: 3 }, 
        mb: { xs: 2, sm: 4 },
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        mx: { xs: 0, sm: 'auto' },
        borderRadius: { xs: '6px', sm: '12px' },
        backgroundColor: '#F5F5F5'
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: { xs: '16px', sm: '24px' },
            textAlign: 'center',
            color: '#333333',
            fontWeight: 500,
            mb: { xs: 1, sm: 2 }
          }}
        >
          Processing Settings Used
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          overflowX: { xs: 'visible', sm: 'auto' },
          justifyContent: { xs: 'center', sm: 'center' },
          pb: { xs: 1, sm: 0 }
        }}>
          <Chip 
            label={`${settings_used?.colors || ''} Colors`} 
            color="primary"
            sx={{ 
              px: 2,
              py: 0.5,
              fontSize: { xs: '13px', sm: '16px' },
              borderRadius: '16px',
              minWidth: { xs: '100px', sm: '90px' },
              mb: { xs: 1, sm: 0 }
            }}
          />
          <Chip 
            label={`Blur: ${settings_used?.blur || ''}`} 
            color="secondary"
            sx={{ 
              px: 2,
              py: 0.5,
              fontSize: { xs: '13px', sm: '16px' },
              borderRadius: '16px',
              minWidth: { xs: '100px', sm: '90px' },
              mb: { xs: 1, sm: 0 }
            }}
          />
          <Chip 
            label={`Edge: ${settings_used?.edge || ''}`} 
            color="info"
            sx={{ 
              px: 2,
              py: 0.5,
              fontSize: { xs: '13px', sm: '16px' },
              borderRadius: '16px',
              minWidth: { xs: '100px', sm: '90px' },
              mb: { xs: 1, sm: 0 }
            }}
          />
          <Chip 
            label={`Min Area: ${settings_used?.min_area || ''}px`} 
            color="success"
            sx={{ 
              px: 2,
              py: 0.5,
              fontSize: { xs: '13px', sm: '16px' },
              borderRadius: '16px',
              minWidth: { xs: '120px', sm: '110px' },
              mb: { xs: 1, sm: 0 }
            }}
          />
        </Box>
      </Paper> */}
    </Box>

  </Box>
);

};

export default ResultsDisplay;
