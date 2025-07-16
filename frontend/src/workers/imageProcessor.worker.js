// Web Worker for image processing optimizations
self.onmessage = async function(e) {
  const { imageData, settings } = e.data;
  
  try {
    // Image pre-processing in the worker
    const processedData = await optimizeImage(imageData, settings);
    self.postMessage({ type: 'success', data: processedData });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};

function optimizeImage(imageData, settings) {
  // Pre-process image data to reduce size before sending to server
  const { width, height, data } = imageData;
  
  // Calculate target size based on device
  const maxWidth = settings.isMobile ? 800 : 1200;
  const maxHeight = settings.isMobile ? 600 : 900;
  
  // Calculate new dimensions
  let newWidth = width;
  let newHeight = height;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }
  
  // Create temporary canvas for resizing
  const canvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d');
  
  // Draw and get resized data
  ctx.drawImage(imageData, 0, 0, newWidth, newHeight);
  const resizedData = ctx.getImageData(0, 0, newWidth, newHeight);
  
  return resizedData;
}
