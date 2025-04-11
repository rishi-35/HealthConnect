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
    password 
  } = req.body;

  try {
    // Check if doctor already exists
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ error: 'Doctor already exists' });
    }

    // Create new doctor with only required fields
    doctor = new Doctor({ 
      name, 
      email, 
      password ,
      hospitalLocation: null ,
      activestatus:false,
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
    res.cookie('token', token, cookieOptions);

    // Send success response
    res.status(201).json({ 
      message: 'Doctor registered successfully',
      user: { 
        id: doctor.id, 
        name: doctor.name, 
        email: doctor.email,
        role: 'doctor'
      },
      isProfileComplete:false
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
              user: { id: patient.id, name: patient.name, email: patient.email ,role:'patient'}
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
          user: { id: patient.id, name: patient.name, email: patient.email ,role:'patient'}
        });
      } catch (err) {
        console.log("error in login auth.controlers"+err);
        return  res.status(500).json({message:"Internal-Server error"});
      }
    }

    // to check whether the profile is completed or not 
    const isProfileComplete = (doctor) => {
      return (
        doctor.specialization &&
        doctor.certificate &&
        doctor.hospitalLocation?.coordinates?.length === 2 && // Coordinates array check
        doctor.dateOfBirth &&
        doctor.gender &&
        doctor.phone &&
        doctor.profilePhoto
      );
    };
  
  async function doctorLogin(req, res) {
      const { email, password } = req.body;
  
      try {
          const doctor = await Doctor.findOne({ email });
          if (!doctor) return res.status(400).json({ error: 'Invalid credentials' });
  
          const isMatch = await bcrypt.compare(password, doctor.password);
          if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
  
          // Check if the doctor's profile is complete
          const profileComplete = isProfileComplete(doctor);
  
          const token = jwt.sign(
              { id: doctor.id, role: 'doctor' },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
          );
  
          res.cookie('token', token, cookieOptions);
          return res.json({
              message: 'Doctor logged in successfully',
              user: {
                  id: doctor.id,
                  name: doctor.name,
                  email: doctor.email,
                  role: 'doctor',
                  isProfileComplete: profileComplete,
              }
          });
      } catch (err) {
          console.error("Error in doctorLogin function:", err);
          return res.status(500).json({ success: false, message: "Internal Server Error" });
      }
  }
  
async function logout(req,res) {
        try{

          res.clearCookie('token');
            res.json({ message: ' Logged out successfully' });
        }
        catch(err){
            console.log("error in  auth.controlers"+err);
            return  res.status(500).json({sucess:false,message:"Internal-Server error"});
        }
      
}

async function authCheck(req,res) {
  try {

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
    logout,
    authCheck
}