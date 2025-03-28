const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser=require('cookie-parser');

// Load routes

const authRoutes=require('./routes/auth.route');
const doctorRoutes=require('./routes/doctors.route');
const appointmentRoutes=require('./routes/appointments.route');
const chatbotRoutes=require("./routes/chatbot.route");
const searchRoutes=require("./routes/search.route");
const razorpayRoute=require("./routes/razorpay.route");
const patientRoute=require("./routes/patient.route");
const protectRoute = require('./middlewares/protectRoute.middleware');
connectDB();
const app = express();


// 1. CORS Configuration (FIRST MIDDLEWARE)
app.use(cors({
    origin: 'http://localhost:5174', // Your frontend URL
    credentials: true // Allow cookies/auth headers
  }));
  
  // 2. Other essential middleware
  app.use(cookieParser());
  app.use(express.json()); 
  app.use(express.urlencoded({ extended: true }));
  
// app.use(cors());
// app.use(cookieParser());
// app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors',protectRoute, doctorRoutes);
app.use('/api/appointments',protectRoute, appointmentRoutes);
app.use('/api/chatbot',protectRoute, chatbotRoutes);
app.use('/api/search',protectRoute, searchRoutes);
app.use('/api/razorpay',protectRoute, razorpayRoute);
app.use('/api/patient',protectRoute, patientRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));