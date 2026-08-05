import React, { useState, useEffect, useRef } from 'react';
import LZString from 'lz-string';
import { processUserMessage, analyzeSchedule } from './AiSchedulingEngine';
import { speakWithCloud, stopAllSpeech } from '../../utils/ttsEngine';

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
  setTasks,
  salary,
  menus,
  chats,
  performance,
  roleContext,
  screenContext,
  onAiItemRequest,
  onAiInventoryUpdate
}) => {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(`febebo_ai_chat_${staffRole}`);
      if (stored) {
        const decompressed = LZString.decompress(stored);
        if (decompressed) return JSON.parse(decompressed);
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
    return [
      { sender: 'ai', text: 'Hi! I am your central AI Assistant powered by Llama 3.3. I can schedule meetings, check your inventory, log attendance, or manage tasks. I also support voice mode—try speaking to me! What can I help you with today?' }
    ];
  });

  // Save compressed chat history to local storage whenever it changes
  useEffect(() => {
    try {
      const compressed = LZString.compress(JSON.stringify(messages));
      localStorage.setItem(`febebo_ai_chat_${staffRole}`, compressed);
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  }, [messages, staffRole]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const recognitionRef = useRef(null);
  const ttsControllerRef = useRef(null); // holds { stop } from speakWithCloud
  const [liveLocation, setLiveLocation] = useState(null);
  
  const chatEndRef = useRef(null);
  
  // Use a ref to hold all current state needed by handleSend (to prevent stale closures in Voice API)
  const stateRef = useRef({ messages, meetings, staffRole, currentView, myInventory, salary, menus, chats, performance, liveLocation, roleContext, screenContext });
  useEffect(() => {
    stateRef.current = { messages, meetings, staffRole, currentView, myInventory, salary, menus, chats, performance, liveLocation, roleContext, screenContext };
  }, [messages, meetings, staffRole, currentView, myInventory, salary, menus, chats, performance, liveLocation, roleContext, screenContext]);

  // Fetch Live Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.state;
          if (city) setLiveLocation(city);
        } catch(e) {}
      });
    }
  }, []);

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

  // Cloud TTS — plays AI responses using free Google Translate audio stream
  const speakText = (text, force = false, msgIndex = null) => {
    if (!voiceEnabled && !force) return;
    // Stop any currently playing audio first
    if (ttsControllerRef.current) {
      ttsControllerRef.current.stop();
      ttsControllerRef.current = null;
    }
    setIsSpeechPaused(false);

    const controller = speakWithCloud(text, {
      onStart: () => { if (msgIndex !== null) setSpeakingMsgIndex(msgIndex); },
      onEnd:   () => { setSpeakingMsgIndex(null); setIsSpeechPaused(false); ttsControllerRef.current = null; },
      rate: 1.0
    });
    ttsControllerRef.current = controller;
  };

  // Pause / resume — cloud audio doesn't support native pause, so we stop and show paused state
  const toggleSpeechPause = () => {
    if (ttsControllerRef.current) {
      ttsControllerRef.current.stop();
      ttsControllerRef.current = null;
      setSpeakingMsgIndex(null);
      setIsSpeechPaused(false);
    }
  };

  const stopSpeech = () => {
    if (ttsControllerRef.current) {
      ttsControllerRef.current.stop();
      ttsControllerRef.current = null;
    }
    stopAllSpeech(); // also cancel any Web Speech fallback
    setSpeakingMsgIndex(null);
    setIsSpeechPaused(false);
  };

  const addAiMessage = (text, options = null) => {
    setMessages(prev => {
      const newMsgs = [...prev, { sender: 'ai', text, options }];
      speakText(text, false, newMsgs.length - 1);
      return newMsgs;
    });
  };

  const handleSend = async (textOverride = null) => {
    const text = typeof textOverride === 'string' ? textOverride : inputText;
    if (!text.trim()) return;

    if (isListening) {
       recognitionRef.current?.stop();
       setIsListening(false);
    }

    const currentState = stateRef.current;
    const currentMessages = currentState.messages;
    const currentMeetings = currentState.meetings;
    const currentRole = currentState.staffRole;
    const currView = currentState.currentView;
    const currInv = currentState.myInventory;
    const currSalary = currentState.salary;
    const currMenus = currentState.menus;
    const currChats = currentState.chats;
    const currPerf = currentState.performance;
    
    const newMessages = [...currentMessages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const conversationHistory = newMessages.map(m => ({ sender: m.sender, text: m.text }));
      const contextData = { 
        existingEvents: currentMeetings, 
        staffRole: currentRole, 
        currentView: currView, 
        myInventory: currInv,
        salary: currSalary,
        menus: currMenus,
        chats: currChats,
        performance: currPerf,
        liveLocation: currentState.liveLocation,
        roleContext: currentState.roleContext,
        screenContext: currentState.screenContext

      };

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

        const analysis = await analyzeSchedule(result, currentMeetings, currentState.liveLocation);
        if (analysis.hasConflict) {
          addAiMessage(
            `⚠️ **Conflict Detected**\n\n${analysis.reason}\n\nWould you like to schedule this meeting at **${analysis.suggestedTime}** instead?`,
            { type: 'conflict_resolution', originalEvent: result, suggestedTime: analysis.suggestedTime }
          );
        } else if (analysis.isMissingLocation) {
          addAiMessage(`⚠️ **Location Required**\n\n${analysis.reason}`);
        } else if (analysis.needsTransportMode) {
          addAiMessage(`🚀 **Long Distance Trip — ${analysis.distKm} km**\n\n${analysis.reason}`);
        } else {
          scheduleMeeting(result);
        }
      }
      // Meeting Update Intent
      else if (result.intent === 'meeting_update') {
        setMeetings(prev => prev.map(m => {
          const matchesDate = !result.date || m.date === result.date;
          const matchesTime = !result.time || m.time === result.time;
          const matchesLoc = !result.location || m.location?.toLowerCase() === result.location?.toLowerCase();
          if (matchesDate && matchesTime && matchesLoc && result.notes) {
            return { ...m, notes: result.notes };
          }
          return m;
        }));
        addAiMessage(result.response || `Notes saved to your meeting.`);
      } 
      // Cancel Schedule Intent
      else if (result.intent === 'cancel_schedule') {
        const matchingMeeting = currentMeetings.find(m => 
          (!result.date || m.date === result.date) && 
          (!result.time || m.time === result.time) && 
          (!result.location || m.location.toLowerCase() === result.location.toLowerCase())
        );

        if (matchingMeeting) {
          setMeetings(prev => prev.filter(m => m.id !== matchingMeeting.id));
          addAiMessage(result.response || `✅ I have successfully canceled your meeting on ${matchingMeeting.date} at ${matchingMeeting.time}.`);
        } else {
          addAiMessage("I couldn't find a meeting matching those details to cancel.");
        }
      }
      // Attendance Intent
      else if (result.intent === 'log_attendance') {
        const isPunchIn = result.action === 'in';
        setClocked(isPunchIn);
        addAiMessage(result.response || (isPunchIn ? "✅ You have been successfully punched in for today!" : "✅ You have been successfully punched out."));
      }
      // Inventory Intent
      else if (result.intent === 'request_inventory') {
        if (onAiItemRequest) onAiItemRequest(result.itemName, result.qty || 'Auto');
        addAiMessage(result.response || `✅ I have requested ${result.qty || 'Auto'} of ${result.itemName} in Need Supplies.`);
      }
      else if (result.intent === 'update_inventory') {
        if (onAiInventoryUpdate) onAiInventoryUpdate(result.itemName, result.qty);
        addAiMessage(result.response || `✅ I have added ${result.qty} of ${result.itemName} to your live inventory.`);
      }
      // Task Intent
      else if (result.intent === 'add_task') {
        const newTask = { id: Date.now(), title: result.taskTitle, priority: result.priority, status: 'Pending', assignedTo: staffRole };
        setTasks(prev => [newTask, ...prev]);
        addAiMessage(result.response || `✅ I have assigned the task "${result.taskTitle}" (${result.priority} priority) successfully.`);
      }
      // Web Search Intent
      else if (result.intent === 'search_web' && (result.search_query || result.query)) {
        const queryStr = result.search_query || result.query;
        addAiMessage(`🔍 Searching the web for: "${queryStr}"...`);
        try {
          const { performWebSearch } = await import('../../utils/webSearch');
          const summary = await performWebSearch(queryStr);
          
          const searchContextMessage = { sender: 'user', text: `[SYSTEM: Web Search Results for "${queryStr}": ${summary}]` };
          const secondResult = await processUserMessage([...conversationHistory, searchContextMessage], {
            existingEvents: currentMeetings, staffRole, currentView, myInventory, salary, menus: null, chats, performance, liveLocation: null, roleContext, screenContext,
          });
          
          // Small delay so user sees the "Searching" message before the result pops in
          setTimeout(() => {
             addAiMessage(secondResult?.response || "I found the info, but had trouble reading it.");
          }, 500);
          return; // Skip normal addAiMessage at bottom
        } catch (e) {
          addAiMessage("I couldn't connect to the web search.");
          return;
        }
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
    const newEvent = { 
      ...eventData, 
      id: Date.now(),
      withWhom: eventData.withWhom || null,
      agenda: eventData.agenda || null,
      durationMins: eventData.durationMins || 60,
      notes: null
    };
    setMeetings(prev => [...prev, newEvent]);
    let msg = `✅ Meeting scheduled in **${newEvent.location}** on ${newEvent.date} at ${newEvent.time}`;
    if (newEvent.withWhom) msg += ` with **${newEvent.withWhom}**`;
    if (newEvent.agenda) msg += ` — *${newEvent.agenda}*`;
    if (newEvent.durationMins) msg += ` (~${newEvent.durationMins} min)`;
    msg += '.';
    addAiMessage(msg);
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
                
                {msg.sender === 'ai' && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {speakingMsgIndex === i ? (
                      <>
                        <button 
                          onClick={toggleSpeechPause} 
                          style={{
                            background: 'none', border: 'none', color: '#10b981', cursor: 'pointer',
                            padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 12, fontWeight: 700, fontFamily: 'inherit'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isSpeechPaused ? 'play_arrow' : 'pause'}</span>
                          {isSpeechPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button 
                          onClick={stopSpeech} 
                          style={{
                            background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
                            padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 12, fontWeight: 700, fontFamily: 'inherit'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>stop</span>
                          Stop
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => speakText(msg.text, true, i)} 
                        style={{
                          background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer',
                          padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                          opacity: 0.8, transition: 'opacity 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = 1}
                        onMouseOut={e => e.currentTarget.style.opacity = 0.8}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>volume_up</span>
                        Listen
                      </button>
                    )}
                  </div>
                )}

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
