import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FinanceChat from './components/FinanceChat';
import Investments from './components/Investments';
import Reports from './components/Reports';
import LiveVoice from './components/LiveVoice';
import Goals from './components/Goals';
import TradeSimulator from './components/TradeSimulator';
import Tutorial from './components/Tutorial';
import { Transaction, Habit, Investment, ChatMessage, UserStats, InfinityStones } from './types';

// Helper for persistence
const loadState = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error(`Error loading ${key}`, e);
    return fallback;
  }
};

const App: React.FC = () => {
  // App State - Initializing from LocalStorage
  const [habits, setHabits] = useState<Habit[]>(() => loadState('thanos_habits', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadState('thanos_transactions', []));
  const [investments, setInvestments] = useState<Investment[]>(() => loadState('thanos_investments', []));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadState('thanos_chat', []));
  
  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('thanos_tutorial_completed'));

  // Gamification State
  const [userStats, setUserStats] = useState<UserStats>(() => loadState('thanos_stats', {
    xp: 0,
    level: 1,
    rankTitle: 'Iniciado'
  }));
  
  const [stones, setStones] = useState<InfinityStones>(() => loadState('thanos_stones', {
    power: false, space: false, reality: false, soul: false, time: false, mind: false
  }));

  // Persistence Effects
  useEffect(() => { localStorage.setItem('thanos_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('thanos_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('thanos_investments', JSON.stringify(investments)); }, [investments]);
  useEffect(() => { localStorage.setItem('thanos_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('thanos_stats', JSON.stringify(userStats)); }, [userStats]);
  useEffect(() => { localStorage.setItem('thanos_stones', JSON.stringify(stones)); }, [stones]);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('thanos_tutorial_completed', 'true');
  };

  // Calculate Stones & XP whenever data changes
  // Note: We use a functional update for setStones to ensure we have the latest state, 
  // but for calculations involving 'stones' in the dependency array, we need to be careful.
  // We added 'stones' to dependency to ensure checks against current stone state are accurate.
  useEffect(() => {
    let newStones = { ...stones };
    let xpGain = 0;
    let stonesChanged = false;

    // 1. Power Stone (Income > Expense)
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const isProfitable = income > expenses && income > 0;
    if (isProfitable !== stones.power) {
       if (isProfitable) xpGain += 500;
       newStones.power = isProfitable;
       stonesChanged = true;
    }

    // 2. Space Stone (Habits > 50%)
    const completedHabits = habits.filter(h => h.completed).length;
    const habitPercent = habits.length > 0 ? completedHabits / habits.length : 0;
    const isHabitMaster = habitPercent >= 0.5;
    if (isHabitMaster !== stones.space) {
        if (isHabitMaster) xpGain += 200;
        newStones.space = isHabitMaster;
        stonesChanged = true;
    }

    // 3. Reality Stone (Investments Exist)
    const hasInvestments = investments.length > 0;
    if (hasInvestments !== stones.reality) {
        if (hasInvestments) xpGain += 1000;
        newStones.reality = hasInvestments;
        stonesChanged = true;
    }

    // 4. Time Stone (Used Chat)
    const usedChat = chatMessages.filter(m => m.role === 'user').length > 0;
    if (usedChat !== stones.time) {
        if (usedChat) xpGain += 100;
        newStones.time = usedChat;
        stonesChanged = true;
    }
    
    // 5. Mind Stone (Balance > 0)
    const balance = income - expenses;
    const positiveBalance = balance > 0;
    if (positiveBalance !== stones.mind) {
        newStones.mind = positiveBalance;
        stonesChanged = true;
    }

    // 6. Soul Stone (Simplification: Has habits defined)
    const hasHabits = habits.length >= 3;
    if (hasHabits !== stones.soul) {
        if (hasHabits) xpGain += 300;
        newStones.soul = hasHabits;
        stonesChanged = true;
    }

    if (stonesChanged) {
        setStones(newStones);
        if (xpGain > 0) {
            addXP(xpGain);
        }
    }
    // Removing 'stones' from dependency to prevent infinite loops if logic isn't perfectly stable, 
    // although with the checks above it should be safe. 
    // However, to process updates correctly based on new data, we rely on data dependencies.
    // The previous state of stones is accessed via the closure or we could use functional state update, 
    // but here we need to read it to determine XP gain.
  }, [habits, transactions, investments, chatMessages]); 

  const addXP = (amount: number) => {
    setUserStats(prev => {
      const newXP = prev.xp + amount;
      const nextLevelXP = prev.level * 1000;
      let newLevel = prev.level;
      let newRank = prev.rankTitle;

      if (newXP >= nextLevelXP) {
        newLevel += 1;
        if (newLevel >= 5) newRank = 'Conquistador';
        if (newLevel >= 10) newRank = 'General da Ordem';
        if (newLevel >= 20) newRank = 'Titã Louco';
      }

      return { ...prev, xp: newXP, level: newLevel, rankTitle: newRank };
    });
  };

  // Handlers
  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        if (!h.completed) addXP(50); // XP for completing habit
        return { ...h, completed: !h.completed };
      }
      return h;
    }));
  };

  const addHabit = (name: string, icon: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      icon,
      completed: false,
      streak: 0
    };
    setHabits(prev => [...prev, newHabit]);
    addXP(100);
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
    addXP(20);
  };

  const editTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addMessage = (msg: ChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
    if (msg.role === 'user') addXP(10);
  };

  const addInvestment = (inv: Omit<Investment, 'id'>) => {
    const newInv: Investment = { ...inv, id: Date.now().toString(), performance: 0 };
    setInvestments(prev => [...prev, newInv]);
    addXP(200);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-thanos-dark text-gray-200 font-sans selection:bg-thanos-red selection:text-white pb-24 relative">
        
        {/* Tutorial Overlay */}
        {showTutorial && <Tutorial onClose={handleCloseTutorial} />}

        {/* Header */}
        <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-neutral-900">
          <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tighter text-white">
              THANOS <span className="text-thanos-red">FINANCE</span>
            </h1>
            <Link to="/chat" className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs hover:bg-thanos-red hover:text-white transition-colors relative">
               AI
               {stones.time && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>}
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-md mx-auto pt-20 px-4">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                stats={userStats} 
                stones={stones}
                habits={habits}
                transactions={transactions}
                investments={investments}
                onToggleHabit={toggleHabit} 
                onAddHabit={addHabit}
              />
            } />
            <Route path="/goals" element={<Goals />} />
            <Route path="/live" element={<LiveVoice />} />
            <Route path="/chat" element={
              <FinanceChat 
                messages={chatMessages} 
                onNewMessage={addMessage} 
                onNewTransaction={addTransaction}
              />
            } />
            <Route path="/trade" element={<TradeSimulator />} />
            <Route path="/invest" element={<Investments investments={investments} onAdd={addInvestment} />} />
            <Route path="/reports" element={
              <Reports 
                transactions={transactions} 
                habits={habits} 
                onAddTransaction={addTransaction}
                onEditTransaction={editTransaction}
                onDeleteTransaction={deleteTransaction}
              />
            } />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full z-50 bg-black border-t border-neutral-900 pb-safe">
          <div className="max-w-md mx-auto flex justify-around items-center h-16">
            <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-thanos-red' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[10px] font-medium">Início</span>
            </NavLink>

            <NavLink to="/trade" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-thanos-red' : 'text-gray-500'}`}>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
              <span className="text-[10px] font-medium">Simulador</span>
            </NavLink>

            {/* Live Center Button */}
            <NavLink to="/live" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-thanos-red scale-110' : 'text-gray-500'}`}>
              {({ isActive }) => (
               <div className={`rounded-full p-2 border-2 ${isActive ? 'bg-thanos-red text-white border-thanos-red shadow-[0_0_15px_rgba(225,6,0,0.5)]' : 'bg-black border-neutral-700'}`}>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                 </svg>
               </div>
              )}
            </NavLink>

            <NavLink to="/invest" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-thanos-red' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-medium">Carteira</span>
            </NavLink>

            <NavLink to="/goals" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-thanos-red' : 'text-gray-500'}`}>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
              <span className="text-[10px] font-medium">Metas</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;