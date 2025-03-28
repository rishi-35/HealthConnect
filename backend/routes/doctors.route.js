const express = require('express');
const router = express.Router();
const auth = require('../middlewares/protectRoute.middleware');
const Doctor = require('../models/doctors.model');
const { toggleAvailability, nearByDoctors, addReviews, getReviews, performance } = require('../controllers/doctors.controllers');

// Toggle Availability
router.put('/availability', auth,toggleAvailability);

//get nearby doctors
router.get('/nearby', auth,nearByDoctors);

// to add reviews for a doctor
router.post('/:id/reviews', auth,addReviews);


// In your doctor routes file
router.get('/:id/reviews', getReviews);

//performance of doctor
router.get('/performance', auth, performance);
module.exports=router;