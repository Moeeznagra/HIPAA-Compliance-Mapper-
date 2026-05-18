import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ShieldCheck, LogOut, Layout, ClipboardList, ShieldAlert, GitBranch } from 'lucide-react';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import AssessmentList from './components/AssessmentList';
import AssessmentView from './components/AssessmentView';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center space-y-4">
          <ShieldCheck className="h-12 w-12 text-white mx-auto animate-pulse" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">Initializing_System</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050505] p-4 font-sans">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg space-y-12"
        >
          <div className="space-y-6 text-center">
            <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 text-[10px] tracking-widest uppercase text-white/60 mb-4">
              Access Protocol Required
            </div>
            <h1 className="text-6xl font-heading italic text-white leading-tight">
              SafeGuard <span className="text-white/20">/</span> Compliance
            </h1>
            <p className="text-white/40 font-light tracking-wide max-w-sm mx-auto leading-relaxed">
              Automated HIPAA Security Rule mapping and NIST alignment for enterprise infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
            <div className="p-6 bg-[#050505]">
                <ShieldAlert className="h-4 w-4 text-white/40 mb-3" />
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Module</div>
                <div className="text-xs font-medium text-white/80 tracking-tight">HIPAA 164.306</div>
            </div>
            <div className="p-6 bg-[#050505]">
                <GitBranch className="h-4 w-4 text-white/40 mb-3" />
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Intelligence</div>
                <div className="text-xs font-medium text-white/80 tracking-tight">AI Gap Analysis</div>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
                className="w-full h-14 text-[11px] uppercase tracking-[0.2em] bg-white text-black hover:bg-white/90" 
                onClick={signInWithGoogle}
            >
              Initialize Authorization
            </Button>
            <div className="text-center">
                <span className="text-[9px] tracking-widest text-white/20 uppercase">System Stable v2.0.4</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans flex flex-col overflow-hidden">
      {/* Header Navigation */}
      <nav className="h-20 border-b border-white/10 flex items-center justify-between px-10 flex-shrink-0">
        <div className="flex items-center gap-12">
          <span 
            className="text-xl tracking-[0.2em] font-light text-white cursor-pointer"
            onClick={() => setSelectedAssessmentId(null)}
          >
            SAFEGUARD.OS
          </span>
          <div className="hidden md:flex gap-8">
            <a href="#" className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white" onClick={() => setSelectedAssessmentId(null)}>Dashboard</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-white">Assessments</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white">Audit Logs</a>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-tighter text-white/30">Auth_Session</span>
            <span className="text-[11px] font-mono text-emerald-400 uppercase">{user.displayName?.replace(' ', '_')}</span>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <button 
            onClick={logout}
            className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4 text-white/40" />
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Utility Rail */}
        <aside className="w-20 border-r border-white/10 flex flex-col items-center py-10 justify-between flex-shrink-0">
          <div className="space-y-10 flex flex-col items-center">
            <div className="w-1 h-1 bg-white"></div>
            <div className={`w-5 h-[2px] transition-colors ${!selectedAssessmentId ? 'bg-white' : 'bg-white/20'}`}></div>
            <div className={`w-5 h-[2px] transition-colors ${selectedAssessmentId ? 'bg-white' : 'bg-white/20'}`}></div>
            <div className="w-5 h-[2px] bg-white/20"></div>
          </div>
          <div className="text-[9px] [writing-mode:vertical-rl] rotate-180 uppercase tracking-[0.4em] text-white/20 font-mono">
            REF: H-0308-A
          </div>
        </aside>

        {/* Main Stage */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-16 max-w-6xl">
              <AnimatePresence mode="wait">
                {!selectedAssessmentId ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-16"
                  >
                    <header>
                        <div className="flex items-center gap-4 mb-4 text-white/40 uppercase tracking-[0.2em] text-[10px]">
                            <span className="bg-white/10 px-2 py-1">Module 01</span>
                            <span>/</span>
                            <span>Infrastructure Overview</span>
                        </div>
                        <h1 className="text-7xl font-heading italic text-white mb-6">
                            Assessments <span className="text-white/20">&</span> Monitoring
                        </h1>
                        <p className="max-w-xl text-white/50 leading-relaxed font-light text-lg">
                            Monitor and manage organizational safeguards against the HIPAA security framework.
                        </p>
                    </header>
                    <AssessmentList onSelect={setSelectedAssessmentId} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <AssessmentView 
                      assessmentId={selectedAssessmentId} 
                      onBack={() => setSelectedAssessmentId(null)} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

