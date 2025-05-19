const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
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
    origin: 'http://localhost:5173', // Your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true // Allow cookies/auth headers
  }));
  
  // 2. Other essential middleware
  app.use(cookieParser());
  app.use(express.json()); 
  app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' data:; img-src 'self' data:;"
  );
  next();
});
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "font-src 'self' https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com;");
  next();
});

app.get('/test', (req, res) => {
  console.log(path.join(uploadsPath, 'dp.jpg')
)
  res.sendFile(path.join(uploadsPath, 'dp.jpg'));
});
  app.use(express.urlencoded({ extended: true }));
  const uploadsPath = path.resolve(__dirname, 'uploads');
  console.log(uploadsPath);
app.use('/uploads', express.static(uploadsPath));


// Register routes

app.use('/api/auth', authRoutes);
app.use('/api/doctors',protectRoute, doctorRoutes);
app.use('/api/appointments',protectRoute, appointmentRoutes);
app.use('/api/chatbot',protectRoute, chatbotRoutes);
app.use('/api/search',protectRoute, searchRoutes);
app.use('/api/razorpay',protectRoute, razorpayRoute);
app.use('/api/patient',protectRoute, patientRoute);

if(process.env.NODE_ENV==='production'){
    app.use(express.static(path.join(path.resolve(),'/frontend/dist')));

    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(path.resolve(),'frontend','dist','index.html'));
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));