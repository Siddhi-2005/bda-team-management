const axios = require('axios');

exports.draftEmail = async (req, res) => {
  try {
    const { name, company, notes } = req.body;
    
    if (!process.env.GROK_API_KEY) {
      return res.status(400).json({ 
        success: false, 
        message: 'Grok API key is missing. Please add GROK_API_KEY to your backend/.env file.' 
      });
    }

    // Build the AI Prompt
    const prompt = `You are an expert Business Development Associate. Write a professional, concise, and persuasive follow-up email to ${name} from ${company || 'the company'}. 
    
    Here are the notes from our discussion: ${notes}
    
    Instructions:
    - Keep it under 150 words.
    - Be highly professional but warm.
    - Do not include a Subject Line. Just the body of the email.
    - Do not include "[Your Name]" at the bottom.`;

    // Call the Grok (xAI) API
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [{ role: 'system', content: 'You are a master salesperson.' }, { role: 'user', content: prompt }],
      model: 'grok-beta', // You can change this to 'grok-2-latest' if you prefer
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const emailBody = response.data.choices[0].message.content.trim();
    res.json({ success: true, emailDraft: emailBody });

  } catch (error) {
    console.error('AI Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.error?.message || 'Failed to connect to Grok AI.' 
    });
  }
};
