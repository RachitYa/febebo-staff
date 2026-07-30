const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Simulated Historical Dataset for the AI to learn from
const HISTORICAL_DATA = [
  { date: "16 Jul", headcount: 35, consumption: { rice: 4.8, atta: 3.2, dal: 2.8, veggies: 5.5 } },
  { date: "17 Jul", headcount: 32, consumption: { rice: 4.2, atta: 3.0, dal: 2.5, veggies: 4.9 } },
  { date: "18 Jul", headcount: 40, consumption: { rice: 5.4, atta: 4.0, dal: 3.3, veggies: 6.2 } },
  { date: "19 Jul", headcount: 38, consumption: { rice: 5.1, atta: 3.8, dal: 3.1, veggies: 5.9 } },
  { date: "20 Jul", headcount: 25, consumption: { rice: 3.2, atta: 2.5, dal: 2.0, veggies: 3.8 } }, // Weekend drop
  { date: "21 Jul", headcount: 28, consumption: { rice: 3.6, atta: 2.7, dal: 2.3, veggies: 4.3 } }, // Weekend drop
  { date: "22 Jul", headcount: 42, consumption: { rice: 5.8, atta: 4.2, dal: 3.5, veggies: 6.5 } }
];

export async function estimateKitchenRequirements(currentHeadcount) {
  const prompt = `You are an intelligent Kitchen Operations AI. 
Your goal is to predict the exact raw ingredient requirements for today's meals based on historical consumption data.

Here is the historical consumption data (in kg) for the past 7 days based on student headcount:
${JSON.stringify(HISTORICAL_DATA, null, 2)}

Today's live headcount is: ${currentHeadcount}.

Analyze the trends in the historical data (average consumption per student) and estimate the required kg of Rice, Atta/Roti, Dal, and Veggies for today.

IMPORTANT: You must respond ONLY with a valid JSON object. Do not include any markdown formatting, backticks, or explanatory text.
Your response MUST strictly follow this exact JSON schema:
{
  "rice": number,
  "atta": number,
  "dal": number,
  "veggies": number
}
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Low temperature for consistent math
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    
    // Parse the JSON. The model is instructed to output strict JSON.
    const parsed = JSON.parse(rawContent);
    
    return {
      rice: parsed.rice.toFixed(1),
      atta: parsed.atta.toFixed(1),
      dal: parsed.dal.toFixed(1),
      veggies: parsed.veggies.toFixed(1)
    };
  } catch (error) {
    console.error("AI Kitchen Engine Error:", error);
    // Fallback gracefully to standard math if the AI fails or rate limits
    return {
      rice: (currentHeadcount * 0.125).toFixed(1),
      atta: (currentHeadcount * 0.10).toFixed(1),
      dal: (currentHeadcount * 0.08).toFixed(1),
      veggies: (currentHeadcount * 0.15).toFixed(1)
    };
  }
}
