import React, { useState } from 'react';
import { Transaction, Habit, Category } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
  habits: Habit[];
  onAddTransaction: (t: Transaction) => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORIES: Category[] = ['Alimentação', 'Transporte', 'Educação', 'Lazer', 'Saúde', 'Investimento', 'Outros', 'Renda'];

const Reports: React.FC<ReportsProps> = ({ transactions, habits, onAddTransaction, onEditTransaction, onDeleteTransaction }) => {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Alimentação');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  // Process data for charts
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  const totalSpent = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
  const netResult = totalIncome - totalSpent;

  // Group by category
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(a => a.name === curr.category);
    if (existing) {
      existing.amount += curr.amount;
    } else {
      acc.push({ name: curr.category, amount: curr.amount });
    }
    return acc;
  }, [] as { name: string; amount: number }[]).sort((a, b) => b.amount - a.amount);

  const handleOpenModal = (tx?: Transaction) => {
    if (tx) {
      setEditingId(tx.id);
      setAmount(tx.amount.toString());
      setDescription(tx.description);
      setCategory(tx.category as Category);
      setType(tx.type);
    } else {
      setEditingId(null);
      setAmount('');
      setDescription('');
      setCategory('Alimentação');
      setType('expense');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!amount || !description) return;

    const txData: Transaction = {
      id: editingId || Date.now().toString(),
      amount: parseFloat(amount),
      description,
      category,
      type,
      date: new Date().toISOString() // In a real app, we might want to edit date too
    };

    if (editingId) {
      onEditTransaction(txData);
    } else {
      onAddTransaction(txData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Relatórios & Fluxo</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-thanos-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-900/20"
        >
          + Transação
        </button>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-neutral-900 to-thanos-dark border-l-4 border-thanos-red p-6 rounded-r-xl">
        <h3 className="text-thanos-red font-bold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Insight do Thanos
        </h3>
        <p className="text-sm text-gray-300 italic">
          "{netResult < 0 
            ? 'Você está sangrando recursos. Corte o desnecessário imediatamente ou enfrente a ruína.' 
            : totalSpent > totalIncome * 0.8 && totalIncome > 0
              ? 'Cuidado. Sua margem de segurança é pequena. O equilíbrio é frágil.'
              : 'O equilíbrio está sendo mantido. Use o excedente para expandir seu império.'}"
        </p>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-thanos-card border border-thanos-border p-4 rounded-xl">
            <p className="text-xs text-gray-400 uppercase">Entradas</p>
            <p className="text-xl font-bold text-green-500">
              {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        </div>
        <div className="bg-thanos-card border border-thanos-border p-4 rounded-xl">
            <p className="text-xs text-gray-400 uppercase">Saídas</p>
            <p className="text-xl font-bold text-red-500">
              {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="bg-thanos-card border border-thanos-border p-6 rounded-2xl">
        <h3 className="text-white font-bold mb-6">Gastos por Categoria</h3>
        {categoryData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={90} 
                  tick={{ fill: '#9ca3af', fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', color: '#fff' }}
                  cursor={{ fill: '#ffffff10' }}
                  formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                />
                <Bar dataKey="amount" fill="#E10600" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-10">Nenhum dado de gasto registrado.</p>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg">Histórico Recente</h3>
        {transactions.length === 0 ? (
           <div className="text-center py-8 text-gray-600 bg-neutral-900/30 rounded-xl border border-dashed border-neutral-800">
             <p>O livro caixa está vazio.</p>
             <button onClick={() => handleOpenModal()} className="text-thanos-red text-sm mt-2 hover:underline">Adicionar manualmente</button>
           </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="bg-thanos-card border border-neutral-800 p-4 rounded-xl flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {tx.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.category} • {new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-green-500' : 'text-white'}`}>
                    {tx.type === 'expense' ? '-' : '+'} {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(tx)} className="text-gray-500 hover:text-blue-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => onDeleteTransaction(tx.id)} className="text-gray-500 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Editar Transação' : 'Nova Transação'}
            </h3>
            
            <div className="space-y-4">
              {/* Type Toggle */}
              <div className="flex bg-black p-1 rounded-lg border border-neutral-800">
                <button 
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-thanos-red text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Despesa
                </button>
                <button 
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Receita
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Descrição</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Almoço, Salário..."
                  className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Categoria</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-white focus:border-thanos-red outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-neutral-800 text-gray-300 rounded-lg hover:bg-neutral-700 font-medium text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-white text-black rounded-lg hover:bg-gray-200 font-bold text-sm"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;