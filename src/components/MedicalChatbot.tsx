import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Heart, Brain, Pill, Activity } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // This is correctly defined

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface MedicalChatbotProps {
  selectedLanguage: string;
}

export default function MedicalChatbot({ selectedLanguage }: MedicalChatbotProps) {
  const t = useTranslation(selectedLanguage);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI medical assistant. I can help with health questions, medicine info, and wellness tips. How can I assist?",
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // *** IMPORTANT CHANGE HERE: Use BACKEND_URL ***
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userMessage.text })
      });

      const data = await response.json();
      const reply =
        selectedLanguage === 'tamil' ? data.tamilResult :
        selectedLanguage === 'hindi' ? data.hindiResult :
        data.result;

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: reply,
        isBot: true,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble responding. Please try again shortly.",
        isBot: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    { icon: Heart, text: 'How to manage high blood pressure?', color: 'text-red-500' },
    { icon: Brain, text: 'Tips for better mental health', color: 'text-purple-500' },
    { icon: Pill, text: 'Medication side effects', color: 'text-blue-500' },
    { icon: Activity, text: 'Exercise recommendations', color: 'text-green-500' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-xl border dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="text-white animate-pulse w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Medical Assistant</h2>
            <p className="text-sm text-white/70">Available 24/7 for health guidance</p>
          </div>
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="p-6 border-b dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Questions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(q.text)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:scale-105 transition"
                >
                  <q.icon className={`w-5 h-5 ${q.color}`} />
                  <span className="text-sm">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-md px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.isBot
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-gray-800 dark:text-gray-200'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
              }`}>
                {msg.text}
                <div className="text-xs mt-1 text-right opacity-60">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 animate-pulse flex items-center justify-center">
                <Bot className="text-white w-4 h-4" />
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-6 border-t dark:border-gray-600 flex gap-3">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me about symptoms, medicines, diet..."
            className="flex-1 px-4 py-3 rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTyping ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}