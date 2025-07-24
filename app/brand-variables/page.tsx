'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Crown, Palette, Users, MessageSquare, Target, Lightbulb, Building, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface BrandVariables {
  // Basic Brand Info
  brandName: string;
  brandMission: string;
  brandValues: string;
  brandPromise: string;
  
  // Brand Voice & Personality
  brandVoice: string;
  brandPersonality: string;
  preferredTone: string;
  communicationStyle: string;
  
  // Target Audience
  targetAudience: string;
  
  // Messaging & Positioning
  keyMessages: string;
  competitiveDifferentiator: string;
  
  // Industry Context
  industryFocus: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: Array<{
    key: keyof BrandVariables;
    label: string;
    placeholder: string;
    rows?: number;
  }>;
}

export default function BrandVariablesPage() {
  const [brandVariables, setBrandVariables] = useState<BrandVariables>({
    // Basic Brand Info
    brandName: '',
    brandMission: '',
    brandValues: '',
    brandPromise: '',
    
    // Brand Voice & Personality
    brandVoice: '',
    brandPersonality: '',
    preferredTone: '',
    communicationStyle: '',
    
    // Target Audience
    targetAudience: '',
    
    // Messaging & Positioning
    keyMessages: '',
    competitiveDifferentiator: '',
    
    // Industry Context
    industryFocus: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  const sections: Section[] = [
    {
      id: 'basic',
      title: 'Basic Brand Information',
      description: 'Core foundation and identity of your brand',
      icon: <Crown className="w-5 h-5" />,
      fields: [
        { key: 'brandName', label: 'Brand Name', placeholder: 'Your brand name', rows: 1 },
        { key: 'brandMission', label: 'Mission Statement', placeholder: 'What is your brand\'s purpose and mission?', rows: 3 },
        { key: 'brandValues', label: 'Core Values', placeholder: 'What principles guide your brand? (e.g., Innovation, integrity, excellence)', rows: 3 },
        { key: 'brandPromise', label: 'Brand Promise', placeholder: 'What do you promise to deliver to customers?', rows: 2 }
      ]
    },
    {
      id: 'voice',
      title: 'Brand Voice & Personality',
      description: 'How your brand speaks and behaves',
      icon: <MessageSquare className="w-5 h-5" />,
      fields: [
        { key: 'brandVoice', label: 'Brand Voice', placeholder: 'How does your brand speak? (e.g., Professional yet friendly)', rows: 2 },
        { key: 'brandPersonality', label: 'Brand Personality', placeholder: 'Personality traits (e.g., Trustworthy, innovative, approachable)', rows: 2 },
        { key: 'preferredTone', label: 'Preferred Tone', placeholder: 'Tone for communications (e.g., Confident yet humble, informative)', rows: 2 },
        { key: 'communicationStyle', label: 'Communication Style', placeholder: 'Style of communication (e.g., Clear, concise, engaging)', rows: 2 }
      ]
    },
    {
      id: 'audience',
      title: 'Target Audience',
      description: 'Who you\'re speaking to and serving',
      icon: <Users className="w-5 h-5" />,
      fields: [
        { key: 'targetAudience', label: 'Primary Audience', placeholder: 'Who is your main target audience? (e.g., Business professionals, decision makers, age 25-45)', rows: 3 }
      ]
    },
    {
      id: 'messaging',
      title: 'Messaging & Positioning',
      description: 'Key messages and market positioning',
      icon: <Target className="w-5 h-5" />,
      fields: [
        { key: 'keyMessages', label: 'Key Messages', placeholder: 'Main messages you want to convey to your audience', rows: 3 },
        { key: 'competitiveDifferentiator', label: 'Competitive Differentiator', placeholder: 'What sets you apart from competitors?', rows: 3 }
      ]
    },
    {
      id: 'context',
      title: 'Industry & Context',
      description: 'Industry positioning and market context',
      icon: <Building className="w-5 h-5" />,
      fields: [
        { key: 'industryFocus', label: 'Industry Focus', placeholder: 'Primary industry or sector (e.g., Technology, Healthcare, Finance)', rows: 2 }
      ]
    }
  ];

  useEffect(() => {
    loadBrandVariables();
  }, []);

  const loadBrandVariables = async () => {
    try {
      setIsLoading(true);
      console.log('Loading brand variables for management...');
      
      const response = await fetch(`/api/brand-variables`);
      const data = await response.json();
      
      console.log('Management page loaded data:', data);
      
      if (data.success && data.variables && Object.keys(data.variables).length > 0) {
        console.log('Setting variables in management page:', data.variables);
        setBrandVariables(prev => ({
          ...prev,
          ...data.variables
        }));
      } else {
        console.log('No existing variables found, starting with empty form');
      }
    } catch (error) {
      console.error('Error loading brand variables:', error);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariableChange = (key: keyof BrandVariables, value: string) => {
    setBrandVariables(prev => ({
      ...prev,
      [key]: value
    }));
    setSaveStatus('idle');
  };

  const saveBrandVariables = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('idle');
      
      console.log('Saving brand variables:', brandVariables);
      
      const response = await fetch('/api/brand-variables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: brandVariables
        }),
      });

      const data = await response.json();
      console.log('Save response:', data);
      
      if (data.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        console.error('Error saving brand variables:', data.error);
      }
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving brand variables:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all brand variables? This will clear all your saved brand information and cannot be undone.')) {
      return;
    }

    try {
      setIsSaving(true);
      
      // Delete from database
      const response = await fetch(`/api/brand-variables`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('Reset response:', data);

      // Reset local state
      setBrandVariables({
        brandName: '', brandMission: '', brandValues: '', brandPromise: '',
        brandVoice: '', brandPersonality: '', preferredTone: '', communicationStyle: '',
        targetAudience: '', keyMessages: '', competitiveDifferentiator: '', industryFocus: ''
      });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      
    } catch (error) {
      setSaveStatus('error');
      console.error('Error resetting brand variables:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getCompletionStatus = (section: Section) => {
    const filledFields = section.fields.filter(field => 
      brandVariables[field.key] && brandVariables[field.key].trim() !== ''
    ).length;
    return { filled: filledFields, total: section.fields.length };
  };

  const getTotalCompletion = () => {
    const allFields = sections.reduce((acc, section) => acc + section.fields.length, 0);
    const filledFields = sections.reduce((acc, section) => {
      const { filled } = getCompletionStatus(section);
      return acc + filled;
    }, 0);
    return { filled: filledFields, total: allFields };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-indigo-300 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading brand variables...</p>
        </div>
      </div>
    );
  }

  const totalCompletion = getTotalCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900">
      <div className=" mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a 
              href="/brand"
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30">
                <Crown className="w-8 h-8 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Brand Variables Manager
                </h1>
                <p className="text-slate-400">Configure your brand intelligence settings</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-300">
                <span className="font-medium">Progress:</span> {totalCompletion.filled}/{totalCompletion.total} fields completed
              </div>
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${Math.round((totalCompletion.filled / totalCompletion.total) * 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Saved successfully
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Save failed
                </div>
              )}
              
              <button
                onClick={resetToDefaults}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-slate-300 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>
              
              <button
                onClick={saveBrandVariables}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {isSaving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const { filled, total } = getCompletionStatus(section);
            const isExpanded = expandedSections.has(section.id);
            const completionPercentage = Math.round((filled / total) * 100);

            return (
              <div key={section.id} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
                
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 text-left hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30 text-indigo-300">
                        {section.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                        <p className="text-slate-400 text-sm">{section.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{filled}/{total}</div>
                        <div className="text-xs text-slate-400">{completionPercentage}% complete</div>
                      </div>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-700/50">
                    <div className="grid gap-6 mt-6">
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-indigo-200 mb-2">
                            {field.label}
                            {brandVariables[field.key] && brandVariables[field.key].trim() !== '' && (
                              <CheckCircle className="w-4 h-4 text-green-400 inline ml-2" />
                            )}
                          </label>
                          <textarea
                            value={brandVariables[field.key]}
                            onChange={(e) => handleVariableChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={field.rows || 2}
                            className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm mb-4">
            These variables will be used to provide personalized, brand-consistent responses in your chat conversations.
          </p>
          <a 
            href="/brand" 
            className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Brand Chat
          </a>
        </div>
      </div>
    </div>
  );
}