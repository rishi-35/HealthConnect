const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware'); // Authentication middleware
const Appointment = require('../models/appointment.model'); // Appointment model
const Doctor = require('../models/doctors.model'); // Doctor model
const geolib = require('geolib'); // Library for distance calculation

// Fetch all upcoming appointments for the logged-in patient
router.get('/upcoming', auth, async (req, res) => {
  try {
    // Get the patient ID from the authenticated user
    const patientId = req.user.id;
    console.log("for testing "+patientId);
    // Get the patient's current location from query parameters (latitude and longitude)
    const { latitude, longitude } = req.query;

    // Validate the patient's current location
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Patient location is required (latitude and longitude)' });
    }

    const patientLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    // Get the current date and time
    const currentDateTime = new Date();

    // Fetch all appointments for the patient that are in the future and not cancelled
    const appointments = await Appointment.find({
      patient: patientId, // Match the patient ID
      dateTime: { $gte: currentDateTime }, // Appointments with dateTime greater than or equal to now
      status: { $ne: 'cancelled' } // Exclude cancelled appointments
    })
      .populate({
        path: 'doctor',
        select: 'name specialization hospitalLocation profilePhoto fee', // Select required fields
      })
      .sort({ dateTime: 1 }); // Sort by dateTime in ascending order (earliest first)

    // Add distance and doctor's profile to each appointment
    const appointmentsWithDetails = appointments.map((appointment) => {
      const doctorLocation = {
        latitude: appointment.doctor.hospitalLocation.coordinates[1], // Latitude
        longitude: appointment.doctor.hospitalLocation.coordinates[0], // Longitude
      };

      // Calculate distance between patient and doctor (in kilometers)
      const distance = geolib.getDistance(patientLocation, doctorLocation) / 1000; // Convert meters to kilometers

      return {
        ...appointment.toObject(), // Convert Mongoose document to plain object
        doctor: {
          ...appointment.doctor.toObject(), // Include doctor's profile
          address: appointment.doctor.hospitalLocation, // Include doctor's address
          distance: distance.toFixed(2), // Include distance in kilometers
        },
      };
    });

    // Send the response
    res.json(appointmentsWithDetails);
  } catch (err) {
    console.error("Error in /upcoming:", err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;