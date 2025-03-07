const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check } = require('express-validator');
const Doctor = require('../models/doctors.model');
const Patient = require('../models/patient.model');
const { doctorRegister, patientRegistration, patientLogin, patientLogout, doctorLogout, doctorLogin } = require('../controllers/auth.controllers');



// Patient Registration
router.post('/patient/register', [
  check('email').isEmail(),
  check('password').isLength({ min: 6 }),
  check('phone').isMobilePhone()
], patientRegistration);

// Doctor Registration
router.post('/doctor/register', [
  check('certificate').not().isEmpty(),
  check('hospitalLocation.coordinates').isArray({ min: 2, max: 2 })
],doctorRegister );

// Patient Login
router.post('/patient/login', [
  
  check('email').isEmail().normalizeEmail(),
  check('password').not().isEmpty()
] ,patientLogin);

// Doctor Login
router.post('/doctor/login', [
  check('email').isEmail().normalizeEmail(),
  check('password').not().isEmpty()
], doctorLogin);

// Patient Logout
router.post('/patient/logout', patientLogout);

// Doctor Logout
router.post('/doctor/logout', doctorLogout);

module.exports = router;