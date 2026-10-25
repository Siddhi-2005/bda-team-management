const axios = require('axios');

exports.draftEmail = async (req, res) => {
  try {
    const { name, company, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Prospect name is required.' });
    }

    // Fallback generator when GROK_API_KEY is not configured or in case of external API downtime
    const generateSmartFallback = () => {
      const companyRef = company ? ` at ${company}` : '';
      const notesClean = notes && notes.trim().length > 0 ? notes.trim() : 'our recent conversation regarding your business goals';
      return `Hi ${name},\n\nThank you for taking the time to connect today regarding potential collaboration${companyRef}.\n\nAs discussed: ${notesClean}.\n\nI have documented your requirements and our team is preparing a customized proposal outlining the recommended scope, timeline, and commercial terms. I expect to share the complete document with you by the end of this week.\n\nPlease let me know if you would like to clarify any additional details before then. Looking forward to partnering together!\n\nBest regards,\nBusiness Development Associate`;
    };

    // If GROK_API_KEY is configured, call Grok (xAI)
    if (process.env.GROK_API_KEY && process.env.GROK_API_KEY.trim() !== '') {
      try {
        const prompt = `You are an expert Business Development Associate. Write a professional, concise, and persuasive follow-up email to ${name} from ${company || 'the company'}. 
        
Here are the notes from our discussion: ${notes || 'standard business inquiry'}

Instructions:
- Keep it under 150 words.
- Be highly professional, actionable, and polite.
- Do not include a Subject Line. Just the body of the email.
- Do not include "[Your Name]" at the bottom.`;

        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            messages: [
              { role: 'system', content: 'You are a master business development sales executive.' },
              { role: 'user', content: prompt }
            ],
            model: 'grok-beta',
            temperature: 0.7
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROK_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 8000
          }
        );

        const emailDraft = response.data?.choices?.[0]?.message?.content?.trim();
        if (emailDraft) {
          return res.json({ success: true, emailDraft, engine: 'grok' });
        }
      } catch (externalErr) {
        console.warn('Grok API call failed, falling back to built-in generator:', externalErr.message);
      }
    }

    // Built-in intelligent template generator
    const emailDraft = generateSmartFallback();
    return res.json({ success: true, emailDraft, engine: 'smart-template' });

  } catch (error) {
    console.error('AI Draft Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate email draft. Please try again.'
    });
  }
};
