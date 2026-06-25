import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { getThemeClasses } from '../utils/theme';
import { Settings, User, DollarSign, EyeOff, Palette, AlertTriangle, Check, RefreshCw, Bot, Key, Brain, Eye, Link, Cpu } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useFinance();
  const themeClasses = getThemeClasses(settings.themeColor);

  const [name, setName] = useState(settings.userName);
  const [currency, setCurrency] = useState(settings.currency);
  const [theme, setTheme] = useState(settings.themeColor);
  const [hideBalance, setHideBalance] = useState(settings.hideBalanceDefault);
  
  // AI States
  const [selectedProvider, setSelectedProvider] = useState(settings.selectedProvider || 'gemini');
  const [customGeminiKey, setCustomGeminiKey] = useState(settings.customGeminiKey || '');
  const [customOpenAiKey, setCustomOpenAiKey] = useState(settings.customOpenAiKey || '');
  const [customNvidiaKey, setCustomNvidiaKey] = useState(settings.customNvidiaKey || '');
  const [customOpenAiBase, setCustomOpenAiBase] = useState(settings.customOpenAiBase || '');
  const [customOpenAiModel, setCustomOpenAiModel] = useState(settings.customOpenAiModel || '');
  
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel || 'gemini-2.5-flash');
  const [selectedAgent, setSelectedAgent] = useState(settings.selectedAgent || 'default');
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showNvidiaKey, setShowNvidiaKey] = useState(false);
  
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleProviderChange = (provider: 'gemini' | 'openai' | 'nvidia' | 'custom_openai') => {
    setSelectedProvider(provider);
    if (provider === 'gemini') {
      setSelectedModel('gemini-2.5-flash');
    } else if (provider === 'openai') {
      setSelectedModel('gpt-4o-mini');
    } else if (provider === 'nvidia') {
      setSelectedModel('meta/llama-3.1-70b-instruct');
    } else if (provider === 'custom_openai') {
      setSelectedModel(customOpenAiModel || 'custom-model');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      userName: name || 'Finança AI',
      currency,
      themeColor: theme,
      hideBalanceDefault: hideBalance,
      customGeminiKey: customGeminiKey,
      selectedModel: selectedModel,
      selectedAgent: selectedAgent,
      selectedProvider,
      customOpenAiKey,
      customNvidiaKey,
      customOpenAiBase,
      customOpenAiModel,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleReset = () => {
    resetAllData();
    setShowConfirmReset(false);
    alert('Todos os dados foram redefinidos para os padrões de fábrica.');
    window.location.reload();
  };

  // Color theme previews
  const themes = [
    { id: 'blue', name: 'Azul Clássico', color: 'bg-blue-600' },
    { id: 'purple', name: 'Violeta Premium', color: 'bg-purple-600' },
    { id: 'emerald', name: 'Verde Esmeralda', color: 'bg-emerald-600' },
    { id: 'slate', name: 'Grafite Minimalista', color: 'bg-slate-700' },
  ] as const;

  const models = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Mais rápido, moderno e recomendado' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Raciocínio complexo e insights profundos' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Excelente velocidade de geração' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Modelo clássico equilibrado' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Modelo clássico de alta capacidade' },
  ];

  const agents = [
    { id: 'default', name: '💼 Consultor Padrão', desc: 'Simpático, equilibrado e direto nas finanças cotidianas.' },
    { id: 'investor', name: '📈 Especialista em Investimentos', desc: 'Focado em renda variável, dividendos, aportes e juros compostos.' },
    { id: 'frugal', name: '💸 Coach do Milhão (Frugal)', desc: 'Extremamente rígido! Critica gastos supérfluos e te faz economizar cada centavo.' },
    { id: 'academic', name: '🎓 Analista Acadêmico', desc: 'Altamente matemático, técnico, estruturando cálculos pelo modelo 50/30/20.' },
    { id: 'friendly', name: '🤝 Amigo Conselheiro', desc: 'Empático, paciente e calmo. Reduz a ansiedade financeira e apoia suas decisões.' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Painel de Controle</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
            <Settings className={`${themeClasses.text} animate-spin-slow`} size={28} />
            Configurações do Sistema
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Personalize sua experiência, mude preferências de exibição e controle as definições do seu aplicativo de finanças.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <User size={18} className={themeClasses.text} />
              Perfil & Preferências Gerais
            </h3>

            {/* User Name input */}
            <div className="space-y-2">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Nome do Usuário ou Programa</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium`}
                  placeholder="Ex: Finança AI Ultimate"
                />
                <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              </div>
              <p className="text-[10px] text-slate-400">Este nome aparecerá no painel e na barra lateral como o administrador do sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Currency Select */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Moeda Principal</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'BRL' | 'USD' | 'EUR')}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium appearance-none`}
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                  <DollarSign className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Hide Balance Default */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Privacidade de Saldos</label>
                <label className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer transition-colors h-[46px]">
                  <input
                    type="checkbox"
                    checked={hideBalance}
                    onChange={(e) => setHideBalance(e.target.checked)}
                    className={`rounded ${themeClasses.text} focus:ring-slate-400 h-4 w-4 border-slate-300`}
                  />
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                    <EyeOff size={14} className="text-slate-500" />
                    <span>Ocultar saldos por padrão</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Theme Picker */}
            <div className="space-y-3">
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                <Palette size={14} className={themeClasses.text} />
                Tema Visual de Destaque
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themes.map((t) => {
                  const itemTheme = getThemeClasses(t.id);
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? `border-slate-900 bg-slate-900 text-white font-bold ring-2 ring-slate-950/20`
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${t.color} shrink-0 shadow-inner`} />
                      <span className="text-xs truncate">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI CONFIGURATIONS SECTION */}
            <div className="border-t border-slate-100 pt-6 space-y-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Brain size={18} className={themeClasses.text} />
                Configurações da Inteligência Artificial (IA)
              </h3>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                  <Cpu size={14} className={themeClasses.text} />
                  Provedor de Inteligência Artificial
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'gemini', name: 'Google Gemini', icon: '✨' },
                    { id: 'openai', name: 'OpenAI (ChatGPT)', icon: '🟢' },
                    { id: 'nvidia', name: 'Nvidia NIM', icon: '💚' },
                    { id: 'custom_openai', name: 'Personalizado', icon: '⚙️' },
                  ].map((p) => {
                    const isSelected = selectedProvider === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleProviderChange(p.id as any)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-sm'
                            : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs shrink-0">{p.icon}</span>
                        <span className="text-[11px] font-bold truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Credentials & Model Input based on Provider */}
              {selectedProvider === 'gemini' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                      <Key size={14} className={themeClasses.text} />
                      Chave de API do Gemini (Opcional)
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={customGeminiKey}
                        onChange={(e) => setCustomGeminiKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                        placeholder="Cole sua API Key do Gemini aqui (ou deixe vazio para usar a do servidor)"
                      />
                      <Key className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Se você deixar vazio, utilizaremos nossa chave padrão do servidor. Se inserir a sua, ela será usada diretamente nas consultas.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                      <Bot size={14} className={themeClasses.text} />
                      Modelo do Gemini
                    </label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium appearance-none`}
                      >
                        {[
                          { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recomendado)', desc: 'Mais rápido e dinâmico' },
                          { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Raciocínio Superior)', desc: 'Para análises extremamente ricas' },
                          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Altíssima velocidade' },
                          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Legado equilibrado' },
                        ].map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <Bot className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedProvider === 'openai' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                      <Key size={14} className={themeClasses.text} />
                      Chave de API da OpenAI (ChatGPT)
                    </label>
                    <div className="relative">
                      <input
                        type={showOpenAiKey ? 'text' : 'password'}
                        value={customOpenAiKey}
                        onChange={(e) => setCustomOpenAiKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                        placeholder="sk-proj-..."
                      />
                      <Key className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <button
                        type="button"
                        onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showOpenAiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Obrigatório para o uso do ChatGPT. Sua chave é guardada apenas localmente no seu navegador e enviada com segurança para as rotas do backend.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                      <Bot size={14} className={themeClasses.text} />
                      Modelo OpenAI
                    </label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium appearance-none`}
                      >
                        {[
                          { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Leve e Econômico - Recomendado)' },
                          { id: 'gpt-4o', name: 'GPT-4o (Modelo Avançado)' },
                          { id: 'o1-mini', name: 'o1 Mini (Modelo de Raciocínio Lógico)' },
                          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
                          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
                        ].map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <Bot className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedProvider === 'nvidia' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                      <Key size={14} className={themeClasses.text} />
                      Chave de API da NVIDIA NIM
                    </label>
                    <div className="relative">
                      <input
                        type={showNvidiaKey ? 'text' : 'password'}
                        value={customNvidiaKey}
                        onChange={(e) => setCustomNvidiaKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                        placeholder="nvapi-..."
                      />
                      <Key className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <button
                        type="button"
                        onClick={() => setShowNvidiaKey(!showNvidiaKey)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showNvidiaKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Obrigatório para o uso dos modelos acelerados no ecossistema Nvidia NIM. Pegue sua chave em build.nvidia.com.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                      <Bot size={14} className={themeClasses.text} />
                      Modelo NVIDIA NIM
                    </label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium appearance-none`}
                      >
                        {[
                          { id: 'meta/llama-3.1-70b-instruct', name: 'Meta Llama 3.1 70B Instruct' },
                          { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'NVIDIA Llama 3.1 Nemotron 70B' },
                          { id: 'mistralai/mixtral-8x22b-instruct-v0.1', name: 'Mistral Mixtral 8x22B MoE' },
                          { id: 'microsoft/phi-3-medium-128k-instruct', name: 'Microsoft Phi-3 Medium' },
                        ].map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <Bot className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedProvider === 'custom_openai' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                        <Link size={14} className={themeClasses.text} />
                        Base URL (OpenAI-compatible)
                      </label>
                      <input
                        type="text"
                        value={customOpenAiBase}
                        onChange={(e) => setCustomOpenAiBase(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                        placeholder="Ex: https://api.groq.com/openai/v1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                        <Bot size={14} className={themeClasses.text} />
                        Nome do Modelo Customizado
                      </label>
                      <input
                        type="text"
                        value={customOpenAiModel}
                        onChange={(e) => {
                          setCustomOpenAiModel(e.target.value);
                          setSelectedModel(e.target.value);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                        placeholder="Ex: llama3-70b-8192"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                      <Key size={14} className={themeClasses.text} />
                      Chave de API Customizada
                    </label>
                    <div className="relative">
                      <input
                        type={showOpenAiKey ? 'text' : 'password'}
                        value={customOpenAiKey}
                        onChange={(e) => setCustomOpenAiKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                        placeholder="gsk_..."
                      />
                      <Key className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <button
                        type="button"
                        onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showOpenAiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Use para integrar com Groq, DeepSeek, OpenRouter, Claude (via Proxy), ou qualquer outra API compatível com o padrão de completions da OpenAI.
                    </p>
                  </div>
                </div>
              )}

              {/* Agent Personality Selector and Badge */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                    <Brain size={14} className={themeClasses.text} />
                    Personalidade do Agente (Persona)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium appearance-none`}
                    >
                      {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <Brain className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex items-start gap-3 h-[85px] self-end overflow-y-auto">
                  <span className="text-2xl shrink-0 leading-none">
                    {agents.find(a => a.id === selectedAgent)?.name.split(' ')[0] || '💼'}
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {agents.find(a => a.id === selectedAgent)?.name.substring(3) || 'Consultor Padrão'}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      {agents.find(a => a.id === selectedAgent)?.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
              <button
                type="submit"
                className={`${themeClasses.bg} ${themeClasses.bgHover} text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md ${themeClasses.shadow} transition-all flex items-center gap-2`}
              >
                <Check size={14} />
                Salvar Configurações
              </button>
            </div>

            {savedMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 flex items-center gap-2 animate-fade-in">
                <Check size={14} className="text-emerald-600" />
                <span>Configurações salvas com sucesso! O tema, preferências e configurações da IA foram atualizados.</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Danger Zone & Info */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className={`bg-gradient-to-br ${
            theme === 'purple' ? 'from-purple-900 to-slate-950' :
            theme === 'emerald' ? 'from-emerald-900 to-slate-950' :
            theme === 'slate' ? 'from-slate-800 to-slate-950' :
            'from-blue-900 to-slate-950'
          } text-white rounded-3xl p-6 shadow-md space-y-4`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${
              theme === 'purple' ? 'text-purple-300' :
              theme === 'emerald' ? 'text-emerald-300' :
              theme === 'slate' ? 'text-slate-300' :
              'text-blue-300'
            }`}>Sobre o Sistema</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                <span className={`${
                  theme === 'purple' ? 'text-purple-200' :
                  theme === 'emerald' ? 'text-emerald-200' :
                  theme === 'slate' ? 'text-slate-200' :
                  'text-blue-200'
                } font-medium`}>Nome do App:</span>
                <span className="font-semibold">{name || 'Finança AI'}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                <span className={`${
                  theme === 'purple' ? 'text-purple-200' :
                  theme === 'emerald' ? 'text-emerald-200' :
                  theme === 'slate' ? 'text-slate-200' :
                  'text-blue-200'
                } font-medium`}>Versão Ativa:</span>
                <span className="font-semibold">v2.1 (Customized)</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                <span className={`${
                  theme === 'purple' ? 'text-purple-200' :
                  theme === 'emerald' ? 'text-emerald-200' :
                  theme === 'slate' ? 'text-slate-200' :
                  'text-blue-200'
                } font-medium`}>Motor de Inteligência:</span>
                <span className="font-semibold font-mono text-[11px]">{selectedModel}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={`${
                  theme === 'purple' ? 'text-purple-200' :
                  theme === 'emerald' ? 'text-emerald-200' :
                  theme === 'slate' ? 'text-slate-200' :
                  'text-blue-200'
                } font-medium`}>Agente de Voz/Chat:</span>
                <span className="font-semibold">{agents.find(a => a.id === selectedAgent)?.name || 'Consultor'}</span>
              </div>
            </div>
            <p className={`text-[10px] ${
              theme === 'purple' ? 'text-purple-200/80' :
              theme === 'emerald' ? 'text-emerald-200/80' :
              theme === 'slate' ? 'text-slate-200/80' :
              'text-blue-200/80'
            } leading-relaxed pt-2`}>
              Desenvolvido com análise preditiva, projeção sob medida e controle financeiro integrado de alta performance com a personalidade do agente ativa.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 border border-red-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle size={18} className="text-rose-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Zona de Perigo</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              A redefinição limpará permanentemente todas as contas bancárias, lançamentos, cartões, dívidas, metas e configurações do navegador de maneira irreversível.
            </p>
            
            {showConfirmReset ? (
              <div className="space-y-3 pt-2">
                <p className="text-[10px] text-red-700 font-bold">Você tem certeza absoluta? Essa ação não pode ser desfeita!</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] py-2 rounded-xl transition-all"
                  >
                    Sim, Redefinir Tudo
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] py-2 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                Limpar Banco de Dados
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
