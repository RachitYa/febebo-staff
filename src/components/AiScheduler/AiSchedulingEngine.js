// AiSchedulingEngine.js - Live API Engine for Smart Scheduling

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
export const DEFAULT_MEETING_DURATION_MINS = 60; // Assume 1 hour for meetings

/**
 * Parses natural language to extract meeting details using Groq (Llama 3).
 * Example: "Schedule a meeting in Gurgaon on 2026-07-30 at 12:00 PM"
 */
export const parseMeetingInput = async (text) => {
  const prompt = `Extract the location, date, and time from this meeting request: "${text}". 
Return ONLY a valid JSON object with keys: "location" (string, strictly City Name only), "date" (string, DD/MM/YYYY format, assume current year 2026 if not specified, and tomorrow if mentioned), "time" (string, strict 12-hour format like '2:30 PM'). If something is missing, set it to null.`;
  
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
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });
    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    // Fallbacks if LLM fails
    let dateStr = content.date;
    if (!dateStr || dateStr.toLowerCase().includes('null')) {
       dateStr = new Date().toLocaleDateString('en-GB');
    }

    return {
      isValid: !!content.time && !!content.location,
      location: content.location || 'Unknown',
      date: dateStr,
      time: content.time
    };
  } catch (e) {
    console.error('Groq API Error:', e);
    return { isValid: false };
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
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`);
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
  let hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const modifier = hours >= 12 ? 'PM' : 'AM';
  
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minStr} ${modifier}`;
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
