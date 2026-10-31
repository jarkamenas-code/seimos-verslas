'use client';

import React, { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, onValue, update, remove, push, set, onDisconnect } from 'firebase/database';
import { Clock, CheckCircle2, Truck, Users, Calendar, Eye, Plus, Sparkles, RotateCcw, Shield, Zap, Flame, Compass, Activity, UserCheck, Radio, Camera, CheckSquare, Home, Building2, AlertTriangle } from 'lucide-react';

const INITIAL_SCHEDULE = {
  Pirmadienis: [
    { id: 'v1', name: 'Vėtrungių g. — 1 laiptinė (Skundas)', isVetrunges: true },
    { id: 'v2', name: 'Vėtrungių g. — 2 laiptinė (Skundas)', isVetrunges: true },
    { id: 'v3', name: 'Vėtrungių g. — 3 laiptinė (Skundas)', isVetrunges: true },
    { id: 'v4', name: 'Vėtrungių g. — 4 laiptinė (Skundas)', isVetrunges: true },
    { id: 'p2', name: 'Zamenhofas' }, { id: 'p3', name: 'Bajorai' }
  ],
  Antradienis: [
    { id: 'v5', name: 'Vėtrungių g. — 5 laiptinė (Skundas)', isVetrunges: true },
    { id: 'v6', name: 'Vėtrungių g. — 6 laiptinė (Skundas)', isVetrunges: true },
    { id: 'a2', name: 'Zamenhofas' }, { id: 'a3', name: 'Paribys' }
  ],
  Trečiadienis: [
    { id: 'v7', name: 'Vėtrungių g. — 7 laiptinė (Skundas)', isVetrunges: true },
    { id: 't2', name: 'Zamenhofas' }, { id: 't3', name: 'Elbingas' }
  ],
  Ketvirtadienis: [
    { id: 'v8', name: 'Vėtrungių g. — 8 laiptinė (Skundas)', isVetrunges: true },
    { id: 'k3', name: 'Bajorai' }, { id: 'k4', name: 'Didlaukis' }
  ],
  Penktadienis: [
    { id: 'v9', name: 'Vėtrungių g. — Bendras kiemas / Skundai', isVetrunges: true },
    { id: 'pn3', name: 'Paribys' }, { id: 'pn4', name: 'Malonioji' }
  ]
};

// Visos Vėtrungių laiptinės vienoje vietoje atsakingam asmeniui
const ALL_VETRUNGES_ITEMS = [
  { id: 'v1', name: 'Vėtrungių g. — 1 laiptinė', day: 'Pirmadienis' },
  { id: 'v2', name: 'Vėtrungių g. — 2 laiptinė', day: 'Pirmadienis' },
  { id: 'v3', name: 'Vėtrungių g. — 3 laiptinė', day: 'Pirmadienis' },
  { id: 'v4', name: 'Vėtrungių g. — 4 laiptinė', day: 'Pirmadienis' },
  { id: 'v5', name: 'Vėtrungių g. — 5 laiptinė', day: 'Antradienis' },
  { id: 'v6', name: 'Vėtrungių g. — 6 laiptinė', day: 'Antradienis' },
  { id: 'v7', name: 'Vėtrungių g. — 7 laiptinė', day: 'Trečiadienis' },
  { id: 'v8', name: 'Vėtrungių g. — 8 laiptinė', day: 'Ketvirtadienis' },
  { id: 'v9', name: 'Vėtrungių g. — Bendras kiemas', day: 'Penktadienis' },
];

const getTeamBadgeStyle = (teamStr) => {
  if (teamStr?.includes('Grupė 2')) {
    return { icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />, bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
  } else if (teamStr?.includes('Grupė 3')) {
    return { icon: <Flame className="w-3.5 h-3.5 text-amber-400" />, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
  }
  return { icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
};

export default function Home() {
  const [role, setRole] = useState(null); 
  const [teamName, setTeamName] = useState('Grupė 1');
  const [workerNames, setWorkerNames] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [statuses, setStatuses] = useState({});
  const [logs, setLogs] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedDay, setSelectedDay] = useState('Pirmadienis');
  const [activeTab, setActiveTab] = useState('routes'); 
  const [myPresenceRef, setMyPresenceRef] = useState(null);

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
      else setStatuses({});
    });

    const logsRef = ref(database, 'logs');
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedLogs = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setLogs(parsedLogs);
      } else {
        setLogs([]);
      }
    });

    const presenceRef = ref(database, 'presence');
    onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setOnlineUsers(data);
      else setOnlineUsers({});
    });
  }, []);

  const handleStartSession = (e) => {
    e.preventDefault();
    if (workerNames.trim()) {
      setRole('crew');
      setIsSessionActive(true);

      const presenceListRef = ref(database, 'presence');
      const newUserRef = push(presenceListRef);
      set(newUserRef, {
        name: workerNames,
        team: teamName,
        joinedAt: Date.now()
      });
      onDisconnect(newUserRef).remove();
      setMyPresenceRef(newUserRef);
    }
  };

  const handleVetrungesManagerSession = () => {
    setRole('vetrunges_manager');
    setWorkerNames('Vėtrungių Atsakingas Asmuo');
    setTeamName('Vėtrungių Valdymas');
    setIsSessionActive(true);
  };

  const handleObserverSession = () => {
    setRole('observer');
    setIsSessionActive(true);
  };

  const handleLogout = () => {
    if (myPresenceRef) {
      remove(myPresenceRef);
      setMyPresenceRef(null);
    }
    setIsSessionActive(false);
    setRole(null);
  };

  const updateStatus = (objId, objName, day, newStatus) => {
    if (role !== 'crew' && role !== 'vetrunges_manager') return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('lt-LT');
    const fullWorkerInfo = role === 'vetrunges_manager' ? 'Vėtrungių Atsakingas Asmuo' : `${teamName} (${workerNames})`;

    const currentObj = statuses[objId] || {};
    const statusData = {
      ...currentObj,
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

  const handleImageUpload = (objId, objName, day, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('lt-LT');
      const fullWorkerInfo = role === 'vetrunges_manager' ? 'Vėtrungių Atsakingas Asmuo' : `${teamName} (${workerNames})`;

      const currentObj = statuses[objId] || {};
      const statusData = {
        ...currentObj,
        image: base64String,
        imageAddedBy: fullWorkerInfo,
        imageAt: timeStr,
        status: currentObj.status && currentObj.status !== 'Laukia' ? currentObj.status : 'Skundas / Nuotrauka'
      };

      update(ref(database, `statuses/${objId}`), statusData);

      const newLog = {
        timestamp: Date.now(),
        timeStr,
        objName,
        day,
        status: 'Įkėlė skundo nuotrauką',
        workerInfo: fullWorkerInfo
      };
      push(ref(database, 'logs'), newLog);
    };
    reader.readAsDataURL(file);
  };

  const confirmTask = (objId, objName, day) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('lt-LT');
    const validatorName = role === 'vetrunges_manager' ? 'Vėtrungių Atsakingas Asmuo' : `${teamName} (${workerNames})`;

    const currentObj = statuses[objId] || {};
    const statusData = {
      ...currentObj,
      status: 'Sutvarkyta ✅',
      confirmedBy: validatorName,
      confirmedAt: timeStr
    };

    update(ref(database, `statuses/${objId}`), statusData);

    const newLog = {
      timestamp: Date.now(),
      timeStr,
      objName,
      day,
      status: 'Sutvarkyta ir patvirtinta',
      workerInfo: validatorName
    };
    push(ref(database, 'logs'), newLog);
  };

  const resetStatus = (objId, objName, day) => {
    remove(ref(database, `statuses/${objId}`));

    const now = new Date();
    const timeStr = now.toLocaleTimeString('lt-LT');
    const fullWorkerInfo = role === 'vetrunges_manager' ? 'Vėtrungių Atsakingas Asmuo' : `${teamName} (${workerNames})`;

    const newLog = {
      timestamp: Date.now(),
      timeStr,
      objName,
      day,
      status: 'Atšaukta',
      workerInfo: fullWorkerInfo
    };
    push(ref(database, 'logs'), newLog);
  };

  const calculateProgress = (dayKey) => {
    if (dayKey === 'Rodyti Visus') return 0;
    const items = INITIAL_SCHEDULE[dayKey] || [];
    if (items.length === 0) return 0;
    const completed = items.filter(item => statuses[item.id]?.status === 'Sutvarkyta ✅' || statuses[item.id]?.status === 'Atlikta').length;
    return Math.round((completed / items.length) * 100);
  };

  const onlineCount = Object.keys(onlineUsers).length;

  return (
    <main className="min-h-screen bg-[#060913] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Pagrindinė Meniu Juosta */}
        <header className="bg-[#0f172a]/70 backdrop-blur-xl border border-indigo-500/25 p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center text-emerald-400">
                <Truck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xl tracking-tight text-white">Vėtrungių Laiptinių ir Skundų Sistema</h1>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Radio className="w-3 h-3 animate-pulse text-emerald-400" /> {onlineCount} Prisijungę
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Šeimos Verslo Valdymo Sistema</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-[#080d1a] p-1.5 rounded-2xl border border-slate-800/80 w-full sm:w-auto justify-between sm:justify-end">
            <button 
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'routes' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-4 h-4" /> Maršrutai
            </button>
            <button 
              onClick={() => setActiveTab('vetrunges_hub')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'vetrunges_hub' 
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-900/30' 
                  : 'text-cyan-400 hover:text-white hover:bg-cyan-950/40 border border-cyan-500/30'
              }`}
            >
              <Building2 className="w-4 h-4" /> Vėtrungių Skundai
            </button>
            <button 
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'live' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" /> Žurnalas ({logs.length})
            </button>
            
            <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

            <div className="px-3 py-1.5 bg-[#0d1424] rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs font-bold tracking-wider">
              {currentTime ? currentTime.slice(0, 5) : '00:00'}
            </div>
          </div>
        </header>

        {/* Aktyvių grupių skydelis */}
        <div className="bg-[#0f172a]/50 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Šiuo metu dirbantys ekipažai:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {onlineCount === 0 ? (
              <span className="text-slate-500 italic">Šiuo metu aktyvių ekipažų nėra</span>
            ) : (
              Object.values(onlineUsers).map((user, idx) => {
                const badge = getTeamBadgeStyle(user.team);
                return (
                  <div key={idx} className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border ${badge.bg} font-semibold`}>
                    {badge.icon}
                    <span>{user.team}: <strong className="text-white">{user.name}</strong></span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {!isSessionActive ? (
          <div className="bg-gradient-to-b from-[#0f172a]/90 to-[#0b0f19]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Prisijunkite prie sistemos</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Pasirinkite ekipažo prisijungimą arba išskirtinį Vėtrungių objekto vadovo valdymą.</p>
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
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-2xl p-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ekipažas / Grupė</label>
                <select 
                  value={teamName} 
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-2xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option>Grupė 1</option>
                  <option>Grupė 2</option>
                  <option>Grupė 3</option>
                </select>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-2xl text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Pradėti kaip Ekipažas
                </button>
                <button 
                  type="button"
                  onClick={handleVetrungesManagerSession}
                  className="bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-500 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-2xl text-sm transition shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" /> Vėtrungių Vadovas (Visos laiptinės)
                </button>
              </div>

              <button 
                type="button"
                onClick={handleObserverSession}
                className="w-full bg-[#0f172a] hover:bg-slate-800 text-slate-300 font-semibold py-3 px-6 rounded-2xl text-sm transition border border-slate-800 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-cyan-400" /> Tik Stebėti
              </button>
            </form>
          </div>
        ) : activeTab === 'live' ? (
          <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> Gyvas Veiksmų Žurnalas (Realiu laiku)
            </h3>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Kol kas jokių įrašų nėra.</p>
              ) : (
                logs.map((log, idx) => {
                  const badge = getTeamBadgeStyle(log.workerInfo);
                  return (
                    <div key={idx} className="bg-[#080d1a] p-3.5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                      <span className="text-slate-300 flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg border ${badge.bg}`}>
                          {badge.icon}
                        </span>
                        <span>
                          <strong className="text-emerald-400 font-mono mr-2">[{log.timeStr}]</strong> 
                          <span className="text-slate-400">{log.workerInfo}</span> — <strong className="text-white">{log.objName}</strong> ({log.day})
                        </span>
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg font-semibold uppercase tracking-wider shrink-0 ${
                        log.status.includes('Sutvarkyta') ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        log.status === 'Atlikta' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'vetrunges_hub' ? (
          /* Specialus Vėtrungių Valdymo Skydelis visoms laiptinėms vienoje vietoje */
          <div className="bg-[#0f172a]/70 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" /> Vėtrungių Gatvės Visų Laiptinių ir Skundų Valdymas
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Čia matomos visos Vėtrungių laiptinės vienoje vietoje, skundai, įkeltos nuotraukos ir tvarkymo statusas.</p>
              </div>
              <button 
                onClick={() => setActiveTab('routes')}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold py-2.5 px-4 rounded-xl transition"
              >
                Grįžti į Maršrutus
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_VETRUNGES_ITEMS.map(item => {
                const st = statuses[item.id] || { status: 'Laukia' };
                const isAciveStatus = st.status !== 'Laukia';

                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-cyan-500/30 bg-[#080d1a] flex flex-col justify-between gap-3 shadow-lg">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-semibold text-sm text-cyan-300 flex items-center gap-1.5">
                          <Home className="w-4 h-4 text-cyan-400 shrink-0" /> {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Diena grafike: {item.day}</span>
                        {st.updatedBy && (
                          <p className="text-[11px] text-slate-400 mt-1 font-mono">
                            ⏱️ {st.updatedAt} — <span className="text-emerald-400">{st.updatedBy}</span>
                          </p>
                        )}
                        {st.confirmedBy && (
                          <p className="text-[11px] text-indigo-400 mt-0.5 font-mono">
                            ✅ Sutvarkė: {st.confirmedBy} ({st.confirmedAt})
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] px-2.5 py-1 rounded-lg font-mono font-semibold uppercase tracking-wider shrink-0 ${
                          st.status === 'Sutvarkyta ✅' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          st.status === 'Atlikta' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          st.status === 'Važiuoja' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          st.status === 'Skundas / Nuotrauka' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}>
                          {st.status}
                        </span>

                        {isAciveStatus && (
                          <button
                            onClick={() => resetStatus(item.id, item.name, item.day)}
                            title="Atstatyti / Ištrinti statusą"
                            className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {st.image && (
                      <div className="mt-2 space-y-1">
                        <div className="text-[11px] text-slate-400">Skundo nuotrauka įkelta ({st.imageAt}):</div>
                        <img src={st.image} alt="Skundas" className="w-full h-36 object-cover rounded-xl border border-slate-700 shadow-md" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <label className="flex-1 cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs py-2 px-3 rounded-xl border border-cyan-500/20 font-semibold transition flex items-center justify-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" /> {st.image ? 'Keisti nuotrauką' : 'Įkelti skundo nuotrauką'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(item.id, item.name, item.day, e)} 
                        />
                      </label>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(item.id, item.name, item.day, 'Važiuoja')}
                          className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs py-2 rounded-xl border border-amber-500/20 font-semibold transition flex items-center justify-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" /> Važiuoja
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, item.name, item.day, 'Atlikta')}
                          className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs py-2 rounded-xl border border-emerald-500/20 font-semibold transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Atlikta
                        </button>
                      </div>

                      <button
                        onClick={() => confirmTask(item.id, item.name, item.day)}
                        className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs py-2 rounded-xl border border-indigo-500/30 font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> Sutvarkyta ir patvirtinta ✅
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {role === 'crew' || role === 'vetrunges_manager' ? (
              <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className={`p-2 rounded-xl border ${getTeamBadgeStyle(teamName).bg}`}>
                    {getTeamBadgeStyle(teamName).icon}
                  </span>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Aktyvus profilis:</span>
                    <strong className="text-white text-sm">{teamName} — <span className="text-emerald-400">{workerNames}</span></strong>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl border border-rose-500/30 transition"
                >
                  Atsijungti / Keisti
                </button>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Pasirinkite savaitės dieną
                </span>
                <button 
                  onClick={() => setActiveTab('vetrunges_hub')}
                  className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" /> Atidaryti visų Vėtrungių skundų langą ↗
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Rodyti Visus'].map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all border flex flex-col items-center justify-center gap-1 ${
                      selectedDay === day 
                        ? 'bg-gradient-to-b from-emerald-600 to-teal-700 text-white border-emerald-500/50 shadow-lg shadow-emerald-900/30' 
                        : 'bg-[#0f172a]/60 text-slate-400 border-slate-800/80 hover:bg-[#131d35] hover:text-slate-200'
                    }`}
                  >
                    <span>{day}</span>
                    {selectedDay === day && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                  </button>
                ))}
              </div>
            </div>

            {(selectedDay === 'Rodyti Visus' ? Object.entries(INITIAL_SCHEDULE) : [[selectedDay, INITIAL_SCHEDULE[selectedDay]]]).map(([dayName, items]) => {
              const progress = calculateProgress(dayName);
              return (
                <div key={dayName} className="bg-[#0f172a]/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {dayName} <span className="text-xs font-normal text-slate-400">({items?.length || 0} objektai)</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Valdykite laiptines, skundus ir nuotraukas.</p>
                    </div>
                  </div>

                  {dayName !== 'Rodyti Visus' && (
                    <div className="space-y-2 bg-[#080d1a] p-4 rounded-2xl border border-slate-800/80">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items?.map(item => {
                      const st = statuses[item.id] || { status: 'Laukia' };
                      const isAciveStatus = st.status !== 'Laukia';

                      return (
                        <div key={item.id} className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                          item.isVetrunges ? 'border-cyan-500/40 bg-cyan-950/10' :
                          item.highlight ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800/80 bg-[#080d1a]'
                        }`}>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className={`font-semibold text-sm flex items-center gap-1.5 ${item.isVetrunges ? 'text-cyan-300' : item.highlight ? 'text-rose-400' : 'text-white'}`}>
                                {item.isVetrunges && <Home className="w-4 h-4 text-cyan-400 shrink-0" />}
                                {item.name}
                              </span>
                              {st.updatedBy && (
                                <p className="text-[11px] text-slate-400 mt-1 font-mono flex items-center gap-1.5">
                                  <span>⏱️ {st.updatedAt} —</span>
                                  <span className="text-emerald-400 font-medium">{st.updatedBy}</span>
                                </p>
                              )}
                              {st.confirmedBy && (
                                <p className="text-[11px] text-indigo-400 mt-0.5 font-mono">
                                  ✅ Sutvarkė/Patvirtino: {st.confirmedBy} ({st.confirmedAt})
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[11px] px-2.5 py-1 rounded-lg font-mono font-semibold uppercase tracking-wider shrink-0 ${
                                st.status === 'Sutvarkyta ✅' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                st.status === 'Atlikta' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                st.status === 'Važiuoja' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                st.status === 'Skundas / Nuotrauka' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                'bg-slate-800 text-slate-400 border border-slate-700/50'
                              }`}>
                                {st.status}
                              </span>

                              {isAciveStatus && (
                                <button
                                  onClick={() => resetStatus(item.id, item.name, dayName)}
                                  title="Atstatyti / Ištrinti statusą"
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {st.image && (
                            <div className="mt-2 space-y-1">
                              <div className="text-[11px] text-slate-400">Nuotrauką įkėlė {st.imageAddedBy} ({st.imageAt}):</div>
                              <img src={st.image} alt="Skundas" className="w-full h-36 object-cover rounded-xl border border-slate-700 shadow-md" />
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1">
                            <label className="flex-1 cursor-pointer bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs py-2 px-3 rounded-xl border border-cyan-500/20 font-semibold transition flex items-center justify-center gap-1.5">
                              <Camera className="w-3.5 h-3.5" /> {st.image ? 'Keisti nuotrauką' : 'Pridėti skundo nuotrauką'}
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(item.id, item.name, dayName, e)} 
                              />
                            </label>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateStatus(item.id, item.name, dayName, 'Važiuoja')}
                                className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs py-2 rounded-xl border border-amber-500/20 font-semibold transition flex items-center justify-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" /> Važiuoja
                              </button>
                              <button
                                onClick={() => updateStatus(item.id, item.name, dayName, 'Atlikta')}
                                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs py-2 rounded-xl border border-emerald-500/20 font-semibold transition flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Atlikta
                              </button>
                            </div>

                            <button
                              onClick={() => confirmTask(item.id, item.name, dayName)}
                              className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs py-2 rounded-xl border border-indigo-500/30 font-semibold transition flex items-center justify-center gap-1.5"
                            >
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> Sutvarkyta ir patvirtinta ✅
                            </button>
                          </div>
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
