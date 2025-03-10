const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const reviewSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  certificate: { type: String, required: true }, // Store URL/path
  hospitalLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'Male', 'Female', 'other'], required: true },
  phone: { type: String, required: true },
  profilePhoto: { type: String },
  availability: {
    isAvailable: { type: Boolean, default: true },
    workingHours: {
      start: { type: String, default: '09:00' }, // Store as "HH:mm"
      end: { type: String, default: '17:00' }
    }
  },
  fee: { type: Number, required: true, default: 500 }, // Doctor's consultation fee
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [reviewSchema],
});

// Geospatial index for nearby search
doctorSchema.index({ hospitalLocation: '2dsphere' });

// Hash password before saving
doctorSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  // Calculate average rating if reviews are modified
  if (this.isModified('reviews')) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = this.reviews.length > 0 
      ? parseFloat((total / this.reviews.length).toFixed(1))
      : 0;
  }
  next();
});

// Add instance method to add reviews
doctorSchema.methods.addReview = async function(patientId, rating, comment) {
  this.reviews.push({
    patient: patientId,
    rating,
    comment
  });
  return this.save();
};

module.exports = mongoose.model('Doctor', doctorSchema);