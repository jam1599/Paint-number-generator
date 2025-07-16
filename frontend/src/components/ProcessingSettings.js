import React, { useState, useCallback } from 'react';
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
  Alert
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

// Device profile detection
const getDeviceProfile = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency <= 4;
  const isHighEnd = navigator.hardwareConcurrency >= 8;

  if (isMobile) {
    if (isLowEnd) return 'fast';
    if (isHighEnd) return 'quality';
    return 'balanced';
  }
  return 'quality';
};

const ProcessingSettings = ({ 
  settings, 
  defaultSettings, 
  onSettingsChange, 
  onProcess, 
  uploadedFile, 
  processing 
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const [currentProfile] = useState(getDeviceProfile());

  // Initialize with device-specific settings on mount
  React.useEffect(() => {
    const preset = MOBILE_PRESETS[currentProfile];
    if (isMobile && preset) {
      onSettingsChange(preset.settings);
    }
  }, [currentProfile, isMobile, onSettingsChange]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const applyPreset = (preset) => {
    const presetSettings = MOBILE_PRESETS[preset]?.settings;
    if (presetSettings) {
      onSettingsChange(presetSettings);
    }
  };

  // Process handler with mobile-specific handling
  const handleProcess = useCallback(async () => {
    if (processing) return;
    try {
      // For mobile, ensure we're using appropriate settings
      if (isMobile && !settings.mobile_optimized) {
        const currentPreset = MOBILE_PRESETS[currentProfile];
        if (currentPreset) {
          onSettingsChange(currentPreset.settings);
        }
      }
      await onProcess();
    } catch (error) {
      console.error('Processing error:', error);
      setShowWarning(true);
    }
  }, [onProcess, processing, isMobile, settings.mobile_optimized, currentProfile, onSettingsChange]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        Processing Settings
      </Typography>

      {/* Mobile Presets */}
      {isMobile && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            Mobile Settings
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

      {/* Current Image */}
      {uploadedFile && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Image
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {uploadedFile.name}
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

      {/* Settings Controls */}
      <Grid container spacing={3}>
        {/* Color Settings */}
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
            />
          </Paper>
        </Grid>

        {/* Format Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Output Format
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={settings.output_format || 'svg'}
                onChange={(e) => handleSettingChange('output_format', e.target.value)}
                label="Format"
              >
                <MenuItem value="svg">SVG (Vector)</MenuItem>
                <MenuItem value="png">PNG (High Quality)</MenuItem>
                <MenuItem value="jpg">JPEG (Smaller Size)</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
      </Grid>

      {/* Process Button */}
      <Box sx={{ 
        mt: 4, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleProcess}
          disabled={processing}
          sx={{
            width: isMobile ? '100%' : 'auto',
            minWidth: '200px',
            height: isMobile ? '56px' : 'auto',
            fontSize: isMobile ? '1.2rem' : '1rem',
            position: 'relative',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&:disabled': {
              backgroundColor: 'primary.main',
              opacity: 0.7,
              color: 'white'
            }
          }}
        >
          {processing ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            <>
              <PlayArrow sx={{ mr: 1 }} />
              Generate Paint by Numbers
            </>
          )}
        </Button>

        {processing && (
          <Typography variant="body2" color="textSecondary">
            {isMobile 
              ? 'Please keep the app open while processing...'
              : 'Processing your image...'}
          </Typography>
        )}
      </Box>

      {/* Warning Message */}
      <Snackbar
        open={showWarning}
        autoHideDuration={6000}
        onClose={() => setShowWarning(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setShowWarning(false)}>
          Processing failed. Please try again with lower quality settings.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcessingSettings;
