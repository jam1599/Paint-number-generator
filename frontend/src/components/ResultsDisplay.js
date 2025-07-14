import React from 'react';
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
  if (!results) {
    return (
      <Alert severity="error">
        No results to display. Please try processing your image again.
      </Alert>
    );
  }

  const { file_id, output_files, settings_used } = results;

  const fileDescriptions = {
    template: {
      title: 'Paint Template',
      description: 'The numbered template for painting',
      icon: '🎨',
    },
    reference: {
      title: 'Color Reference',
      description: 'Color chart with numbered swatches',
      icon: '🎭',
    },
    solution: {
      title: 'Solution Image',
      description: 'The final colored result',
      icon: '✨',
    },
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CheckCircle color="success" sx={{ fontSize: 32 }} />
        <Typography variant="h4">
          Your Paint by Numbers is Ready!
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body1">
          Successfully generated your paint-by-numbers template with {settings_used.num_colors} colors.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Download Your Files
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(output_files).map(([fileType, fileName]) => {
                const fileInfo = fileDescriptions[fileType] || {
                  title: fileType.charAt(0).toUpperCase() + fileType.slice(1),
                  description: `Generated ${fileType} file`,
                  icon: '📄',
                };

                return (
                  <Grid item xs={12} sm={6} md={4} key={fileType}>
                    <Card elevation={1} sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" component="span">
                            {fileInfo.icon}
                          </Typography>
                          <Typography variant="h6">
                            {fileInfo.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {fileInfo.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          startIcon={<Download />}
                          onClick={() => onDownload(fileType)}
                          fullWidth
                          variant="outlined"
                        >
                          Download
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Processing Settings Used
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip 
                label={`${settings_used.num_colors} Colors`} 
                color="primary" 
                size="small"
              />
              <Chip 
                label={`Blur: ${settings_used.blur_amount}`} 
                color="secondary" 
                size="small"
              />
              <Chip 
                label={`Edge: ${settings_used.edge_threshold}`} 
                color="info" 
                size="small"
              />
              <Chip 
                label={`Min Area: ${settings_used.min_area}px`} 
                color="success" 
                size="small"
              />
            </Box>

            <Button
              startIcon={<Refresh />}
              onClick={onReset}
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              Create Another
            </Button>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>How to Paint:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              1. Print the template and color reference<br/>
              2. Match paint colors to the numbered swatches<br/>
              3. Paint each numbered area with the corresponding color<br/>
              4. Use the solution image as a reference
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          File ID: {file_id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Files will be available for download for 24 hours
        </Typography>
      </Box>
    </Box>
  );
};

export default ResultsDisplay;
