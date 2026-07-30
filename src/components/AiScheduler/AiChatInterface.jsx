import React, { useState, useEffect, useRef } from 'react';
import { parseMeetingInput, analyzeSchedule } from './AiSchedulingEngine';

const AiChatInterface = ({ onClose, meetings, setMeetings }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your AI Scheduling Assistant powered by Groq & Llama 3. I can help you book meetings and detect live travel conflicts. Where do you need to be?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addAiMessage = (text, options = null) => {
    setMessages(prev => [...prev, { sender: 'ai', text, options }]);
  };

  const handleSend = async (textOverride = null) => {
    const text = textOverride || inputText;
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsTyping(true);

    try {
      // 1. Process NLP with Groq API
      const parsed = await parseMeetingInput(text);
      if (!parsed || !parsed.isValid) {
        addAiMessage("I couldn't quite understand that. Please specify a location (e.g., Gurgaon, Noida) and a time (e.g., 12:00 PM).");
        setIsTyping(false);
        return;
      }

      // 2. Check conflicts using Live OpenStreetMap API
      const analysis = await analyzeSchedule(parsed, meetings);

      if (analysis.hasConflict) {
        addAiMessage(
          `⚠️ **Conflict Detected**\n\n${analysis.reason}\n\nWould you like to schedule this meeting at **${analysis.suggestedTime}** instead?`,
          {
            type: 'conflict_resolution',
            originalEvent: parsed,
            suggestedTime: analysis.suggestedTime
          }
        );
      } else {
        scheduleMeeting(parsed);
      }
    } catch (e) {
      addAiMessage("Sorry, I encountered an error connecting to the API. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const scheduleMeeting = (eventData) => {
    const newEvent = { ...eventData, id: Date.now() };
    setMeetings(prev => [...prev, newEvent]);
    addAiMessage(`✅ Successfully scheduled meeting in **${newEvent.location}** on ${newEvent.date} at ${newEvent.time}.`);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 999,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'sheetUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{
        background: '#fff', height: '85vh', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '16px 20px', background: '#0f172a', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-symbols-outlined" style={{ color: '#fde047' }}>smart_toy</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>AI Scheduler (Live)</h3>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Powered by Groq Llama 3 & OSM</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                background: msg.sender === 'user' ? '#3b82f6' : '#fff',
                color: msg.sender === 'user' ? '#fff' : '#1e293b',
                padding: '12px 16px', borderRadius: 16,
                borderBottomRightRadius: msg.sender === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.sender === 'ai' ? 4 : 16,
                maxWidth: '85%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                fontSize: 14.5, lineHeight: 1.5, whiteSpace: 'pre-wrap'
              }}>
                {msg.text.split('**').map((chunk, idx) => idx % 2 === 1 ? <strong key={idx}>{chunk}</strong> : chunk)}
              </div>
              
              {/* Interactive Options */}
              {msg.options && msg.options.type === 'conflict_resolution' && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      const updatedEvent = { ...msg.options.originalEvent, time: msg.options.suggestedTime };
                      scheduleMeeting(updatedEvent);
                      setMessages(prev => prev.map((m, mIdx) => mIdx === i ? { ...m, options: null } : m));
                    }}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(16,185,129,0.3)' }}
                  >
                    Accept Suggestion
                  </button>
                  <button 
                    onClick={() => {
                      addAiMessage("Okay, I have cancelled that request. Let me know if you need to schedule anything else.");
                      setMessages(prev => prev.map((m, mIdx) => mIdx === i ? { ...m, options: null } : m));
                    }}
                    style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                <div style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                <div style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
             </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Prefilled Buttons */}
        <div style={{ padding: '12px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
          <button 
            onClick={() => setInputText("I have a meeting in Gurgaon today at 12 PM.")}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', flexShrink: 0 }}
          >
            🗓️ Gurgaon 12 PM
          </button>
          <button 
             onClick={() => setInputText("Book me in Ghaziabad for 1:30 PM.")}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', flexShrink: 0 }}
          >
            🚗 Ghaziabad 1:30 PM
          </button>
          <button 
             onClick={() => setInputText("Need to go to Noida tomorrow at 10 AM.")}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', flexShrink: 0 }}
          >
            📍 Noida Tomorrow
          </button>
        </div>

        {/* Input Box */}
        <div style={{ padding: '16px 20px 24px', background: '#fff', display: 'flex', gap: 12 }}>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a natural request..."
            style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', padding: '14px 16px', borderRadius: 16, fontSize: 15, fontFamily: 'inherit', outline: 'none' }}
          />
          <button 
            onClick={() => handleSend()}
            style={{ width: 50, height: 50, borderRadius: 16, background: '#0f172a', color: '#fde047', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AiChatInterface;
