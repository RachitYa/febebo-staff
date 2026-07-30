// AiSchedulingEngine.js - Live API Engine for Smart Scheduling

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
export const DEFAULT_MEETING_DURATION_MINS = 60; // Assume 1 hour for meetings

/**
 * Processes user intent (schedule, query, chat) using Groq (Llama 3.1) and provides schedule context.
 */
export const processUserMessage = async (text, existingEvents) => {
  const eventsContext = existingEvents.length > 0 
    ? existingEvents.map(e => `- ${e.date} at ${e.time} in ${e.location}`).join('\n')
    : "No meetings scheduled yet.";

  const prompt = `You are a helpful AI Business & Scheduling Assistant for Febebo. 
You understand English and Hinglish perfectly. If the user speaks Hinglish (Hindi written in English), respond naturally in Hinglish. Otherwise, use English.

Current Scheduled Meetings:
${eventsContext}

User Message: "${text}"

Determine the user's intent and respond with a strictly valid JSON object.
Use this exact format:
{
  "intent": "schedule" | "query" | "chat",
  "schedule_details": { "location": "City Name", "date": "DD/MM/YYYY", "time": "12:00 PM" },
  "response": "Your conversational response here."
}
Rules:
- If intent is "schedule", include "schedule_details". If date year is missing, use 2026.
- If intent is "query", read the 'Current Scheduled Meetings' and summarize them for the user in "response".
- If intent is "chat", provide helpful business advice or a friendly response in "response".`;
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
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
        let dateStr = details.date;
        if (!dateStr || dateStr.toLowerCase().includes('null')) {
           dateStr = new Date().toLocaleDateString('en-GB');
        }
        return {
          intent: 'schedule',
          isValid: !!details.time && !!details.location,
          location: details.location || 'Unknown',
          date: dateStr,
          time: details.time
        };
    } else {
        return {
            intent: content.intent || 'chat',
            response: content.response || "I didn't quite catch that."
        };
    }
  } catch (e) {
    console.error('Groq API Error:', e);
    return { error: true, message: "Looks like my connection dropped. Please check your network and try again!" };
  }
};

/**
 * Nominatim Geocoding Cache
 */
const geocodeCache = {};

/**
 * Converts a City Name into Lat/Lon coordinates using OpenStreetMap Nominatim
 */
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
  } catch(e) {
    console.error('OSM Geocode Error:', e);
  }
  return null;
};

/**
 * Calculates travel time between two cities using OSRM Live Routing API.
 */
export const getTravelTime = async (locA, locB) => {
  if (locA.toLowerCase() === locB.toLowerCase()) return 15; // 15 mins intra-city travel
  
  const coordsA = await geocodeLocation(locA);
  const coordsB = await geocodeLocation(locB);
  
  if (!coordsA || !coordsB) return 30; // Default fallback if OSM fails

  try {
    // OSRM expects: lon,lat;lon,lat
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsA.lon},${coordsA.lat};${coordsB.lon},${coordsB.lat}?overview=false`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].duration / 60; // convert seconds to minutes
    }
  } catch(e) {
    console.error('OSRM Routing Error:', e);
  }
  return 30; // Default fallback
};


/**
 * Helper to convert a time string like "1:00 PM" into total minutes from midnight
 */
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

/**
 * Helper to convert minutes from midnight into a time string like "1:00 PM"
 */
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

/**
 * Checks for conflicts and returns a suggested alternative if one exists.
 * Now Async to wait for Live Routing calculations.
 */
export const analyzeSchedule = async (newEvent, existingEvents) => {
  const newStartMins = timeToMinutes(newEvent.time);
  const newEndMins = newStartMins + DEFAULT_MEETING_DURATION_MINS;
  
  // Filter events on the same date
  const todaysEvents = existingEvents.filter(e => e.date === newEvent.date);
  
  for (let event of todaysEvents) {
    const eventStartMins = timeToMinutes(event.time);
    const eventEndMins = eventStartMins + DEFAULT_MEETING_DURATION_MINS;
    
    // Are they overlapping at all?
    const isDirectConflict = (newStartMins >= eventStartMins && newStartMins < eventEndMins) || 
                             (newEndMins > eventStartMins && newEndMins <= eventEndMins);
                             
    if (isDirectConflict) {
      return {
        hasConflict: true,
        reason: `Direct schedule conflict with existing meeting at ${event.time}.`,
        suggestedTime: minutesToTime(eventEndMins + 30) // Suggest 30 mins after existing meeting
      };
    }

    // Is new event AFTER existing event?
    if (newStartMins >= eventEndMins) {
      const travelMins = await getTravelTime(event.location, newEvent.location);
      if (newStartMins < eventEndMins + travelMins) {
        return {
          hasConflict: true,
          reason: `Travel time from ${event.location} to ${newEvent.location} takes ~${Math.round(travelMins)} minutes via OpenStreetMap routing. You won't make it by ${newEvent.time}.`,
          suggestedTime: minutesToTime(eventEndMins + travelMins + 15) // +15 mins buffer
        };
      }
    }
    
    // Is new event BEFORE existing event?
    if (newEndMins <= eventStartMins) {
      const travelMins = await getTravelTime(newEvent.location, event.location);
      if (newEndMins + travelMins > eventStartMins) {
         return {
           hasConflict: true,
           reason: `If you end at ${minutesToTime(newEndMins)}, travel to ${event.location} takes ~${Math.round(travelMins)} minutes via OpenStreetMap routing. You will be late for your ${event.time} meeting.`,
           suggestedTime: minutesToTime(eventStartMins - travelMins - DEFAULT_MEETING_DURATION_MINS - 15)
         };
      }
    }
  }

  return { hasConflict: false };
};
