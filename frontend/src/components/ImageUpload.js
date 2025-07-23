import React, { useCallback, useState } from 'react';
import {
  Typography,
  Button,
  Paper,
  LinearProgress,
  Alert,
  Box,
} from '@mui/material';
import { CloudUpload, Image } from '@mui/icons-material';



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

  </Box>
  );
}
export default ImageUpload;
