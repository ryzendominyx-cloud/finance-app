import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";

const LiveVoice: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Refs
  const videoEl = useRef<HTMLVideoElement>(null);
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const connectToLive = async () => {
    setError(null);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      
      // Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setIsConnected(true);
            
            // Start processing input audio
            if (!inputAudioContextRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               setIsTalking(true);
               await playAudio(base64Audio);
               // Simple timeout to turn off talking visual after a bit if no more chunks come
               setTimeout(() => setIsTalking(false), 500); 
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              cancelAudio();
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setError("Conexão perdida com o Titã.");
            setIsConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "Você é o Thanos Finance. Um assistente financeiro implacável e motivador. Fale em Português. Seja direto, use metáforas de equilíbrio e poder. Se o usuário falar sobre gastos, critique construtivamente. Se falar sobre ganhos, incentive a acumulação. Seja conversacional, como uma chamada de voz real."
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erro ao conectar");
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    sessionRef.current?.then((session: any) => session.close());
    setIsConnected(false);
    setIsTalking(false);
  };

  const playAudio = async (base64String: string) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const arrayBuffer = decode(base64String);
    const audioBuffer = await decodeAudioData(arrayBuffer, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    
    source.onended = () => {
      sourcesRef.current.delete(source);
    };
    sourcesRef.current.add(source);
  };

  const cancelAudio = () => {
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-radial-gradient from-red-900/20 to-transparent transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`} />

      {/* Main UI */}
      <div className="z-10 text-center space-y-8">
        <h2 className="text-2xl font-bold tracking-widest uppercase text-white drop-shadow-lg">
          {isConnected ? "Ligação Direta" : "Canal de Voz"}
        </h2>
        
        {/* The Reactor / Orb */}
        <div className="relative group cursor-pointer" onClick={isConnected ? disconnect : connectToLive}>
          <div className={`
            w-48 h-48 rounded-full border-4 flex items-center justify-center
            transition-all duration-500 relative z-10 bg-black
            ${isConnected 
              ? 'border-thanos-red shadow-[0_0_50px_rgba(225,6,0,0.6)] scale-110' 
              : 'border-neutral-700 hover:border-gray-500'
            }
          `}>
             {/* Core Animation */}
             <div className={`
               w-32 h-32 rounded-full transition-all duration-200
               ${isConnected 
                 ? `bg-thanos-red ${isTalking ? 'animate-pulse scale-95 opacity-80' : 'opacity-20'}`
                 : 'bg-neutral-800'
               }
             `}></div>
             
             {/* Icon */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {!isConnected ? (
                 <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                 </svg>
               ) : (
                 <svg className="w-12 h-12 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               )}
             </div>
          </div>
          
          {/* Ring Animations */}
          {isConnected && (
            <>
              <div className="absolute inset-0 rounded-full border border-thanos-red/50 animate-ping opacity-20"></div>
              <div className="absolute -inset-4 rounded-full border border-thanos-red/30 animate-spin-slow opacity-30 border-dashed"></div>
            </>
          )}
        </div>

        <p className="text-gray-400 text-sm max-w-xs mx-auto min-h-[20px]">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : isConnected ? (
            isTalking ? "O Titã está falando..." : "Escutando..."
          ) : (
            "Toque no núcleo para iniciar a conexão com o Thanos."
          )}
        </p>
      </div>
    </div>
  );
};

// --- Helper Functions ---

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default LiveVoice;