import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Send, Loader2 } from 'lucide-react';
import { LifeOSService } from '../../kernel/services/LifeOSService';
import { FinanceService } from '../../kernel/services/FinanceService';
import { GymService } from '../../kernel/services/GymService';
import '../styles/design-tokens.css';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const MentorView: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        parts: [{ text: '¡Hola guerrero! Soy tu Mentor de HorumLife. Estoy monitoreando tus stats de XP, tus finanzas y tu gym. ¿Qué misión o duda tienes hoy?' }]
      }]);
    }
  }, [messages.length]);

  const generateSystemPrompt = () => {
    const profile = LifeOSService.getInstance().getPlayerProfile();
    const budget = FinanceService.getInstance().getCurrentBudget();
    const gymSessions = GymService.getInstance().getSessions();
    const todayStatus = LifeOSService.getInstance().getTodayStatus();
    
    let lastWorkout = "No hay registros.";
    if (gymSessions.length > 0) {
      const last = gymSessions[0];
      lastWorkout = `${new Date(last.date).toLocaleDateString()} (${last.durationMinutes} min, ${last.logs.length} ejercicios)`;
    }

    return `
Eres el Mentor IA de HorumLife, un sistema de Life OS gamificado (estilo RPG). 
Actúas como un consejero sabio, directo y motivador. Tuteas al usuario.
CONTEXTO ACTUAL DEL JUGADOR:
- Stats: Fuerza Nvl.${profile.skills.fuerza.level} | Intelecto Nvl.${profile.skills.intelecto.level} | Vitalidad Nvl.${profile.skills.vitalidad.level} | Carisma Nvl.${profile.skills.carisma.level}
- Monedas: ${profile.horumCoins} HorumCoins
- Presupuesto Mensual: Ingresos $${budget?.totalIncome || 0}, Gastado $${budget?.currentSpend || 0}, Meta Ahorro $${budget?.targetSavings || 0}
- Último entrenamiento de gym: ${lastWorkout}
- Estado de hoy: Energía ${todayStatus.energyLevel}%, Vasos de agua: ${todayStatus.waterGlasses}, Trabajo profundo: ${todayStatus.deepWorkMinutes} min.

REGLAS:
1. Responde de forma CONCISA (máximo 3 párrafos cortos).
2. Usa emojis relevantes.
3. Da consejos accionables basados en sus estadísticas actuales (ej. si ha gastado mucho, si su energía está baja, si no ha ido al gym).
4. Eres parte del juego, mantén la inmersión RPG a veces (habla de "XP", "quests", "hp", "nivel").
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input.trim() }] };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key no configurada en .env");
      }

      // Prepare history (excluding our hardcoded initial greeting to save tokens if we want, but it's fine to include)
      // Gemini API expects user/model alternating, but our initial greeting is 'model'. 
      // If the first message is 'model', Gemini might complain (it wants 'user' first for history). 
      // So we will just send the actual conversation history starting from the first user message.
      const apiHistory = newMessages.filter((m, i) => !(i === 0 && m.role === 'model'));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: apiHistory,
            systemInstruction: { parts: [{ text: generateSystemPrompt() }] }
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Error en la API");
      }

      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, mi conexión psíquica se interrumpió.";
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: botReply }] }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Error de conexión: ${error.message}` }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container} className="ios-scroll">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mentor IA</h1>
          <p style={styles.subtitle}>Tu consejero personal</p>
        </div>
        <BrainCircuit size={28} color="var(--accent-orange)" />
      </div>

      <div style={styles.chatArea}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.role === 'user' ? styles.userMessage : styles.botMessage}>
            {/* Simple Markdown Bold parsing */}
            {msg.parts[0].text.split('\n').map((line, i) => (
              <p key={i} style={{ margin: '0 0 8px 0' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
            ))}
          </div>
        ))}
        {isLoading && (
          <div style={{...styles.botMessage, display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7}}>
            <Loader2 size={16} className="spinner" /> Pensando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input 
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda o misión..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <button 
          style={{ ...styles.sendButton, opacity: isLoading || !input.trim() ? 0.5 : 1 }} 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          <Send size={18} color="#fff" />
        </button>
      </div>

      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '24px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexShrink: 0,
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    margin: 0,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    paddingBottom: '20px',
    paddingRight: '4px',
  },
  botMessage: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '14px 16px',
    borderRadius: '16px',
    borderTopLeftRadius: '4px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: 1.5,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  userMessage: {
    background: 'linear-gradient(135deg, var(--accent-orange), #d97706)',
    padding: '14px 16px',
    borderRadius: '16px',
    borderTopRightRadius: '4px',
    color: '#fff',
    fontSize: '14px',
    lineHeight: 1.5,
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto',
    paddingTop: '16px',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    borderRadius: '24px',
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontSize: '15px',
    outline: 'none',
  },
  sendButton: {
    background: 'var(--accent-orange)',
    border: 'none',
    borderRadius: '50%',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  }
};
