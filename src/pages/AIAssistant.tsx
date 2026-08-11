import { useState } from 'react';
import { Send, Mic, Image as ImageIcon, Sparkles, Sprout, TestTube, Landmark, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { apiClient } from '../lib/apiClient';

const promptChips = [
  { icon: Sprout, label: "Identify this leaf disease" },
  { icon: TestTube, label: "Calculate NPK for Wheat" },
  { icon: Landmark, label: "Find subsidies for drip irrigation" },
];

import { PageType } from '../types';

export function AIAssistant({ onNavigate }: { onNavigate?: (page: PageType) => void }) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Welcome to the AgriSmart AI Hub. I am a specialized agricultural assistant powered by Gemini. How can I assist your farm today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const data = await apiClient.post("/api/quick-tips", {
        input: text
      });
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: data.text || "Sorry, I couldn't process that." 
      }]);
    } catch (e) {
      console.error("Chat error", e);
      setMessages(prev => [...prev, { role: 'ai', text: "An error occurred while connecting to the AI." }]);
    }
    
    setIsTyping(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
            <Sparkles className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight">AgriSmart Copilot</h2>
            <p className="text-xs text-slate-400">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-800 border-none text-xs rounded-lg px-3 py-1.5 focus:ring-0 text-slate-300">
            <option>English</option>
            <option>Hindi</option>
            <option>Punjabi</option>
          </select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
          >
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1 shrink-0">
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
            )}
            <div className={cn(
              "max-w-[75%] rounded-2xl p-4 text-sm md:text-base shadow-sm leading-relaxed whitespace-pre-wrap",
              msg.role === 'user' 
                ? "bg-green-600 text-white rounded-br-none" 
                : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 shrink-0">
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
             <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center text-slate-500">
               <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
             </div>
           </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4 px-2">
            {promptChips.map((chip, i) => (
              <button 
                key={i}
                onClick={() => handleSend(chip.label)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
              >
                <chip.icon className="w-3.5 h-3.5" /> {chip.label}
              </button>
            ))}
          </div>
        )}
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your question here..."
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 py-3 px-3 resize-none h-[48px] max-h-[120px]"
            rows={1}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:hover:bg-green-600 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
