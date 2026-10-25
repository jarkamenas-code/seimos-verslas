'use client';

import React, { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, onValue, set, update, push } from 'firebase/database';
import { Clock, CheckCircle2, Truck, AlertTriangle, Users, History, Calendar, Eye, ShieldAlert } from 'lucide-react';

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
  const [role, setRole] = useState(null); // 'crew' arba 'observer'
  const [teamName, setTeamName] = useState('1 Ekipažas');
  const [workerNames, setWorkerNames] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [statuses, setStatuses] = useState({});
  const [logs, setLogs] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Visi');

  // Gyvas laikrodis
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('lt-LT'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase klausymasis realiu laiku
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

  const handleStartCrewSession = (e) => {
    e.preventDefault();
    if (workerNames.trim()) {
      setRole('crew');
      setIsSessionActive(true);
    }
  };

  const handleStartObserverSession = () => {
    setRole('observer');
    setIsSessionActive(true);
  };

  const updateStatus = (objId, objName, day, newStatus) => {
    if (role !== 'crew') return; // Apsauga stebėtojams

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      {/* Viršutinė juosta */}
      <header className="max-w-6xl mx-auto bg-slate-800 p-4 rounded-xl mb-6 border border-slate-700 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-emerald-400">Teritorijų Tvarkymo Grafikas</h1>
          <p className="text-xs text-slate-400">Realaus laiko Vercel + Firebase stebėjimas</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 font-mono text-emerald-400">
          <Clock className="w-5 h-5 animate-pulse" />
          <span className="text-lg font-bold">{currentTime || '00:00:00'}</span>
        </div>
      </header>

      {/* Prisijungimo arba Režimo pasirinkimo langas */}
      {!isSessionActive ? (
        <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mt-10 space-y-6">
          <h2 className="text-lg font-bold text-center text-slate-200">Pasirinkite prisijungimo būdą</h2>
          
          {/* Ekipažo prisijungimas */}
          <div className="border border-slate-700 p-4 rounded-lg bg-slate-900/50">
            <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Dirbantis Ekipažas
            </h3>
            <form onSubmit={handleStartCrewSession} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ekipažas:</label>
                <select 
                  value={teamName} 
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                >
                  <option>1 Ekipažas</option>
                  <option>2 Ekipažas</option>
                  <option>3 Ekipažas</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Darbuotojų vardai:</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Pvz.: Mantas, Saška" 
                  value={workerNames} 
                  onChange={(e) => setWorkerNames(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 rounded-lg text-sm transition">
                Pradėti Darbą
              </button>
            </form>
          </div>

          <div className="relative text-center">
            <span className="bg-slate-800 px-3 text-xs text-slate-500 font-semibold">ARBA</span>
            <div className="absolute left-0 top-1/2 w-full border-t border-slate-700 -z-10"></div>
          </div>

          {/* Stebėtojo prisijungimas */}
          <button 
            onClick={handleStartObserverSession}
            className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 font-bold py-3 rounded-lg text-sm transition flex items-center justify-center gap-2 text-slate-200"
          >
            <Eye className="w-5 h-5 text-sky-400" /> Tiesiog Stebėti Gyvai (Vadovas / Klientas)
          </button>
        </div>
      ) : (
        /* Pagrindinis Ekranas (Ekipažui arba Stebėtojui) */
        <main className="max-w-6xl mx-auto space-y-6">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${role === 'crew' ? 'bg-emerald-500 animate-ping' : 'bg-sky-500 animate-pulse'}`}></span>
              <span className="font-semibold text-slate-200">
                {role === 'crew' ? (
                  <>Prisijungęs: <span className="text-emerald-400">{teamName}</span> ({workerNames})</>
                ) : (
                  <span className="text-sky-400 flex items-center gap-2"><Eye className="w-4 h-4" /> Tiesioginė Stebėjimo Peržiūra</span>
                )}
              </span>
            </div>
            <button onClick={() => setIsSessionActive(false)} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg">
              Atsijungti / Keisti Režimą
            </button>
          </div>

          {/* Dienų filtras */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Visi', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis'].map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                  selectedDay === day ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Grafiko lentelė */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(INITIAL_SCHEDULE)
              .filter(([day]) => selectedDay === 'Visi' || selectedDay === day)
              .map(([day, items]) => (
                <div key={day} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h3 className="font-bold text-lg mb-3 border-b border-slate-700 pb-2 text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" /> {day}
                  </h3>
                  <div className="space-y-3">
                    {items.map(item => {
                      const st = statuses[item.id] || { status: 'Laukia' };
                      return (
                        <div key={item.id} className={`p-3 rounded-lg border transition ${
                          item.highlight ? 'border-red-500/50 bg-red-950/20' : 'border-slate-700 bg-slate-900/50'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-semibold ${item.highlight ? 'text-red-400' : 'text-slate-200'}`}>
                              {item.name}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                              st.status === 'Atlikta' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              st.status === 'Važiuoja' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {st.status}
                            </span>
                          </div>

                          {st.updatedBy && (
                            <div className="text-[11px] text-slate-400 mb-2 font-mono">
                              ⏱️ {st.updatedAt} — {st.updatedBy}
                            </div>
                          )}

                          {/* Mygtukai rodomi TIK Ekipažams. Stebėtojai mygtukų nespaudžia */}
                          {role === 'crew' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateStatus(item.id, item.name, day, 'Važiuoja')}
                                className="flex-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 text-xs py-1.5 rounded border border-amber-500/30 font-medium transition flex items-center justify-center gap-1"
                              >
                                <Truck className="w-3 h-3" /> Važiuoja
                              </button>
                              <button
                                onClick={() => updateStatus(item.id, item.name, day, 'Atlikta')}
                                className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs py-1.5 rounded border border-emerald-500/30 font-medium transition flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Atlikta
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>

          {/* Gyvas logas */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mt-8">
            <h3 className="font-bold text-slate-300 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" /> Gyvas Veiksmų Žurnalas (Sekundės tikslumu)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 font-mono text-xs">
              {logs.map((log, idx) => (
                <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center text-slate-400">
                  <span>
                    <strong className="text-slate-200">[{log.timeStr}]</strong> {log.workerInfo} pažymėjo <strong className="text-emerald-400">{log.objName}</strong> ({log.day}) ➔ <span className="text-amber-400">{log.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}