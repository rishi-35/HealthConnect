const express = require('express');
const router = express.Router();
const Doctor=require("../models/doctors.model");
router.get('/',(req,res)=>{})
// Doctor Search Route
router.get('/doctors', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const query = {};

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { name: searchRegex },
        { specialization: searchRegex }
      ];
    }

    const options = {
      select: '-password -__v',
      skip: (page - 1) * limit,
      limit: parseInt(limit)
    };

    const [doctors, total] = await Promise.all([
      Doctor.find(query, null, options),
      Doctor.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: doctors.length,
      total,
      data: doctors
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports= router;