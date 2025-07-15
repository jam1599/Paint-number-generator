import os
import shutil
import psutil  # Add for memory monitoring
import gc
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import uuid
import tempfile
from typing import Dict, List, Tuple, Optional
import logging
from dotenv import load_dotenv

from paint_processor import PaintByNumbersProcessor

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Memory monitoring function
def get_memory_usage():
    """Get current memory usage."""
    process = psutil.Process()
    memory_info = process.memory_info()
    return {
        'rss_mb': round(memory_info.rss / 1024 / 1024, 2),  # Resident Set Size in MB
        'vms_mb': round(memory_info.vms / 1024 / 1024, 2),  # Virtual Memory Size in MB
        'percent': round(process.memory_percent(), 2)
    }

# Get CORS origins from environment variable or use default
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001').split(',')

# Add explicit Vercel URLs as fallback
vercel_urls = [
    'https://paint-number-generator.vercel.app',
    'https://paint-number-generator-sijv.vercel.app',
    'https://paint-number-generator-git-main-jm-team.vercel.app',
    'https://paint-number-generator-gbbmect08-jm-team.vercel.app',
    'https://paint-number-generator-space.vercel.app',
    'https://paint-number-generator-git-main-jm-personal-workspace.vercel.app',
    'https://paint-number-generator-nauv4mu1r-jm-personal-workspace.vercel.app'
]

for url in vercel_urls:
    if url not in cors_origins:
        cors_origins.append(url)

# Configure CORS with wildcard for all origins (temporary fix)
CORS(app, 
     origins="*",
     allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=False)

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

@app.after_request
def after_request(response):
    """Add CORS headers to all responses."""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Root route for basic info."""
    return jsonify({
        'message': 'Paint by Numbers Generator API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'upload': '/api/upload',
            'process': '/api/process',
            'download': '/api/download/<file_id>/<file_type>',
            'settings': '/api/settings'
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/debug/cors', methods=['GET'])
def debug_cors():
    """Debug endpoint to check CORS configuration."""
    return jsonify({
        'cors_origins': cors_origins,
        'cors_origins_env': os.getenv('CORS_ORIGINS', 'NOT_SET'),
        'wildcard_enabled': True,
        'timestamp': '2025-01-15T16:50:00Z',
        'current_request_origin': request.headers.get('Origin', 'No Origin Header'),
        'force_deploy_v3': True
    }), 200

@app.route('/api/debug/memory', methods=['GET'])
def debug_memory():
    """Debug endpoint to check memory usage."""
    try:
        memory_stats = get_memory_usage()
        # Force garbage collection
        gc.collect()
        memory_after_gc = get_memory_usage()
        
        return jsonify({
            'memory_before_gc': memory_stats,
            'memory_after_gc': memory_after_gc,
            'memory_saved_mb': round(memory_stats['rss_mb'] - memory_after_gc['rss_mb'], 2),
            'timestamp': '2025-01-16T12:00:00Z'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload and process image file."""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = secure_filename(file.filename)
            unique_id = str(uuid.uuid4())
            file_ext = filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{unique_id}.{file_ext}"
            
            # Save uploaded file
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)
            
            logger.info(f"File uploaded: {unique_filename}")
            
            return jsonify({
                'message': 'File uploaded successfully',
                'file_id': unique_id,
                'filename': filename
            }), 200
        else:
            return jsonify({'error': 'File type not allowed'}), 400
            
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': 'Upload failed'}), 500

@app.route('/api/process', methods=['POST'])
def process_image():
    """Process uploaded image to generate paint-by-numbers."""
    try:
        data = request.get_json()
        
        if not data or 'file_id' not in data:
            return jsonify({'error': 'File ID required'}), 400
        
        file_id = data['file_id']
        settings = data.get('settings', {})
        
        # Default settings
        default_settings = {
            'num_colors': 15,
            'blur_amount': 2,
            'edge_threshold': 50,
            'min_area': 50,
            'output_format': 'svg'
        }
        
        # Merge with provided settings
        process_settings = {**default_settings, **settings}
        
        # Find input file
        input_file = None
        for ext in ['png', 'jpg', 'jpeg', 'gif', 'bmp']:
            potential_file = os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.{ext}")
            if os.path.exists(potential_file):
                input_file = potential_file
                break
        
        if not input_file:
            return jsonify({'error': 'Input file not found'}), 404
        
        # Process the image
        processor = PaintByNumbersProcessor()
        output_files = processor.process_image(input_file, process_settings)
        
        # Move output files to output directory
        result_files = {}
        for file_type, temp_path in output_files.items():
            if temp_path and os.path.exists(temp_path):
                output_filename = f"{file_id}_{file_type}"
                output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
                
                # Copy file to output directory instead of moving
                import shutil
                shutil.copy2(temp_path, output_path)
                
                # Clean up temp file
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
                
                result_files[file_type] = output_filename
        
        logger.info(f"Image processed: {file_id}")
        
        # Force garbage collection after processing to free memory
        gc.collect()
        
        return jsonify({
            'message': 'Image processed successfully',
            'file_id': file_id,
            'output_files': result_files,
            'settings_used': process_settings,
            'memory_usage': get_memory_usage()  # Include memory stats in response
        }), 200
        
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/api/download/<file_id>/<file_type>', methods=['GET'])
def download_file(file_id: str, file_type: str):
    """Download processed file."""
    try:
        filename = f"{file_id}_{file_type}"
        filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(filepath, as_attachment=True)
        
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({'error': 'Download failed'}), 500

@app.route('/api/settings', methods=['GET'])
def get_default_settings():
    """Get default processing settings."""
    return jsonify({
        'num_colors': 15,
        'blur_amount': 2,
        'edge_threshold': 50,
        'min_area': 50,
        'output_format': 'svg',
        'color_options': [5, 10, 15, 20, 25, 30],
        'blur_options': [0, 1, 2, 3, 4, 5],
        'edge_options': [10, 25, 50, 75, 100],
        'area_options': [50, 100, 200, 500, 1000]
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
