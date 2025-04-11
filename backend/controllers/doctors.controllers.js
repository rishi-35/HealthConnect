const Appointment = require("../models/appointment.model");
const Doctor = require("../models/doctors.model");
// Add this at the top with other requires
const moment = require('moment-timezone');
validateCoordinates = (lng, lat) => {
  return !isNaN(lng) && !isNaN(lat) && 
         Math.abs(lng) <= 180 && 
         Math.abs(lat) <= 90;
};

async function toggleAvailability(req, res) {
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
const nearByDoctors = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000, category, available, sortBy, minRating, search, page = 1, limit = 10, activeOnly } = req.query;

    // Validation
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const distance = parseFloat(maxDistance);
    if (isNaN(distance)) return res.status(400).json({ error: 'Invalid maxDistance' });

    // Base pipeline with $geoNear as the first stage
    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates },
          distanceField: 'distance',
          maxDistance: distance,
          spherical: true,
          key: 'hospitalLocation'
        }
      }
    ];

    // Add filters
    const matchStage = {};
    if (category) matchStage.specialization = new RegExp(category, 'i');
    if (minRating) matchStage.rating = { $gte: parseFloat(minRating) };
    if (search) {
      matchStage.$or = [
        { name: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') }
      ];
    }
    if (activeOnly === 'true') matchStage.activestatus = true; // Filter for active doctors only

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Create count pipeline before adding sorting/pagination
    const countPipeline = [...pipeline, { $count: 'total' }];

    // Add calculated fields
    pipeline.push({
      $addFields: {
        distanceKm: { $divide: ['$distance', 1000] },
        combinedScore: {
          $add: [
            { $multiply: [{ $ifNull: ['$rating', 0] }, 1000] },
            { $cond: [
              { $eq: ['$distance', 0] },
              10000,
              { $divide: [distance, '$distance'] }
            ]}
          ]
        }
      }
    });

    // Sorting
    switch (sortBy) {
      case 'rating':
        pipeline.push({ $sort: { rating: -1 } });
        break;
      case 'distance':
        pipeline.push({ $sort: { distanceKm: 1 } });
        break;
      default:
        pipeline.push({ $sort: { combinedScore: -1 } });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push(
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          password: 0,
          certificate: 0,
          reviews: 0,
          'availability._id': 0
        }
      }
    );

    // Execute both pipelines in parallel
    const [doctors, countResult] = await Promise.all([
      Doctor.aggregate(pipeline),
      Doctor.aggregate(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      count: doctors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: doctors
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTopRatedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ rating: { $gte: 4 } })
      .sort({ rating: -1 })
      .limit(10)
      .select('-password -certificate -reviews');
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

async function getSpecializations(req, res) {
    try {
        const specializations = await mongoose.model('Doctor').distinct('specialization');
        res.json(specializations);
    } catch (error) {
        console.error("Error fetching specializations:", error);
        res.status(500).json({ error: 'Server error' });
    }
}

async function addReviews(req, res) {
    try {
        if (req.user.specialization !== undefined) return res.status(400).json({ message: "Access denied. login with patient to access" });
        const doctor = await Doctor.findById(req.params.id);
      
        await doctor.addReview(req.user.id, req.body.rating, req.body.text);
        res.json({ message: 'Review added successfully' });
    } catch (err) {
      console.log("Error in doctors.controlers.js for addreqviewss",err);
        res.status(500).json({ error: 'Server error' });
    }
}

async function getReviews(req, res) {
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

// Helper function to get the start of the current day at midnight
function getStartOfDay(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

// Fetch available appointment slots for a doctor
getAvailableSlots = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!id || !date) {
    return res.status(400).json({ error: 'Doctor ID and date are required' });
  }

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get timezone and working hours
    const tz = doctor.availability.timezone || 'UTC';
    const workingHours = doctor.availability.workingHours;
    
    // Parse input date with timezone
    const targetDate = moment.tz(req.query.date, tz); // tz is likely 'UTC' or another timezone
    if (!targetDate.isValid()) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Convert working hours to UTC
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    
    const startUTC = targetDate.clone().hour(startHour).minute(startMinute).tz('UTC');
    const endUTC = targetDate.clone().hour(endHour).minute(endMinute).tz('UTC');

    // Get all appointments for the day (UTC)
    const startOfDay = targetDate.clone().startOf('day').tz('UTC');
    const endOfDay = targetDate.clone().endOf('day').tz('UTC');

    const appointments = await Appointment.find({
      doctor: id,
      $or: [
        { dateTime: { $gte: startOfDay.toDate(), $lt: endOfDay.toDate() } },
        { endTime: { $gt: startOfDay.toDate(), $lte: endOfDay.toDate() } }
      ]
    });

    // Generate slots with lunch break
    const slotDuration = 30; // minutes
    let currentSlot = startUTC.clone();
    const endTime = endUTC.clone();
    const availableSlots = [];
    
    while (currentSlot.isBefore(endTime)) {
      // Check lunch time in local time (12pm-1pm)
      const localTime = currentSlot.clone().tz(tz);
      if (localTime.hour() === 12) {
        // Skip to 1pm in local time
        currentSlot = targetDate.clone().tz(tz).hour(13).minute(0).tz('UTC');
        continue;
      }

      const slotEnd = currentSlot.clone().add(slotDuration, 'minutes');
      
      // Check if slot exceeds working hours
      if (slotEnd.isAfter(endUTC)) break;

      // Check for conflicts with existing appointments
      const isAvailable = !appointments.some(appt => {
        const apptStart = moment(appt.dateTime);
        const apptEnd = moment(appt.endTime || apptStart).add(appt.duration || 30, 'minutes');
        return currentSlot.isBefore(apptEnd) && slotEnd.isAfter(apptStart);
      });

      // Only show future slots
      if (isAvailable && currentSlot.isAfter(moment())) {
        availableSlots.push({
          start: currentSlot.toISOString(),
          end: slotEnd.toISOString(),
          // Add human-readable local time for display
          localTime: localTime.format('h:mm A') + ' - ' + localTime.clone().add(30, 'minutes').format('h:mm A')
        });
      }

      currentSlot.add(slotDuration, 'minutes');
    }

    res.json({
      success: true,
      slots: availableSlots,
      doctor: doctor.name,
      date: targetDate.format('YYYY-MM-DD'),
      workingHours: {
        start: workingHours.start,
        end: workingHours.end,
        timezone: tz
      }
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
    toggleAvailability,
    nearByDoctors,
    addReviews,
    getReviews,
    performance,
    getTopRatedDoctors,
    getSpecializations,
    getAvailableSlots,
};