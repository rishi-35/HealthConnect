const Appointment=require("../models/appointment.model");
const Doctor=require("../models/doctors.model");
async function toggleAvailability(req,res) {
    if (req.user.specialization === undefined) {
        return res.status(403).json({ error: 'Access denied' });
      }
    
      try {
        const doctor = await Doctor.findById(req.user.id);
    
        if (!doctor) {
          return res.status(404).json({ error: 'Doctor not found' });
        }
    
        // Toggle the availability
        doctor.availability.isAvailable = !doctor.availability.isAvailable;
    
        // Save the updated doctor document
        await doctor.save();
    
        // Return the updated availability status
        res.json({ isAvailable: doctor.availability.isAvailable });
      } catch (err) {
        console.error('Error in /availability:', err.message);
        res.status(500).send('Server error');
      }
}
async function nearByDoctors(req,res) {
    const { lng, lat, maxDistance = 10000, category, available, sortBy } = req.query;

  // Validate lng and lat
  if (!lng || !lat || isNaN(parseFloat(lng)) || isNaN(parseFloat(lat))) {
    return res.status(400).json({ error: 'Invalid longitude or latitude values' });
  }

  // Validate maxDistance
  const distance = parseFloat(maxDistance);
  if (isNaN(distance)) {
    return res.status(400).json({ error: 'Invalid maxDistance value' });
  }

  try {
    const coordinates = [parseFloat(lng), parseFloat(lat)];

    // Aggregation pipeline
    const aggregationPipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates },
          distanceField: 'distance', // Add a distance field to each document
          maxDistance: distance,
          spherical: true // Use spherical geometry for accurate calculations
        }
      },
      // Apply additional filters (category, availability)
      {
        $match: {
          ...(category && { category }), // Add category filter if provided
          ...(available === 'true' && { 'availability.isAvailable': true }) // Add availability filter if provided
        }
      },
      // Add a combined score field
      {
        $addFields: {
          combinedScore: {
            $add: [
              { $multiply: ['$rating', 1000] }, // Weight rating more heavily (e.g., 1000x)
              { $divide: [10000, '$distance'] } // Weight distance inversely (closer = higher score)
            ]
          }
        }
      },
      // Sort by the combined score
      { $sort: { combinedScore: -1 } }
    ];

    // Execute aggregation pipeline
    const doctors = await Doctor.aggregate(aggregationPipeline);

    res.json(doctors);
  } catch (err) {
    console.log("Error in doctors.route.js /nearby:", err.message);
    res.status(500).send('Server error');
  }
}

async function addReviews(req,res) {
    
  try {
    if(req.user.specialization!==undefined) return  res.status(400).json({message:"Access denied. login with patient to access"});
    const doctor = await Doctor.findById(req.params.id);
    await doctor.addReview(req.user.id, req.body.rating, req.body.comment);
    res.json({ message: 'Review added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function getReviews(req,res){
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
}
async function performance(req, res) {
    if (req.user.specialization === undefined) {
      return res.status(403).json({ error: 'Only doctors can access this endpoint' });
    }
  
    const doctorId = req.user.id;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
  
    try {
      // Build the query for completed appointments
      const query = { doctor: doctorId, status: 'completed' };
  
      // Add date range filter if provided
      if (startDate && endDate) {
        query.dateTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
  
      // Fetch completed appointments with pagination
      const appointments = await Appointment.find(query)
        .populate('patient', 'name email phone')
        .skip((page - 1) * limit)
        .limit(limit);
  
      // Calculate number of patients treated
      const uniquePatientIds = [...new Set(appointments.map(appointment => appointment.patient._id.toString()))];
      const numberOfPatientsTreated = uniquePatientIds.length;
  
      // Calculate total earnings
      const doctor = await Doctor.findById(doctorId);
      const earnings = appointments.length * doctor.fee; // Assuming each appointment has the same fee
  
      // Calculate average rating
      const ratings = appointments.map(appointment => appointment.rating).filter(rating => rating !== undefined);
      const averageRating = ratings.length > 0
        ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)
        : null;
  
      // Calculate number of cancellations
      const cancellationsQuery = { doctor: doctorId, status: 'cancelled' };
      if (startDate && endDate) {
        cancellationsQuery.dateTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      const cancellations = await Appointment.countDocuments(cancellationsQuery);
  
      // Calculate average appointment duration (example: 30 minutes)
      const averageDuration = 30; // In minutes
  
      // Send response
      res.json({
        numberOfPatientsTreated,
        earnings,
        averageRating,
        cancellations,
        averageDuration,
        appointments, // Paginated list of appointments
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalAppointments: await Appointment.countDocuments(query)
        }
      });
    } catch (err) {
      console.error("Error in /performance:", err.message);
      res.status(500).send('Server error');
    }
  }
module.exports={
    toggleAvailability,
    nearByDoctors,
    addReviews,
    getReviews,
    performance
}