import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from './FinanceContext';
import { getThemeClasses } from '../utils/theme';
import { Bot, Send, Sparkles, User, RefreshCw, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export const AiAssistantView: React.FC = () => {
  const finance = useFinance();
  const themeClasses = getThemeClasses(finance.settings.themeColor);

  const agentInfoMap: Record<string, { name: string, desc: string, icon: string }> = {
    default: { name: 'Consultor Padrão', desc: 'Análise equilibrada, simpática e profissional.', icon: '💼' },
    investor: { name: 'Especialista em Investimentos', desc: 'Foco agressivo em juros compostos e patrimônio.', icon: '📈' },
    frugal: { name: 'Coach do Milhão (Frugal)', desc: 'Rigoroso e humorístico com gastos diários.', icon: '💸' },
    academic: { name: 'Analista Acadêmico', desc: 'Técnico, matemático e focado no modelo 50/30/20.', icon: '🎓' },
    friendly: { name: 'Amigo Conselheiro', desc: 'Empático, reduz o estresse e celebra pequenas vitórias.', icon: '🤝' },
  };

  const activeAgent = agentInfoMap[finance.settings.selectedAgent || 'default'] || agentInfoMap.default;
  
  const selectedProvider = finance.settings.selectedProvider || 'gemini';
  const providerNames: Record<string, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI (ChatGPT)',
    nvidia: 'Nvidia NIM',
    custom_openai: 'Personalizado',
  };
  const activeProviderName = providerNames[selectedProvider] || 'Google Gemini';

  let activeModel = finance.settings.selectedModel || 'gemini-2.5-flash';
  if (selectedProvider === 'openai') {
    activeModel = finance.settings.selectedModel || 'gpt-4o-mini';
  } else if (selectedProvider === 'nvidia') {
    activeModel = finance.settings.selectedModel || 'meta/llama-3.1-70b-instruct';
  } else if (selectedProvider === 'custom_openai') {
    activeModel = finance.settings.customOpenAiModel || 'custom-model';
  }

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        role: 'assistant',
        text: `Olá! Sou o seu ${activeAgent.name} (${activeAgent.icon}). ${activeAgent.desc}\n\nAnalisei todo o seu contexto financeiro (saldos, faturas, compromissos futuros de cartões, investimentos e metas) sob a ótica da minha especialidade e estou pronto para te dar insights estratégicos.\n\nComo posso te ajudar hoje?`,
      },
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const presetQuestions = [
    { text: 'Quanto vou gastar mês que vem?', label: 'Previsão Gastos Mês que Vem' },
    { text: 'Onde estou gastando mais?', label: 'Análise de Categorias de Gasto' },
    { text: 'Como posso me planejar para economizar?', label: 'Dicas de Economia' },
    { text: 'Avalie minhas finanças pela Regra 50/30/20.', label: 'Simular Regra 50/30/20' },
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorMsg(null);
    const userMessage: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Gather current snapshot
      const financialSnapshot = {
        accounts: finance.accounts,
        cards: finance.cards,
        transactions: finance.transactions,
        investments: finance.investments,
        debtors: finance.debtors,
        creditors: finance.creditors,
        goals: finance.goals,
        futureSummary: finance.getFutureSummary(),
      };

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(1), // omit the welcome message to optimize prompt context token limits
          financialData: financialSnapshot,
          customGeminiKey: finance.settings.customGeminiKey,
          selectedModel: finance.settings.selectedModel,
          selectedAgent: finance.settings.selectedAgent,
          selectedProvider: finance.settings.selectedProvider,
          customOpenAiKey: finance.settings.customOpenAiKey,
          customNvidiaKey: finance.settings.customNvidiaKey,
          customOpenAiBase: finance.settings.customOpenAiBase,
          customOpenAiModel: finance.settings.customOpenAiModel,
        }),
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
      } else {
        setErrorMsg(data.error || 'Não foi possível carregar a resposta do consultor IA.');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Não foi possível se comunicar com o servidor da IA. Verifique se o servidor está rodando ou se a chave GEMINI_API_KEY está configurada nos Segredos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Safe client-side Markdown formatter
  const renderFormattedText = (rawText: string) => {
    // Converts basic markdown syntax: lists, tables, bold, paragraphs
    return rawText.split('\n').map((line, idx) => {
      let content = line;

      // Handle bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-slate-900 font-extrabold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const finalLine = parts.length > 0 ? parts : content;

      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-extrabold text-slate-900 mt-4 mb-1.5">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-extrabold text-blue-600 mt-5 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-600 leading-relaxed mb-1">
            {line.replace(/^[\*\-]\s+/, '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return <p key={idx} className="text-xs text-slate-650 leading-relaxed mb-1.5">{finalLine}</p>;
    });
  };

  return (
    <div className="p-4 md:p-8 flex flex-col md:h-[calc(100vh-10px)] h-[calc(100vh-110px)] max-w-7xl mx-auto w-full text-slate-800">
      {/* Header */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Foresight com Inteligência Artificial</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
            <Bot className={themeClasses.text} size={28} />
            Assistente Financeiro IA
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            A IA analisa de forma consolidada todos os seus gastos passados e faturas futuras para sugerir economia e metas de forma preditiva.
          </p>
        </div>

        {/* Active Agent & Model Badge Info */}
        <div className="flex flex-wrap gap-2 self-start md:self-center">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs">
            <span className="text-base leading-none shrink-0">{activeAgent.icon}</span>
            <div className="leading-tight text-left">
              <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Agente</span>
              <span className="font-extrabold text-slate-850">{activeAgent.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs">
            <Sparkles className={`w-3.5 h-3.5 shrink-0 ${themeClasses.text}`} />
            <div className="leading-tight text-left">
              <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">{activeProviderName}</span>
              <span className="font-extrabold text-slate-850 font-mono text-[10px]">{activeModel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Questions Panel */}
      <div className="shrink-0 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {presetQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q.text)}
            className={`p-3 text-left bg-white border border-slate-200 rounded-2xl hover:border-slate-350 hover:bg-slate-50/50 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-sm flex flex-col justify-between h-20`}
            disabled={isLoading}
          >
            <Sparkles size={14} className={`${themeClasses.text} shrink-0`} />
            <span className="leading-tight">{q.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto mt-6 p-4 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col space-y-4 shadow-inner min-h-[250px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-250 text-slate-700 border border-slate-300' : `${themeClasses.bg} text-white`}`}>
              {msg.role === 'user' ? <User size={16} /> : <span className="text-base">{activeAgent.icon}</span>}
            </div>
            <div className={`rounded-2xl p-4 text-xs shadow-sm ${msg.role === 'user' ? `${themeClasses.bg} text-white font-medium` : 'bg-white border border-slate-200 text-slate-800'}`}>
              {msg.role === 'user' ? (
                <p className="leading-relaxed">{msg.text}</p>
              ) : (
                <div className="space-y-1">{renderFormattedText(msg.text)}</div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Spinner bubble */}
        {isLoading && (
          <div className="flex gap-4 self-start max-w-[85%]">
            <div className={`w-9 h-9 rounded-xl ${themeClasses.bg} text-white flex items-center justify-center shrink-0`}>
              <RefreshCw size={16} className="animate-spin" />
            </div>
            <div className="rounded-2xl p-4 text-xs bg-white border border-slate-200 text-slate-500 flex items-center gap-2 shadow-sm">
              <Sparkles size={14} className={`animate-pulse ${themeClasses.text}`} />
              <span>O {activeAgent.name} está cruzando seus dados financeiros sob medida...</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex gap-2 self-center max-w-lg mt-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
        className="shrink-0 mt-4 flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className={`flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-sm`}
          placeholder={`Pergunte ao ${activeAgent.name}: Posso comprar uma TV de R$ 3.000? Quanto vou gastar mês que vem?`}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`${themeClasses.bg} ${themeClasses.bgHover} text-white p-3.5 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 shadow-md`}
          disabled={isLoading || !inputValue.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
