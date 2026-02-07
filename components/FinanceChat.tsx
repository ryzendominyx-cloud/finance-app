import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Transaction } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface FinanceChatProps {
  messages: ChatMessage[];
  onNewMessage: (msg: ChatMessage) => void;
  onNewTransaction: (tx: Transaction) => void;
}

const FinanceChat: React.FC<FinanceChatProps> = ({ messages, onNewMessage, onNewTransaction }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    onNewMessage(userMsg);
    setInput('');
    setIsLoading(true);

    // Prepare history for API (simplified)
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await sendMessageToGemini(userMsg.text, history);

    setIsLoading(false);

    // Add AI Response
    onNewMessage({
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: response.reply,
    });

    // Handle detected transaction
    if (response.transaction) {
      onNewTransaction({
        id: Date.now().toString(),
        amount: response.transaction.amount,
        category: response.transaction.category,
        description: response.transaction.description,
        date: new Date().toISOString(),
        type: response.transaction.type,
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-neutral-800">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-20">
            <p className="mb-2 text-2xl">🧤</p>
            <p className="text-sm">"O Equilíbrio... como tudo deve ser."</p>
            <p className="text-xs mt-2">Diga quanto gastou ou peça conselhos.</p>
            <p className="text-[10px] text-gray-700 mt-4">Ex: "Gastei 50 com Uber", "Recebi 2000 de salário"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-neutral-800 text-white rounded-tr-none' 
                  : 'bg-thanos-red/10 border border-thanos-red/20 text-gray-200 rounded-tl-none'
                }
              `}
            >
               {msg.role === 'model' && <span className="block text-xs font-bold text-thanos-red mb-1">Thanos AI</span>}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-neutral-900 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <div className="w-2 h-2 bg-thanos-red rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-thanos-red rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-thanos-red rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black border-t border-neutral-900">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-neutral-900 text-white pl-4 pr-12 py-4 rounded-xl border border-neutral-800 focus:border-thanos-red focus:outline-none transition-colors placeholder-gray-600"
            placeholder="Ex: Gastei 50 em livros..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-thanos-red hover:bg-red-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceChat;