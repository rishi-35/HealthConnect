const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check } = require('express-validator');
const Patient=require('../models/patient.model');
const Doctor=require('../models/doctors.model');

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 3600000, // 1 hour in milliseconds
  path: '/',
};

async function doctorRegister(req,res) {

      const { name, email, password, specialization, certificate, hospitalLocation, dob, gender, phone } = req.body;
      try {
        let doctor = await Doctor.findOne({ email });
        if (doctor) return res.status(400).json({ error: 'Doctor already exists' });
    
        doctor = new Doctor({ 
          name, email, password, specialization, certificate,
          hospitalLocation: { 
            type: 'Point', 
            coordinates: hospitalLocation.coordinates 
          },
          dob, gender, phone 
        });
        await doctor.save();
    
        const token = jwt.sign(
          { id: doctor.id, role: 'doctor' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
    
        res.cookie('token', token, cookieOptions);
        res.status(201).json({ 
          message: 'Doctor registered successfully',
          user: { id: doctor.id, name: doctor.name, email: doctor.email }
        });
      } catch (err) {
        console.log("error in login auth.controlers"+err);
        return  res.status(500).json({sucess:false,message:"Internal-Server error"});
      }
    
}
async function patientRegistration(req,res) {
          const { name, email, password, phone, dob, gender } = req.body;
          try {
            let patient = await Patient.findOne({ email });
            if (patient) return res.status(400).json({ error: 'Patient already exists' });
        
            patient = new Patient({ name, email, password, phone, dob, gender });
            await patient.save();
        
            const token = jwt.sign(
              { id: patient.id, role: 'patient' },
              process.env.JWT_SECRET,
              { expiresIn: '1h' }
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
        if (!patient) return res.status(400).json({ error: 'Invalid credentials' });
    
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
        console.log("this is reached");
        const token = jwt.sign(
          { id: patient.id, role: 'patient' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
    
        res.cookie('token', token, cookieOptions);
        res.json({ 
          message: 'Patient logged in successfully',
          user: { id: patient.id, name: patient.name, email: patient.email }
        });
      } catch (err) {
        console.log("error in login auth.controlers"+err);
        return  res.status(500).json({sucess:false,message:"Internal-Server error"});
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
            { expiresIn: '1h' }
          );
      
          res.cookie('token', token, cookieOptions);
          res.json({ 
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
module.exports={
    doctorRegister,
    patientRegistration,
    patientLogin,
    doctorLogin,
    patientLogout,
    doctorLogout
}