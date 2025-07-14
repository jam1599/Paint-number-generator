# Paint by Numbers Generator

A web application that transforms your images into paint-by-numbers templates. Built with Python Flask backend and React.js frontend, designed for easy deployment on AWS EC2.

## Features

- **Image Upload**: Support for JPEG, PNG, BMP, and GIF formats (up to 16MB)
- **Color Reduction**: Intelligent color clustering using K-means algorithm
- **Customizable Settings**: Adjust number of colors, blur, edge detection, and region size
- **Multiple Outputs**: Generate numbered template, color reference chart, and solution image
- **Responsive Design**: Modern Material-UI interface that works on all devices
- **Easy Deployment**: Docker-based deployment for AWS EC2

## Tech Stack

### Backend

- **Python Flask**: Web framework
- **OpenCV**: Image processing
- **scikit-learn**: K-means clustering
- **Pillow**: Image manipulation
- **NumPy**: Numerical computing

### Frontend

- **React.js**: User interface
- **Material-UI**: Component library
- **Axios**: HTTP client

### Deployment

- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Frontend web server
- **Gunicorn**: Python WSGI server

## Quick Start

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/Paint_Number_Jam.git
   cd Paint_Number_Jam
   ```

2. **Start with Docker Compose**

   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

### Manual Setup

#### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## AWS EC2 Deployment

### Prerequisites

- AWS EC2 instance (t3.medium or larger recommended)
- Ubuntu 20.04 or later
- Security groups allowing ports 80 and 5000
- SSH access to the instance

### Deployment Steps

1. **Connect to your EC2 instance**

   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Run the deployment script**

   ```bash
   curl -fsSL https://raw.githubusercontent.com/your-username/Paint_Number_Jam/main/deploy-ec2.sh -o deploy-ec2.sh
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```

3. **Access your application**
   - Open your browser and navigate to your EC2 public IP address

### Manual EC2 Setup

1. **Update system and install Docker**

   ```bash
   sudo apt-get update -y
   sudo apt-get install -y docker.io docker-compose git
   sudo usermod -aG docker $USER
   ```

2. **Clone and deploy**
   ```bash
   git clone https://github.com/your-username/Paint_Number_Jam.git
   cd Paint_Number_Jam
   docker-compose up -d --build
   ```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Backend Configuration
FLASK_ENV=production
FLASK_APP=app.py
MAX_CONTENT_LENGTH=16777216

# Frontend Configuration
REACT_APP_API_URL=http://your-domain.com/api
```

### Processing Settings

Default settings can be customized in the backend:

- **num_colors**: Number of colors to reduce to (5-30)
- **blur_amount**: Gaussian blur level (0-5)
- **edge_threshold**: Edge detection sensitivity (10-100)
- **min_area**: Minimum region size in pixels (50-1000)

## Usage

1. **Upload Image**: Select an image file (JPEG, PNG, BMP, GIF)
2. **Configure Settings**: Adjust color count, blur, and edge detection
3. **Process**: Generate paint-by-numbers template
4. **Download**: Get template, color reference, and solution files

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - Upload image file
- `POST /api/process` - Process image with settings
- `GET /api/download/:id/:type` - Download generated files
- `GET /api/settings` - Get default settings

## File Structure

```
Paint_Number_Jam/
├── backend/
│   ├── app.py                 # Flask application
│   ├── paint_processor.py     # Image processing logic
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Backend container config
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   └── App.js           # Main application
│   ├── package.json         # Node.js dependencies
│   ├── Dockerfile           # Frontend container config
│   └── nginx.conf           # Nginx configuration
├── docker-compose.yml       # Multi-container setup
├── deploy-ec2.sh           # EC2 deployment script
└── README.md               # This file
```

## Performance Considerations

- **Image Size**: Larger images take longer to process
- **Color Count**: More colors increase processing time
- **EC2 Instance**: t3.medium minimum for good performance
- **Memory**: 4GB+ RAM recommended for large images

## Troubleshooting

### Common Issues

1. **Out of Memory**: Reduce image size or use larger EC2 instance
2. **Slow Processing**: Decrease color count or increase instance size
3. **Upload Fails**: Check file size (16MB limit) and format
4. **API Errors**: Verify backend is running and accessible

### Logs

```bash
# View application logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

## Security

- File uploads are validated for type and size
- Temporary files are cleaned up automatically
- CORS is configured for frontend access
- No sensitive data is stored permanently

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

- Create an issue on GitHub
- Check the troubleshooting section
- Review the logs for error details

## Roadmap

- [ ] SVG output support
- [ ] Batch processing
- [ ] Custom color palettes
- [ ] Advanced edge detection
- [ ] Print optimization
- [ ] Mobile app version
