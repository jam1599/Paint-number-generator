import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from sklearn.cluster import KMeans
from skimage.measure import label, regionprops
from skimage.segmentation import watershed
from skimage.morphology import disk
from scipy.spatial import distance
import os
import tempfile
import gc  # Add garbage collection
from typing import Dict, List, Tuple, Optional, Any
import logging

logger = logging.getLogger(__name__)

class PaintByNumbersProcessor:
    """Main processor for generating paint-by-numbers from images."""
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        # Increase maximum image size for better quality/speed balance
        self.max_image_size = (1200, 900)  # Increased for better quality
        
    def _resize_if_needed(self, image: np.ndarray) -> np.ndarray:
        """Resize image if it's too large to save memory."""
        h, w = image.shape[:2]
        max_w, max_h = self.max_image_size
        
        # Only resize if image is significantly larger
        if w > max_w * 1.5 or h > max_h * 1.5:
            # Calculate scaling factor
            scale = min(max_w / w, max_h / h)
            new_w = int(w * scale)
            new_h = int(h * scale)
            
            logger.info(f"Resizing image from {w}x{h} to {new_w}x{new_h}")
            resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
            
            # Force garbage collection
            del image
            gc.collect()
            
            return resized
        return image
        
    def _cleanup_memory(self, *arrays):
        """Clean up memory by deleting arrays and forcing garbage collection."""
        for arr in arrays:
            if arr is not None:
                del arr
        gc.collect()
        
    def process_image(self, input_path: str, settings: Dict[str, Any]) -> Dict[str, str]:
        """
        Process an image to generate paint-by-numbers output.
        
        Args:
            input_path: Path to input image
            settings: Processing settings
            
        Returns:
            Dictionary of output file paths
        """
        try:
            logger.info(f"Processing image: {input_path}")
            logger.info(f"Settings: {settings}")
            
            # Load and prepare image
            image = cv2.imread(input_path)
            if image is None:
                raise ValueError(f"Could not load image from {input_path}")
            
            logger.info(f"Image loaded successfully. Shape: {image.shape}")
            
            # Convert BGR to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize if too large to save memory
            image = self._resize_if_needed(image)
            logger.info(f"After resize check. Shape: {image.shape}")
            
            # Apply blur if specified
            blur_amount = settings.get('blur_amount', 0)
            if blur_amount > 0:
                kernel_size = blur_amount * 2 + 1
                image = cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)
                logger.info(f"Applied blur with kernel size: {kernel_size}")
            
            # Reduce colors
            num_colors = settings.get('num_colors', 15)
            logger.info(f"Reducing colors to {num_colors}")
            reduced_image, color_palette = self.reduce_colors(image, num_colors)
            
            # Create regions
            logger.info("Creating regions...")
            regions = self.create_regions(reduced_image, settings)
            
            # Generate outputs
            output_files = {}
            
            # Generate numbered template
            logger.info("Generating template...")
            template_path = self.generate_template(regions, color_palette, settings, reduced_image)
            if template_path:
                output_files['template.png'] = template_path
            
            # Generate color reference
            logger.info("Generating color reference...")
            reference_path = self.generate_color_reference(color_palette, settings)
            if reference_path:
                output_files['reference.png'] = reference_path
            
            # Generate solution
            logger.info("Generating solution...")
            solution_path = self.generate_solution(reduced_image, settings)
            if solution_path:
                output_files['solution.png'] = solution_path
            
            logger.info(f"Processing completed. Generated {len(output_files)} files")
            return output_files
            
        except Exception as e:
            logger.error(f"Processing error: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
    
    def reduce_colors(self, image: np.ndarray, num_colors: int) -> Tuple[np.ndarray, List[Tuple[int, int, int]]]:
        """
        Reduce image colors using K-means clustering with memory optimization.
        
        Args:
            image: Input image array
            num_colors: Number of colors to reduce to
            
        Returns:
            Reduced image and color palette
        """
        # Reshape image for clustering
        original_shape = image.shape
        h, w = original_shape[:2]
        total_pixels = h * w
        
        # Use much more aggressive sampling for speed
        if total_pixels > 50000:  # Sample if more than 50k pixels
            # Use adaptive sampling - smaller sample for larger images
            if total_pixels > 500000:
                sample_size = 20000  # Very large images
            elif total_pixels > 200000:
                sample_size = 40000  # Large images
            else:
                sample_size = min(50000, total_pixels // 2)  # Medium images
            
            logger.info(f"Sampling {sample_size} pixels from {total_pixels} for fast clustering")
            
            # Flatten and sample
            data = image.reshape((-1, 3))
            indices = np.random.choice(len(data), sample_size, replace=False)
            sampled_data = np.float32(data[indices])
            
            # Fast K-means with reduced iterations
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 5, 2.0)  # Reduced iterations
            _, _, centers = cv2.kmeans(sampled_data, num_colors, None, criteria, 3, cv2.KMEANS_RANDOM_CENTERS)
            
            # Clean up
            del sampled_data, indices
            gc.collect()
            
            # Fast assignment using broadcasting (faster than cdist)
            data = np.float32(data)
            labels = np.argmin(np.sum((data[:, None, :] - centers[None, :, :]) ** 2, axis=2), axis=1)
            
        else:
            # Small images - use full clustering but fast
            data = image.reshape((-1, 3))
            data = np.float32(data)
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 5, 2.0)
            _, labels, centers = cv2.kmeans(data, num_colors, None, criteria, 3, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convert back to uint8
        centers = np.uint8(centers)
        
        # Create reduced image
        reduced_data = centers[labels.flatten()]
        reduced_image = reduced_data.reshape(original_shape)
        
        # Create color palette
        color_palette = [(int(c[0]), int(c[1]), int(c[2])) for c in centers]
        
        # Clean up memory
        self._cleanup_memory(data, reduced_data, labels)
        
        return reduced_image, color_palette
    
    def create_regions(self, image: np.ndarray, settings: Dict[str, Any]) -> np.ndarray:
        """
        Create regions using color-based segmentation for better portrait handling.
        
        Args:
            image: Color-reduced image
            settings: Processing settings
            
        Returns:
            Region labels array
        """
        # Use color-based segmentation directly for better results
        return self.create_color_regions(image, settings)
    
    def create_color_regions(self, image: np.ndarray, settings: Dict[str, Any]) -> np.ndarray:
        """
        Create regions based on color similarity - better for portraits.
        """
        height, width = image.shape[:2]
        regions = np.zeros((height, width), dtype=np.int32)
        
        # Get unique colors in the image
        image_2d = image.reshape(-1, 3)
        unique_colors = np.unique(image_2d, axis=0)
        
        logger.info(f"Found {len(unique_colors)} unique colors in the image")
        
        region_id = 1
        min_area = settings.get('min_area', 100)
        
        for color in unique_colors:
            # Create mask for this color
            mask = np.all(image == color, axis=2).astype(np.uint8)
            
            # Find connected components for this color
            num_labels, labels = cv2.connectedComponents(mask)
            
            for i in range(1, num_labels):
                component_mask = (labels == i)
                component_area = np.sum(component_mask)
                
                if component_area >= min_area:
                    regions[component_mask] = region_id
                    logger.info(f"Created region {region_id} with area {component_area} for color {color}")
                    region_id += 1
        
        logger.info(f"Created {region_id - 1} color-based regions")
        return regions
    def find_optimal_label_position(self, region_mask: np.ndarray, existing_positions: List[Tuple[int, int]], min_distance: int = 30) -> Tuple[int, int]:
        """Find the optimal position for label placement using regionprops."""
        # Get region properties
        regions = regionprops(region_mask.astype(int))
        
        if not regions:
            # Fallback to center of mask
            y_coords, x_coords = np.where(region_mask)
            if len(y_coords) > 0:
                return (int(x_coords.mean()), int(y_coords.mean()))
            return (0, 0)
        
        region = regions[0]  # Take the first (and should be only) region
        
        # Get region properties
        centroid = region.centroid
        bbox = region.bbox
        coords = region.coords
        
        # Convert coordinates to set for faster lookup
        region_pixels = set(map(tuple, coords))
        
        # Try different positions, starting with centroid
        candidate_positions = [
            (int(centroid[1]), int(centroid[0])),  # centroid (x, y)
            (int((bbox[3] + bbox[1])/2), int((bbox[2] + bbox[0])/2)),  # bbox center
        ]
        
        # Add more candidates along the region's area
        y_positions = np.linspace(bbox[0], bbox[2], 5)[1:-1]
        x_positions = np.linspace(bbox[1], bbox[3], 5)[1:-1]
        for y in y_positions:
            for x in x_positions:
                if (int(y), int(x)) in region_pixels:
                    candidate_positions.append((int(x), int(y)))
        
        best_position = None
        best_score = float('-inf')
        
        for pos in candidate_positions:
            if (pos[1], pos[0]) not in region_pixels:
                continue
                
            # Calculate score based on:
            # 1. Distance from existing labels
            min_dist_to_others = min([np.sqrt((pos[0] - p[0])**2 + (pos[1] - p[1])**2) 
                                    for p in existing_positions] + [float('inf')])
            
            # 2. Distance from edges
            dist_to_edge = min(
                pos[0] - bbox[1],  # distance to left
                bbox[3] - pos[0],  # distance to right
                pos[1] - bbox[0],  # distance to top
                bbox[2] - pos[1]   # distance to bottom
            )
            
            # 3. Centrality score
            centrality = -np.sqrt((pos[0] - centroid[1])**2 + (pos[1] - centroid[0])**2)
            
            # Combine scores
            score = (min_dist_to_others * 0.5 + 
                    dist_to_edge * 0.3 + 
                    centrality * 0.2)
            
            if score > best_score and min_dist_to_others >= min_distance:
                best_score = score
                best_position = pos
        
        # If no good position found, return centroid
        if best_position is None:
            best_position = (int(centroid[1]), int(centroid[0]))
            
        return best_position
    
    def place_label(self, img: np.ndarray, text: str, position: Tuple[int, int], 
                   font_scale: float = 1.0, thickness: int = 1,
                   padding: int = 4, bg_color: Tuple[int, int, int] = (255,255,255), 
                   text_color: Tuple[int, int, int] = (255,255,255)) -> None:
        """Place a simple white text label without background box."""
        cx, cy = position
        font = cv2.FONT_HERSHEY_SIMPLEX
        
        # Get text size for centering
        (text_w, text_h), baseline = cv2.getTextSize(text, font, font_scale, thickness)
        
        # Calculate centered position
        text_pos = (cx - text_w//2, cy + text_h//2)
        
        # Draw simple white text with black outline for visibility
        cv2.putText(img, text, text_pos, font, font_scale, (0,0,0), thickness+1, cv2.LINE_AA)  # Black outline
        cv2.putText(img, text, text_pos, font, font_scale, text_color, thickness, cv2.LINE_AA)  # White text
    
    def generate_template(self, regions: np.ndarray, color_palette: List[Tuple[int, int, int]], settings: Dict[str, Any], reduced_image: np.ndarray = None) -> Optional[str]:
        """
        Generate numbered template image with colored background and optimal label placement.
        
        Args:
            regions: Region labels array
            color_palette: Color palette
            settings: Processing settings
            reduced_image: The color-reduced image to use as background
            
        Returns:
            Path to generated template file
        """
        try:
            # Create template image with colored background
            if reduced_image is not None:
                template = reduced_image.copy()
            else:
                template = np.ones((regions.shape[0], regions.shape[1], 3), dtype=np.uint8) * 255
            
            max_region = regions.max()
            logger.info(f"Generating template with {max_region} regions using optimal placement")
            
            if max_region == 0:
                logger.warning("No regions found!")
                return None
            
            height, width = regions.shape
            
            # Draw subtle region boundaries for better definition
            for region_id in range(1, max_region + 1):
                mask = (regions == region_id).astype(np.uint8)
                if np.any(mask):
                    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    # Draw thin dark lines for region boundaries
                    cv2.drawContours(template, contours, -1, (0, 0, 0), 1, cv2.LINE_AA)
            
            # Track existing label positions to avoid overlaps
            existing_positions = []
            numbers_placed = 0
            
            # Place numbers with optimal positioning
            for region_id in range(1, max_region + 1):
                mask = (regions == region_id)
                
                if not np.any(mask):
                    continue
                
                # Calculate color number
                color_num = ((region_id - 1) % len(color_palette)) + 1
                text = str(color_num)
                
                # Find optimal position for this label
                optimal_pos = self.find_optimal_label_position(mask, existing_positions, min_distance=60)
                
                # Make sure position is within image bounds
                optimal_pos = (
                    max(30, min(optimal_pos[0], width - 30)),
                    max(30, min(optimal_pos[1], height - 30))
                )
                
                # Calculate font scale based on region size - even smaller
                region_area = np.sum(mask)
                font_scale = max(0.3, min(0.5, np.sqrt(region_area) / 300))
                
                # Place the simple white text label
                self.place_label(template, text, optimal_pos, 
                               font_scale=font_scale, thickness=1)
                
                # Track this position
                existing_positions.append(optimal_pos)
                numbers_placed += 1
                
                logger.info(f"Placed number {color_num} for region {region_id} at optimal position ({optimal_pos[0]}, {optimal_pos[1]})")
            
            # Save template
            template_path = os.path.join(self.temp_dir, 'template.png')
            cv2.imwrite(template_path, cv2.cvtColor(template, cv2.COLOR_RGB2BGR))
            
            logger.info(f"Template generated with {numbers_placed} optimally placed numbers")
            return template_path
            
        except Exception as e:
            logger.error(f"Template generation error: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    def generate_color_reference(self, color_palette: List[Tuple[int, int, int]], settings: Dict[str, Any]) -> Optional[str]:
        """
        Generate color reference chart.
        
        Args:
            color_palette: Color palette
            settings: Processing settings
            
        Returns:
            Path to generated reference file
        """
        try:
            # Create reference image
            swatch_size = 120
            margin = 25
            cols = min(5, len(color_palette))
            rows = (len(color_palette) + cols - 1) // cols
            
            ref_width = cols * swatch_size + (cols + 1) * margin
            ref_height = rows * swatch_size + (rows + 1) * margin + 80  # Extra space for title
            
            reference = np.ones((ref_height, ref_width, 3), dtype=np.uint8) * 255
            
            # Add title
            title = 'Paint-by-Numbers Color Reference'
            title_font_scale = 1.0
            title_thickness = 2
            title_size = cv2.getTextSize(title, cv2.FONT_HERSHEY_SIMPLEX, title_font_scale, title_thickness)[0]
            title_x = (ref_width - title_size[0]) // 2
            
            cv2.putText(reference, title, (title_x, 40), 
                       cv2.FONT_HERSHEY_SIMPLEX, title_font_scale, (0, 0, 0), title_thickness)
            
            # Draw color swatches
            for i, color in enumerate(color_palette):
                row = i // cols
                col = i % cols
                
                x = margin + col * (swatch_size + margin)
                y = 80 + margin + row * (swatch_size + margin)
                
                # Draw color swatch
                cv2.rectangle(reference, (x, y), (x + swatch_size, y + swatch_size), color, -1)
                cv2.rectangle(reference, (x, y), (x + swatch_size, y + swatch_size), (0, 0, 0), 3)
                
                # Add number label with better visibility
                number_text = str(i + 1)
                font_scale = 1.2
                thickness = 3
                text_size = cv2.getTextSize(number_text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0]
                
                text_x = x + (swatch_size - text_size[0]) // 2
                text_y = y + (swatch_size + text_size[1]) // 2
                
                # Add white background circle for number
                circle_radius = max(text_size) // 2 + 8
                cv2.circle(reference, (text_x + text_size[0]//2, text_y - text_size[1]//2), 
                          circle_radius, (255, 255, 255), -1)
                cv2.circle(reference, (text_x + text_size[0]//2, text_y - text_size[1]//2), 
                          circle_radius, (0, 0, 0), 2)
                
                # Add number text
                cv2.putText(reference, number_text, (text_x, text_y), 
                           cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), thickness)
                
                # Add color RGB values
                rgb_text = f"RGB({color[0]},{color[1]},{color[2]})"
                small_font_scale = 0.4
                small_thickness = 1
                rgb_size = cv2.getTextSize(rgb_text, cv2.FONT_HERSHEY_SIMPLEX, small_font_scale, small_thickness)[0]
                rgb_x = x + (swatch_size - rgb_size[0]) // 2
                rgb_y = y + swatch_size + 20
                
                cv2.putText(reference, rgb_text, (rgb_x, rgb_y), 
                           cv2.FONT_HERSHEY_SIMPLEX, small_font_scale, (100, 100, 100), small_thickness)
            
            # Save reference
            reference_path = os.path.join(self.temp_dir, 'reference.png')
            cv2.imwrite(reference_path, cv2.cvtColor(reference, cv2.COLOR_RGB2BGR))
            
            logger.info(f"Color reference generated with {len(color_palette)} colors")
            return reference_path
            
        except Exception as e:
            logger.error(f"Reference generation error: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    def generate_solution(self, reduced_image: np.ndarray, settings: Dict[str, Any]) -> Optional[str]:
        """
        Generate solution image (colored version).
        
        Args:
            reduced_image: Color-reduced image
            settings: Processing settings
            
        Returns:
            Path to generated solution file
        """
        try:
            # Create a clean copy of the reduced image to ensure no contamination
            clean_solution = reduced_image.copy()
            
            logger.info(f"Generating solution with clean reduced image. Shape: {clean_solution.shape}")
            
            # Save solution
            solution_path = os.path.join(self.temp_dir, 'solution.png')
            cv2.imwrite(solution_path, cv2.cvtColor(clean_solution, cv2.COLOR_RGB2BGR))
            
            logger.info("Solution generated successfully - should be clean colored image without numbers")
            return solution_path
            
        except Exception as e:
            logger.error(f"Solution generation error: {str(e)}")
            return None
