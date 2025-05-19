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
  specialization: { type: String },
  certificate: { type: String }, // Store URL/path
  activestatus:{
    type:Boolean,
    default:false
  },
  hospitalLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function (coords) {
          // If coordinates are provided, ensure they are valid
          if (coords) {
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              typeof coords[0] === 'number' &&
              typeof coords[1] === 'number'
            );
          }
          // If coordinates are absent, it's fine
          return true;
        },
        message: 'hospitalLocation.coordinates must be an array of two numbers [longitude, latitude] when provided.'
      }
    }
  },
  dateOfBirth: { type: Date },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other']
  },
  phone: { type: String },
  profilePhoto: { type: String },
  address:{type:String},
  availability: {
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" }
    },
    timezone: { type: String, default: 'IST' }
  },
  fee: { type: Number, default: 500 },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [reviewSchema],
});

// Geospatial index for nearby search (only works when coordinates are present)
doctorSchema.index({ hospitalLocation: '2dsphere' });


// Hash password before saving and calculate rating
doctorSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('reviews')) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = this.reviews.length > 0 
      ? parseFloat((total / this.reviews.length).toFixed(1)) 
      : 0;
  }
  next();
});

// Add instance method to add reviews
doctorSchema.methods.addReview = async function (patientId, rating, comment) {
  this.reviews.push({
    patient: patientId,
    rating,
    comment
  });
  return this.save();
};

module.exports = mongoose.model('Doctor', doctorSchema);