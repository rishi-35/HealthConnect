const jwt = require('jsonwebtoken');
const Doctor = require('../models/doctors.model');
const Patient = require('../models/patient.model');

const isProfileComplete = (doctor) => {
  // Explicit boolean conversion
  return Boolean(
    doctor.specialization &&
    doctor.certificate &&
    doctor.hospitalLocation?.coordinates?.length === 2 &&
    doctor.dateOfBirth &&
    doctor.gender &&
    doctor.phone &&
    doctor.profilePhoto
  );
};

const protectRoute = async (req, res, next) => {
  const token = req.cookies['token'];
 

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided in cookies or headers.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.role === 'doctor') {
      user = await Doctor.findById(decoded.id)
        .select('-password')
        .lean();
    } else if (decoded.role === 'patient') {
      user = await Patient.findById(decoded.id)
        .select('-password')
        .lean();
    } else {
      return res.status(401).json({ error: 'Invalid role in token' });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    

    // Create user object with proper typing
    const userData = {
      email: user.email,
      id: user._id,
      name: user.name,
      role: decoded.role, // Use role from token instead of specialization check
      isProfileComplete: decoded.role === 'doctor' 
        ? isProfileComplete(user)
        : Boolean(user.phone) // Example patient completion check
    };

    req.user = userData;
    req.token = token;
    next();
  } catch (err) {
    const errorMessage = err.name === 'TokenExpiredError' 
      ? 'Token expired' 
      : 'Invalid token';
    
    res.status(401).json({ 
      error: errorMessage,
      suggestion: 'Please login again'
    });
  }
};

module.exports = protectRoute;