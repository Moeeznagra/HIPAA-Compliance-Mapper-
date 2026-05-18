import { useState } from 'react';
import { Safeguard } from '../constants/safeguards';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Info, ChevronRight, FileSearch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface Finding {
  complianceStatus: string;
  comments?: string;
  analysis?: {
    status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
    nistMapping: string;
    gapAnalysis: string;
    recommendations: string;
    confidenceScore: number;
    lastAnalyzedText?: string;
  };
}

interface ControlAnalysisProps {
  safeguard: Safeguard;
  finding?: Finding;
  onSave: (data: any) => void;
}

export default function ControlAnalysis({ safeguard, finding, onSave }: ControlAnalysisProps) {
  const [controlText, setControlText] = useState(finding?.comments || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!controlText.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          controlText,
          safeguardId: safeguard.id,
          safeguardTitle: safeguard.title,
          safeguardDescription: safeguard.description
        })
      });
      
      const analysis = await response.json();
      
      onSave({
        comments: controlText,
        complianceStatus: analysis.status === 'COMPLIANT' ? 'COMPLIANT' : 'NON_COMPLIANT',
        analysis: {
            ...analysis,
            lastAnalyzedText: controlText
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analysis = finding?.analysis;
  const isDirty = controlText !== (analysis?.lastAnalyzedText || finding?.comments);

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 flex items-center gap-3">
            Organizational_Control_Protocol
            {isDirty && <span className="w-1 h-1 bg-white animate-pulse" />}
          </label>
          <div className="flex gap-4">
            <button 
                onClick={() => onSave({ comments: controlText })}
                disabled={!isDirty}
                className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 disabled:hover:text-white/40 transition-colors"
            >
                [ Save_State ]
            </button>
            <Button 
              size="sm" 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !controlText.trim()}
              className="bg-white text-black hover:bg-white/90 rounded-none h-10 px-6 text-[10px] uppercase tracking-widest"
            >
              {isAnalyzing ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
              {analysis ? 'Re_Initialize_Audit' : 'Authorize_AI_Audit'}
            </Button>
          </div>
        </div>
        <Textarea 
          placeholder="Declare organizational implementation measures. Include technical specifications, administrative policies, and audit frequency..."
          value={controlText}
          onChange={(e) => setControlText(e.target.value)}
          className="min-h-[250px] bg-white/5 border-white/10 text-white rounded-none focus:border-white/30 font-mono text-xs leading-relaxed p-6"
        />
      </div>

      <AnimatePresence mode="wait">
        {analysis ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="flex items-center gap-8 p-8 bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                    <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Confidence_Rating: {(analysis.confidenceScore * 100).toFixed(1)}%</span>
                </div>
              <div className="flex-shrink-0">
                {analysis.status === 'COMPLIANT' ? (
                  <div className="w-12 h-12 flex items-center justify-center border border-emerald-500/50 bg-emerald-500/10"><CheckCircle2 className="h-6 w-6 text-emerald-400" /></div>
                ) : analysis.status === 'PARTIALLY_COMPLIANT' ? (
                  <div className="w-12 h-12 flex items-center justify-center border border-amber-500/50 bg-amber-500/10"><Info className="h-6 w-6 text-amber-400" /></div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center border border-red-500/50 bg-red-500/10"><AlertCircle className="h-6 w-6 text-red-400" /></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-light tracking-tight text-white uppercase italic">Audit_Status: {analysis.status}</h3>
                </div>
                <p className="text-[10px] tracking-widest uppercase text-white/30 mt-1 font-mono">Reference Strategy: NIST SP 800-66 R2</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                    <FileSearch className="h-3 w-3" /> NIST_Mapping_Diagnostics
                  </h4>
                  <div className="p-8 bg-white/[0.02] border border-white/5 text-sm font-light leading-relaxed text-white/60">
                    <div className="prose prose-invert prose-sm max-w-none prose-white">
                      <ReactMarkdown>
                        {analysis.nistMapping}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                    <AlertCircle className="h-3 w-3" /> Structural_Gap_Analysis
                  </h4>
                  <div className="text-base font-light leading-relaxed text-white/70 italic p-2">
                    <div className="prose prose-invert prose-white max-w-none">
                      <ReactMarkdown>
                        {analysis.gapAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                  <Sparkles className="h-3 w-3" /> Remediation_Path
                </h4>
                <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 text-xs font-mono leading-loose text-indigo-200/70">
                  <div className="prose prose-invert prose-indigo prose-xs max-w-none">
                    <ReactMarkdown>
                      {analysis.recommendations}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border border-white/5 bg-white/[0.01] text-white/20">
            <Sparkles className="h-8 w-8 mb-6 opacity-20 animate-pulse" />
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold">Awaiting_Security_Input</h3>
            <p className="text-[9px] mt-2 opacity-50 uppercase tracking-widest text-center max-w-xs leading-relaxed">
                Diagnostics will initialize upon submission of organizational control data.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

