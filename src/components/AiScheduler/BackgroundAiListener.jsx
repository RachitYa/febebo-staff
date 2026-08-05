/**
 * BackgroundAiListener.jsx
 * 
 * A headless, always-on AI listener that sits in the background.
 * It stays in "sleep" mode until it hears a wake phrase like "Hi AI" or "Hello AI".
 * On wake, it listens for a command, sends it to Groq, and speaks the response
 * via the free cloud TTS — all without opening the chat UI.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { processUserMessage } from './AiSchedulingEngine';
import { speakWithCloud, stopAllSpeech } from '../../utils/ttsEngine';

// Wake phrases (case-insensitive match)
const WAKE_PHRASES = ['hello agent'];

// Clean transcript by removing punctuation
const cleanText = (t) => t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

const isWakeWord = (transcript) => {
  const lower = cleanText(transcript);
  return WAKE_PHRASES.some(wp => lower.includes(wp));
};

// Remove wake phrase from the transcript to extract the command
const extractCommand = (transcript) => {
  let text = cleanText(transcript);
  for (const wp of WAKE_PHRASES) {
    text = text.replace(wp, '');
  }
  return text.trim();
};

const BackgroundAiListener = ({
  staffRole,
  currentView,
  roleContext,
  screenContext,
  myInventory,
  salary,
  tasks,
  chats,
  performance,
  onAiItemRequest,
  onAiInventoryUpdate
}) => {
  const [state, setState] = useState('sleeping'); // sleeping | listening | thinking | speaking
  const [statusText, setStatusText] = useState('');
  const recognitionRef = useRef(null);
  const ttsRef = useRef(null);
  const conversationRef = useRef([]);
  const stateRef = useRef({ staffRole, currentView, roleContext, screenContext, myInventory, salary, tasks, chats, performance });
  const internalStateRef = useRef('sleeping'); // To safely read/write inside the recognition loop

  // Keep stateRef fresh
  useEffect(() => {
    stateRef.current = { staffRole, currentView, roleContext, screenContext, myInventory, salary, tasks, chats, performance };
  }, [staffRole, currentView, roleContext, screenContext, myInventory, salary, tasks, chats, performance]);

  const [lastTranscript, setLastTranscript] = useState('');

  const speak = useCallback((text, onDone) => {
    // Crucial: Stop microphone while speaking so Chrome doesn't permanently mute the stream or hear itself
    try { recognitionRef.current?.abort(); } catch (_) {}

    if (ttsRef.current) ttsRef.current.stop();
    internalStateRef.current = 'speaking';
    setState('speaking');
    setStatusText('Speaking...');
    ttsRef.current = speakWithCloud(text, {
      rate: 1.05,
      onEnd: () => {
        ttsRef.current = null;
        internalStateRef.current = 'sleeping';
        setState('sleeping');
        setStatusText('');
        // Restart microphone now that TTS is done
        setTimeout(() => {
          try { recognitionRef.current?.start(); } catch (_) {}
        }, 100);
        if (onDone) onDone();
      }
    });
  }, []);

  const handleCommand = useCallback(async (command) => {
    if (!command) {
      speak("Yes, I'm here. How can I help you?");
      return;
    }
    internalStateRef.current = 'thinking';
    setState('thinking');
    setStatusText('Thinking...');

    const { staffRole, currentView, roleContext, screenContext, myInventory, salary, chats, performance } = stateRef.current;
    conversationRef.current.push({ sender: 'user', text: command });

    try {
      const result = await processUserMessage(conversationRef.current, {
        existingEvents: [], staffRole, currentView, myInventory, salary, menus: null, chats, performance, liveLocation: null, roleContext, screenContext,
      });

      if (result.intent === 'request_inventory') {
        if (onAiItemRequest) onAiItemRequest(result.itemName, result.qty || 'Auto');
      } else if (result.intent === 'update_inventory') {
        if (onAiInventoryUpdate) onAiInventoryUpdate(result.itemName, result.qty);
      }

      let reply = result?.response || "Sorry, I could not understand that.";

      // Background Web Search
      if (result.intent === 'search_web' && (result.search_query || result.query)) {
        const queryStr = result.search_query || result.query;
        setStatusText(`Searching web for ${queryStr}...`);
        try {
          const { performWebSearch } = await import('../../utils/webSearch');
          const summary = await performWebSearch(queryStr);
          
          conversationRef.current.push({ sender: 'user', text: `[SYSTEM: Web Search Results for "${queryStr}": ${summary}]` });
          
          const secondResult = await processUserMessage(conversationRef.current, {
            existingEvents: [], staffRole, currentView, myInventory, salary, menus: null, chats, performance, liveLocation: null, roleContext, screenContext,
          });
          reply = secondResult?.response || "I found the info, but had trouble reading it.";
        } catch (e) {
          reply = "I couldn't connect to the web search.";
        }
      }

      conversationRef.current.push({ sender: 'ai', text: reply });
      speak(reply);
    } catch (e) {
      console.error('[BackgroundAI] error:', e);
      speak("Sorry, I had a connection issue. Please try again.");
    }
  }, [speak, onAiItemRequest]);

  // Start the continuous wake-word listener
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // Set to true to show live text
    recognition.lang = 'en-IN';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalStr += event.results[i][0].transcript;
        else interimStr += event.results[i][0].transcript;
      }

      if (internalStateRef.current === 'listening') {
        if (interimStr || finalStr) setLastTranscript(interimStr || finalStr);
      } else if (internalStateRef.current === 'sleeping') {
        setLastTranscript(''); // Hide transcript in sleep mode
      }

      // Ignore speech if we are talking or thinking
      if (internalStateRef.current === 'speaking' || internalStateRef.current === 'thinking') return;

      if (!finalStr) return; // Wait for final result to process command
      const transcript = finalStr.trim();

      if (internalStateRef.current === 'sleeping') {
        if (isWakeWord(transcript)) {
          internalStateRef.current = 'listening';
          setState('listening');
          setStatusText('Listening...');
          
          const inlineCommand = extractCommand(transcript);
          if (inlineCommand.length > 3) {
            handleCommand(inlineCommand);
          } else {
            speak("Yes?", () => {
              internalStateRef.current = 'listening';
              setState('listening');
              setStatusText('Listening...');
            });
          }
        }
      } else if (internalStateRef.current === 'listening') {
        handleCommand(transcript);
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      console.warn('[BackgroundAI] recognition error:', e.error);
    };

    recognition.onend = () => {
      // Do not auto-restart if we are actively speaking, because Chrome will permanently mute the mic 
      // if it starts while audio is playing. The speak() function will manually restart it when done.
      if (internalStateRef.current === 'speaking') return;

      setTimeout(() => {
        try { recognition.start(); } catch (_) {}
      }, 300);
    };

    try { recognition.start(); } catch (e) {}

    return () => {
      try { recognition.abort(); } catch (_) {}
    };
  }, []); // eslint-disable-line


  // Show a small floating indicator pill when active
  const stateConfig = {
    sleeping:  { bg: 'rgba(0,0,0,0.1)', icon: 'mic', pulse: false, label: 'Click to wake or say "Hello Agent"', color: '#64748b' },
    listening: { bg: '#22c55e', icon: 'mic', pulse: true, label: 'Listening...', color: '#fff' },
    thinking:  { bg: '#f59e0b', icon: 'smart_toy', pulse: false, label: 'Thinking...', color: '#fff' },
    speaking:  { bg: '#3b82f6', icon: 'volume_up', pulse: false, label: 'Speaking...', color: '#fff' },
  };
  const cfg = stateConfig[state] || stateConfig.sleeping;

  const handleManualWake = () => {
    internalStateRef.current = 'listening';
    setState('listening');
    speak("Yes, I'm listening.", () => {
      internalStateRef.current = 'listening';
      setState('listening');
    });
  };

  if (state === 'sleeping') {
    return (
      <div 
        onClick={handleManualWake}
        style={{ cursor: 'pointer', position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', padding: '6px 14px', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1d4ed8'; e.currentTarget.style.border = '1px solid #bfdbfe'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.border = '1px solid rgba(0,0,0,0.05)'; }}
      >
        <div style={{width: 6, height: 6, borderRadius: '50%', background: '#22c55e'}} />
        {cfg.label}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      userSelect: 'none',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: cfg.bg,
        borderRadius: 999,
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        color: cfg.color,
        fontSize: 13,
        fontWeight: 800,
        fontFamily: 'inherit',
        animation: cfg.pulse ? 'aiPilPulse 1.4s infinite ease-in-out' : 'none',
      }}>
        <style>{`
          @keyframes aiPilPulse {
            0%, 100% { box-shadow: 0 0 0 0 ${cfg.bg}80; }
            50% { box-shadow: 0 0 0 12px ${cfg.bg}00; }
          }
        `}</style>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{cfg.icon}</span>
        {cfg.label}
        {/* Tap to dismiss / cancel */}
        <button
          onClick={() => {
            if (ttsRef.current) { ttsRef.current.stop(); ttsRef.current = null; }
            stopAllSpeech();
            internalStateRef.current = 'sleeping';
            setState('sleeping');
            setStatusText('');
          }}
          style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4, padding: 0 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>close</span>
        </button>
      </div>

      {/* Show live transcript if listening */}
      {lastTranscript && state === 'listening' && (
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 12,
          fontSize: 12,
          maxWidth: 300,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          "{lastTranscript}"
        </div>
      )}
    </div>
  );
};

export default BackgroundAiListener;
