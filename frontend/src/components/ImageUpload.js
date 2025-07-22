import React, { useCallback, useState } from 'react';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Alert,
  Box,
} from '@mui/material';
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


const ImageUpload = ({ onFileUpload, processing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, BMP, or GIF)');
      return;
    }

    // Validate file size (16MB max)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 16MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
  };
  const [expanded, setExpanded] = useState(false);

const handleChange = (panel) => (event, isExpanded) => {
  setExpanded(isExpanded ? panel : false);
};
  return (
      <Box>
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography
  variant="h4"
  gutterBottom
  sx={{
    fontFamily: '"DM Sans Medium", "DM Sans", Arial, sans-serif',
    fontWeight: 700,
    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.3rem' },
    color: '#1976d2', // Deep purple, close to the logo
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    mb: { xs: 2, sm: 3 },
    mt: { xs: 1, sm: 2 },
    lineHeight: 1.1,
  }}
>
  Transform Your Image into Paint by Numbers
</Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ 
        fontFamily: '"DM Sans Medium", "DM Sans", Arial, sans-serif', 
        mb: 4 
        }}>
        Upload an image to get started. We'll convert it into a beautiful paint-by-numbers template.
      </Typography>

      {!selectedFile && (
        <Paper
          elevation={dragActive ? 8 : 2}
          sx={{
            p: 4,
            border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
            backgroundColor: dragActive ? '#f0f7ff' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: '#f8f9fa',
            },
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <CloudUpload sx={{ fontFamily: '"DM Sans Medium", "DM Sans", Arial, sans-serif', fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drop your image here or click to browse
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: JPEG, PNG, BMP, GIF (max 16MB)
          </Typography>
        </Paper>
      )}

      {preview && (
        <Box sx={{ mt: 3 }}>
          <Paper elevation={3} sx={{ p: 2, display: 'inline-block' }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </Paper>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={processing}
              startIcon={<Image />}
              size="large"
            >
              {processing ? 'Uploading...' : 'Process Image'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={processing}
            >
              Clear
            </Button>
          </Box>
          
          {processing && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Uploading your image...
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      <Alert severity="info" sx={{ fontFamily: '"DM Sans Medium", "DM Sans", Arial, sans-serif', mt: 3, textAlign: 'left' }}>
        <Typography variant="body2">
          <strong>Tips for best results:</strong>
        </Typography>
        <ul style={{ marginTop: 8, marginBottom: 0 }}>
          <li>Use images with clear, distinct colors</li>
          <li>Avoid images with too many small details</li>
          <li>Photos with good contrast work best</li>
          <li>Consider the final size when selecting complexity</li>
        </ul>
      </Alert>
    </Box>
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
      fontFamily: '"DM Sans Medium", "DM Sans", Arial, sans-serif', 
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
}
export default ImageUpload;
