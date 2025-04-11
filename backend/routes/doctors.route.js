const express = require('express');
const router = express.Router();
const auth = require('../middlewares/protectRoute.middleware');
const Doctor = require('../models/doctors.model');
const { toggleAvailability, nearByDoctors, addReviews, getReviews, performance, getTopRatedDoctors, getAvailableSlots,} = require('../controllers/doctors.controllers');
const upload= require("../middlewares/upload");
// Toggle Availability
router.put('/availability', auth,toggleAvailability);

//get nearby doctors
router.get('/nearby',nearByDoctors);

router.get('/top-rated',getTopRatedDoctors);

// to add reviews for a doctor
router.post('/:id/reviews', auth,addReviews);


// In your doctor routes file
router.get('/:id/reviews', getReviews);

//performance of doctor
router.get('/performance', auth, performance);

router.get("/profile", auth, async (req, res) => {
    try {
      // Find the doctor by email (assuming the JWT token contains the email)
      const doctor = await Doctor.findOne({ email: req.user.email }).select("-password"); // Exclude password
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.json({
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        address: doctor.address,
        specialization: doctor.specialization,
        hospitalLocation: {
          latitude: doctor.hospitalLocation?.coordinates?.[1] || 17.4948, // latitude
          longitude: doctor.hospitalLocation?.coordinates?.[0] || 78.3996, // longitude
        },
        gender: doctor.gender,
        dateOfBirth: doctor.dateOfBirth ? doctor.dateOfBirth.toISOString().split("T")[0] : "", // Format as YYYY-MM-DD
        fee: doctor.fee.toString(),
        profilePhoto: doctor.profilePhoto,
        certificate: doctor.certificate,
        workingHours: {
          start: doctor.availability.workingHours.start,
          end: doctor.availability.workingHours.end,
        },
        rating: doctor.rating,
        reviews: doctor.reviews,
      });
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// Update Profile Route (Fixed working hours modification)
router.post(
  "/update-profile",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        specialization,
        longitude,
        latitude,
        gender,
        dateOfBirth,
        fee,
        workingHours // Now expects { start: "09:00", end: "17:00" }
      } = req.body;

      const doctor = await Doctor.findOne({ email: req.user.email });
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      // Initialize availability if missing
      if (!doctor.availability) {
        doctor.availability = {
          workingHours: { start: "09:00", end: "17:00" },
          timezone: "UTC"
        };
      }

      // Update working hours only if new values are provided
      if (workingHours) {
        doctor.availability.workingHours = {
          start: workingHours.start || doctor.availability.workingHours.start,
          end: workingHours.end || doctor.availability.workingHours.end
        };
      }

      // Update other fields
      doctor.name = name || doctor.name;
      doctor.email = email || doctor.email;
      doctor.phone = phone || doctor.phone;
      doctor.address = address || doctor.address;
      doctor.specialization = specialization || doctor.specialization;

      if (latitude && longitude) {
        doctor.hospitalLocation = {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
      }

      doctor.gender = gender || doctor.gender;
      doctor.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : doctor.dateOfBirth;
      doctor.fee = fee ? parseInt(fee) : doctor.fee;

      // File upload handling
      if (req.files.profilePhoto) {
        doctor.profilePhoto = `/uploads/${req.files.profilePhoto[0].filename}`;
      }
      if (req.files.certificate) {
        doctor.certificate = `/uploads/${req.files.certificate[0].filename}`;
      }

      doctor.activestatus = false;
      await doctor.save();

      // Return updated profile
      const updatedDoctor = await Doctor.findById(doctor._id)
        .select("-password -__v -reviews")
        .lean();

      res.json({
        ...updatedDoctor,
        hospitalLocation: {
          latitude: updatedDoctor.hospitalLocation?.coordinates?.[1],
          longitude: updatedDoctor.hospitalLocation?.coordinates?.[0]
        },
        dateOfBirth: updatedDoctor.dateOfBirth?.toISOString().split("T")[0] || "",
        workingHours: updatedDoctor.availability.workingHours
      });

    } catch (error) {
      console.error("Error updating doctor profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
router.get('/specialization', async (req, res) => {
    try {
      const specializations = await Doctor.distinct('specialization', { specialization: { $ne: null } });
  
      if (!specializations || specializations.length === 0) {
        return res.status(404).json({ error: 'No specializations found' });
      }
  
      res.json(specializations.sort()); // Sort alphabetically
    } catch (err) {
      console.error('Error fetching specializations:', err.message);
      res.status(500).json({ error: 'Server error while fetching specializations' });
    }
  });
router.get('/:id',async (req, res) => {
  try {
    const { id } = req.params;

    // Find doctor by ID and populate the patient details in reviews
    const doctor = await Doctor.findById(id)
      .populate({
        path: 'reviews.patient',
        select: 'name profilePhoto' // Only fetch name and profilePhoto from Patient model
      })
      .lean(); // Convert to plain JavaScript object for easier manipulation

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Calculate average rating if not already updated (optional, as pre-save handles it)
    const totalRating = doctor.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = doctor.reviews.length > 0 
      ? parseFloat((totalRating / doctor.reviews.length).toFixed(1)) 
      : 0;

    // Prepare response
    const doctorDetails = {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      certificate: doctor.certificate,
      hospitalLocation: doctor.hospitalLocation,
      dateOfBirth: doctor.dateOfBirth,
      gender: doctor.gender,
      phone: doctor.phone,
      profilePhoto: doctor.profilePhoto,
      address: doctor.address,
      availability: doctor.availability,
      fee: doctor.fee,
      rating: averageRating, // Use calculated or schema rating
      reviews: doctor.reviews.map(review => ({
        patient: {
          name: review.patient.name,
          profilePhoto: review.patient.profilePhoto
        },
        rating: review.rating,
        comment: review.comment,
        date: review.date
      })),
      activestatus:doctor.activestatus,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    };

    res.status(200).json({
      success: true,
      doctor: doctorDetails
    });
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ error: 'Server error while fetching doctor details' });
  }
})
router.get('/:id/available-slots', getAvailableSlots);
module.exports=router;