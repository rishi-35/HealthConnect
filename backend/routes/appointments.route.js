require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctors.model');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Your Razorpay key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET // Your Razorpay key secret
});

// Book Appointment
router.post('/book', auth, async (req, res) => {
  if (req.user.specialization !== undefined) {
    return res.status(403).json({ error: 'Only patients can book appointments' });
  }

  const { doctorId, dateTime, paymentMethod, notes } = req.body;

  // Input validation
  if (!doctorId || !dateTime) {
    return res.status(400).json({ error: 'doctorId and dateTime are required' });
  }

  // Date validation
  const appointmentDate = new Date(dateTime);
  if (isNaN(appointmentDate.getTime()) || appointmentDate < new Date()) {
    return res.status(400).json({ error: 'Invalid or past dateTime' });
  }

  try {
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Calculate start and end times for the new appointment
    const appointmentStart = new Date(appointmentDate);
    const appointmentEnd = new Date(appointmentStart.getTime() + 30 * 60000); // 30 minutes duration

    // Check for overlapping appointments
    const overlappingAppointments = await Appointment.find({
      doctor: doctorId,
      dateTime: {
        $lt: appointmentEnd, // Existing appointment starts before the new one ends
        $gte: appointmentStart // Existing appointment ends after the new one starts
      }
    });

    if (overlappingAppointments.length > 0) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    // Check for appointments within 30 minutes before or after
    const bufferStart = new Date(appointmentStart.getTime() - 30 * 60000); // 30 minutes before
    const bufferEnd = new Date(appointmentEnd.getTime() + 30 * 60000); // 30 minutes after

    const bufferAppointments = await Appointment.find({
      doctor: doctorId,
      dateTime: {
        $lt: bufferEnd, // Existing appointment starts before the buffer ends
        $gte: bufferStart // Existing appointment ends after the buffer starts
      }
    });

    if (bufferAppointments.length > 0) {
      return res.status(400).json({ error: 'Appointments must be at least 30 minutes apart' });
    }

    // Create the appointment
    const appointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      dateTime: appointmentDate,
      payment: {
        method: paymentMethod || 'cash', // Default to cash
        status: 'pending'
      },
      notes: notes || '' // Include notes (default to empty string if not provided)
    });

    // Handle online payments
    if (appointment.payment.method === 'online') {
      const amount = doctor.fee * 100; // Convert to paise

      // Create a Razorpay order
      const options = {
        amount,
        currency: 'INR',
        receipt: `receipt_${appointment._id}`,
        payment_capture: 1 // Auto-capture payment
      };

      try {
        const order = await razorpay.orders.create(options);
        appointment.payment.razorpayOrderId = order.id;

        // Save the appointment before returning the response
        await appointment.save();

        // Return order details to the client
        return res.json({
          appointment,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency
        });
      } catch (razorpayError) {
        console.error("Razorpay error:", razorpayError.message);
        return res.status(500).json({ error: 'Failed to create Razorpay order' });
      }
    }

    // Save the appointment for cash payments
    await appointment.save();

    // Return the appointment for cash payments
    res.json(appointment);
  } catch (err) {
    console.error("Error in /book:", err.message);
    res.status(500).send('Server error');
  }
});
//to confirm Appointment
router.patch('/:appointmentId/confirm', auth, async (req, res) => {
  if (req.user.specialization === undefined) {
    return res.status(403).json({ error: 'Only doctors can confirm appointments' });
  }

  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if the logged-in doctor is the one associated with the appointment
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to confirm this appointment' });
    }

    // Check if the appointment is in a valid state to be confirmed
    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: 'Appointment can only be confirmed from "pending" status' });
    }

    // Check payment status for online payments
    if (appointment.payment.method === 'online' && appointment.payment.status !== 'paid') {
      return res.status(400).json({ error: 'Payment is pending. Cannot confirm appointment.' });
    }

    // Update the appointment status to confirmed
    appointment.status = 'confirmed';

    // For cash payments, mark payment as paid
    if (appointment.payment.method === 'cash') {
      appointment.payment.status = 'paid';
    }

    // Save the updated appointment
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    console.error("Error in /:appointmentId/confirm:", err.message);
    res.status(500).send('Server error');
  }
});

// to cancel Appointments 
router.patch('/:appointmentId/cancel', auth, async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if the logged-in user is the patient or the associated doctor
    const isPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user.id;
    const isDoctor = req.user.specialization !== undefined && appointment.doctor.toString() === req.user.id;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ error: 'You are not authorized to cancel this appointment' });
    }

    // Check if the appointment is in a valid state to be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    // Handle refund for online payments
    if (appointment.payment.method === 'online' && appointment.payment.status === 'paid') {
      const refund = await razorpay.payments.refund({
        payment_id: appointment.payment.razorpayPaymentId,
        amount: appointment.doctor.fee * 100 // Refund the full amount in paise
      });

      // Update payment status to refunded
      appointment.payment.status = 'refunded';
    }

    // Update the appointment status to cancelled
    appointment.status = 'cancelled';
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    console.error("Error in /:appointmentId/cancel:", err.message);
    res.status(500).send('Server error');
  }
});

// Get all pending appointments for the doctor
router.get('/pending', auth, async (req, res) => {
  if (req.user.specialization ===undefined) {
    return res.status(403).json({ error: 'Only doctors can access this endpoint' });
  }

  try {
    const appointments = await Appointment.find({
      doctor: req.user.id,
      status: 'pending'
    }).populate('patient', 'name email phone');

    res.json(appointments);
  } catch (err) {
    console.error("Error in /pending:", err.message);
    res.status(500).send('Server error');
  }
});

// Get all confirmed appointments for the doctor
router.get('/confirmed', auth, async (req, res) => {
  if (req.user.specialization=== undefined ) {
    return res.status(403).json({ error: 'Only doctors can access this endpoint' });
  }

  try {
    // Fetch confirmed appointments (ignore payment status)
    const appointments = await Appointment.find({
      doctor: req.user.id,
      status: 'confirmed'
    }).populate('patient', 'name email phone');

    res.json(appointments);
  } catch (err) {
    console.error("Error in /confirmed:", err.message);
    res.status(500).send('Server error');
  }
});

// Get all appointments for the doctor
router.get('/all', auth, async (req, res) => {
  if (req.user.specialization ===undefined){
    return res.status(403).json({ error: 'Only doctors can access this endpoint' });
  }

  try {
    const appointments = await Appointment.find({
      doctor: req.user.id
    }).populate('patient', 'name email phone');

    res.json(appointments);
  } catch (err) {
    console.error("Error in /all:", err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
router.get("/upcoming",(req,res)=>{});
module.exports=router;