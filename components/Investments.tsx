import React, { useState } from 'react';
import { Investment } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface InvestmentsProps {
  investments: Investment[];
  onAdd: (inv: Omit<Investment, 'id'>) => void;
}

const COLORS = ['#E10600', '#991B1B', '#7F1D1D', '#450A0A', '#1F1F1F'];

const Investments: React.FC<InvestmentsProps> = ({ investments, onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newInv, setNewInv] = useState<Partial<Investment>>({ type: 'Ações' });

  const totalValue = investments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAdd = () => {
    if (newInv.name && newInv.amount) {
      onAdd({
        name: newInv.name,
        amount: Number(newInv.amount),
        type: newInv.type as any || 'Ações'
      });
      setIsAdding(false);
      setNewInv({ type: 'Ações' });
    }
  };

  const dataForChart = investments.map(i => ({ name: i.type, value: i.amount }));

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-thanos-card border border-thanos-border p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Patrimônio Total</h2>
          <div className="text-3xl font-bold text-white">
            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-xs text-green-500 mt-2 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Ativos em Crescimento
          </p>
        </div>
        
        <div className="h-32 w-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataForChart}
                innerRadius={25}
                outerRadius={40}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {dataForChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* List */}
      <div className="bg-thanos-card border border-thanos-border p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Seus Ativos</h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-thanos-red text-sm hover:text-white transition-colors"
          >
            {isAdding ? 'Cancelar' : '+ Novo Investimento'}
          </button>
        </div>

        {isAdding && (
          <div className="mb-6 p-4 bg-neutral-900 rounded-xl border border-neutral-800 animate-fade-in">
            <div className="grid gap-3">
              <input 
                type="text" 
                placeholder="Nome do Ativo (ex: Bitcoin, MXRF11)" 
                className="bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none"
                onChange={e => setNewInv({...newInv, name: e.target.value})}
              />
              <div className="flex gap-3">
                <input 
                  type="number" 
                  placeholder="Valor (R$)" 
                  className="bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none w-1/2"
                  onChange={e => setNewInv({...newInv, amount: Number(e.target.value)})}
                />
                <select 
                  className="bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none w-1/2"
                  onChange={e => setNewInv({...newInv, type: e.target.value as any})}
                  value={newInv.type}
                >
                  <option value="Ações">Ações</option>
                  <option value="Renda Fixa">Renda Fixa</option>
                  <option value="Cripto">Cripto</option>
                  <option value="FIIs">FIIs</option>
                  <option value="Negócios">Negócios</option>
                </select>
              </div>
              <button 
                onClick={handleAdd}
                className="bg-thanos-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {investments.map((inv) => (
            <div key={inv.id} className="flex justify-between items-center p-3 hover:bg-neutral-900 rounded-lg transition-colors border-b border-neutral-900 hover:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${
                  inv.type === 'Cripto' ? 'bg-purple-600' :
                  inv.type === 'Ações' ? 'bg-blue-600' :
                  inv.type === 'Negócios' ? 'bg-emerald-600' : 
                  inv.type === 'FIIs' ? 'bg-orange-600' : 'bg-yellow-600'
                }`}></div>
                <div>
                  <p className="font-semibold text-white">{inv.name}</p>
                  <p className="text-xs text-gray-500">{inv.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-white">
                  {inv.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {inv.performance && (
                   <span className="text-xs text-green-500">+{inv.performance}%</span>
                )}
              </div>
            </div>
          ))}
          {investments.length === 0 && (
            <p className="text-gray-500 text-center text-sm py-4">Nenhum ativo registrado. O futuro exige investimento.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investments;