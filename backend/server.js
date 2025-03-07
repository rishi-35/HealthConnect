const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load routes

const authRoutes=require('./routes/auth.route');
const doctorRoutes=require('./routes/doctors.route');
const appointmentRoutes=require('./routes/appointments.route');
const chatbotRoutes=require("./routes/chatbot.route");
const searchRoutes=require("./routes/search.route");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/search', searchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));