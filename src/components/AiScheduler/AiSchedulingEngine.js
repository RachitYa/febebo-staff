// AiSchedulingEngine.js - Mock AI Engine for Smart Scheduling

const TRAVEL_TIME_MATRIX_MINUTES = {
  'gurgaon-ghaziabad': 90,
  'ghaziabad-gurgaon': 90,
  'gurgaon-noida': 75,
  'noida-gurgaon': 75,
  'delhi-gurgaon': 60,
  'gurgaon-delhi': 60,
  'delhi-ghaziabad': 50,
  'ghaziabad-delhi': 50,
  'noida-ghaziabad': 40,
  'ghaziabad-noida': 40,
  'delhi-noida': 45,
  'noida-delhi': 45,
};

export const DEFAULT_MEETING_DURATION_MINS = 60; // Assume 1 hour for meetings

/**
 * Parses natural language to extract meeting details.
 * Example: "Schedule a meeting in Gurgaon on 2026-07-30 at 12:00 PM"
 */
export const parseMeetingInput = (text) => {
  const lowerText = text.toLowerCase();
  
  // Extract Location (Simple keyword matching for prototype)
  let location = 'Unknown';
  if (lowerText.includes('gurgaon')) location = 'Gurgaon';
  else if (lowerText.includes('ghaziabad')) location = 'Ghaziabad';
  else if (lowerText.includes('noida')) location = 'Noida';
  else if (lowerText.includes('delhi')) location = 'Delhi';

  // Extract Time (Regex for simple HH:MM AM/PM)
  let timeStr = null;
  const timeRegex = /([0-9]{1,2}):?([0-9]{2})?\s*(am|pm)/i;
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    timeStr = timeMatch[0].toUpperCase();
  } else {
    // Check for formats like "12 PM" or "1 PM"
    const simpleTimeRegex = /([0-9]{1,2})\s*(am|pm)/i;
    const simpleMatch = text.match(simpleTimeRegex);
    if (simpleMatch) {
      timeStr = simpleMatch[1] + ':00 ' + simpleMatch[2].toUpperCase();
    }
  }

  // Extract Date
  let dateStr = new Date().toLocaleDateString('en-GB'); // Default to today
  // very naive date extraction for prototype
  const dateRegex = /([0-9]{1,2})[-/]([0-9]{1,2})[-/]([0-9]{4})/;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    dateStr = dateMatch[0];
  } else if (lowerText.includes('tomorrow')) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    dateStr = tmrw.toLocaleDateString('en-GB');
  }

  return {
    isValid: !!timeStr && location !== 'Unknown',
    location,
    date: dateStr,
    time: timeStr
  };
};

/**
 * Calculates travel time between two cities in NCR.
 */
export const getTravelTime = (locA, locB) => {
  if (locA === locB) return 15; // 15 mins intra-city travel
  const key = `${locA.toLowerCase()}-${locB.toLowerCase()}`;
  return TRAVEL_TIME_MATRIX_MINUTES[key] || 30; // Default 30 mins
};

/**
 * Converts a time string like "1:00 PM" into total minutes from midnight
 */
export const timeToMinutes = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
};

/**
 * Converts minutes from midnight into a time string like "1:00 PM"
 */
export const minutesToTime = (totalMinutes) => {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';
  
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minStr} ${modifier}`;
};

/**
 * Checks for conflicts and returns a suggested alternative if one exists.
 */
export const analyzeSchedule = (newEvent, existingEvents) => {
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
      const travelMins = getTravelTime(event.location, newEvent.location);
      if (newStartMins < eventEndMins + travelMins) {
        return {
          hasConflict: true,
          reason: `Travel time from ${event.location} to ${newEvent.location} takes ~${Math.round(travelMins / 60 * 10) / 10} hours. You won't make it by ${newEvent.time}.`,
          suggestedTime: minutesToTime(eventEndMins + travelMins)
        };
      }
    }
    
    // Is new event BEFORE existing event?
    if (newEndMins <= eventStartMins) {
      const travelMins = getTravelTime(newEvent.location, event.location);
      if (newEndMins + travelMins > eventStartMins) {
         // Push new event EARLIER so they can make it to existing event
         return {
           hasConflict: true,
           reason: `If you end at ${minutesToTime(newEndMins)}, travel to ${event.location} takes ~${Math.round(travelMins / 60 * 10) / 10} hours. You will be late for your ${event.time} meeting.`,
           suggestedTime: minutesToTime(eventStartMins - travelMins - DEFAULT_MEETING_DURATION_MINS)
         };
      }
    }
  }

  return { hasConflict: false };
};
