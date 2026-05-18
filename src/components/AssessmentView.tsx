import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { HIPAA_SAFEGUARDS, Safeguard } from '../constants/safeguards';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import ControlAnalysis from './ControlAnalysis';

interface Finding {
  id: string;
  safeguardId: string;
  complianceStatus: string;
  comments?: string;
  mappedControls?: string[];
  analysis?: any;
}

interface AssessmentViewProps {
  assessmentId: string;
  onBack: () => void;
}

export default function AssessmentView({ assessmentId, onBack }: AssessmentViewProps) {
  const [findings, setFindings] = useState<Record<string, Finding>>({});
  const [selectedSafeguard, setSelectedSafeguard] = useState<Safeguard>(HIPAA_SAFEGUARDS[0]);
  const [assessmentName, setAssessmentName] = useState('');

  useEffect(() => {
    // Fetch Assessment Name
    const unsubAssessment = onSnapshot(doc(db, 'assessments', assessmentId), (snapshot) => {
      if (snapshot.exists()) {
        setAssessmentName(snapshot.data().name);
      }
    });

    // Fetch Findings
    const q = query(collection(db, 'assessments', assessmentId, 'findings'));
    const unsubFindings = onSnapshot(q, (snapshot) => {
      const fieldFindings: Record<string, Finding> = {};
      snapshot.docs.forEach(doc => {
        fieldFindings[doc.data().safeguardId] = { id: doc.id, ...doc.data() } as Finding;
      });
      setFindings(fieldFindings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `assessments/${assessmentId}/findings`));

    return () => {
      unsubAssessment();
      unsubFindings();
    };
  }, [assessmentId]);

  const completedCount = Object.values(findings).filter(f => f.complianceStatus === 'COMPLIANT' || f.complianceStatus === 'NON_COMPLIANT' || f.complianceStatus === 'NOT_APPLICABLE').length;
  const progress = (completedCount / HIPAA_SAFEGUARDS.length) * 100;

  const saveFinding = async (safeguardId: string, data: Partial<Finding>) => {
    try {
      const findingId = findings[safeguardId]?.id || safeguardId;
      const findingRef = doc(db, 'assessments', assessmentId, 'findings', findingId);
      
      await setDoc(findingRef, {
        ...findings[safeguardId],
        ...data,
        safeguardId,
        assessmentId,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Update assessment updatedAt
      await updateDoc(doc(db, 'assessments', assessmentId), {
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `assessments/${assessmentId}/findings`);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-white/40 uppercase tracking-[0.2em] text-[10px]">
              <span className="bg-white/10 px-2 py-0.5 border border-white/10">Ref: {assessmentId.slice(0,8)}</span>
              <span>/</span>
              <button onClick={onBack} className="hover:text-white transition-colors">Return_to_Hub</button>
          </div>
          <h2 className="text-5xl font-heading italic text-white leading-tight">{assessmentName || 'Active_Session'}</h2>
        </div>
        <div className="text-right space-y-3">
            <div className="text-[10px] uppercase font-mono tracking-widest text-white/40">
                Coverage: {completedCount} / {HIPAA_SAFEGUARDS.length}
            </div>
            <div className="h-1 w-64 bg-white/5 overflow-hidden">
                <div 
                    className="h-full bg-white/40 transition-all duration-500" 
                    style={{ width: `${progress}%` }} 
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-6">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 mb-4 px-2">Framework Safeguards</div>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-1">
              {HIPAA_SAFEGUARDS.map((s) => {
                const status = findings[s.id]?.complianceStatus;
                const isSelected = selectedSafeguard.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSafeguard(s)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-4 border-l-2 ${
                      isSelected 
                        ? 'bg-white/5 border-white text-white' 
                        : 'border-transparent hover:bg-white/[0.02] text-white/40'
                    }`}
                  >
                    <div className="mt-1">
                      {status === 'COMPLIANT' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                      {status === 'NON_COMPLIANT' && <AlertCircle className="h-3 w-3 text-red-400" />}
                      {status === 'IN_PROGRESS' && <Clock className="h-3 w-3 text-amber-400" />}
                      {!status && <div className="h-3 w-3 rounded-full border border-white/10" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[9px] uppercase font-mono tracking-tighter opacity-50 mb-1">{s.id}</div>
                      <div className="text-[11px] font-medium tracking-tight truncate">
                        {s.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        <main className="lg:col-span-3">
          <div className="space-y-8 bg-white/[0.02] border border-white/5 p-12">
            <header className="space-y-6">
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="rounded-none px-3 py-1 bg-white/5 border-white/10 text-[9px] uppercase tracking-widest text-white/60">
                        {selectedSafeguard.section}
                    </Badge>
                    <Badge className={`rounded-none px-3 py-1 text-[9px] uppercase tracking-widest ${selectedSafeguard.specificationType === 'REQUIRED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {selectedSafeguard.specificationType}
                    </Badge>
                </div>
                <div>
                    <h3 className="text-3xl font-light text-white tracking-tight mb-4">
                        {selectedSafeguard.id} <span className="text-white/20 mx-2">|</span> {selectedSafeguard.title}
                    </h3>
                    <p className="text-lg text-white/40 leading-relaxed font-light italic">
                        "{selectedSafeguard.description}"
                    </p>
                </div>
            </header>
            
            <div className="pt-8 border-t border-white/10">
                <ControlAnalysis 
                    safeguard={selectedSafeguard}
                    finding={findings[selectedSafeguard.id]}
                    onSave={(data) => saveFinding(selectedSafeguard.id, data)}
                />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

