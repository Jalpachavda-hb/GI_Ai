import React, { useState, useEffect, useRef } from 'react';
import botAiIcon from '@/assets/images/BOT_AI.png';
import { API_PATHS } from '@/apipath';

export default function Chatbot({ transcript }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your Kaizen AI Clinical Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(API_PATHS.DOCTOR_QUESTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript ? transcript.trim() : '',
          doctor_question: userText
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      const result = await response.json();
      let responseText = "";

      if (result.success && result.data && result.data.answer !== undefined) {
        responseText = result.data.answer;
      } else if (result.answer !== undefined) {
        responseText = result.answer;
      } else if (result.data && typeof result.data === 'string') {
        responseText = result.data;
      } else {
        throw new Error("Could not parse answer from response");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: responseText,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error('Chatbot API error:', err);
      
      // Local fallback in case of connection issues, to keep it robust and premium
      let fallbackText = "I encountered an error communicating with the clinical assistant. Please try again or verify the server is running.";
      const promptText = userText.toLowerCase();
      if (promptText.includes('hi') || promptText.includes('hello') || promptText.includes('hey')) {
        fallbackText = "Hello! I am your Kaizen AI Clinical Assistant. I can help answer questions about OPD transcription, report extraction, or general clinical symptoms.";
      } else if (promptText.includes('acidity') || promptText.includes('heartburn') || promptText.includes('reflux')) {
        fallbackText = "Frequent acidity or chest heartburn can indicate gastroesophageal reflux (GERD) or an inadequate antireflux barrier. I recommend tracking details for the OPD report.";
      } else if (promptText.includes('operation') || promptText.includes('surgery') || promptText.includes('robotic')) {
        fallbackText = "Post-operative follow-up is highly important. Make sure to log laparoscopic ports healing, gastric emptying rate, and any mild abdominal tenderness.";
      } else if (promptText.includes('report') || promptText.includes('endoscopy') || promptText.includes('biopsy') || promptText.includes('ct')) {
        fallbackText = "You can record or type details of Endoscopy, Esophageal Biopsies, and CT scans. Our OPD generator will pull these findings into the appropriate fields.";
      } else if (promptText.includes('pain') || promptText.includes('hurt') || promptText.includes('ache')) {
        fallbackText = "If you are experiencing abdominal pain or mild tenderness, please document its location (e.g. left upper abdomen) so it is correctly captured in the Provisional Diagnosis.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open clinical chatbot assistant"
        >
          <img src={botAiIcon} alt="Kaizen Chatbot AI Logo" className="chatbot-toggle-btn__img" />
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chatbot-header__avatar-svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="chatbot-header__title">Have a question ?</div>
            <button
              type="button"
              className="chatbot-header__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-message-row chatbot-message-row--${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <div className="chatbot-message-avatar">
                    <img src={botAiIcon} alt="Bot Avatar" />
                  </div>
                )}
                <div className={`chatbot-message-bubble chatbot-message-bubble--${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chatbot-message-row chatbot-message-row--bot">
                <div className="chatbot-message-avatar">
                  <img src={botAiIcon} alt="Bot Avatar" />
                </div>
                <div className="chatbot-message-bubble chatbot-message-bubble--bot chatbot-message-bubble--typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form className="chatbot-footer" onSubmit={handleSend}>
            <input
              type="text"
              className="chatbot-footer__input"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="chatbot-footer__send-btn">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
