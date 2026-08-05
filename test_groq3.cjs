
const fs = require("fs");
const https = require("https");
const groqKey = fs.readFileSync(".env", "utf8").match(/VITE_GROQ_API_KEY=(.*)/)[1].trim();

const prompt = `You are the central AI Assistant for Febebo.
The user's current role is: Cook.

Conversation History:
USER: search for cooking events in Paris in September

Determine the user's intent from the latest message.
Available intents:
... 6. "search_web": User asks a factual question requiring internet search ...

WEB SEARCH RULES:
- If the user asks a new question that requires internet search, you MUST set intent to "search_web" and leave "response" blank.

ROLE CONSTRAINTS:
1. You are strictly a Cook. If the user asks you to do something outside your role, politely decline.
`;

const req = https.request("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" }
}, res => {
    let body = ""; res.on("data", d => body += d); res.on("end", () => console.log(JSON.parse(body).choices[0].message.content));
});
req.write(JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.2, response_format: { type: "json_object" } }));
req.end();

