import React, { useState } from 'react';

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "O Equilíbrio Começa",
      text: "Bem-vindo ao Thanos Finance. Sua missão é trazer ordem ao caos financeiro e pessoal.",
      icon: "🧤"
    },
    {
      title: "As Joias do Infinito",
      text: "No topo do Dashboard, você verá a Manopla. Complete tarefas (investir, poupar, cumprir hábitos) para acender as 6 Joias e ganhar XP.",
      icon: "💎"
    },
    {
      title: "Simulador de Mercado",
      text: "Novo! Use a aba 'Simulador' para praticar Day Trade com dinheiro fictício sem arriscar seu patrimônio real.",
      icon: "📈"
    },
    {
      title: "Inteligência Suprema",
      text: "Use o Chat ou a Voz (Live) para falar com o Thanos. Ele analisará seus gastos e dará conselhos implacáveis.",
      icon: "🧠"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-sm rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-thanos-red transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />

        <div className="text-center space-y-6">
          <div className="text-6xl animate-bounce-slow">{steps[step].icon}</div>
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{steps[step].title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{steps[step].text}</p>
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {step === steps.length - 1 ? "Entendido, Iniciar" : "Próximo"}
          </button>
        </div>

        {/* Decorative Background */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-thanos-red/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </div>
  );
};

export default Tutorial;