import React, { useState, useRef, useEffect } from 'react';
import { DailyLog, ChatMessage } from '../types';
import { askAdvisor, HEALTH_DISCLAIMER } from '../gemini';
import { Bot, Send, X, KeyRound, Sparkles } from 'lucide-react';

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLog: DailyLog;
  apiKey: string;
  onOpenSettings: () => void;
}

const QUICK_CHIPS = [
  'Feeling a bit overwhelmed',
  'Guide me through a 2-minute breath reset',
  'How do I work with my current energy?',
  'Help me reframe my afternoon focus',
];

export const AdvisorModal: React.FC<AdvisorModalProps> = ({
  isOpen,
  onClose,
  currentLog,
  apiKey,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello. I'm your DayPulse companion. How are you holding up right now? We can reflect on your day, do a quick breathing pause, or plan your afternoon pace.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'assistant',
          text: 'Please configure your Gemini API Key in Settings to start our conversation.',
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askAdvisor(messages, text, currentLog, apiKey);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      const err = e as Error;
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: `Error: ${err.message || 'Unable to connect to Gemini'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-paper-card dark:bg-paper-darkCard w-full max-w-lg rounded-3xl border border-paper-200 dark:border-paper-darkBorder shadow-xl overflow-hidden h-[85vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-paper-200 dark:border-paper-darkBorder flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-pond-100 dark:bg-pond-950/50 text-pond-700 dark:text-pond-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm text-slate-800 dark:text-slate-100">
                Wellness Advisor
              </h2>
              <p className="font-sans text-[11px] text-slate-400">
                Calm guidance & grounding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {!apiKey && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>API Key needed for conversational advice</span>
              </div>
              <button
                onClick={onOpenSettings}
                className="font-bold underline hover:no-underline shrink-0"
              >
                Settings
              </button>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-sage-600 text-white rounded-br-xs'
                      : 'bg-paper-100 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder text-slate-800 dark:text-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-paper-100 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder rounded-2xl rounded-bl-xs px-4 py-2.5 flex items-center space-x-1.5 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-sage-600" />
                <span>Reflecting...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="px-4 py-1.5 overflow-x-auto flex space-x-1.5 border-t border-paper-200/60 dark:border-paper-darkBorder/60 scrollbar-none">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-paper-100 dark:bg-paper-dark text-slate-600 dark:text-slate-300 border border-paper-200 dark:border-paper-darkBorder hover:border-sage-400 hover:text-sage-700 dark:hover:text-sage-300 transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-paper-200 dark:border-paper-darkBorder flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a reflection or question..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-paper-50 dark:bg-paper-dark border border-paper-200 dark:border-paper-darkBorder focus:border-sage-500 focus:outline-hidden text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Health Disclaimer */}
        <div className="px-4 pb-2 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
            {HEALTH_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
};
