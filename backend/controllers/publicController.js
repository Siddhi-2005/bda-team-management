const Lead = require('../models/Lead');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    
    // Create a new "Lead" automatically with 'website' as the source
    const newCustomer = await Lead.create({
      name,
      email,
      phone,
      notes,
      source: 'website',
      status: 'new'
    });

    res.status(201).json({ success: true, message: 'Message received!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
