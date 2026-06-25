import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { Plus, Trash2, TrendingUp, TrendingDown, Landmark, Shield, Landmark as BankIcon, DollarSign, Wallet } from 'lucide-react';
import { Investment, InvestmentType } from '../types';

export const InvestmentsView: React.FC = () => {
  const { investments, addInvestment, deleteInvestment } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);

  // Simulation states
  const [simInitialCapital, setSimInitialCapital] = useState<number | undefined>(undefined);
  const [simMonthlyContribution, setSimMonthlyContribution] = useState<number>(500);
  const [simInterestRate, setSimInterestRate] = useState<number>(10.5);
  const [simYears, setSimYears] = useState<number>(5);

  // New Investment Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('CDB');
  const [investedAmount, setInvestedAmount] = useState<number>(0);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [yieldRate, setYieldRate] = useState<number>(0);
  const [dividends, setDividends] = useState<number>(0);

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || investedAmount <= 0 || currentAmount <= 0) return;

    addInvestment({
      name,
      type,
      investedAmount: +investedAmount,
      currentAmount: +currentAmount,
      yieldRate: +yieldRate,
      dividendsReceived: +dividends,
      purchaseDate: new Date().toISOString().split('T')[0],
    });

    setName('');
    setInvestedAmount(0);
    setCurrentAmount(0);
    setYieldRate(0);
    setDividends(0);
    setShowAddModal(false);
  };

  const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalCurrent = investments.reduce((sum, i) => sum + i.currentAmount, 0);
  const totalProfitLoss = totalCurrent - totalInvested;
  const averageYield = investments.length > 0 ? (investments.reduce((sum, i) => sum + i.yieldRate, 0) / investments.length) : 0;
  const totalDividends = investments.reduce((sum, i) => sum + i.dividendsReceived, 0);

  const getInvestmentTypeLabel = (type: InvestmentType) => {
    return type;
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Alocação de Ativos</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Investimentos</h2>
          <p className="text-slate-500 text-sm mt-1">Acompanhe dividendos, rentabilidades médias e o crescimento do seu patrimônio ativo.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all self-start md:self-auto"
          id="btn-open-add-inv"
        >
          <Plus size={16} />
          <span>Adicionar Ativo</span>
        </button>
      </div>

      {/* Investment Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Investido Original</span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Valor Atual Consolidado</span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            {totalCurrent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Lucro / Prejuízo Papel</span>
          <h3 className={`text-xl font-extrabold mt-1 flex items-center gap-1.5 ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totalProfitLoss >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {totalProfitLoss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Dividendos Recebidos</span>
          <h3 className="text-xl font-extrabold text-emerald-600 mt-1 flex items-center gap-1">
            <DollarSign size={18} className="text-emerald-600" />
            {totalDividends.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map(inv => {
          const profit = inv.currentAmount - inv.investedAmount;
          return (
            <div key={inv.id} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {getInvestmentTypeLabel(inv.type)}
                  </span>
                  <button
                    onClick={() => deleteInvestment(inv.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-50 transition-all border border-slate-100"
                    title="Excluir ativo"
                    id={`btn-delete-inv-${inv.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 className="text-base font-bold text-slate-950 mt-4">{inv.name}</h4>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="text-slate-550">Rentabilidade Média</span>
                  <span className={`font-bold ${inv.yieldRate >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {inv.yieldRate}% a.a.
                  </span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="text-slate-550">Capital Investido</span>
                  <span className="text-slate-800 font-semibold">
                    {inv.investedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="text-slate-550">Saldo Atualizado</span>
                  <span className="text-slate-900 font-extrabold">
                    {inv.currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                {inv.dividendsReceived > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                    <span>Dividendos Obtidos</span>
                    <span>+{inv.dividendsReceived.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {investments.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-3xl">
            Nenhum investimento cadastrado. Adicione um ativo para começar a monitorar a sua carteira!
          </div>
        )}
      </div>

      {/* Planejador de Juros Compostos */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet size={20} className="text-blue-600" />
            Simulador de Crescimento e Juros Compostos
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Simule o crescimento do seu patrimônio com base em aportes mensais e taxas de juros. Os valores iniciais começam com o seu saldo atual consolidado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-semibold">Capital Inicial (R$)</label>
            <input
              type="number"
              step="0.01"
              value={simInitialCapital !== undefined ? simInitialCapital : totalCurrent}
              onChange={e => setSimInitialCapital(+e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              placeholder={totalCurrent.toFixed(2)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-semibold">Aporte Mensal (R$)</label>
            <input
              type="number"
              step="10"
              value={simMonthlyContribution}
              onChange={e => setSimMonthlyContribution(+e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-semibold">Taxa de Juros Anual (% a.a.)</label>
            <input
              type="number"
              step="0.1"
              value={simInterestRate}
              onChange={e => setSimInterestRate(+e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-semibold">Período de Simulação (Anos)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="40"
                value={simYears}
                onChange={e => setSimYears(+e.target.value)}
                className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 shrink-0 w-16 text-right">{simYears} {simYears === 1 ? 'ano' : 'anos'}</span>
            </div>
          </div>
        </div>

        {/* Results Overview */}
        {(() => {
          const initCap = simInitialCapital !== undefined ? simInitialCapital : totalCurrent;
          const annualRate = simInterestRate;
          const monthlyRate = annualRate / 100 / 12;
          const totalMonths = simYears * 12;
          
          let fvInitial = initCap * Math.pow(1 + monthlyRate, totalMonths);
          let fvMonthly = 0;
          if (monthlyRate > 0) {
            fvMonthly = simMonthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
          } else {
            fvMonthly = simMonthlyContribution * totalMonths;
          }
          
          const totalAccumulated = fvInitial + fvMonthly;
          const totalDeposited = initCap + (simMonthlyContribution * totalMonths);
          const totalInterestEarned = totalAccumulated - totalDeposited;

          return (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-xs text-slate-500 font-semibold">Total Acumulado Final</span>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">
                  {totalAccumulated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <span className="text-[10px] text-slate-400">Patrimônio projetado para {simYears} anos</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold">Total de Aportes</span>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {totalDeposited.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <span className="text-[10px] text-slate-400">Capital próprio investido</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold">Rendimento de Juros</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {totalInterestEarned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <span className="text-[10px] text-slate-400">Ganhos gerados pelo efeito dos juros</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="add-inv-modal">
          <form onSubmit={handleAddInvestment} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Adicionar Novo Ativo</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Nome do Ativo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Ex: Tesouro Selic 2029, Ações Petrobras PETR4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Tipo de Ativo</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as InvestmentType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="Tesouro Direto">Tesouro Direto</option>
                    <option value="CDB">CDB (Renda Fixa)</option>
                    <option value="LCI">LCI</option>
                    <option value="LCA">LCA</option>
                    <option value="Ações">Ações (Bolsa)</option>
                    <option value="FIIs">FIIs (Fundos Imobiliários)</option>
                    <option value="ETFs">ETFs</option>
                    <option value="Criptomoedas">Criptomoedas</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Rentabilidade Esperada (% a.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={yieldRate || ''}
                    onChange={e => setYieldRate(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="11.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Valor Investido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={investedAmount || ''}
                    onChange={e => setInvestedAmount(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Valor Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentAmount || ''}
                    onChange={e => setCurrentAmount(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Dividendos / Proventos Acumulados (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dividends || ''}
                  onChange={e => setDividends(+e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10"
              >
                Salvar Ativo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
