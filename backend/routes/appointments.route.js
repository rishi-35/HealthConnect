const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctors.model');

// Book Appointment
router.post('/book', auth, async (req, res) => {
  if (req.user.role !== 'patient') return res.status(403).json({ error: 'Patients only' });

  const { doctorId, dateTime } = req.body;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor.availability.isAvailable) {
      return res.status(400).json({ error: 'Doctor not available' });
    }

    const appointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      dateTime
    });
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get("/upcoming",(req,res)=>{});
module.exports=router;