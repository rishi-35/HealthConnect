const express = require('express');
const router = express.Router();
const upload = require("../middlewares/upload");
const Appointment = require('../models/appointment.model'); // Appointment model
const Doctor = require('../models/doctors.model'); // Doctor model
const geolib = require('geolib'); // Library for distance calculation
const Patient = require('../models/patient.model');

// Fetch all upcoming appointments for the logged-in patient
router.get('/upcoming', async (req, res) => {
  try {
    const patientId = req.user.id;
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Patient location is required' });
    }

    const currentDateTime = new Date();

    // Fetch appointments with proper population
    const appointments = await Appointment.find({
      patient: patientId,
      dateTime: { $gte: currentDateTime },
      status: { $ne: 'cancelled' }
    }).populate({
      path: 'doctor',
      select: 'name specialization hospitalLocation profilePhoto fee',
      // Add explicit population if hospitalLocation is a reference
      populate: {
        path: 'hospitalLocation',
        model: 'HospitalLocation' // Replace with actual model name
      }
    });

    // Modified mapping with proper coordinate handling
    const appointmentsWithDetails = appointments.map((appointment) => {
      if (!appointment.doctor?.hospitalLocation?.coordinates) {
        return null; // Filter out invalid entries
      }

      // Extract coordinates properly
      const [longitude, latitude] = appointment.doctor.hospitalLocation.coordinates;
      
      return {
        ...appointment.toObject(),
        doctor: {
          ...appointment.doctor.toObject(),
          hospitalLocation: {
            ...appointment.doctor.hospitalLocation.toObject(),
            latitude, // Add explicit latitude
            longitude // Add explicit longitude
          },
          distance: calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(req.query.latitude),
            parseFloat(req.query.longitude)
          ).toFixed(2)
        }
      };
    }).filter(Boolean); // Remove null entries

    res.json(appointmentsWithDetails);
  } catch (err) {
    console.error("Error in /upcoming:", err.message);
    res.status(500).send('Server error');
  }
});

// Helper function for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

router.get("/profile", async (req, res) => {
  try {
    const patient = await Patient.findOne({ email: req.user.email }).select("-password");
    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }
    // Ensure dateOfBirth is formatted correctly
    const dataSending = {
      ...patient.toObject(),
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString().split("T")[0] : "",
      password: "", // Explicitly exclude password
    };
    
    res.json(dataSending);
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update patient profile
router.post(
  "/update-profile",
  upload.fields([{ name: "profilePhoto", maxCount: 1 }]),
  async (req, res) => {
    try {
   

      const {
        name,
        email,
        phone,
        gender,
        dateOfBirth,
        healthInfo, // This is now the entire healthInfo object as a JSON string
      } = req.body;

      let patient = await Patient.findOne({ email: req.user.email });
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      // Update basic fields
      patient.name = name || patient.name;
      patient.email = email || patient.email;
      patient.phone = phone || patient.phone;
      patient.gender = gender || patient.gender;
      patient.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : patient.dateOfBirth;

      // Parse and update healthInfo if provided
      if (healthInfo) {
        try {
          const parsedHealthInfo = JSON.parse(healthInfo);
          // Ensure healthInfo exists on the patient
          if (!patient.healthInfo) {
            patient.healthInfo = { conditions: [], allergies: [] };
          }
          patient.healthInfo.conditions = parsedHealthInfo.conditions || [];
          patient.healthInfo.allergies = parsedHealthInfo.allergies || [];
        } catch (error) {
          console.error("Error parsing healthInfo:", error);
          return res.status(400).json({ message: "Invalid healthInfo format" });
        }
      }

      // Handle profile photo upload
      if (req.files?.profilePhoto) {
        patient.profilePhoto = `/uploads/${req.files.profilePhoto[0].filename}`;
      }

      await patient.save();

      // Prepare and send response
      const responseData = {
        ...patient.toObject(),
        dateOfBirth: patient.dateOfBirth?.toISOString().split("T")[0] || "",
        password: undefined, // Exclude password
      };

      res.json(responseData);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
module.exports = router;