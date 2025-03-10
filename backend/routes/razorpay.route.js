const express = require('express');
const router = express.Router();
const crypto = require('crypto'); // Import the crypto module
const Appointment = require('../models/appointment.model');


// Razorpay webhook endpoint
router.post('/webhook', express.json(), async (req, res) => {
    const { event, payload } = req.body;
  
    // Verify the webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
  
    console.log("Generated Signature:", expectedSignature);
    console.log("Received Signature:", signature);
  
    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
  
    // Handle payment success event
    if (event === 'payment.captured') {
      const { payment_id, order_id } = payload.payment.entity;
  
      // Update the appointment with payment details
      await Appointment.findOneAndUpdate(
        { 'payment.razorpayOrderId': order_id },
        {
          'payment.status': 'paid',
          'payment.razorpayPaymentId': payment_id
        }
      );
    }
  
    // Respond to Razorpay
    res.status(200).send('OK');
  });
  module.exports=router;