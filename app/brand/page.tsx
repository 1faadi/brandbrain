'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';
import { Send, Sparkles, Crown } from 'lucide-react';

export default function BrandChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/brand',
    onResponse: (response) => {
      console.log('Response received:', response);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: (message) => {
      console.log('Message finished:', message);
    }
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with input:', input);
    console.log('Current messages:', messages);
    handleSubmit(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      <div className="flex flex-col h-screen  mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-indigo-800/30 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
              <Crown className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Brand Brain Assistant</h1>
              <p className="text-indigo-300/80 text-sm">Your strategic brand intelligence partner</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-xl">
              <strong>Error:</strong> {error.message}
            </div>
          )}
          
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-full border border-indigo-500/30 mb-4">
                <Sparkles className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to Brand Brain</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                Ask me about brand strategy, tone, messaging, slogans, or any creative direction you need guidance on.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white ml-12' 
                  : 'bg-slate-800/70 backdrop-blur-sm text-slate-100 border border-slate-700/50 mr-12'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${
                    m.role === 'user' ? 'text-indigo-100' : 'text-indigo-300'
                  }`}>
                    {m.role === 'user' ? 'You' : 'Brand AI'}
                  </span>
                </div>
                <div className="text-sm leading-relaxed">
                  {m.content || <span className="text-slate-400 italic">No response received</span>}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-5 py-3 mr-12">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-indigo-300">Brand AI</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-slate-400 ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={ref} />
        </div>

        {/* Input Form */}
        <div className="p-6 bg-slate-800/30 backdrop-blur-sm border-t border-indigo-800/30">
          <div className="flex gap-3" onSubmit={handleFormSubmit}>
            <div className="flex-1 relative">
              <input
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about brand tone, slogan, messaging, strategy..."
                disabled={isLoading}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e as any);
                  }
                }}
              />
            </div>
            <button 
              type="button"
              onClick={handleFormSubmit}
              disabled={isLoading || !input.trim()} 
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
            <span>Powered by AI</span>
            <span>•</span>
            <span>Strategic Brand Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}