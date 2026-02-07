import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Define the response schema for structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: "Uma resposta na persona 'Thanos Finance'. Se for um conselho, pode ser mais elaborado e filosófico sobre equilíbrio e poder. Se for transação, seja breve.",
    },
    transaction: {
      type: Type.OBJECT,
      nullable: true,
      description: "Dados da transação extraídos se o usuário mencionar gastar ou ganhar dinheiro.",
      properties: {
        amount: { type: Type.NUMBER },
        description: { type: Type.STRING },
        category: { 
          type: Type.STRING, 
          description: "Uma das: Alimentação, Transporte, Educação, Lazer, Saúde, Investimento, Outros, Renda" 
        },
        type: { 
          type: Type.STRING, 
          enum: ["expense", "income"] 
        },
      },
    },
  },
  required: ["reply"],
};

export const sendMessageToGemini = async (
  message: string, 
  history: { role: string; parts: { text: string }[] }[]
): Promise<AIAnalysisResponse> => {
  if (!apiKey) {
    return {
      reply: "A Joia da Mente (API Key) está faltando. Não posso funcionar sem poder.",
      transaction: null
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // We use generateContent with a system instruction to enforce persona and task
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: `
          Você é o 'Thanos Finance'. Um mentor financeiro que mistura estoicismo, disciplina militar e a filosofia do Titã Louco.
          
          Persona:
          - Fale em Português do Brasil.
          - Use metáforas sobre equilíbrio, destino, recursos e poder.
          - Se o usuário pedir conselhos, elabore uma resposta inspiradora e rigorosa. Não precisa ser curto demais, o importante é o impacto.
          - Se o usuário registrar um gasto fútil, questione se isso era "inevitável".
          - Se o usuário registrar um investimento, reconheça a visão de longo prazo.
          
          Tarefa:
          1. Analise o texto do usuário.
          2. Se ele mencionar gastar dinheiro (ex: "comprei um livro por 50"), extraia os dados para o campo 'transaction'. 
             - Use 'expense' para gastos e 'income' para ganhos (salário, vendas).
             - Categorize corretamente em Português (Alimentação, Transporte, etc).
          3. Se for apenas uma conversa ou pedido de conselho, defina 'transaction' como null.
          4. Forneça uma resposta ('reply') reagindo ao usuário.
        `,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do Thanos.");

    const parsed: AIAnalysisResponse = JSON.parse(text);
    return parsed;

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      reply: "O universo está desequilibrado. Não consegui processar essa requisição. (Erro de API)",
      transaction: null
    };
  }
};