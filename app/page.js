'use client';

import React, { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, onValue, update, push } from 'firebase/database';
import { Clock, CheckCircle2, Truck, Users, Calendar, Eye, Plus, Sun, Sparkles } from 'lucide-react';

const INITIAL_SCHEDULE = {
  Pirmadienis: [
    { id: 'p1', name: 'Vėtrungės' }, { id: 'p2', name: 'Zamenhofas' },
    { id: 'p3', name: 'Bajorai' }, { id: 'p4', name: 'Didlaukis' },
    { id: 'p5', name: 'Helsinkis' }, { id: 'p6', name: 'Kopenhagas' },
    { id: 'p7', name: 'Pakraštys' }, { id: 'p8', name: 'Ašmenėlė' }
  ],
  Antradienis: [
    { id: 'a1', name: 'Vėtrungės' }, { id: 'a2', name: 'Zamenhofas' },
    { id: 'a3', name: 'Paribys' }, { id: 'a4', name: 'Malonioji' },
    { id: 'a5', name: 'Linkmenys' }, { id: 'a6', name: 'Žvėrynas' },
    { id: 'a7', name: 'Klapėda' }, { id: 'a8', name: 'Algirdas' },
    { id: 'a9', name: 'Lietus' }, { id: 'a10', name: 'Lazdynėliai' },
    { id: 'a11', name: 'Tuskulėniai' }
  ],
  Trečiadienis: [
    { id: 't1', name: 'Vėtrungės' }, { id: 't2', name: 'Zamenhofas' },
    { id: 't3', name: 'Elbingas' }, { id: 't4', name: 'Užubaliai' },
    { id: 't5', name: 'Visoriai' }, { id: 't6', name: 'Mokykla' },
    { id: 't7', name: 'Antežeriai' }, { id: 't8', name: 'Kudirkos 3', highlight: true }
  ],
  Ketvirtadienis: [
    { id: 'k1', name: 'Vėtrungės' }, { id: 'k2', name: 'Zamenhofas' },
    { id: 'k3', name: 'Bajorai' }, { id: 'k4', name: 'Didlaukis' },
    { id: 'k5', name: 'Helsinkis' }, { id: 'k6', name: 'Kopenhagas' },
    { id: 'k7', name: 'Pakraštys' }, { id: 'k8', name: 'Ašmenėlė' },
    { id: 'k9', name: 'Vytauto g. 19, Trakai', highlight: true }
  ],
  Penktadienis: [
    { id: 'pn1', name: 'Vėtrungės' }, { id: 'pn2', name: 'Zamenhofas' },
    { id: 'pn3', name: 'Paribys' }, { id: 'pn4', name: 'Malonioji' },
    { id: 'pn5', name: 'Linkmenys' }, { id: 'pn6', name: 'Žvėrynas' },
    { id: 'pn7', name: 'Klapėda' }, { id: 'pn8', name: 'Algirdas' },
    { id: 'pn9', name: 'Lietus' }, { id: 'pn10', name: 'Lazdynėliai' },
    { id: 'pn11', name: 'Tuskulėniai' }
  ]
};

export default function Home() {
  const [role, setRole] = useState(null); 
  const [teamName, setTeamName] = useState('Grupė 1');
  const [workerNames, setWorkerNames] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [statuses, setStatuses] = useState({});
  const [logs, setLogs] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Pirmadienis');
  const [activeTab, setActiveTab] = useState('routes'); 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('lt-LT'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const statusRef = ref(database, 'statuses');
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStatuses(data);
    });

    const logsRef = ref(database, 'logs');
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedLogs = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setLogs(parsedLogs);
      }
    });
  }, []);

  const handleStartSession = (e) => {
    e.preventDefault();
    if (workerNames.trim()) {
      setRole('crew');
      setIsSessionActive(true);
    }
  };

  const handleObserverSession = () => {
    setRole('observer');
    setIsSessionActive(true);
  };

  const updateStatus = (objId, objName, day, newStatus) => {
    if (role !== 'crew') return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('lt-LT');
    const fullWorkerInfo = `${teamName} (${workerNames})`;

    const statusData = {
      status: newStatus,
      updatedAt: timeStr,
      updatedBy: fullWorkerInfo
    };

    update(ref(database, `statuses/${objId}`), statusData);

    const newLog = {
      timestamp: Date.now(),
      timeStr,
      objName,
      day,
      status: newStatus,
      workerInfo: fullWorkerInfo
    };
    push(ref(database, 'logs'), newLog);
  };

  const calculateProgress = (dayKey) => {
    if (dayKey === 'Rodyti Visus') return 0;
    const items = INITIAL_SCHEDULE[dayKey] || [];
    if (items.length === 0) return 0;
    const completed = items.filter(item => statuses[item.id]?.status === 'Atlikta').length;
    return Math.round((completed / items.length) * 100);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Viršutinė Navigacijos Juosta */}
        <header className="flex justify-between items-center bg-[#131b2e] p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-wide text-white">Teritorijų Tvarkymas</h1>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Gyvas Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">Prijungta prie bendros sistemos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-[#1a233a] border border-slate-700/60 flex items-center justify-center text-amber-400 hover:bg-slate-800 transition">
              <Sun className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#1a233a] border border-slate-700/60 flex items-center justify-center text-slate-300 font-mono text-sm font-semibold">
              {currentTime ? currentTime.slice(0, 5) : '00:00'}
            </div>
          </div>
        </header>

        {/* Antro lygio mygtukai */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition border ${
              activeTab === 'routes' 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/20' 
                : 'bg-[#131b2e] text-slate-300 border-slate-800 hover:bg-[#1a233a]'
            }`}
          >
            <Calendar className="w-4 h-4" /> Maršrutai ir Objektai
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition border ${
              activeTab === 'live' 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/20' 
                : 'bg-[#131b2e] text-slate-300 border-slate-800 hover:bg-[#1a233a]'
            }`}
          >
            <Eye className="w-4 h-4" /> Gyvas Stebėjimas ({logs.length})
          </button>
          {isSessionActive && (
            <button 
              onClick={() => setIsSessionActive(false)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition ml-auto"
            >
              Keisti Vardą / Atsijungti
            </button>
          )}
        </div>

        {/* Prisijungimo kortelė, jei sesija neaktyvi */}
        {!isSessionActive ? (
          <div className="bg-gradient-to-b from-[#131b2e] to-[#0f172a] p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Įveskite savo vardą ir pasirinkite grupę</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Kiti ekipažai ir vadovai matys, kas šiuo metu vyksta į objektą ir kas jį sutvarkė.</p>
              </div>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jūsų Vardas</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Pvz.: Mantas, Saška..." 
                  value={workerNames} 
                  onChange={(e) => setWorkerNames(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-2xl p-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ekipažas / Grupė</label>
                <select 
                  value={teamName} 
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-700/80 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  <option>Grupė 1</option>
                  <option>Grupė 2</option>
                  <option>Grupė 3</option>
                </select>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Išsaugoti Profilį ir Pradėti
                </button>
                <button 
                  type="button"
                  onClick={handleObserverSession}
                  className="bg-[#1a233a] hover:bg-slate-800 text-slate-300 font-semibold py-4 px-6 rounded-2xl text-sm transition border border-slate-700/60 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-sky-400" /> Tik Stebėti
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'live' ? (
          /* Gyvo stebėjimo žurnalas */
          <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> Gyvas Veiksmų Žurnalas (Realiu laiku)
            </h3>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Kol kas jokių įrašų nėra. Pažymėkite objektus grafike!</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="bg-[#0b0f19] p-3.5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <span className="text-slate-300">
                      <strong className="text-emerald-400 font-mono mr-2">[{log.timeStr}]</strong> 
                      <span className="text-slate-400">{log.workerInfo}</span> pažymėjo <strong className="text-white">{log.objName}</strong> ({log.day})
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg font-semibold uppercase tracking-wider ${
                      log.status === 'Atlikta' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Maršrutų ir dienų vaizdas */
          <div className="space-y-6">
            
            {/* Dienų pasirinkimo juosta */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Pasirinkite dieną
                </span>
                <span className="text-[11px] bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Šiandien (Aktyvus)
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Rodyti Visus'].map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition border flex flex-col items-center justify-center gap-1 ${
                      selectedDay === day 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30' 
                        : 'bg-[#131b2e] text-slate-400 border-slate-800 hover:bg-[#1a233a] hover:text-slate-200'
                    }`}
                  >
                    <span>{day}</span>
                    {selectedDay === day && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Atvaizdavimas pagal dieną (-as) */}
            {(selectedDay === 'Rodyti Visus' ? Object.entries(INITIAL_SCHEDULE) : [[selectedDay, INITIAL_SCHEDULE[selectedDay]]]).map(([dayName, items]) => {
              const progress = calculateProgress(dayName);
              return (
                <div key={dayName} className="bg-[#131b2e] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {dayName} <span className="text-xs font-normal text-slate-400">({items?.length || 0} objektai)</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Pažymėkite objektą prieš išvykdami, kad kitos grupės matytų statusą.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => alert('Objektų pridėjimo funkcija')}
                        className="flex-1 sm:flex-none bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Pridėti Objektą
                      </button>
                    </div>
                  </div>

                  {/* Proceso juosta */}
                  {dayName !== 'Rodyti Visus' && (
                    <div className="space-y-2 bg-[#0b0f19] p-4 rounded-2xl border border-slate-800/80">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Dienos atlikimo eiga</span>
                        <span className="text-emerald-400 font-mono font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Objektų sąrašas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items?.map(item => {
                      const st = statuses[item.id] || { status: 'Laukia' };
                      return (
                        <div key={item.id} className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                          item.highlight ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800 bg-[#0b0f19]'
                        }`}>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className={`font-semibold text-sm ${item.highlight ? 'text-rose-400' : 'text-white'}`}>
                                {item.name}
                              </span>
                              {st.updatedBy && (
                                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                                  ⏱️ {st.updatedAt} — <span className="text-emerald-400">{st.updatedBy}</span>
                                </p>
                              )}
                            </div>
                            
                            <span className={`text-[11px] px-2.5 py-1 rounded-lg font-mono font-semibold uppercase tracking-wider shrink-0 ${
                              st.status === 'Atlikta' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              st.status === 'Važiuoja' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-slate-800 text-slate-400 border border-slate-700/50'
                            }`}>
                              {st.status}
                            </span>
                          </div>

                          {/* Valdymo mygtukai ekipažui */}
                          {role === 'crew' ? (
                            <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                              <button
                                onClick={() => updateStatus(item.id, item.name, dayName, 'Važiuoja')}
                                className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs py-2 rounded-xl border border-amber-500/20 font-semibold transition flex items-center justify-center gap-1.5"
                              >
                                <Truck className="w-3.5 h-3.5" /> Važiuoja
                              </button>
                              <button
                                onClick={() => updateStatus(item.id, item.name, dayName, 'Atlikta')}
                                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs py-2 rounded-xl border border-emerald-500/20 font-semibold transition flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Atlikta
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-800/80 flex items-center justify-between">
                              <span>Režimas: Stebėtojas</span>
                              <span>(Įveskite vardą, kad žymėtumėte)</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}
