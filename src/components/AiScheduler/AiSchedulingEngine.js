import recipeData from '../../data/recipes.json';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
export const DEFAULT_MEETING_DURATION_MINS = 60; // Assume 1 hour for meetings

/**
 * Processes user intent (schedule, log_attendance, request_inventory, add_task, query, search_web, chat) using Groq (Llama 3.3).
 */
export const processUserMessage = async (conversationHistory, contextData) => {
  const { existingEvents, staffRole, currentView } = contextData;
  const eventsContext = existingEvents.length > 0 
    ? existingEvents.map(e => `- ${e.date} at ${e.time} in ${e.location}`).join('\n')
    : "No meetings scheduled yet.";

  // Build string of previous messages (limit to last 12 for context window)
  const historyContext = conversationHistory.slice(-12).map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

  // Inject RAG context for Cook
  let recipeContext = "";
  if (staffRole === 'Cook') {
    recipeContext = `
HOSTEL RECIPE BOOK:
The following are the exact standardized recipes from the Febebo Recipe Book. You MUST use these exact ingredients and instructions if asked. Do NOT make up your own recipes if one exists below.
---
${JSON.stringify(recipeData, null, 2)}
---
`;
  }

  const prompt = `You are the central AI Assistant for Febebo. You understand English and Hinglish perfectly.
The user's current role is: ${staffRole}. They are currently viewing the '${currentView}' page.

${recipeContext}

Current Scheduled Meetings:
${eventsContext}

Conversation History:
${historyContext}

Determine the user's intent from the latest message.
Available intents:
1. "schedule": User wants to schedule a meeting. Requires 'time' and 'location'.
2. "log_attendance": User wants to punch in, punch out, or mark attendance.
3. "request_inventory": User wants to order or request an item (e.g., rice, safety gear, tools). Requires 'item_name' and 'quantity' (number).
4. "add_task": User wants to create or assign a task. Requires 'task_title' and 'priority' (High, Medium, Low).
5. "query": User asks for information about their schedule, app, or job.
6. "search_web": User asks a factual question requiring internet search (e.g., "latest news", "chicken curry recipe", "events").
7. "chat": General conversational response.

Respond strictly with a valid JSON object matching this schema:
{
  "intent": "schedule" | "log_attendance" | "request_inventory" | "add_task" | "query" | "search_web" | "chat",
  "schedule_details": { "location": string|null, "date": string|null, "time": string|null },
  "inventory_details": { "item_name": string|null, "quantity": number|null },
  "task_details": { "task_title": string|null, "priority": string|null },
  "search_query": "The exact internet search query to search for (e.g., 'latest news India', 'best chicken curry recipe'). Only use this if intent is search_web.",
  "response": "Your conversational response here. Keep it brief and natural. If intent is search_web, leave this as an empty string \"\" as you will respond after the search."
}

WEB SEARCH RULES:
- When the VERY LAST message in the conversation history is exactly "[SYSTEM: Web Search Results...]", you MUST use that information to directly answer the user's previous question. For this final answer, set your intent to "chat" (NOT "search_web") so you can fill in the "response" field!
- If the user asks a new question that requires internet search, you MUST set intent to "search_web" and leave "response" blank.
- If the search result says "No detailed summary found", apologize and tell the user you couldn't find the answer on the web. Do not change the subject.

ROLE CONSTRAINTS:
1. You are strictly a ${staffRole}. If the user asks you to do something outside your role, politely decline.
2. ABSOLUTE EXCEPTION FOR WEB SEARCHES: If the user asks you to search for something, OR if you are answering using Web Search Results, YOU MUST NEVER REFUSE. You must always bypass your role constraint and provide the exact information requested, even if it is completely unrelated to your job! Do not steer them back to your role.

CONSULTATIVE CHEF RULE (IF ROLE IS COOK):
- If the user asks for a recipe that is NOT in the HOSTEL RECIPE BOOK, do NOT guess the portion size. 
- You MUST first set intent to "chat" and ask the user how many grams of the main ingredient they usually serve per person, or any other clarifying questions (e.g. dry or gravy). Only calculate the bulk math AFTER they reply.

JSON Rules:
- If intent is schedule, but time/location is missing, set intent to "chat" and ask for them.
- If intent is request_inventory, but item or quantity is missing, set intent to "chat" and ask for them.
- If intent is add_task, but title is missing, set intent to "chat" and ask for it.
- Never output markdown around the JSON block. Output raw JSON only.`;
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    if (content.intent === 'schedule') {
        const details = content.schedule_details || {};
        const isComplete = !!details.time && details.time !== 'null' && !!details.location && details.location !== 'null';
        if (!isComplete) {
            return { intent: 'chat', response: content.response || "Sure! I just need to know what time and which city you'll be in." };
        }
        let dateStr = details.date;
        if (!dateStr || dateStr.toLowerCase().includes('null')) {
           dateStr = new Date().toLocaleDateString('en-GB');
        }
        return { intent: 'schedule', isValid: true, location: details.location, date: dateStr, time: details.time };
    } 
    
    if (content.intent === 'request_inventory') {
        const details = content.inventory_details || {};
        if (!details.item_name || !details.quantity) {
           return { intent: 'chat', response: content.response || "What exactly would you like to order and how many?" };
        }
        return { intent: 'request_inventory', itemName: details.item_name, qty: details.quantity, response: content.response };
    }

    if (content.intent === 'add_task') {
        const details = content.task_details || {};
        if (!details.task_title) {
           return { intent: 'chat', response: content.response || "What is the task description?" };
        }
        return { intent: 'add_task', taskTitle: details.task_title, priority: details.priority || 'Medium', response: content.response };
    }

    if (content.intent === 'search_web') {
        if (!content.search_query) {
           return { intent: 'chat', response: "What exactly would you like me to search for?" };
        }
        return { intent: 'search_web', search_query: content.search_query, response: content.response };
    }

    if (content.intent === 'log_attendance') {
        return { intent: 'log_attendance', response: content.response };
    }

    return {
        intent: content.intent || 'chat',
        response: content.response || "I didn't quite catch that."
    };
  } catch (e) {
    console.error('Groq API Error:', e);
    return { error: true, message: "Looks like my connection dropped. Please check your network and try again!" };
  }
};

/**
 * Nominatim Geocoding Cache
 */
const geocodeCache = {};

export const geocodeLocation = async (locationName) => {
  const key = locationName.toLowerCase().trim();
  if (geocodeCache[key]) return geocodeCache[key];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1&countrycodes=in`);
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      geocodeCache[key] = coords;
      return coords;
    }
  } catch(e) {}
  return null;
};

export const getTravelTime = async (locA, locB) => {
  if (locA.toLowerCase() === locB.toLowerCase()) return 15;
  const coordsA = await geocodeLocation(locA);
  const coordsB = await geocodeLocation(locB);
  if (!coordsA || !coordsB) return 30;
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsA.lon},${coordsA.lat};${coordsB.lon},${coordsB.lat}?overview=false`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].duration / 60;
    }
  } catch(e) {}
  return 30;
};

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(' ');
  if (parts.length < 2) return 0;
  const time = parts[0];
  const modifier = parts[1];
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier.toUpperCase() === 'PM') hours = parseInt(hours, 10) + 12;
  return parseInt(hours, 10) * 60 + parseInt(minutes || '00', 10);
};

export const minutesToTime = (totalMinutes) => {
  let days = Math.floor(totalMinutes / (24 * 60));
  let minsInDay = Math.floor(totalMinutes % (24 * 60));
  let hours = Math.floor(minsInDay / 60);
  const minutes = Math.floor(minsInDay % 60);
  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  let res = `${hours}:${minStr} ${modifier}`;
  if (days > 0) res += ` (+${days} Day${days > 1 ? 's' : ''})`;
  return res;
};

export const analyzeSchedule = async (newEvent, existingEvents) => {
  const newStartMins = timeToMinutes(newEvent.time);
  const newEndMins = newStartMins + DEFAULT_MEETING_DURATION_MINS;
  const todaysEvents = existingEvents.filter(e => e.date === newEvent.date);
  
  for (let event of todaysEvents) {
    const eventStartMins = timeToMinutes(event.time);
    const eventEndMins = eventStartMins + DEFAULT_MEETING_DURATION_MINS;
    
    const isDirectConflict = (newStartMins >= eventStartMins && newStartMins < eventEndMins) || 
                             (newEndMins > eventStartMins && newEndMins <= eventEndMins);
                             
    if (isDirectConflict) {
      return { hasConflict: true, reason: `Direct schedule conflict with existing meeting at ${event.time}.`, suggestedTime: minutesToTime(eventEndMins + 30) };
    }
    if (newStartMins >= eventEndMins) {
      const travelMins = await getTravelTime(event.location, newEvent.location);
      if (newStartMins < eventEndMins + travelMins) {
        return { hasConflict: true, reason: `Travel time from ${event.location} to ${newEvent.location} takes ~${Math.round(travelMins)} minutes via OpenStreetMap routing. You won't make it by ${newEvent.time}.`, suggestedTime: minutesToTime(eventEndMins + travelMins + 15) };
      }
    }
    if (newEndMins <= eventStartMins) {
      const travelMins = await getTravelTime(newEvent.location, event.location);
      if (newEndMins + travelMins > eventStartMins) {
         return { hasConflict: true, reason: `If you end at ${minutesToTime(newEndMins)}, travel to ${event.location} takes ~${Math.round(travelMins)} minutes. You will be late for your ${event.time} meeting.`, suggestedTime: minutesToTime(eventStartMins - travelMins - DEFAULT_MEETING_DURATION_MINS - 15) };
      }
    }
  }
  return { hasConflict: false };
};
