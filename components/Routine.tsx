import React, { useState } from 'react';
import { Habit } from '../types';

interface RoutineProps {
  habits: Habit[];
  onToggle: (id: string) => void;
  onAddHabit: (name: string, icon: string) => void;
}

const Routine: React.FC<RoutineProps> = ({ habits, onToggle, onAddHabit }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('⚡');

  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  const handleAdd = () => {
    if (newHabitName.trim()) {
      onAddHabit(newHabitName, newHabitIcon);
      setNewHabitName('');
      setIsAdding(false);
    }
  };

  const icons = ['⚡', '🏋️', '📚', '💼', '💧', '🧘', '💰', '🥦', '🚫'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-thanos-card border border-thanos-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 text-white flex justify-between items-center">
          Protocolo Diário
          <span className="text-xs font-normal text-gray-500 uppercase tracking-widest">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Nível de Disciplina</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-thanos-red transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.map((habit) => (
            <div 
              key={habit.id}
              onClick={() => onToggle(habit.id)}
              className={`
                group flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 border
                ${habit.completed 
                  ? 'bg-neutral-900/50 border-thanos-red/30' 
                  : 'bg-neutral-900 border-transparent hover:border-neutral-700'
                }
              `}
            >
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors
                ${habit.completed ? 'bg-thanos-red border-thanos-red' : 'border-neutral-600 group-hover:border-neutral-400'}
              `}>
                {habit.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium transition-colors ${habit.completed ? 'text-gray-400 line-through' : 'text-gray-100'}`}>
                  {habit.icon} {habit.name}
                </p>
              </div>
              {habit.streak > 0 && (
                <span className="text-xs text-orange-500 font-mono">
                  🔥 {habit.streak}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add Habit Button */}
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full mt-4 py-3 border border-dashed border-neutral-700 text-neutral-500 rounded-xl hover:border-thanos-red hover:text-thanos-red transition-colors text-sm font-medium"
          >
            + Adicionar Novo Hábito
          </button>
        ) : (
          <div className="mt-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 animate-fade-in">
             <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-700">
                {icons.map(icon => (
                  <button 
                    key={icon}
                    onClick={() => setNewHabitIcon(icon)}
                    className={`p-2 rounded-lg ${newHabitIcon === icon ? 'bg-thanos-red text-white' : 'bg-neutral-800 text-gray-400'}`}
                  >
                    {icon}
                  </button>
                ))}
             </div>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Nome do hábito (ex: Ler 10 pág)"
                  className="flex-1 bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button 
                  onClick={handleAdd}
                  className="bg-white text-black font-bold px-4 rounded-lg hover:bg-gray-200"
                >
                  OK
                </button>
             </div>
             <button 
               onClick={() => setIsAdding(false)}
               className="text-xs text-red-500 mt-2 hover:underline"
             >
               Cancelar
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Routine;