import React from 'react';
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
} from '@mui/material';
import { Settings, PlayArrow } from '@mui/icons-material';

const ProcessingSettings = ({ 
  settings, 
  defaultSettings, 
  onSettingsChange, 
  onProcess, 
  uploadedFile, 
  processing 
}) => {
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    onSettingsChange(defaultSettings);
  };

  return (
  <Box sx={{ p: { xs: 1, sm: 2 } }}>
    <Typography
      variant="h4"
      gutterBottom
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        fontSize: { xs: '1.1rem', sm: '2rem' },
        mb: { xs: 1, sm: 2 }
      }}
    >
      <Settings />
      Processing Settings
    </Typography>

    <Typography
      variant="body1"
      color="text.secondary"
      sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}
    >
      Adjust these settings to customize your paint-by-numbers template.
    </Typography>

    {uploadedFile && (
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Selected Image
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
            <Typography variant="body2">
              <strong>File:</strong> {uploadedFile.name}
            </Typography>
            <Chip
              label={`${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB`}
              size="small"
              color="primary"
              sx={{ mt: { xs: 1, sm: 0 } }}
            />
          </Box>
        </CardContent>
      </Card>
    )}

    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: { xs: 1.2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Color Settings
          </Typography>
          <FormControl fullWidth sx={{ mb: { xs: 1.2, sm: 3 } }}>
            <InputLabel>Number of Colors</InputLabel>
            <Select
              value={settings.num_colors || 15}
              onChange={(e) => handleSettingChange('num_colors', e.target.value)}
              label="Number of Colors"
              size="small"
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
        <Paper elevation={2} sx={{ p: { xs: 1.2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
        <Paper elevation={2} sx={{ p: { xs: 1.2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Region Settings
          </Typography>
          <FormControl fullWidth sx={{ mb: { xs: 1.2, sm: 3 } }}>
            <InputLabel>Minimum Area</InputLabel>
            <Select
              value={settings.min_area || 100}
              onChange={(e) => handleSettingChange('min_area', e.target.value)}
              label="Minimum Area"
              size="small"
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
        <Paper elevation={2} sx={{ p: { xs: 1.2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Output Format
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={settings.output_format || 'png'}
              onChange={(e) => handleSettingChange('output_format', e.target.value)}
              label="Format"
              size="small"
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

    <Box
      sx={{
        mt: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 },
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Button
        variant="contained"
        size="medium"
        onClick={onProcess}
        disabled={processing}
        startIcon={<PlayArrow />}
        sx={{
          minWidth: { xs: '100%', sm: 200 },
          mb: { xs: 1, sm: 0 }
        }}
      >
        {processing ? 'Processing...' : 'Generate Paint by Numbers'}
      </Button>
      <Button
        variant="outlined"
        onClick={resetToDefaults}
        disabled={processing}
        sx={{
          minWidth: { xs: '100%', sm: 150 }
        }}
      >
        Reset to Defaults
      </Button>
    </Box>
{/* 
      <Paper elevation={1} sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Processing Preview:</strong> Your image will be processed with {settings.num_colors || 15} colors, 
          blur level {settings.blur_amount || 0}, and edge sensitivity {settings.edge_threshold || 50}. 
          This may take 30-60 seconds depending on image size.
        </Typography>
      </Paper> */}
    </Box>
  );
};

export default ProcessingSettings;
