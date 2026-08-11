import { useState } from 'react';
import { MessageSquare, X, Send, Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function ChatbotFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your AgriSmart Quick Assistant. How can I help you right now?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const res = await fetch("/api/quick-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: currentInput })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: data.text || "Sorry, I couldn't process that quickly." 
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to AI." }]);
    }
    setIsTyping(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 p-4 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 hover:scale-105 transition-all z-50 flex items-center justify-center",
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-200 flex flex-col"
            style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
          >
            <div className="bg-green-700 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AgriSmart AI</h3>
                  <p className="text-[10px] text-green-100 opacity-80">Lightning fast answers (Flash Lite)</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-green-800 p-1.5 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                    msg.role === 'user' 
                      ? "bg-green-600 text-white rounded-br-none" 
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none p-3 text-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200 focus-within:border-green-500/50 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a quick question..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-slate-400 px-3"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:hover:bg-green-600 flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
