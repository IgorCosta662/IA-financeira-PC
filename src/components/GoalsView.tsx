import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { Target, Plus, Trash2, ArrowUpRight, Award, PiggyBank } from 'lucide-react';
import { Goal } from '../types';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, deleteGoal, fundGoal, accounts } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');

  // Add Goal Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [category, setCategory] = useState('Lazer');
  const [deadline, setDeadline] = useState('');

  // Fund Goal State
  const [fundAmount, setFundAmount] = useState<number>(0);
  const [sourceAccountId, setSourceAccountId] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || targetAmount <= 0 || !deadline) return;

    addGoal({
      name,
      targetAmount: +targetAmount,
      currentAmount: 0,
      deadline,
      category,
    });

    setName('');
    setTargetAmount(0);
    setDeadline('');
    setShowAddModal(false);
  };

  const handleFundGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || fundAmount <= 0 || !sourceAccountId) return;

    const success = fundGoal(selectedGoalId, +fundAmount, sourceAccountId);
    if (success) {
      setFundAmount(0);
      setSourceAccountId('');
      setShowFundModal(false);
    } else {
      alert('Não foi possível realizar o aporte. Verifique se o saldo da conta de origem é suficiente.');
    }
  };

  const getDaysRemaining = (deadlineStr: string) => {
    const today = new Date();
    const d = new Date(deadlineStr + 'T00:00:00');
    const diffTime = d.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} dias restantes` : 'Prazo esgotado';
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Metas e Projetos</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Metas Financeiras</h2>
          <p className="text-slate-500 text-sm mt-1">Defina objetivos de curto a longo prazo, planeje prazos e aporte recursos para economizar.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFundModal(true)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-750 hover:bg-slate-50 transition-all shadow-sm"
            id="btn-open-fund-goal"
          >
            <ArrowUpRight size={16} className="text-blue-600" />
            <span>Aportar Recursos</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            id="btn-open-add-goal"
          >
            <Plus size={16} />
            <span>Criar Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progressPercent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const isComplete = progressPercent >= 100;

          return (
            <div key={goal.id} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {goal.category}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelectedGoalId(goal.id); setShowFundModal(true); }}
                      className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all border border-slate-100"
                      title="Fazer aporte financeiro"
                    >
                      <ArrowUpRight size={15} />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all border border-slate-100"
                      title="Excluir meta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="p-3 bg-slate-50 text-blue-650 rounded-xl border border-slate-100">
                    {isComplete ? <Award size={20} className="text-amber-500" /> : <PiggyBank size={20} className="text-blue-600" />}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">{goal.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">Prazo: {getDaysRemaining(goal.deadline)}</span>
                  </div>
                </div>
              </div>

              {/* Progress and values */}
              <div className="space-y-3">
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase text-[9px] font-semibold">Valor Alvo</span>
                    <p className="font-semibold text-slate-600 mt-0.5">
                      {goal.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block uppercase text-[9px] font-semibold">Saldo Atual</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {goal.currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${progressPercent}%`, backgroundColor: isComplete ? '#d97706' : '#2563eb' }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block text-right">{progressPercent.toFixed(0)}% concluído</span>
                </div>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-3xl">
            Nenhuma meta cadastrada. Crie uma meta para planejar reservas e poupanças!
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="add-goal-modal">
          <form onSubmit={handleAddGoal} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Criar Nova Meta Financeira</h3>
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
                <label className="text-xs text-slate-500 font-semibold">Nome do Objetivo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Ex: Reserva de Emergência, Viagem Disney, Comprar Carro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={targetAmount || ''}
                    onChange={e => setTargetAmount(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Prazo (Data Alvo)</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Categoria da Meta</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Segurança">Segurança (Reserva)</option>
                  <option value="Lazer">Lazer & Viagens</option>
                  <option value="Bens">Bens & Patrimônio</option>
                  <option value="Educação">Educação & Estudos</option>
                  <option value="Outros">Outros</option>
                </select>
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
                Criar Meta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fund Goal Modal (Aporte) */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="fund-goal-modal">
          <form onSubmit={handleFundGoal} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Fazer Aporte de Recursos</h3>
              <button
                type="button"
                onClick={() => setShowFundModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Meta de Destino</label>
                <select
                  required
                  value={selectedGoalId}
                  onChange={e => setSelectedGoalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="">Selecione a meta...</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Alvo: R$ {g.targetAmount.toFixed(2)} - Atual: R$ {g.currentAmount.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Conta de Origem (Débito)</label>
                <select
                  required
                  value={sourceAccountId}
                  onChange={e => setSourceAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="">Selecione a conta...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Saldo: R$ {a.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Valor do Aporte (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={fundAmount || ''}
                  onChange={e => setFundAmount(+e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFundModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10"
              >
                Confirmar Depósito
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
