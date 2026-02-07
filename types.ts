export type Category = 'Alimentação' | 'Transporte' | 'Educação' | 'Lazer' | 'Saúde' | 'Investimento' | 'Outros' | 'Renda';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO String
  type: 'expense' | 'income';
}

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  icon: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  type: 'Renda Fixa' | 'Cripto' | 'Ações' | 'Negócios' | 'FIIs';
  performance?: number; // Porcentagem
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTransactionConfirmation?: boolean;
}

// AI Response Schema
export interface AIAnalysisResponse {
  reply: string;
  transaction?: {
    amount: number;
    description: string;
    category: string;
    type: 'expense' | 'income';
  } | null;
}

// Gamification Types
export interface UserStats {
  xp: number;
  level: number;
  rankTitle: string;
}

export interface InfinityStones {
  power: boolean;   // Renda > Despesa
  space: boolean;   // Hábitos > 50%
  reality: boolean; // Investimentos > 0
  soul: boolean;    // Metas criadas
  time: boolean;    // Usou o Chat
  mind: boolean;    // Saldo Positivo
}