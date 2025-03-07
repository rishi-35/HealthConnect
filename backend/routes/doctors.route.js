const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const Doctor = require('../models/doctors.model');
// Update Availability
router.put('/availability', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Access denied' });

  try {
    const doctor = await Doctor.findById(req.user.id);
    doctor.availability = req.body.availability;
    await doctor.save();
    res.json(doctor.availability);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get Nearby Doctors (For Patients)
router.get('/nearby', auth, async (req, res) => {
  const { lng, lat, maxDistance = 5000 } = req.query; // Default 5km radius

  try {
    const doctors = await Doctor.find({
      'hospitalLocation': {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistance
        }
      },
      'availability.isAvailable': true
    }).select('-password');

    res.json(doctors);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
// to add reviews for a doctor
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    await doctor.addReview(req.user.id, req.body.rating, req.body.comment);
    res.json({ message: 'Review added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// In your doctor routes file
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const doctor = await Doctor.findById(id)
      .select('reviews rating')
      .populate({
        path: 'reviews.patient',
        select: 'name profilePhoto -_id',
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit)
        }
      });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      success: true,
      averageRating: doctor.rating,
      totalReviews: doctor.reviews.length,
      page: parseInt(page),
      totalPages: Math.ceil(doctor.reviews.length / limit),
      reviews: doctor.reviews.map(review => ({
        rating: review.rating,
        comment: review.comment,
        date: review.date,
        patient: review.patient
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports=router;