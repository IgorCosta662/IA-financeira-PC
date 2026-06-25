import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './components/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AccountsView } from './components/AccountsView';
import { CardsView } from './components/CardsView';
import { TransactionsView } from './components/TransactionsView';
import { InvestmentsView } from './components/InvestmentsView';
import { DebtsView } from './components/DebtsView';
import { GoalsView } from './components/GoalsView';
import { AiAssistantView } from './components/AiAssistantView';
import { ReportsView } from './components/ReportsView';
import { BackupSecurityView } from './components/BackupSecurityView';
import { SettingsView } from './components/SettingsView';
import { ShieldCheck, Lock, ChevronRight } from 'lucide-react';

function AppContent() {
  const { activeView, setActiveView, security } = useFinance();
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Check if PIN is required on startup
  useEffect(() => {
    if (security.pinEnabled && security.pinCode) {
      setPinUnlocked(false);
    } else {
      setPinUnlocked(true);
    }
  }, [security]);

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === security.pinCode) {
      setPinUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // Render Lock Screen if required and locked
  if (!pinUnlocked) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-4 z-50 select-none">
        <form
          onSubmit={handlePinUnlock}
          className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center space-y-6 shadow-lg"
          id="pin-unlock-form"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Lock size={30} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Finança AI Ultimate</h2>
            <p className="text-xs text-slate-500 mt-1">Este dispositivo está protegido por um PIN de segurança de 4 dígitos.</p>
          </div>

          <div className="space-y-2 w-full">
            <input
              type="password"
              maxLength={4}
              required
              value={pinInput}
              onChange={e => {
                setPinError(false);
                setPinInput(e.target.value.replace(/\D/g, ''));
              }}
              className={`w-full bg-slate-50 border ${
                pinError ? 'border-rose-500' : 'border-slate-200 focus:border-blue-500'
              } rounded-2xl px-5 py-3.5 text-center text-xl font-bold text-slate-900 tracking-widest focus:outline-none`}
              placeholder="••••"
              autoFocus
            />
            {pinError && (
              <span className="text-[11px] text-rose-600 font-medium block">PIN de acesso incorreto. Tente novamente.</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-xs py-3.5 rounded-2xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10"
          >
            <span>Desbloquear Painel</span>
            <ChevronRight size={14} />
          </button>
        </form>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'accounts':
        return <AccountsView />;
      case 'cards':
        return <CardsView />;
      case 'transactions':
        return <TransactionsView />;
      case 'investments':
        return <InvestmentsView />;
      case 'debts':
        return <DebtsView />;
      case 'goals':
        return <GoalsView />;
      case 'assistant':
        return <AiAssistantView />;
      case 'reports':
        return <ReportsView />;
      case 'backup':
        return <BackupSecurityView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar for navigation */}
      <Sidebar />

      {/* Main workspace container */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
