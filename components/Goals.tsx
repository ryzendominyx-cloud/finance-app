import React, { useState, useEffect } from 'react';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
}

const Goals: React.FC = () => {
  // Inicialização com persistência
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const saved = localStorage.getItem('thanos_goals');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  // Salvar sempre que mudar
  useEffect(() => {
    localStorage.setItem('thanos_goals', JSON.stringify(goals));
  }, [goals]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({});

  const handleAdd = () => {
    if (newGoal.name && newGoal.target) {
      setGoals(prev => [...prev, {
        id: Date.now().toString(),
        name: newGoal.name!,
        target: Number(newGoal.target),
        current: Number(newGoal.current || 0),
        deadline: newGoal.deadline
      }]);
      setIsAdding(false);
      setNewGoal({});
    }
  };

  const updateProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const newVal = Math.min(g.target, Math.max(0, g.current + amount));
        return { ...g, current: newVal };
      }
      return g;
    }));
  };

  const deleteGoal = (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Metas do Infinito</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-thanos-red font-bold text-sm hover:text-white transition-colors"
        >
          {isAdding ? 'Cancelar' : '+ Nova Meta'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3 animate-fade-in">
          <input 
            type="text" 
            placeholder="Nome da Conquista" 
            className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none"
            onChange={e => setNewGoal({...newGoal, name: e.target.value})}
          />
          <div className="flex gap-3">
            <input 
              type="number" 
              placeholder="Alvo (R$)" 
              className="w-1/2 bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none"
              onChange={e => setNewGoal({...newGoal, target: Number(e.target.value)})}
            />
            <input 
              type="number" 
              placeholder="Atual (R$)" 
              className="w-1/2 bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none"
              onChange={e => setNewGoal({...newGoal, current: Number(e.target.value)})}
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full bg-thanos-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Criar Destino
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {goals.length === 0 && !isAdding && (
          <div className="text-center py-10 bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-800">
             <p className="text-gray-500 mb-2">O destino ainda não foi traçado.</p>
             <p className="text-xs text-gray-600">Crie metas para obter a Joia da Alma.</p>
          </div>
        )}

        {goals.map(goal => {
          const percent = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
          return (
            <div key={goal.id} className="bg-thanos-card border border-neutral-800 p-5 rounded-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-white">{goal.name}</h3>
                    <p className="text-xs text-gray-500">
                      {goal.deadline ? `Prazo: ${new Date(goal.deadline).toLocaleDateString('pt-BR')}` : 'Sem prazo definido'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-mono text-thanos-red bg-thanos-red/10 px-2 py-1 rounded">
                        {percent.toFixed(1)}%
                     </span>
                     <button onClick={() => deleteGoal(goal.id)} className="text-gray-600 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-bold text-gray-200">
                    {goal.current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">
                    de {goal.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-neutral-800">
                  <div 
                    className="h-full bg-gradient-to-r from-red-900 to-thanos-red transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => updateProgress(goal.id, 100)} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1 rounded-lg border border-neutral-700">
                    + R$ 100
                  </button>
                  <button onClick={() => updateProgress(goal.id, 500)} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1 rounded-lg border border-neutral-700">
                    + R$ 500
                  </button>
                </div>
              </div>
              
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-thanos-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;