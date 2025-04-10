const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize app
const app = express();

// Middleware
app.use(express.json());

// CORS middleware must come before your routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <h1>Badminton Analyzer API is running!</h1>
    <p>Use the <a href="/test-upload">test upload form</a> to test file uploads.</p>
  `);
});

// Test upload form
app.get('/test-upload', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Upload Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input[type="file"], input[type="text"] { width: 100%; padding: 8px; }
        button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Test Upload Form</h1>
      <form action="/api/upload-video" method="POST" enctype="multipart/form-data">
        <div class="form-group">
          <label for="video">Select Video File:</label>
          <input type="file" id="video" name="video" accept="video/mp4,video/quicktime">
        </div>
        <div class="form-group">
          <label for="userId">User ID:</label>
          <input type="text" id="userId" name="userId" value="test-user">
        </div>
        <div class="form-group">
          <label for="shopId">Shop ID:</label>
          <input type="text" id="shopId" name="shopId" value="test-shop">
        </div>
        <button type="submit">Upload Video</button>
      </form>
    </body>
    </html>
  `);
});

// Add handler for GET requests to the upload endpoint
app.get('/api/upload-video', (req, res) => {
  res.send('This is the video upload endpoint. Please use POST method with a multipart form to upload videos.');
});

// File upload endpoint
app.post('/api/upload-video', (req, res) => {
  console.log('Received upload request');
  console.log('Headers:', req.headers);
  
  // Use multer middleware
  upload.single('video')(req, res, function(err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    // Check if file exists
    if (!req.file) {
      console.error('No file received in the request');
      return res.status(400).json({
        success: false,
        error: 'No file was uploaded'
      });
    }
    
    console.log('File received successfully:', req.file);
    console.log('Form data:', req.body);
    
    // Send success response
    res.json({
      success: true,
      videoId: 'test-' + Date.now(),
      message: 'Video upload received successfully'
    });
  });
});

// Mock analysis endpoint
// Mock analysis endpoint with randomized scores
app.get('/api/analysis/:id', (req, res) => {
  // Generate random scores between 60-95
  const generateScore = () => Math.floor(Math.random() * 36) + 60;
  
  // Generate technique scores
  const techniqueOverall = generateScore();
  const backswing = generateScore();
  const followThrough = generateScore();
  const contactPoint = generateScore();
  const racketPath = generateScore();
  
  // Generate footwork scores
  const footworkOverall = generateScore();
  const movementEfficiency = generateScore();
  const recoverySpeed = generateScore();
  const courtCoverage = generateScore();
  
  // Generate strategy score
  const strategyOverall = generateScore();
  
  // Return randomized mock data
  res.json({
    success: true,
    analysis: {
      videoUrl: "https://example.com/sample-video.mp4",
      status: "completed",
      results: {
        technique: {
          overallScore: techniqueOverall,
          feedback: [
            "Good racket preparation on your forehand side",
            "Try to maintain a higher elbow position during backhand strokes",
            "Your follow-through is excellent on smashes",
            "Work on wrist positioning during net shots"
          ],
          detailedMetrics: {
            backswing: backswing,
            followThrough: followThrough,
            contactPoint: contactPoint,
            racketPath: racketPath
          },
          timeMarkers: [
            { time: 15, label: "Good forehand technique" },
            { time: 42, label: "Backhand needs improvement" },
            { time: 78, label: "Excellent smash execution" }
          ]
        },
        footwork: {
          overallScore: footworkOverall,
          feedback: [
            "Your split-step timing is good",
            "Work on faster recovery to the center court",
            "Good lateral movement on the forehand side",
            "Try to use more chassé steps when moving to the backhand corner"
          ],
          detailedMetrics: {
            movementEfficiency: movementEfficiency,
            recoverySpeed: recoverySpeed,
            courtCoverage: courtCoverage
          },
          timeMarkers: [
            { time: 28, label: "Good split-step" },
            { time: 56, label: "Slow recovery to center" },
            { time: 92, label: "Efficient forehand movement" }
          ]
        },
        strategy: {
          overallScore: strategyOverall,
          feedback: [
            "Good variety in your shot selection",
            "Try to use more attacking clears when opponent is at front court",
            "Effective use of drop shots",
            "Work on deception in your shot preparation"
          ],
          patterns: [
            { name: "Net shots", value: 32 },
            { name: "Clears", value: 28 },
            { name: "Drops", value: 18 },
            { name: "Drives", value: 12 },
            { name: "Smashes", value: 10 }
          ],
          timeMarkers: [
            { time: 35, label: "Good shot variation" },
            { time: 68, label: "Missed attacking opportunity" },
            { time: 105, label: "Effective defensive play" }
          ]
        }
      }
    }
  });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
