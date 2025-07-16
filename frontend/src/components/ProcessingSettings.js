import React, { useState } from 'react';
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
  Alert,
  Snackbar
} from '@mui/material';
import { Settings, PlayArrow, Speed, HighQuality, PhoneAndroid } from '@mui/icons-material';

// Performance presets based on device type
const PERFORMANCE_PRESETS = {
  desktop_high: {
    name: 'High Performance',
    icon: <HighQuality />,
    settings: {
      num_colors: 30,
      blur_amount: 3,
      edge_threshold: 25,
      min_area: 50,
      output_format: 'svg'
    },
    description: 'Best quality, optimized for powerful desktops'
  },
  desktop_balanced: {
    name: 'Balanced',
    icon: <Speed />,
    settings: {
      num_colors: 20,
      blur_amount: 2,
      edge_threshold: 50,
      min_area: 75,
      output_format: 'svg'
    },
    description: 'Good balance of speed and quality'
  },
  mobile_optimized: {
    name: 'Mobile Optimized',
    icon: <PhoneAndroid />,
    settings: {
      num_colors: 15,
      blur_amount: 1,
      edge_threshold: 75,
      min_area: 100,
      output_format: 'svg'
    },
    description: 'Optimized for mobile devices'
  }
};

// Device detection with performance assessment
const getDeviceProfile = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const memory = navigator?.deviceMemory || 4;
  const cores = navigator?.hardwareConcurrency || 4;
  
  const isHighPerformance = !isMobile && cores >= 8 && memory >= 8;
  const isLowPerformance = isMobile || (cores <= 2 || memory <= 4);
  
  return {
    isMobile,
    isHighPerformance,
    isLowPerformance,
    cores,
    memory
  };
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

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const handleProcessClick = async () => {
    if (processing) return;
    
    try {
      await onProcess();
    } catch (error) {
      console.error('Processing error:', error);
      setShowWarning(true);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        Processing Settings
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Adjust these settings to customize your paint-by-numbers template.
      </Typography>

      {/* Performance Recommendation */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {deviceProfile.isHighPerformance ? <HighQuality /> : deviceProfile.isMobile ? <PhoneAndroid /> : <Speed />}
          {deviceProfile.isHighPerformance ? 'High-Performance Mode' : 'Optimized Settings'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {deviceProfile.isHighPerformance 
            ? 'Using advanced processing optimizations for your high-performance device.' 
            : deviceProfile.isMobile 
              ? 'Mobile-optimized settings for better performance.'
              : 'Balanced settings for desktop processing.'}
        </Typography>
        <ButtonGroup fullWidth variant="contained" size="small">
          {Object.entries(PERFORMANCE_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              onClick={() => applyPreset(key)}
              startIcon={preset.icon}
              sx={{ 
                flexDirection: 'column', 
                py: 1,
                backgroundColor: getRecommendedPreset() === key ? 'primary.dark' : 'primary.main'
              }}
            >
              <Typography variant="caption">{preset.name}</Typography>
            </Button>
          ))}
        </ButtonGroup>
      </Paper>

      {/* Mobile Performance Presets */}
      {deviceProfile.isMobile && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneAndroid />
            Mobile Optimized Presets
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Choose a preset optimized for mobile performance:
          </Typography>
          <ButtonGroup fullWidth variant="contained" size="small">
            {Object.entries(PERFORMANCE_PRESETS).map(([key, preset]) => (
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
      {deviceProfile.isMobile && (
        <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Performance Presets
          </Typography>
          <ButtonGroup variant="outlined" fullWidth>
            {Object.keys(PERFORMANCE_PRESETS).map(key => (
              <Button 
                key={key} 
                onClick={() => applyPreset(key)} 
                sx={{ 
                  flex: 1, 
                  borderColor: settings.num_colors === PERFORMANCE_PRESETS[key].settings.num_colors ? 'primary.main' : undefined,
                  color: settings.num_colors === PERFORMANCE_PRESETS[key].settings.num_colors ? 'primary.main' : undefined
                }}
              >
                {PERFORMANCE_PRESETS[key].icon}
                {PERFORMANCE_PRESETS[key].name}
              </Button>
            ))}
          </ButtonGroup>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {PERFORMANCE_PRESETS[Object.keys(PERFORMANCE_PRESETS)[0]].description}
          </Typography>
        </Paper>
      )}

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
          color="primary"
          size="large"
          onClick={handleProcessClick}
          disabled={processing}
          sx={{
            width: isMobile ? '100%' : 'auto',
            minWidth: isMobile ? '100%' : '200px',
            height: isMobile ? '56px' : 'auto',
            fontSize: isMobile ? '1.2rem' : '1rem',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&:disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
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
          <Typography variant="body2" color="textSecondary" align="center">
            {isMobile 
              ? 'Please keep the app open while processing...'
              : 'Processing your image...'}
          </Typography>
        )}
      </Box>

      {/* Warning Snackbar */}
      <Snackbar
        open={showWarning}
        autoHideDuration={6000}
        onClose={() => setShowWarning(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setShowWarning(false)}>
          {isMobile
            ? 'Processing failed. Please try again with lower quality settings or a smaller image.'
            : 'Processing failed. Please try again.'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProcessingSettings;
