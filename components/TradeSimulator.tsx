import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TradeSimulator: React.FC = () => {
  // Mock Data State
  const [data, setData] = useState<{ time: string; price: number }[]>([]);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [balance, setBalance] = useState(10000); // Saldo simulado
  const [shares, setShares] = useState(0);
  const [trend, setTrend] = useState(0); // Tendência de mercado

  // Initialize Data
  useEffect(() => {
    const initialData = [];
    let price = 100;
    for (let i = 0; i < 20; i++) {
      initialData.push({ time: i.toString(), price: price });
      price = price * (1 + (Math.random() - 0.5) * 0.05);
    }
    setData(initialData);
    setCurrentPrice(price);
  }, []);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const lastPrice = prevData[prevData.length - 1].price;
        // Random walk volatility
        const change = (Math.random() - 0.5 + trend) * 0.03; 
        const newPrice = Math.max(1, lastPrice * (1 + change));
        
        // Update Trend randomly occasionally
        if (Math.random() > 0.9) setTrend((Math.random() - 0.5) * 0.05);

        const newData = [...prevData.slice(1), { time: Date.now().toString(), price: newPrice }];
        setCurrentPrice(newPrice);
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trend]);

  const handleBuy = () => {
    if (balance >= currentPrice) {
      setBalance(prev => prev - currentPrice);
      setShares(prev => prev + 1);
    }
  };

  const handleSell = () => {
    if (shares > 0) {
      setBalance(prev => prev + currentPrice);
      setShares(prev => prev - 1);
    }
  };

  const totalEquity = balance + (shares * currentPrice);
  const profit = totalEquity - 10000;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Simulador de Trade</h2>
        <span className="text-xs bg-neutral-800 text-gray-400 px-2 py-1 rounded border border-neutral-700">Modo Estudo</span>
      </div>

      {/* Stats Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl grid grid-cols-2 gap-4">
         <div>
           <p className="text-xs text-gray-500 uppercase">Saldo Disponível</p>
           <p className="text-xl font-bold text-white">{balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
         </div>
         <div className="text-right">
           <p className="text-xs text-gray-500 uppercase">Lucro/Prejuízo</p>
           <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
             {profit > 0 ? '+' : ''}{profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </p>
         </div>
      </div>

      {/* Chart Area */}
      <div className="bg-black border border-neutral-800 rounded-2xl p-4 h-64 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
           <p className="text-xs text-gray-500">TNS (Thanos Corp)</p>
           <p className="text-2xl font-bold text-white">{currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E10600" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#E10600" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
               contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
               itemStyle={{ color: '#E10600' }}
               formatter={(val: number) => val.toFixed(2)}
               labelFormatter={() => ''}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#E10600" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleSell}
          disabled={shares === 0}
          className="py-4 bg-red-900/30 border border-red-900/50 text-red-500 rounded-xl font-bold hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          VENDER
          <span className="block text-xs font-normal mt-1 opacity-70">Posição: {shares} ações</span>
        </button>
        
        <button 
          onClick={handleBuy}
          disabled={balance < currentPrice}
          className="py-4 bg-green-900/30 border border-green-900/50 text-green-500 rounded-xl font-bold hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          COMPRAR
          <span className="block text-xs font-normal mt-1 opacity-70">Max: {Math.floor(balance / currentPrice)}</span>
        </button>
      </div>

      <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-xs text-gray-500 text-center">
        <p>⚠️ Este é um ambiente de simulação. Nenhum valor real está sendo utilizado. Use para estudar oscilações de mercado.</p>
      </div>
    </div>
  );
};

export default TradeSimulator;