import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, ChevronRight, ClipboardCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface Assessment {
  id: string;
  name: string;
  status: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

interface AssessmentListProps {
  onSelect: (assessmentId: string) => void;
}

export default function AssessmentList({ onSelect }: AssessmentListProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'assessments'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
        setAssessments(list.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'assessments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createAssessment = async () => {
    if (!newName.trim() || !auth.currentUser) return;

    try {
      const now = serverTimestamp();
      await addDoc(collection(db, 'assessments'), {
        name: newName,
        status: 'IN_PROGRESS',
        ownerId: auth.currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
      setNewName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assessments');
    }
  };

  const deleteAssessment = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'assessments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `assessments/${id}`);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading assessments...</div>;

  return (
    <div className="space-y-12">
      <div className="flex gap-4 max-w-2xl">
        <Input 
          placeholder="New system reference ID or assessment name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-white/30 transition-colors"
        />
        <Button onClick={createAssessment} className="h-12 px-8 bg-white text-black hover:bg-white/90 rounded-none uppercase tracking-widest text-[10px]">
          <Plus className="mr-2 h-3 w-3" /> Initialize_New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
        {assessments.map((assessment) => (
          <motion.div
            key={assessment.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group"
          >
            <div 
              className="bg-[#050505] p-10 cursor-pointer hover:bg-white/5 transition-colors relative h-full flex flex-col justify-between"
              onClick={() => onSelect(assessment.id)}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/30">Ref_#{assessment.id.slice(0,6).toUpperCase()}</div>
                  <Badge className={`rounded-none uppercase tracking-widest text-[9px] ${assessment.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                    {assessment.status}
                  </Badge>
                </div>
                <h3 className="text-2xl font-light text-white group-hover:text-white/90 transition-colors leading-tight">
                    {assessment.name}
                </h3>
              </div>
              
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-white/20">System_Clock</span>
                    <span className="text-xs font-mono text-white/40 uppercase">{assessment.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={(e) => deleteAssessment(e, assessment.id)} className="hover:bg-red-500/10 hover:text-red-500 text-white/20">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                        <ChevronRight className="h-4 w-4 text-white/30" />
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {assessments.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white/5 border border-white/5">
            <ClipboardCheck className="h-8 w-8 text-white/10 mx-auto mb-4" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/30">Zero_Assessments_Detected</p>
          </div>
        )}
      </div>
    </div>
  );
}

