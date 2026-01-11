
import React, { useState, useRef, useEffect } from 'react';
import { Message, SymptomID, DiagnosisResult } from './types';
import { SYMPTOMS, DISEASES, RULES, MED_KB } from './kb';
import { runInference } from './logicEngine';
import { extractSymptomsFromText, generateHealthAdvice } from './geminiService';
import { 
  Activity, 
  Send, 
  Stethoscope, 
  Info, 
  History, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Database,
  MessageSquare,
  FileJson,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Code
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'kb'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am MedLogic, your diagnostic assistant. How are you feeling today? You can type your symptoms or select them from the sidebar.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomID[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisResult[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') scrollToBottom();
  }, [messages, activeTab]);

  useEffect(() => {
    if (selectedSymptoms.length > 0) {
      const results = runInference(selectedSymptoms);
      setDiagnoses(results);
    } else {
      setDiagnoses([]);
    }
  }, [selectedSymptoms]);

  const toggleSymptom = (id: SymptomID) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const extracted = await extractSymptomsFromText(input);
      const newSymptoms = Array.from(new Set([...selectedSymptoms, ...extracted]));
      setSelectedSymptoms(newSymptoms);

      const results = runInference(newSymptoms);
      const advice = await generateHealthAdvice(results, newSymptoms);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: advice,
        timestamp: Date.now(),
        metadata: {
          identifiedSymptoms: extracted,
          diagnoses: results
        }
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MED_KB, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "medlogic_kb.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportToCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Conclusion,Antecedents,Exclusions,Priority\n";
    RULES.forEach(r => {
      csvContent += `${r.id},${r.conclusion},"${r.antecedents.join('|')}","${(r.exclusions || []).join('|')}",${r.priority}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medlogic_rules.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">MedLogic</h1>
            <p className="text-xs text-slate-500 font-medium">Expert System v{MED_KB.version}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MessageSquare size={18} /> Chat Assistant
          </button>
          <button 
            onClick={() => setActiveTab('kb')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'kb' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Database size={18} /> Knowledge Base
          </button>
        </nav>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Symptom Predicates</h2>
            <div className="space-y-1">
              {SYMPTOMS.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedSymptoms.includes(s.id) 
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                  {selectedSymptoms.includes(s.id) && <CheckCircle size={14} />}
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* Main View */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-800">
              {activeTab === 'chat' ? 'Diagnostic Consultation' : 'Expert System Browser'}
            </h2>
          </div>
          <div className="flex gap-2">
            {activeTab === 'kb' && (
              <>
                <button onClick={exportToJson} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors">
                  <FileJson size={14} /> JSON
                </button>
                <button onClick={exportToCsv} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors">
                  <FileSpreadsheet size={14} /> CSV
                </button>
              </>
            )}
          </div>
        </header>

        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      {msg.metadata?.identifiedSymptoms && msg.metadata.identifiedSymptoms.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                          {msg.metadata.identifiedSymptoms.map(id => (
                            <span key={id} className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono font-bold">
                              {id}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm animate-pulse flex items-center gap-2">
                       <span className="text-xs text-slate-400 font-medium">Analyzing Symptoms...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            <div className="p-6 bg-white border-t border-slate-200">
              <div className="max-w-3xl mx-auto flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="E.g., 'I have a high fever and a persistent cough'..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isProcessing}
                    className="absolute right-2 top-1.5 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
            <div className="max-w-5xl mx-auto space-y-12">
              {/* Rules Schema Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Code size={20} className="text-indigo-600" /> Reasoning Rules (Horn Clauses)
                    </h3>
                    <p className="text-sm text-slate-500">The formal logic rules powering the forward-chaining engine.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RULES.map(r => {
                    const disease = DISEASES.find(d => d.id === r.conclusion);
                    return (
                      <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">{r.id}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Priority: {r.priority}</span>
                        </div>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-1 space-y-2">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                               Antecedents
                             </div>
                             <div className="flex flex-wrap gap-1.5">
                               {r.antecedents.map(ant => (
                                 <span key={ant} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[11px] font-medium">
                                   {ant}
                                 </span>
                               ))}
                             </div>
                          </div>
                          <div className="pt-6">
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <div className="flex-1 space-y-2">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                               Conclusion
                             </div>
                             <span className="inline-block px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold">
                               {disease?.name}
                             </span>
                          </div>
                        </div>
                        {r.exclusions && r.exclusions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-50">
                             <div className="text-[10px] font-bold text-rose-400 uppercase mb-2">Negative Constraints (Exclusions)</div>
                             <div className="flex flex-wrap gap-1.5">
                               {r.exclusions.map(ex => (
                                 <span key={ex} className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[11px] font-medium italic">
                                   NOT({ex})
                                 </span>
                               ))}
                             </div>
                          </div>
                        )}
                        <p className="mt-4 text-xs text-slate-500 leading-relaxed italic">{r.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Data Schema Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" /> Symptom Predicates
                  </h3>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">ID</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Natural Label</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Synonyms</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {SYMPTOMS.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-xs font-mono font-bold text-indigo-600">{s.id}</td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-700">{s.label}</td>
                            <td className="px-4 py-3 text-[10px] text-slate-400 leading-tight italic">{s.synonyms.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-indigo-500" /> Clinical Targets
                  </h3>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Disease Name</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {DISEASES.map(d => (
                          <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-xs font-bold text-slate-700">{d.name}</td>
                            <td className="px-4 py-3 text-xs text-slate-500 leading-relaxed">{d.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Rule Trace (Only in Chat) */}
      {activeTab === 'chat' && (
        <aside className="w-96 bg-white border-l border-slate-200 overflow-y-auto hidden lg:flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Activity size={20} className="text-indigo-600" />
              Live Inference
            </div>
            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono font-bold">CHAINING</span>
          </div>

          <div className="flex-1 p-6 space-y-6">
            {diagnoses.length > 0 ? (
              diagnoses.map((d, idx) => (
                <div key={d.diseaseId} className={`rounded-xl border transition-all p-4 ${idx === 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-white'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 text-sm">{d.diseaseName}</h3>
                    <div className={`text-[10px] font-bold px-2 py-1 rounded ${d.score > 0.7 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {Math.round(d.score * 100)}% Match
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><CheckCircle size={10} /> Fact Matching</div>
                      <div className="flex flex-wrap gap-1.5">
                        {d.proof.evidence.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    {d.proof.missing.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Info size={10} /> Missing Evidence</div>
                        <div className="flex flex-wrap gap-1.5 opacity-50">
                          {d.proof.missing.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-[10px] font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] italic text-slate-500 border-t border-slate-100 pt-3">{d.explanation}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-40">
                <Database size={48} className="text-slate-200 mb-4" />
                <p className="text-xs text-slate-500 font-medium">No symptoms selected. Reasoning engine is idle.</p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
