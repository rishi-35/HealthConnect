const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check } = require('express-validator');
const Patient=require('../models/patient.model');
const Doctor=require('../models/doctors.model');

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // false in development
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Adjust for cross-site in production
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/'
};


async function doctorRegister(req, res) {
  const { 
    name, 
    email, 
    password, 
    specialization, 
    certificate, 
    hospitalLocation, 
    dob, 
    gender, 
    phone, 
    fee // Add fee field
  } = req.body;

  try {
    // Check if doctor already exists
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ error: 'Doctor already exists' });
    }

    // Validate fee (must be a positive number)
    if (typeof fee !== 'number' || fee <= 0) {
      return res.status(400).json({ error: 'Invalid fee. Fee must be a positive number' });
    }

    // Create new doctor
    doctor = new Doctor({ 
      name, 
      email, 
      password, 
      specialization, 
      certificate,
      hospitalLocation: { 
        type: 'Point', 
        coordinates: hospitalLocation.coordinates 
      },
      dob, 
      gender, 
      phone,
      fee // Include fee field
    });

    // Save doctor to database
    await doctor.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: doctor.id, role: 'doctor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie with token
    res.cookie('token', token,cookieOptions);

    // Send success response
    res.status(201).json({ 
      message: 'Doctor registered successfully',
      user: { 
        id: doctor.id, 
        name: doctor.name, 
        email: doctor.email,
        fee: doctor.fee // Include fee in response
      }
    });
  } catch (err) {
    console.error("Error in doctorRegister:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
}

async function patientRegistration(req,res) {
          const { name, email, password,} = req.body;
          try {
            let patient = await Patient.findOne({ email });
            if (patient) return res.status(400).json({ error: 'Patient already exists' });
        
            patient = new Patient({ name, email, password,});
            await patient.save();
        
            const token = jwt.sign(
              { id: patient.id, role: 'patient' },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );
        
            res.cookie('token', token, cookieOptions);
            res.status(201).json({ 
              message: 'Patient registered successfully',
              user: { id: patient.id, name: patient.name, email: patient.email }
            });
          } catch (err) {
            console.log("error in login auth.controlers"+err);
            return  res.status(500).json({sucess:false,message:"Internal-Server error"});
          }
        
}
async function patientLogin(req,res) {
      const { email, password } = req.body;
      try {
        const patient = await Patient.findOne({ email });
        if (!patient) return res.status(400).json({ message: 'Invalid credentials' });
    
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign(
          { id: patient.id, role: 'patient' },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
    
        res.cookie('token', token, cookieOptions);
        req.user=patient
      
        res.json({ 
          message: 'Patient logged in successfully',
          user: { id: patient.id, name: patient.name, email: patient.email }
        });
      } catch (err) {
        console.log("error in login auth.controlers"+err);
        return  res.status(500).json({message:"Internal-Server error"});
      }
    }

async function doctorLogin(req,res) {
        const { email, password } = req.body;
        try {
          const doctor = await Doctor.findOne({ email });
          if (!doctor) return res.status(400).json({ error: 'Invalid credentials' });
      
          const isMatch = await bcrypt.compare(password, doctor.password);
          if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
      
          const token = jwt.sign(
            { id: doctor.id, role: 'doctor' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
      
          res.cookie('token', token, cookieOptions);
          return res.json({ 
            message: 'Doctor logged in successfully',
            user: { id: doctor.id, name: doctor.name, email: doctor.email }
          });
        } catch (err) {
            console.log("error in login auth.controlers"+err);
            return  res.status(500).json({sucess:false,message:"Internal-Server error"});
        }
      
}
async function patientLogout(req,res) {
        try{

            res.clearCookie('token', cookieOptions);
            res.json({ message: 'Patient logged out successfully' });
        }
        catch(err){
            console.log("error in  auth.controlers"+err);
            return  res.status(500).json({sucess:false,message:"Internal-Server error"});
        }
      
}
async function doctorLogout(req,res) {
        try{

            res.clearCookie('token', cookieOptions);
            res.json({ message: 'Doctor logged out successfully' });
        }
        catch{
            console.log("error in login auth.controlers"+err);
            return  res.status(500).json({sucess:false,message:"Internal-Server error"});
        }
      
}
async function authCheck(req,res) {
  try {
    console.log("req.user val: ",req.user);
      return  res.status(200).json({sucess:true, user:req.user});
  } catch (error) {
      console.log("Error in auth.controlers.js"+error.message);
      return res.status(500).json({sucess:false,message:"Internal-Server-Error"});
  }
}
module.exports={
    doctorRegister,
    patientRegistration,
    patientLogin,
    doctorLogin,
    patientLogout,
    doctorLogout,
    authCheck
}