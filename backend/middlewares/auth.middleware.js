const jwt = require('jsonwebtoken');
const Doctor = require('../models/doctors.model');
const Patient = require('../models/patient.model');

const auth = async (req, res, next) => {
  // Check both cookies and headers for token
  const token = req.cookies?.token || req.header('x-auth-token');

  console.log("Auth Middleware: Token received:", req.cookies?.token );

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided in cookies or headers.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user based on role
    let user;
    if (decoded.role === 'doctor') {
      user = await Doctor.findById(decoded.id).select('-password');
    } else if (decoded.role === 'patient') {
      user = await Patient.findById(decoded.id).select('-password');
    } else {
      return res.status(401).json({ error: 'Invalid role in token' });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    // Specific error handling
    const errorMessage = err.name === 'TokenExpiredError' 
      ? 'Token expired' 
      : 'Invalid token';
    
    res.status(401).json({ 
      error: errorMessage,
      suggestion: 'Please login again'
    });
  }
};

module.exports = auth;