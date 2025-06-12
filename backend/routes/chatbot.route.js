const express = require('express');
const router = express.Router();
const auth = require('../middlewares/protectRoute.middleware');
const axios = require('axios');

router.post('/', auth, async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(
      'https:/api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Medical query: ${message}` }]
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_KEY}` } }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).send('Chatbot error');
  }
});

module.exports = router;