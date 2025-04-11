const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  healthInfo: {
    conditions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
  },
  profilePhoto: { type: String },
  dateOfBirth: { type: Date,},
  gender: { type: String, enum: ['male', 'female', 'other'],},
  phone: { type: String, }
});

// Hash password before saving
patientSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);