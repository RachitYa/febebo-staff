import React, { useState, useEffect, useRef } from 'react';
import { processUserMessage, analyzeSchedule } from './AiSchedulingEngine';

const AiChatInterface = ({ 
  onClose, 
  meetings, 
  setMeetings,
  staffRole,
  currentView,
  clocked,
  setClocked,
  myInventory,
  setMyInventory,
  tasks,
  setTasks
}) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your central AI Assistant powered by Llama 3.3. I can schedule meetings, check your inventory, log attendance, or manage tasks. I also support voice mode—try speaking to me! What can I help you with today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const recognitionRef = useRef(null);
  
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Prevents it from auto-closing instantly on silence
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Works well for English + Hinglish
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          handleSend(finalTranscript);
          recognition.stop();
          setIsListening(false);
        } else {
          setInputText(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert("Microphone access is blocked! Please click the camera/mic icon in your browser's address bar to allow it.");
        } else if (event.error === 'network') {
          alert("Speech API blocked by browser! If you are using Brave, you MUST turn off 'Shields' (the lion icon) for this site, or switch to Chrome/Edge.");
        } else if (event.error === 'no-speech') {
          // Ignore no-speech, it just means silence
        } else {
          alert("Mic error: " + event.error + ". Please ensure your microphone is plugged in.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []); // eslint-disable-line

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInputText('');
      recognitionRef.current?.start();
      setIsListening(true);
      // Auto-enable voice output if they start talking
      setVoiceEnabled(true);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled) return;
    const synth = window.speechSynthesis;
    if (synth) {
      // Basic text cleanup for TTS
      const cleanText = text.replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      // Try to pick a female voice or default
      const voices = synth.getVoices();
      const prefVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
      if (prefVoice) utterance.voice = prefVoice;
      synth.speak(utterance);
    }
  };

  const addAiMessage = (text, options = null) => {
    setMessages(prev => [...prev, { sender: 'ai', text, options }]);
    speakText(text);
  };

  const handleSend = async (textOverride = null) => {
    const text = typeof textOverride === 'string' ? textOverride : inputText;
    if (!text.trim()) return;

    if (isListening) {
       recognitionRef.current?.stop();
       setIsListening(false);
    }

    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const conversationHistory = newMessages.map(m => ({ sender: m.sender, text: m.text }));
      const contextData = { existingEvents: meetings, staffRole, currentView };

      const result = await processUserMessage(conversationHistory, contextData);

      if (result.error) {
        addAiMessage(result.message);
        setIsTyping(false);
        return;
      }

      // Schedule Intent
      if (result.intent === 'schedule') {
        if (!result.isValid) {
          addAiMessage("I couldn't quite understand the details. Please specify a location and a time.");
          setIsTyping(false);
          return;
        }

        const analysis = await analyzeSchedule(result, meetings);
        if (analysis.hasConflict) {
          addAiMessage(
            `⚠️ **Conflict Detected**\n\n${analysis.reason}\n\nWould you like to schedule this meeting at **${analysis.suggestedTime}** instead?`,
            { type: 'conflict_resolution', originalEvent: result, suggestedTime: analysis.suggestedTime }
          );
        } else {
          scheduleMeeting(result);
        }
      } 
      // Attendance Intent
      else if (result.intent === 'log_attendance') {
        setClocked(true);
        addAiMessage(result.response || "✅ You have been successfully punched in for today!");
      }
      // Inventory Intent
      else if (result.intent === 'request_inventory') {
        const newItem = { id: Date.now().toString(), name: result.itemName, icon: 'inventory_2', qty: result.qty };
        setMyInventory(prev => [...prev, newItem]);
        addAiMessage(result.response || `✅ I have added ${result.qty} of ${result.itemName} to your inventory request.`);
      }
      // Task Intent
      else if (result.intent === 'add_task') {
        const newTask = { id: Date.now(), title: result.taskTitle, priority: result.priority, status: 'Pending', assignedTo: staffRole };
        setTasks(prev => [newTask, ...prev]);
        addAiMessage(result.response || `✅ I have assigned the task "${result.taskTitle}" (${result.priority} priority) successfully.`);
      }
      // Query or Chat
      else {
        addAiMessage(result.response);
      }
    } catch (e) {
      addAiMessage("Looks like my connection dropped. Please check your network and try again!");
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>smart_toy</span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>AI Central Assistant</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Powered by Llama 3.3</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => {
                 setVoiceEnabled(!voiceEnabled);
                 if (voiceEnabled) window.speechSynthesis.cancel(); // Stop talking if muted
              }} 
              style={{ background: 'none', border: 'none', color: voiceEnabled ? '#a855f7' : '#94a3b8', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex' }}
            >
              <span className="material-symbols-outlined">{voiceEnabled ? 'volume_up' : 'volume_off'}</span>
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20, background: '#fafafa' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', gap: 12, alignItems: 'flex-end' }}>
              {msg.sender === 'ai' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>smart_toy</span>
                </div>
              )}
              <div style={{
                background: msg.sender === 'user' ? '#6366f1' : '#fff',
                color: msg.sender === 'user' ? '#fff' : '#1e293b',
                padding: '12px 16px',
                borderRadius: 18,
                borderBottomRightRadius: msg.sender === 'user' ? 4 : 18,
                borderBottomLeftRadius: msg.sender === 'ai' ? 4 : 18,
                maxWidth: '75%',
                boxShadow: msg.sender === 'ai' ? '0 2px 8px rgba(15,23,42,0.05)' : 'none',
                border: msg.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                fontSize: 14, lineHeight: 1.5
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                {msg.options?.type === 'conflict_resolution' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => {
                      scheduleMeeting({ ...msg.options.originalEvent, time: msg.options.suggestedTime });
                    }} style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '8px 0', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                      Yes, Schedule
                    </button>
                    <button onClick={() => {
                      addAiMessage("No problem! Let me know what time you'd prefer.");
                    }} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '8px 0', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
               <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>smart_toy</span>
                </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: 18, borderBottomLeftRadius: 4, display: 'flex', gap: 4, alignItems:'center' }}>
                <span className="dot-bounce" style={{width:6, height:6, background:'#cbd5e1', borderRadius:'50%', animation:'bounce 1.4s infinite ease-in-out both'}} />
                <span className="dot-bounce" style={{width:6, height:6, background:'#cbd5e1', borderRadius:'50%', animation:'bounce 1.4s infinite ease-in-out both', animationDelay:'-0.32s'}} />
                <span className="dot-bounce" style={{width:6, height:6, background:'#cbd5e1', borderRadius:'50%', animation:'bounce 1.4s infinite ease-in-out both', animationDelay:'-0.16s'}} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: 16, background: '#fff', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#f1f5f9', borderRadius: 24, padding: '6px 6px 6px 16px', border: `1px solid ${isListening ? '#a855f7' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
            <input
              type="text"
              placeholder={isListening ? "Listening..." : "Type or speak your request..."}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#0f172a' }}
            />
            {recognitionRef.current && (
              <button 
                onClick={toggleListening}
                style={{
                   width: 40, height: 40, borderRadius: '50%', 
                   background: isListening ? '#ef4444' : '#fff', 
                   color: isListening ? '#fff' : '#64748b', 
                   border: isListening ? 'none' : '1px solid #e2e8f0',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                   boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
                   transition: 'all 0.2s'
                }}>
                <span className="material-symbols-outlined">{isListening ? 'mic_off' : 'mic'}</span>
              </button>
            )}
            <button 
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              style={{ 
                width: 40, height: 40, borderRadius: '50%', 
                background: inputText.trim() ? '#6366f1' : '#cbd5e1', 
                color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
              }}>
              <span className="material-symbols-outlined" style={{marginLeft:2}}>send</span>
            </button>
          </div>
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default AiChatInterface;
