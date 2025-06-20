const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// Load routes
const authRoutes = require('./routes/auth.route');
const doctorRoutes = require('./routes/doctors.route');
const appointmentRoutes = require('./routes/appointments.route');
const chatbotRoutes = require("./routes/chatbot.route");
const searchRoutes = require("./routes/search.route");
const razorpayRoute = require("./routes/razorpay.route");
const patientRoute = require("./routes/patient.route");
const protectRoute = require('./middlewares/protectRoute.middleware');

// DB connect
connectDB();

const app = express();


app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

//  Set CSP header using that nonce
app.use((req, res, next) => {
  // res.setHeader(
  //   'Content-Security-Policy',
  //   "default-src 'self'; " +
  //   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  //   "font-src 'self' https://fonts.gstatic.com data:; " +
  //   "img-src 'self' data: https:; " +
  //   "connect-src 'self';"
  // );

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://nominatim.openstreetmap.org https://api.mapbox.com https://*.tile.openstreetmap.org;"
  );
  next();
});



//  middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
const uploadsPath = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.setHeader("Content-Security-Policy", "img-src 'self' https: data: blob:;");
  }
}));


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', protectRoute, doctorRoutes);
app.use('/api/appointments', protectRoute, appointmentRoutes);
app.use('/api/chatbot', protectRoute, chatbotRoutes);
app.use('/api/search', protectRoute, searchRoutes);
app.use('/api/razorpay', protectRoute, razorpayRoute);
app.use('/api/patient', protectRoute, patientRoute);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(path.resolve(), '/frontend/dist')));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(path.resolve(), 'frontend', 'dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
