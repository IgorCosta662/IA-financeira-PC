import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import { getThemeClasses } from '../utils/theme';
import {
  TrendingUp,
  CreditCard,
  Coins,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  Percent,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    accounts,
    cards,
    transactions,
    investments,
    debtors,
    creditors,
    alerts,
    getMonthlyCommitments,
    getFutureSummary,
    getCardInvoice,
    settings,
  } = useFinance();

  const themeClasses = getThemeClasses(settings.themeColor);

  const getThemeHex = (color: string) => {
    switch (color) {
      case 'purple':
        return '#9333ea';
      case 'emerald':
        return '#059669';
      case 'slate':
        return '#475569';
      case 'blue':
      default:
        return '#2563eb';
    }
  };

  const themeHex = getThemeHex(settings.themeColor);

  const [hideValues, setHideValues] = useState(settings.hideBalanceDefault);
  const [selectedFutureMonth, setSelectedFutureMonth] = useState<{ month: number; year: number; total: number; details: any[] } | null>(null);

  // Core Calculations for current month
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalInvestments = investments.reduce((sum, i) => sum + i.currentAmount, 0);
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Invoice sum for current month across all cards
  const totalCardsInvoice = cards.reduce((sum, c) => sum + getCardInvoice(c.id, currentYear, currentMonth).total, 0);

  // Debts from creditors
  const totalDebts = creditors
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + (c.amount * (c.installmentsCount - c.currentInstallment + 1)), 0);

  const totalReceivables = debtors
    .filter(d => d.status === 'pending' || d.status === 'overdue')
    .reduce((sum, d) => sum + d.amount, 0);

  // Net Worth
  const netWorth = totalBalance + totalInvestments + totalReceivables - totalCardsInvoice - totalDebts;

  // Available to spend (Checking account sum minus current invoices due)
  const checkingBalance = accounts.filter(a => a.type === 'checking' || a.type === 'digital_wallet').reduce((sum, a) => sum + a.balance, 0);
  const availableToSpend = Math.max(0, checkingBalance - totalCardsInvoice);

  // Income vs Expenses for current month
  const monthlyIncomes = transactions
    .filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && t.amount > 0;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && t.amount < 0;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Predictive Future Commitments
  const future = getFutureSummary();

  // Generate 12-Month commitments timeline for chart
  const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const timelineData = Array.from({ length: 12 }).map((_, index) => {
    const fDate = new Date(today.getFullYear(), today.getMonth() + index, 15);
    const m = fDate.getMonth() + 1;
    const y = fDate.getFullYear();
    const comm = getMonthlyCommitments(y, m);
    return {
      name: `${monthsNames[m - 1]}/${String(y).slice(2)}`,
      Commitments: comm.total,
      Installments: comm.installments,
      Subscriptions: comm.subscriptions,
      Debts: comm.debts,
      RecurringBills: comm.recurringBills,
      month: m,
      year: y,
    };
  });

  // Category Pie Chart Data for current month
  const categoryDataMap: Record<string, number> = {};
  transactions
    .filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && t.amount < 0;
    })
    .forEach(t => {
      const cat = t.category;
      categoryDataMap[cat] = (categoryDataMap[cat] || 0) + Math.abs(t.amount);
    });

  const categoryColors = {
    Alimentação: '#ef4444',
    Transporte: '#3b82f6',
    Saúde: '#10b981',
    Educação: '#f59e0b',
    Moradia: '#8b5cf6',
    Lazer: '#ec4899',
    Compras: '#eab308',
    Outros: '#6b7280',
  };

  const pieChartData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: +categoryDataMap[key].toFixed(2),
    color: categoryColors[key as keyof typeof categoryColors] || '#6b7280',
  }));

  const handleOpenFutureMonth = (data: any) => {
    const comm = getMonthlyCommitments(data.year, data.month);
    setSelectedFutureMonth({
      month: data.month,
      year: data.year,
      total: comm.total,
      details: comm.breakdown,
    });
  };

  const formatCurrency = (val: number) => {
    if (hideValues) return '••••••';
    return formatCurrencyUtil(val, settings.currency);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-slate-800">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Controle Total de Finanças</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Olá, {settings.userName}! 👋
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Sua saúde financeira está integrada. Aqui está sua previsão preditiva para hoje.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideValues(!hideValues)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            id="btn-toggle-values"
          >
            {hideValues ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{hideValues ? 'Mostrar Valores' : 'Ocultar Valores'}</span>
          </button>
          <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-medium shadow-sm">
            <Calendar size={14} className={themeClasses.text} />
            <span>{today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {alerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 shadow-sm" id="alerts-panel">
          <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-rose-800">Alertas Financeiros Pendentes ({alerts.length})</h4>
            <ul className="mt-2 space-y-1">
              {alerts.map((alert, i) => (
                <li key={i} className="text-xs text-rose-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Financial Status Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Saldo Total */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all" id="card-saldo-total">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Saldo Total</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Coins size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900">{formatCurrency(totalBalance)}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">Contas e Carteiras</span>
          </div>
        </div>

        {/* Investimentos */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all" id="card-investimentos">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Investimentos</span>
            <div className={`w-8 h-8 rounded-xl ${themeClasses.bgLight} flex items-center justify-center ${themeClasses.text}`}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-lg md:text-xl font-extrabold ${themeClasses.text}`}>{formatCurrency(totalInvestments)}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">Patrimônio Ativo</span>
          </div>
        </div>

        {/* Cartões de Crédito */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all" id="card-faturas">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Cartões</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-xl font-extrabold text-rose-600">{formatCurrency(totalCardsInvoice)}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">Fatura deste Mês</span>
          </div>
        </div>

        {/* Dívidas Ativas */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all" id="card-dividas">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Dívidas Ativas</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-800">{formatCurrency(totalDebts)}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">Compromissos Pendentes</span>
          </div>
        </div>

        {/* Patrimônio Líquido */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all" id="card-patrimonio">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Patrimônio Líquido</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900">{formatCurrency(netWorth)}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">Consolidado Total</span>
          </div>
        </div>

        {/* Disponível para Gastar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all" id="card-disponivel">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Disponível</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Coins size={16} className="text-slate-700" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-700">{formatCurrency(availableToSpend)}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">Saldo Líquido de Faturas</span>
          </div>
        </div>
      </div>

      {/* Income & Expenses Sub-Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 font-medium">Receitas do Mês</span>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{formatCurrency(monthlyIncomes)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 font-medium">Despesas do Mês</span>
            <p className="text-lg font-bold text-rose-600 mt-0.5">{formatCurrency(monthlyExpenses)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <ArrowDownRight size={20} />
          </div>
        </div>
      </div>

      {/* Predictive Financial Forecast Section */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm" id="forecast-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className={`${themeClasses.bgLight} ${themeClasses.text} text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase`}>Previsão Inteligente</span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">Compromissos Financeiros Futuros</h3>
            <p className="text-xs text-slate-500 mt-1">
              O sistema soma automaticamente suas parcelas futuras, faturas recorrentes, assinaturas e empréstimos cadastrados.
            </p>
          </div>
        </div>

        {/* Forecast Summary Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer shadow-inner" onClick={() => handleOpenFutureMonth({ year: today.getMonth() === 11 ? currentYear + 1 : currentYear, month: today.getMonth() === 11 ? 1 : currentMonth + 1 })}>
            <p className="text-xs text-slate-500 font-medium">Mês que Vem</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(future.nextMonthTotal)}</p>
            <span className={`text-[10px] ${themeClasses.text} mt-1 flex items-center gap-1 font-semibold`}>Ver detalhes <ChevronRight size={10} /></span>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
            <p className="text-xs text-slate-500 font-medium">Próximos 3 Meses</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(future.threeMonthsTotal)}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Acumulado comprometido</span>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
            <p className="text-xs text-slate-500 font-medium">Próximos 6 Meses</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(future.sixMonthsTotal)}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Acumulado comprometido</span>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
            <p className="text-xs text-slate-500 font-medium">Próximos 12 Meses</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(future.twelveMonthsTotal)}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Acumulado comprometido</span>
          </div>
        </div>

        {/* Commitment Cashflow Timeline Chart */}
        <div className="mt-6 pt-6 border-t border-slate-100 h-72">
          <p className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Cronograma de Contas Comprometidas (Próximos 12 meses)</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} onClick={(state: any) => { if (state && (state as any).activePayload) handleOpenFutureMonth((state as any).activePayload[0].payload); }}>
              <defs>
                <linearGradient id="colorCommit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeHex} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={themeHex} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                formatter={(value: any) => [`R$ ${value}`, 'Comprometido']}
              />
              <Area type="monotone" dataKey="Commitments" stroke={themeHex} strokeWidth={2} fillOpacity={1} fill="url(#colorCommit)" />
            </AreaChart>
          </ResponsiveContainer>
          <span className="text-[10px] text-slate-400 text-center block mt-2">Dica: Clique em qualquer ponto do gráfico para explodir e ver os gastos detalhados daquele mês futuro.</span>
        </div>
      </section>

      {/* Breakdown & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown pie chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 mb-6">Gastos por Categoria (Mês Atual)</h4>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-48 h-48">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `R$ ${val}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  Sem Gastos
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              {pieChartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-500 font-medium">{item.name}</span>
                  </div>
                  <span className="text-slate-900 font-bold">{formatCurrency(item.value)}</span>
                </div>
              ))}
              {pieChartData.length === 0 && (
                <p className="text-xs text-slate-400 text-center">Nenhum lançamento no mês atual.</p>
              )}
            </div>
          </div>
        </div>

        {/* Fast Tips Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Visão Geral de Poupança</h4>
            <p className="text-xs text-slate-500">
              Utilize a regra 50/30/20 com as seguintes recomendações baseadas no seu saldo e faturas atuais:
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Necessidades Básicas (50%)</span>
                  <span className="text-slate-900 font-semibold">Recomendado: R$ {(monthlyIncomes * 0.5).toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Desejos Pessoais (30%)</span>
                  <span className="text-slate-900 font-semibold">Recomendado: R$ {(monthlyIncomes * 0.3).toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '30%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Investimentos & Reserva (20%)</span>
                  <span className="text-slate-900 font-semibold">Recomendado: R$ {(monthlyIncomes * 0.2).toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Metas ativas: {investments.length} Ativos</span>
            <span className="text-emerald-600 font-semibold">Saúde Financeira: Excelente</span>
          </div>
        </div>
      </div>

      {/* Selected Future Month Commitments Modal */}
      {selectedFutureMonth && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="future-month-modal">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-blue-600 text-[10px] font-bold tracking-wider uppercase">Foresight Preditivo</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Despesas Comprometidas para {monthsNames[selectedFutureMonth.month - 1]} de {selectedFutureMonth.year}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFutureMonth(null)}
                className="text-slate-500 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors"
                id="btn-close-future-modal"
              >
                Fechar
              </button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500">Total Comprometido Reservado</span>
                <span className="text-lg font-extrabold text-slate-900">{formatCurrency(selectedFutureMonth.total)}</span>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Origem das Cobranças</h5>
                {selectedFutureMonth.details.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {selectedFutureMonth.details.map((item, i) => (
                      <div key={i} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <span className="text-[10px] text-slate-500 mt-0.5 inline-block bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.source}
                          </span>
                        </div>
                        <span className="font-extrabold text-rose-600">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhuma cobrança comprometida para este mês!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
