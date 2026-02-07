import React from 'react';
import { UserStats, InfinityStones, Habit, Transaction, Investment } from '../types';
import Routine from './Routine';
import { Link } from 'react-router-dom';

interface DashboardProps {
  stats: UserStats;
  stones: InfinityStones;
  habits: Habit[];
  transactions: Transaction[];
  investments: Investment[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (name: string, icon: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  stones, 
  habits, 
  transactions,
  investments,
  onToggleHabit, 
  onAddHabit 
}) => {
  
  // Calculate next level XP (simple formula)
  const xpToNextLevel = stats.level * 1000;
  const progressPercent = Math.min(100, (stats.xp / xpToNextLevel) * 100);

  const activeStonesCount = Object.values(stones).filter(Boolean).length;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Hero Section: Level & Rank */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">Status Atual</p>
            <h2 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {stats.rankTitle}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-thanos-red text-white text-[10px] font-bold px-2 py-0.5 rounded">
                LVL {stats.level}
              </span>
              <span className="text-xs text-gray-500">{stats.xp} / {xpToNextLevel} XP</span>
            </div>
          </div>
          
          {/* Gauntlet Mini Visualization */}
          <div className="flex flex-col items-end">
             <div className="text-2xl font-bold text-white">{activeStonesCount}/6</div>
             <div className="text-[10px] text-gray-500 uppercase">Joias Coletadas</div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-6 relative z-10">
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-thanos-red to-purple-600 shadow-[0_0_10px_rgba(225,6,0,0.5)] transition-all duration-1000"
               style={{ width: `${progressPercent}%` }}
             />
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-thanos-red/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* The Infinity Stones Status */}
      <div>
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>A Manopla Financeira</span>
          <span className="text-xs font-normal text-gray-500">(Complete as tarefas para equilibrar o universo)</span>
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Power Stone - Income */}
          <div className={`aspect-square rounded-xl border p-3 flex flex-col justify-between transition-all duration-500 ${stones.power ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-neutral-900/50 border-neutral-800 opacity-60 grayscale'}`}>
            <div className={`w-3 h-3 rounded-full ${stones.power ? 'bg-purple-500 animate-pulse' : 'bg-neutral-700'}`}></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-purple-400">Poder</p>
              <p className="text-[9px] text-gray-400 leading-tight">Superavit Mensal</p>
            </div>
          </div>

          {/* Space Stone - Routine */}
          <div className={`aspect-square rounded-xl border p-3 flex flex-col justify-between transition-all duration-500 ${stones.space ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-neutral-900/50 border-neutral-800 opacity-60 grayscale'}`}>
            <div className={`w-3 h-3 rounded-full ${stones.space ? 'bg-blue-500 animate-pulse' : 'bg-neutral-700'}`}></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-400">Espaço</p>
              <p className="text-[9px] text-gray-400 leading-tight">Rotina &gt; 50%</p>
            </div>
          </div>

          {/* Reality Stone - Investments */}
          <div className={`aspect-square rounded-xl border p-3 flex flex-col justify-between transition-all duration-500 ${stones.reality ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-neutral-900/50 border-neutral-800 opacity-60 grayscale'}`}>
            <div className={`w-3 h-3 rounded-full ${stones.reality ? 'bg-red-500 animate-pulse' : 'bg-neutral-700'}`}></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-red-400">Realidade</p>
              <p className="text-[9px] text-gray-400 leading-tight">Investidor</p>
            </div>
          </div>

          {/* Soul Stone - Goals */}
          <div className={`aspect-square rounded-xl border p-3 flex flex-col justify-between transition-all duration-500 ${stones.soul ? 'bg-orange-900/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-neutral-900/50 border-neutral-800 opacity-60 grayscale'}`}>
            <div className={`w-3 h-3 rounded-full ${stones.soul ? 'bg-orange-500 animate-pulse' : 'bg-neutral-700'}`}></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-orange-400">Alma</p>
              <p className="text-[9px] text-gray-400 leading-tight">Metas Ativas</p>
            </div>
          </div>

          {/* Time Stone - Wisdom/Chat */}
          <div className={`aspect-square rounded-xl border p-3 flex flex-col justify-between transition-all duration-500 ${stones.time ? 'bg-green-900/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-neutral-900/50 border-neutral-800 opacity-60 grayscale'}`}>
            <div className={`w-3 h-3 rounded-full ${stones.time ? 'bg-green-500 animate-pulse' : 'bg-neutral-700'}`}></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-green-400">Tempo</p>
              <p className="text-[9px] text-gray-400 leading-tight">Consultou IA</p>
            </div>
          </div>

          {/* Mind Stone - Balance */}
          <div className={`aspect-square rounded-xl border p-3 flex flex-col justify-between transition-all duration-500 ${stones.mind ? 'bg-yellow-900/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-neutral-900/50 border-neutral-800 opacity-60 grayscale'}`}>
            <div className={`w-3 h-3 rounded-full ${stones.mind ? 'bg-yellow-500 animate-pulse' : 'bg-neutral-700'}`}></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-yellow-400">Mente</p>
              <p className="text-[9px] text-gray-400 leading-tight">Saldo Positivo</p>
            </div>
          </div>
        </div>

        {activeStonesCount === 6 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg border border-purple-500 text-center animate-pulse">
            <p className="text-xs font-bold text-white uppercase tracking-widest">⚠️ O Equilíbrio Perfeito foi Atingido ⚠️</p>
            <p className="text-[10px] text-purple-200">Bônus de XP Aplicado</p>
          </div>
        )}
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
         <Link to="/reports" className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center gap-3 hover:border-thanos-red transition-colors group">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-thanos-red group-hover:text-white transition-colors">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Transações</p>
              <p className="text-xs text-gray-500">{transactions.length} regs.</p>
            </div>
         </Link>
         <Link to="/invest" className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center gap-3 hover:border-thanos-red transition-colors group">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-thanos-red group-hover:text-white transition-colors">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Carteira</p>
              <p className="text-xs text-gray-500">{investments.length} ativos</p>
            </div>
         </Link>
      </div>

      {/* Routine Section Embedded */}
      <div>
         <Routine habits={habits} onToggle={onToggleHabit} onAddHabit={onAddHabit} />
      </div>

    </div>
  );
};

export default Dashboard;