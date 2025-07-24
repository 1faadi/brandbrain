'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Crown, Settings } from 'lucide-react';

interface BrandVariables {
  brandName: string;
  brandVoice: string;
  targetAudience: string;
  brandValues: string;
  brandPersonality: string;
  communicationStyle: string;
  keyMessages: string;
  brandPromise: string;
  competitiveDifferentiator: string;
  brandMission: string;
  preferredTone: string;
  industryFocus: string;
}

export default function BrandChat() {
  // Start with completely empty variables - no defaults
  const [brandVariables, setBrandVariables] = useState<BrandVariables>({
    brandName: '',
    brandVoice: '',
    targetAudience: '',
    brandValues: '',
    brandPersonality: '',
    communicationStyle: '',
    keyMessages: '',
    brandPromise: '',
    competitiveDifferentiator: '',
    brandMission: '',
    preferredTone: '',
    industryFocus: ''
  });

  const [isLoadingVariables, setIsLoadingVariables] = useState(true);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  } = useChat({
    api: '/api/brand',
    body: {
      brandVariables
    },
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

  // Load brand variables on component mount
  useEffect(() => {
    const loadBrandVariables = async () => {
      try {
        setIsLoadingVariables(true);
        console.log('Loading brand variables...');
        
        // Simplified - no userId needed since no auth
        const response = await fetch(`/api/brand-variables`);
        const data = await response.json();

        console.log('Loaded data:', data);

        if (data.success && data.variables && Object.keys(data.variables).length > 0) {
          console.log('Setting brand variables:', data.variables);
          setBrandVariables(data.variables);
        } else {
          console.log('No brand variables found in database');
        }
      } catch (error) {
        console.error('Error loading brand variables:', error);
      } finally {
        setIsLoadingVariables(false);
      }
    };

    loadBrandVariables();
  }, []);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  };

  // Helper to check if any brand variables are set
  const hasBrandVariables = Object.values(brandVariables).some(value => value.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      <div className="flex flex-col h-screen  mx-auto">

        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-indigo-800/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
                <Crown className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {brandVariables.brandName || 'Brand Brain Assistant'}
                </h1>
                <p className="text-indigo-300/80 text-sm">
                  {isLoadingVariables 
                    ? 'Loading brand configuration...' 
                    : 'Your strategic brand intelligence partner'
                  }
                </p>
              </div>
            </div>

            <a
              href="/brand-variables"
              className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage Brand Variables
            </a>
          </div>
        </div>

        {/* Messages */}
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
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to {brandVariables.brandName || 'Brand Brain'}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-4">
                Ask me about brand strategy, tone, messaging, slogans, or any creative direction you need guidance on.
              </p>
              
              {isLoadingVariables ? (
                <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
                  <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                  Loading your brand configuration...
                </div>
              ) : !hasBrandVariables ? (
                <div className="inline-flex items-center gap-2 text-indigo-300 text-sm bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-700/30">
                  <Settings className="w-4 h-4" />
                  <a href="/brand-variables" className="hover:underline">
                    Set up your brand variables for personalized responses
                  </a>
                </div>
              ) : (
                <div className="text-indigo-300 text-sm bg-indigo-900/20 px-4 py-2 rounded-lg border border-indigo-700/30">
                  ✅ Brand variables loaded - ready for personalized responses
                </div>
              )}
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${m.role === 'user'
                ? 'bg-indigo-600 text-white ml-12'
                : 'bg-slate-800/70 backdrop-blur-sm text-slate-100 border border-slate-700/50 mr-12'
                }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${m.role === 'user' ? 'text-indigo-100' : 'text-indigo-300'}`}>
                    {m.role === 'user' ? 'You' : (brandVariables.brandName ? `${brandVariables.brandName} AI` : 'Brand AI')}
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
                  <span className="text-xs font-medium text-indigo-300">
                    {brandVariables.brandName ? `${brandVariables.brandName} AI` : 'Brand AI'}
                  </span>
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
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                value={input}
                onChange={handleInputChange}
                placeholder={`Ask about ${brandVariables.brandName || 'your brand'} strategy, tone, messaging...`}
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
            <span>
              {hasBrandVariables 
                ? `Customized for ${brandVariables.brandName || 'your brand'}` 
                : 'Generic Brand Intelligence'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}