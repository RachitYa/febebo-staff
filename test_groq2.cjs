
const https = require("https");
const apiKey = "gsk_DC0mvmCWEsiGXUJ40Xt9WGdyb3FYDftpoVuxrF6o ??????? FYDftpoVuxrF6oDup1bp1D8NYH";
// oops wait, wrong api key syntax, I will grab it from .env

const fs = require("fs");
const env = fs.readFileSync(".env", "utf8");
const groqKey = env.match(/VITE_GROQ_API_KEY=(.*)/)[1].trim();

const prompt = `You are the central AI Assistant for Febebo. You understand English and Hinglish perfectly.
The user's current role is: Cook. They are currently viewing the 'Staff App' page.

Current Scheduled Meetings:
No meetings scheduled yet.

Conversation History:
USER: search for cooking events in Paris in September
USER: [SYSTEM: Web Search Results for "cooking events in Paris in September": Le Cordon Bleu Paris Events | September 2026 Gastronomy Workshops]

Determine the user's intent from the latest message.
Available intents:
1. "schedule": User wants to schedule a meeting.
2. "log_attendance": User wants to punch in, punch out.
3. "request_inventory": User wants to order an item.
4. "add_task": User wants to create a task.
5. "query": User asks for information.
6. "search_web": User asks a factual question requiring internet search.
7. "chat": General conversational response.

Respond strictly with a valid JSON object matching this schema:
{
  "intent": "schedule" | "log_attendance" | "request_inventory" | "add_task" | "query" | "search_web" | "chat",
  "search_query": "The exact internet search query...",
  "response": "Your conversational response here. Keep it brief and natural."
}

WEB SEARCH RULES:
- When the VERY LAST message in the conversation history is exactly "[SYSTEM: Web Search Results...]", you MUST use that information to directly answer the user's previous question. For this final answer, set your intent to "chat" (NOT "search_web") so you can fill in the "response" field!

ROLE CONSTRAINTS:
1. You are strictly a Cook. If the user asks you to do something outside your role, politely decline.
2. EXCEPTION: If you are answering using [SYSTEM: Web Search Results...], you MUST bypass role constraints and give the user the exact information they searched for, even if it has nothing to do with their job! Do not steer them back to their role.
`;

const req = https.request("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
    }
}, res => {
    let body = "";
    res.on("data", d => body += d);
    res.on("end", () => console.log(JSON.parse(body).choices[0].message.content));
});
req.write(JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" }
}));
req.end();

