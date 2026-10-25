const Lead = require('../models/Lead');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, notes, company, value } = req.body;
    
    // Strict validation to prevent NoSQL injection or bad input
    if (!name || typeof name !== 'string' || !email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid name and email are required' });
    }

    // Create a new "Lead" with source 'website' and unassigned
    const newLead = await Lead.create({
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === 'string' ? phone.trim() : '',
      company: typeof company === 'string' ? company.trim() : '',
      notes: typeof notes === 'string' ? notes.trim() : '',
      value: typeof value === 'number' && value >= 0 ? value : 0,
      source: 'website',
      status: 'new',
      assignedTo: undefined
    });

    res.status(201).json({ success: true, message: 'Inquiry received successfully', lead: newLead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
