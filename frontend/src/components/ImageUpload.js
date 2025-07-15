import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import { CloudUpload, Image } from '@mui/icons-material';

// Mobile-optimized image compression utility
const compressImageForMobile = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      // Mobile optimization: smaller max size for better performance
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Detect if user is on mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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

  const handleFileSelection = async (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, BMP, or GIF)');
      return;
    }

    // Mobile optimization: compress large images
    let processedFile = file;
    const isMobile = isMobileDevice();
    const fileSizeInMB = file.size / (1024 * 1024);
    
    // Compress if mobile device or file is large
    if (isMobile || fileSizeInMB > 2) {
      console.log(`Mobile optimization: Original file size: ${fileSizeInMB.toFixed(2)}MB`);
      
      try {
        processedFile = await compressImageForMobile(
          file, 
          isMobile ? 600 : 800,  // Smaller size for mobile
          isMobile ? 450 : 600,  // Smaller size for mobile
          isMobile ? 0.7 : 0.8   // More compression for mobile
        );
        
        const newSizeInMB = processedFile.size / (1024 * 1024);
        console.log(`Mobile optimization: Compressed to: ${newSizeInMB.toFixed(2)}MB`);
      } catch (error) {
        console.error('Compression failed, using original file:', error);
        processedFile = file;
      }
    }

    // Validate file size (16MB max)
    const maxSize = 16 * 1024 * 1024;
    if (processedFile.size > maxSize) {
      alert('File size must be less than 16MB');
      return;
    }

    setSelectedFile(processedFile);  // Use processed file
    
    // Create preview from original file for better quality display
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);  // Preview original, upload compressed
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Compress image if on mobile
      const uploadFile = isMobileDevice() ? compressImageForMobile(selectedFile) : Promise.resolve(selectedFile);
      
      uploadFile.then((fileToUpload) => {
        onFileUpload(fileToUpload);
      });
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Transform Your Image into Paint by Numbers
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
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
          <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
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

      <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
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
  );
};

export default ImageUpload;
