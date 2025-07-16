import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
  ButtonGroup,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress
} from '@mui/material';
import { Settings, PlayArrow, Speed, HighQuality, PhoneAndroid } from '@mui/icons-material';

// Mobile performance presets
const MOBILE_PRESETS = {
  fast: {
    name: 'Fast (Mobile)',
    icon: <Speed />,
    settings: {
      num_colors: 8,
      blur_amount: 1,
      edge_threshold: 75,
      min_area: 200,
      output_format: 'svg'
    },
    description: 'Quick processing for mobile devices'
  },
  balanced: {
    name: 'Balanced',
    icon: <PhoneAndroid />,
    settings: {
      num_colors: 12,
      blur_amount: 2,
      edge_threshold: 50,
      min_area: 100,
      output_format: 'svg'
    },
    description: 'Good balance of speed and quality'
  },
  quality: {
    name: 'High Quality',
    icon: <HighQuality />,
    settings: {
      num_colors: 20,
      blur_amount: 3,
      edge_threshold: 25,
      min_area: 50,
      output_format: 'svg'
    },
    description: 'Best quality, slower processing'
  }
};

// Detect mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const ProcessingSettings = ({ 
  settings, 
  defaultSettings, 
  onSettingsChange, 
  onProcess, 
  uploadedFile, 
  processing 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const buttonRef = useRef(null);
  const isMobile = isMobileDevice();

  // Prevent double submission
  useEffect(() => {
    if (!processing && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [processing]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    onSettingsChange(defaultSettings);
  };

  const applyPreset = (preset) => {
    onSettingsChange(MOBILE_PRESETS[preset].settings);
  };

  // Improved process handler with touchstart/click handling
  const handleProcess = useCallback(async (event) => {
    event.preventDefault(); // Prevent any default behavior
    
    // Prevent double submission
    if (isSubmitting || processing) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Disable button immediately
      if (buttonRef.current) {
        buttonRef.current.disabled = true;
      }

      // Call process handler
      await onProcess();
    } catch (error) {
      console.error('Processing error:', error);
      setShowWarning(true);
    }
  }, [onProcess, processing, isSubmitting]);

  // Handle closing warning message
  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  // Add touch event listeners for mobile
  useEffect(() => {
    if (!buttonRef.current || !isMobile) return;

    const button = buttonRef.current;
    
    const touchStartHandler = (e) => {
      e.preventDefault();
      button.style.transform = 'scale(0.98)';
    };
    
    const touchEndHandler = (e) => {
      e.preventDefault();
      button.style.transform = 'scale(1)';
    };

    button.addEventListener('touchstart', touchStartHandler);
    button.addEventListener('touchend', touchEndHandler);

    return () => {
      button.removeEventListener('touchstart', touchStartHandler);
      button.removeEventListener('touchend', touchEndHandler);
    };
  }, [isMobile]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        Processing Settings
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adjust these settings to customize your paint-by-numbers template.
      </Typography>

      {/* Mobile Performance Presets */}
      {isMobile && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneAndroid />
            Mobile Optimized Presets
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Choose a preset optimized for mobile performance:
          </Typography>
          <ButtonGroup fullWidth variant="contained" size="small">
            {Object.entries(MOBILE_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                onClick={() => applyPreset(key)}
                startIcon={preset.icon}
                sx={{ flexDirection: 'column', py: 1 }}
              >
                <Typography variant="caption">{preset.name}</Typography>
              </Button>
            ))}
          </ButtonGroup>
        </Paper>
      )}

      {uploadedFile && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Image
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                <strong>File:</strong> {uploadedFile.name}
              </Typography>
              <Chip 
                label={`${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB`} 
                size="small" 
                color="primary" 
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Color Settings
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Number of Colors</InputLabel>
              <Select
                value={settings.num_colors || 15}
                onChange={(e) => handleSettingChange('num_colors', e.target.value)}
                label="Number of Colors"
              >
                {(defaultSettings.color_options || [5, 10, 15, 20, 25, 30]).map(num => (
                  <MenuItem key={num} value={num}>{num} colors</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography gutterBottom>
              Blur Amount: {settings.blur_amount || 0}
            </Typography>
            <Slider
              value={settings.blur_amount || 0}
              onChange={(e, value) => handleSettingChange('blur_amount', value)}
              min={0}
              max={5}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Higher values create smoother color transitions
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Edge Detection
            </Typography>
            
            <Typography gutterBottom>
              Edge Threshold: {settings.edge_threshold || 50}
            </Typography>
            <Slider
              value={settings.edge_threshold || 50}
              onChange={(e, value) => handleSettingChange('edge_threshold', value)}
              min={10}
              max={100}
              step={5}
              marks={[
                { value: 10, label: 'Soft' },
                { value: 50, label: 'Medium' },
                { value: 100, label: 'Sharp' }
              ]}
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Higher values create more defined edges
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Region Settings
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Minimum Area</InputLabel>
              <Select
                value={settings.min_area || 100}
                onChange={(e) => handleSettingChange('min_area', e.target.value)}
                label="Minimum Area"
              >
                {(defaultSettings.area_options || [50, 100, 200, 500, 1000]).map(area => (
                  <MenuItem key={area} value={area}>{area} pixels</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Smaller regions will be merged into larger ones
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Output Format
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={settings.output_format || 'png'}
                onChange={(e) => handleSettingChange('output_format', e.target.value)}
                label="Format"
              >
                <MenuItem value="png">PNG (High Quality)</MenuItem>
                <MenuItem value="jpg">JPEG (Smaller Size)</MenuItem>
                <MenuItem value="svg">SVG (Vector)</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              PNG recommended for best quality
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Mobile Presets Section */}
      {isMobile && (
        <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Performance Presets
          </Typography>
          <ButtonGroup variant="outlined" fullWidth>
            {Object.keys(MOBILE_PRESETS).map(key => (
              <Button 
                key={key} 
                onClick={() => applyPreset(key)} 
                sx={{ 
                  flex: 1, 
                  borderColor: settings.num_colors === MOBILE_PRESETS[key].settings.num_colors ? 'primary.main' : undefined,
                  color: settings.num_colors === MOBILE_PRESETS[key].settings.num_colors ? 'primary.main' : undefined
                }}
              >
                {MOBILE_PRESETS[key].icon}
                {MOBILE_PRESETS[key].name}
              </Button>
            ))}
          </ButtonGroup>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {MOBILE_PRESETS[Object.keys(MOBILE_PRESETS)[0]].description}
          </Typography>
        </Paper>
      )}

      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
        <Button
          ref={buttonRef}
          variant="contained"
          size="large"
          onClick={handleProcess}
          disabled={processing || isSubmitting}
          startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
          sx={{ 
            minWidth: isMobile ? '100%' : 200,
            height: isMobile ? 56 : 'auto',
            fontSize: isMobile ? '1.2rem' : 'inherit',
            position: 'relative',
            '&:disabled': {
              backgroundColor: 'primary.main',
              color: 'white',
              opacity: 0.7
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'transform 0.1s ease-in-out, opacity 0.2s ease-in-out',
            WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
            cursor: (processing || isSubmitting) ? 'not-allowed' : 'pointer',
            pointerEvents: (processing || isSubmitting) ? 'none' : 'auto'
          }}
        >
          {processing ? 'Processing...' : 'Generate Paint by Numbers'}
        </Button>
        
        <Button
          variant="outlined"
          onClick={resetToDefaults}
          disabled={processing || isSubmitting}
          sx={{
            minWidth: isMobile ? '100%' : 'auto',
            height: isMobile ? 48 : 'auto'
          }}
        >
          Reset to Defaults
        </Button>
      </Box>

      {/* Processing indicator */}
      {(processing || isSubmitting) && (
        <Box sx={{ mt: 2, width: '100%' }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {isMobile ? 'Please keep the app open while processing...' : 'Processing your image...'}
          </Typography>
        </Box>
      )}

      <Paper elevation={1} sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Processing Preview:</strong> Your image will be processed with {settings.num_colors || 15} colors, 
          blur level {settings.blur_amount || 0}, and edge sensitivity {settings.edge_threshold || 50}. 
          {isMobile ? ' Mobile optimizations are enabled for faster processing.' : ''} 
          Please wait while processing completes.
        </Typography>
      </Paper>

      {/* Warning Snackbar */}
      <Snackbar 
        open={showWarning} 
        autoHideDuration={6000} 
        onClose={handleCloseWarning}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseWarning} severity="warning" sx={{ width: '100%' }}>
          Please wait for the processing to complete. Multiple clicks may cause issues.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcessingSettings;
