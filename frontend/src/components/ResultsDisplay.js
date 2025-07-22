import React, { useCallback, useState } from 'react';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
import { CloudUpload, Image } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const faqData = [
  {
    q: 'Do you store our photos?',
    a: 'No, your photos are not saved in any of our systems when they are uploaded in the custom paint by numbers generator.',
  },
  {
    q: 'What file formats do you accept for uploading photos?',
    a: 'We accept both jpeg and png files for image uploading.',
  },
  {
    q: 'How do I figure out the right colors to “color” with?',
    a: 'If using paint you can use a “real color mixer” to create any color assuming you have the paint colors white, black, red, yellow, and blue. Otherwise, if you are using crayons, colored pencils, markers or some other drawing tool you should just try to find the closest match.',
  },
  {
    q: 'What is the best kind of image to upload to the generator?',
    a: 'You can upload any image you want into the generator. Generally speaking, the more colors in the image the more complicated the design will be.',
  },
  {
    q: 'Is it possible to edit the generated custom pbn image?',
    a: 'You can use tools like Photoshop and Canva to edit the image if you want to tweak it after the image is generated.',
  },
  {
    q: 'Is there a way to get a higher quality image to paint?',
    a: 'Yes, if you are looking for a high quality image to paint you should order a custom paint by numbers canvas from PaintMeLike.',
  },
  {
    q: 'Can I use this free paint by numbers generator on my phone?',
    a: 'Yes, this generator can be used on both mobile and desktop computers.',
  },
  {
    q: 'What are the image dimensions that my photo will be processed in?',
    a: 'The generator displays image dimensions as x x y.',
  },
];
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
  
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
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
        padding: { xs: '12px', sm: '24px', md: '32px' },
        boxSizing: 'border-box'
      }}
    >
      {/* Page Title */}
      <Typography 
        variant="h1" 
        sx={{
          fontSize: { xs: '24px', sm: '32px', md: '40px' },
          textAlign: 'center',
          color: '#333333',
          fontWeight: 600,
          mb: { xs: 2, sm: 4 },
          textTransform: 'uppercase',
          px: { xs: 1, sm: 0 },
          lineHeight: { xs: 1.2, sm: 1.3 }
        }}
      >
        FREE PAINT BY NUMBERS GENERATOR
      </Typography>

      {/* Header Section - Temporarily commented out
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        gap: 2, 
        mb: { xs: 3, sm: 4 },
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <CheckCircle 
          color="success" 
          sx={{ 
            fontSize: { xs: 40, sm: 48 },
            color: '#4CAF50'
          }} 
        />
        <Typography 
          variant="h2" 
          sx={{ 
            fontSize: { xs: '24px', sm: '28px' },
            textAlign: 'center',
            color: '#4CAF50',
            fontWeight: 500
          }}
        >
          Your Paint by Numbers is Ready!
        </Typography>
      </Box>
      */}

      {/* Success Message and Preview Section */}
      {/* Main Content Container */}
      <Box sx={{ 
        mb: { xs: 4, sm: 5 }, 
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Success Message */}
        <Alert 
          severity="success" 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            mx: { xs: 1, sm: 0 },
            '& .MuiAlert-message': {
              fontSize: { xs: '14px', sm: '16px' }
            },
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            borderRadius: { xs: '6px', sm: '8px' }
          }}
        >
          Successfully generated your paint-by-numbers template with {settings_used?.colors || ''} colors.
        </Alert>

        {/* Template Preview */}
        <Paper 
          elevation={2} 
          sx={{ 
            mb: { xs: 3, sm: 4 }, 
            p: { xs: 1, sm: 2 },
            mx: { xs: 1, sm: 0 },
            borderRadius: { xs: '8px', sm: '12px' },
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}
        >
          {!imageError ? (
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              '&::before': {
                content: '""',
                display: 'block',
                paddingTop: '75%' // 4:3 aspect ratio
              }
            }}>
              <img 
                src={`${apiUrl}/download/${file_id}_template.png`}
                alt="Paint by Numbers Template"
                onError={handleImageError}
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </Box>
          ) : (
            <Alert 
              severity="error"
              sx={{
                m: 2,
                backgroundColor: '#FFF3F3',
                color: '#D32F2F'
              }}
            >
              Failed to load preview image. Don't worry - you can still download the files below.
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Download Section */}
      <Box sx={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontSize: { xs: '24px', sm: '28px' },
            textAlign: 'center',
            color: '#333333',
            fontWeight: 500,
            mb: 3
          }}
        >
          Download Your Files
        </Typography>

        <Grid 
          container 
          spacing={{ xs: 1.5, sm: 3 }} 
          sx={{ 
            mb: 4,
            px: { xs: 1, sm: 0 }
          }}
        >
          {['reference', 'solution', 'template'].map((fileType) => (
            <Grid item xs={12} sm={4} key={fileType}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: '8px', sm: '12px' },
                transition: 'all 0.3s ease',
                border: '1px solid #E0E0E0',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  borderColor: '#2196F3'
                }
              }}>
                <CardContent sx={{ 
                  flexGrow: 1,
                  p: { xs: 2, sm: 3 }
                }}>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mb: 1.5,
                      fontSize: { xs: '18px', sm: '20px' },
                      fontWeight: 500
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{fileDescriptions[fileType].icon}</span>
                    {fileDescriptions[fileType].title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: '#666666',
                      fontSize: { xs: '14px', sm: '16px' },
                      lineHeight: 1.5
                    }}
                  >
                    {fileDescriptions[fileType].description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    onClick={() => handleDownload(`${file_id}_${fileType}.png`)}
                    sx={{
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: { xs: '16px', sm: '18px' },
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
        mt: { xs: 4, sm: 5 }, 
        mb: { xs: 4, sm: 5 },
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
            py: 2,
            px: { xs: 4, sm: 6 },
            textTransform: 'uppercase',
            fontSize: { xs: '16px', sm: '18px' },
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
      <Paper sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: { xs: 3, sm: 4 },
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        mx: { xs: 1, sm: 'auto' },
        borderRadius: { xs: '8px', sm: '12px' },
        backgroundColor: '#F5F5F5'
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: { xs: '18px', sm: '24px' },
            textAlign: 'center',
            color: '#333333',
            fontWeight: 500,
            mb: { xs: 1.5, sm: 2 }
          }}
        >
          Processing Settings Used
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Chip 
            label={`${settings_used?.colors || ''} Colors`} 
            color="primary"
            sx={{ 
              px: 2,
              py: 0.5,
              fontSize: { xs: '14px', sm: '16px' },
              borderRadius: '16px'
            }}
          />
          <Chip 
            label={`Blur: ${settings_used?.blur || ''}`} 
            color="secondary"
            sx={{ 
              px: 2,
              py: 0.5,
              fontSize: { xs: '14px', sm: '16px' },
              borderRadius: '16px'
            }}
          />
          <Chip 
            label={`Edge: ${settings_used?.edge || ''}`} 
            color="info"
            sx={{ 
              px: 2,
              py: 0.5,
              fontSize: { xs: '14px', sm: '16px' },
              borderRadius: '16px'
            }}
          />
          <Chip 
            label={`Min Area: ${settings_used?.min_area || ''}px`} 
            color="success"
            sx={{ 
              px: 2,
              py: 0.5,
              fontSize: { xs: '14px', sm: '16px' },
              borderRadius: '16px'
            }}
          />
        </Box>
      </Paper>
<Paper
  sx={{
    mt: { xs: 3, sm: 6 },
    mb: { xs: 3, sm: 6 },
    width: '98%',
    maxWidth: { xs: '99vw', sm: '900px' },
    margin: '0 auto',
    borderRadius: { xs: '16px', sm: '28px' },
    background: 'linear-gradient(135deg, #f5fafd 60%, #e3f2fd 100%)',
    p: { xs: 1.5, sm: 5 },
    boxShadow: '0 4px 24px 0 rgba(25,118,210,0.10)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  }}
  elevation={6}
>
  <Box
    sx={{
      width: '100%',
      background: 'linear-gradient(90deg, #1976D2 60%, #42a5f5 100%)',
      borderRadius: { xs: '12px 12px 0 0', sm: '18px 18px 0 0' },
      boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.10)',
      p: { xs: 1.5, sm: 3 },
      mb: { xs: 1, sm: 2 },
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'visible',
      zIndex: 1,
    }}
  >
    <CheckCircleIcon sx={{ color: '#fff', fontSize: { xs: 26, sm: 40 }, mr: { xs: 1, sm: 2 }, filter: 'drop-shadow(0 2px 8px #1976D2)' }} />
    <Typography
      variant="h5"
      sx={{
        fontWeight: 900,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: { xs: 1, sm: 2 },
        color: '#fff',
        fontSize: { xs: '1.05rem', sm: '2.2rem' },
        textShadow: '0 2px 12px rgba(25,118,210,0.18)',
        flex: 1,
      }}
    >
      HOW TO CREATE YOUR CUSTOM PAINT BY NUMBERS
    </Typography>
  </Box>
  <Box
    sx={{
      width: { xs: 100, sm: 200 },
      height: { xs: 4, sm: 7 },
      mx: 'auto',
      mb: { xs: 2, sm: 3 },
      borderRadius: 4,
      background: 'linear-gradient(90deg, #42a5f5 0%, #1976D2 100%)',
      boxShadow: '0 2px 12px 0 rgba(25, 118, 210, 0.18)',
      position: 'relative',
      overflow: 'hidden',
      '::after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(270deg, #42a5f5, #1976D2, #42a5f5)',
        opacity: 0.3,
        animation: 'moveGradient 2.5s linear infinite',
      },
      '@keyframes moveGradient': {
        '0%': { backgroundPosition: '0% 50%' },
        '100%': { backgroundPosition: '100% 50%' },
      },
    }}
  />
  <Divider sx={{ width: { xs: '80%', sm: '60%' }, mb: { xs: 1, sm: 2 }, bgcolor: '#1976D2', height: { xs: 2, sm: 3 }, borderRadius: 2, alignSelf: 'center' }} />
  <Box
    component="ol"
    sx={{
      pl: 0,
      color: '#444',
      fontSize: { xs: 14, sm: 16 },
      mb: { xs: 1.5, sm: 2 },
      width: '100%',
    }}
  >
    {[ // Steps as array for DRYness
      { text: 'Visit the PaintMeLike Custom Paint By Numbers Generator Page' },
      { text: <>Click on the <b style={{ color: '#1976D2' }}>“Upload Your Photo”</b> Button <CloudUploadIcon sx={{ color: '#1976D2', fontSize: { xs: 16, sm: 20 }, ml: 0.5, verticalAlign: 'middle' }} /></> },
      { text: 'Upload Your Desired Photo' },
      { text: <>Click <b style={{ color: '#1976D2' }}>“Generate”</b></> },
      { text: 'Get Your New Design!' },
    ].map((step, idx) => (
      <li
        key={idx}
        style={{
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1976D2',
          color: '#fff',
          borderRadius: '50%',
          width: 24,
          height: 24,
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}>{idx + 1}</span>
        <span style={{ wordBreak: 'break-word', lineHeight: 1.5 }}>{step.text}</span>
      </li>
    ))}
  </Box>
  <Typography
    variant="h6"
    sx={{
      color: '#1976D2',
      fontWeight: 700,
      mb: { xs: 0.5, sm: 1 },
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      width: '100%',
      fontSize: { xs: '1rem', sm: '1.25rem' },
    }}
  >
    <DownloadIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
    <span>
      Download Your Paint By Numbers
    </span>
  </Typography>
<Typography
  variant="body2"
  sx={{
    color: '#555',
    fontSize: { xs: 13, sm: 15 },
    textAlign: 'center',
    mt: 1.5,
    width: '100%',
    maxWidth: 600,
    mx: 'auto',
    background: '#f5fafd',
    borderRadius: 2,
    px: { xs: 2, sm: 3 },
    py: 1.5,
    boxShadow: '0 1px 6px 0 rgba(33,150,243,0.07)',
    lineHeight: 1.7,
    display: 'block',
  }}
>
  After clicking <b>download</b> you’ll receive a <b>[PDF/PNG]</b> file with your design.<br />
  You can then print this design out and color it in with your own art supplies.
</Typography>
  
</Paper>
    {/* <Paper
      sx={{
        mt: { xs: 3, sm: 6 },
        mb: { xs: 3, sm: 6 },
        width: '98%',
        maxWidth: { xs: '99vw', sm: '900px' },
        margin: '0 auto',
        borderRadius: { xs: '16px', sm: '28px' },
        background: 'linear-gradient(135deg, #f5fafd 60%, #e3f2fd 100%)',
        p: { xs: 1.5, sm: 5 },
        boxShadow: '0 4px 24px 0 rgba(25,118,210,0.10)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
      }}
      elevation={6}
    >
      {/* ...instructional content, steps, download info... 
    </Paper> */}
 {/* Instructional Section */}

<Paper
  sx={{
    mt: { xs: 4, sm: 8 },
    mb: { xs: 4, sm: 8 },
    width: '100%',
    maxWidth: 900,
    mx: 'auto',
    borderRadius: { xs: 2, sm: 4 },
    background: '#fff',
    boxShadow: '0 2px 16px 0 rgba(33,150,243,0.07)',
    p: { xs: 2, sm: 4 },
    fontFamily: `'Montserrat', 'Roboto', Arial, sans-serif`,
  }}
  elevation={0}
>
  <Typography
    variant="h2"
    sx={{
      fontWeight: 700,
      textAlign: { xs: 'center', sm: 'left' },
      mb: { xs: 3, sm: 4 },
      color: '#1976D2',
      fontSize: { xs: '2.1rem', sm: '3.5rem' },
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontFamily: `'Montserrat', 'Roboto', Arial, sans-serif`,
      lineHeight: { xs: 1.15, sm: 1.1 },
    }}
  >
    FAQ
  </Typography>
  <Box>
    {faqData.map((item, idx) => (
      <React.Fragment key={idx}>
        <Accordion
          expanded={expanded === idx}
          onChange={handleChange(idx)}
          sx={{
            background: 'transparent',
            boxShadow: 'none',
            '&:before': { display: 'none' },
            borderRadius: 0,
            m: 0,
            px: { xs: 0, sm: 0 },
          }}
        >
          <AccordionSummary
            expandIcon={
              expanded === idx
                ? (
                  <RemoveIcon
                    sx={{
                      color: '#444',
                      fontSize: 22,
                      bgcolor: 'transparent',
                      borderRadius: '6px',
                      transition: 'background 0.2s',
                      '&:hover': {
                        bgcolor: '#1976D2',
                        color: '#fff',
                      },
                      mx: { xs: 0.5, sm: 1 },
                      p: { xs: 0.5, sm: 0.5 },
                    }}
                  />
                )
                : (
                  <AddIcon
                    sx={{
                      color: '#444',
                      fontSize: 22,
                      bgcolor: 'transparent',
                      borderRadius: '6px',
                      transition: 'background 0.2s',
                      '&:hover': {
                        bgcolor: '#1976D2',
                        color: '#fff',
                      },
                      mx: { xs: 0.5, sm: 1 },
                      p: { xs: 0.5, sm: 0.5 },
                    }}
                  />
                )
            }
            aria-controls={`faq-content-${idx}`}
            id={`faq-header-${idx}`}
            sx={{
              minHeight: 48,
              px: { xs: 1, sm: 0 },
              '& .MuiAccordionSummary-content': {
                my: 1,
                fontWeight: 700,
                color: '#444',
                textTransform: 'uppercase',
                fontSize: { xs: 15, sm: 18 },
                letterSpacing: 0.5,
                fontFamily: `'Montserrat', 'Roboto', Arial, sans-serif`,
                textAlign: { xs: 'center', sm: 'left' },
                width: '100%',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
              },
            }}
          >
            {item.q}
          </AccordionSummary>
          <AccordionDetails
            sx={{
              px: { xs: 1, sm: 0 },
              pb: 2,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Typography
              sx={{
                color: '#444',
                fontSize: { xs: 14, sm: 16 },
                fontFamily: `'Montserrat', 'Roboto', Arial, sans-serif`,
                lineHeight: 1.6,
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              {item.a}
            </Typography>
          </AccordionDetails>
        </Accordion>
        {idx < faqData.length - 1 && (
          <Divider sx={{ my: 0, borderColor: '#eee' }} />
        )}
      </React.Fragment>
    ))}
  </Box>
</Paper>
    </Box>
    
    
  );
};

export default ResultsDisplay;
