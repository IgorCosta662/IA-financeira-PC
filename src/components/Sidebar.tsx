import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { getThemeClasses } from '../utils/theme';
import {
  LayoutDashboard,
  CreditCard,
  ArrowUpDown,
  TrendingUp,
  Users,
  Target,
  Bell,
  Bot,
  FileText,
  Database,
  Menu,
  X,
  Coins,
  Shield,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, alerts, security, setPinVerified, settings } = useFinance();
  const [isOpen, setIsOpen] = useState(false);

  const themeClasses = getThemeClasses(settings.themeColor);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Contas Bancárias', icon: Coins },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard },
    { id: 'transactions', label: 'Lançamentos', icon: ArrowUpDown },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'debts', label: 'Dívidas & Cobranças', icon: Users },
    { id: 'goals', label: 'Metas Financeiras', icon: Target },
    { id: 'assistant', label: 'Assistente IA', icon: Bot, highlight: true },
    { id: 'reports', label: 'Relatórios & Export', icon: FileText },
    { id: 'backup', label: 'Sincronização & PIN', icon: Database },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNav = (viewId: string) => {
    setActiveView(viewId);
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (security.pinEnabled) {
      setPinVerified(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 text-slate-900 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className={`${themeClasses.bg} text-white p-1.5 rounded-lg flex items-center justify-center`}>
            <TrendingUp size={16} />
          </div>
          <span className="font-bold tracking-tight text-slate-900">Finança AI <span className={themeClasses.text}>Ultimate</span></span>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-700 p-1 focus:outline-none"
          id="btn-mobile-menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 text-slate-600 flex flex-col justify-between transition-transform duration-300 transform md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isOpen ? 'pt-0' : 'pt-0'} md:h-screen h-[calc(100vh-53px)]`}
      >
        <div className="flex flex-col overflow-y-auto">
          {/* Brand Logo */}
          <div className="hidden md:flex items-center gap-2 px-6 py-6 border-b border-slate-100">
            <div className={`text-white p-2 rounded-xl flex items-center justify-center shadow-md ${themeClasses.bg} ${themeClasses.shadow}`}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-slate-900 leading-none">Finança AI</h1>
              <span className={`text-[10px] ${themeClasses.text} font-semibold tracking-wider uppercase`}>Ultimate v2.0</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? `${themeClasses.bg} text-white font-semibold shadow-md ${themeClasses.shadow}`
                        : `${themeClasses.bgLight} ${themeClasses.textLight} font-semibold rounded-lg`
                      : item.highlight
                      ? `${themeClasses.text} hover:bg-slate-50 hover:${themeClasses.textHover} font-semibold border border-slate-200/30 rounded-lg`
                      : 'hover:bg-slate-50 hover:text-slate-900 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'backup' && security.pinEnabled && (
                    <Shield size={14} className={themeClasses.text} />
                  )}
                  {item.id === 'dashboard' && alerts.length > 0 && (
                    <span className="bg-rose-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                      {alerts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Assistant Active Card & User Footer */}
        <div className="flex flex-col">
          {/* AI Info Card inside Sidebar */}
          <div className="p-4 border-t border-slate-100">
            <div className={`${
              settings.themeColor === 'purple' ? 'bg-purple-900' :
              settings.themeColor === 'emerald' ? 'bg-emerald-900' :
              settings.themeColor === 'slate' ? 'bg-slate-800' :
              'bg-blue-900'
            } rounded-xl p-4 text-white shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 ${
                  settings.themeColor === 'purple' ? 'bg-purple-300' :
                  settings.themeColor === 'emerald' ? 'bg-emerald-300' :
                  settings.themeColor === 'slate' ? 'bg-slate-400' :
                  'bg-blue-300'
                } rounded-full animate-pulse`}></div>
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-85">Assistente Ativo</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Poupe até R$ 450,00 este mês. Peça sugestões na aba Assistente IA.
              </p>
            </div>
          </div>

          {/* User Account State Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${themeClasses.bgLight} ${themeClasses.textLight} flex items-center justify-center font-bold text-sm shadow-inner shrink-0`}>
                  {getInitials(settings.userName)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-900 leading-none truncate">{settings.userName}</p>
                  <span className="text-[10px] text-slate-500 truncate block">Premium Advisor</span>
                </div>
              </div>
              {security.pinEnabled && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                  title="Bloquear aplicativo"
                  id="btn-lock-app"
                >
                  <Shield size={16} className="text-rose-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
