import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { Users, Plus, Trash2, CheckCircle, Calculator, Percent, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Debtor, Creditor } from '../types';

export const DebtsView: React.FC = () => {
  const {
    debtors,
    addDebtor,
    updateDebtorStatus,
    deleteDebtor,
    creditors,
    addCreditor,
    payCreditorInstallment,
    deleteCreditor,
    accounts,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'debtors' | 'creditors'>('debtors');
  const [showAddDebtor, setShowAddDebtor] = useState(false);
  const [showAddCreditor, setShowAddCreditor] = useState(false);
  const [selectedCreditorForSimulation, setSelectedCreditorForSimulation] = useState<string>('');

  // Add Debtor Form
  const [debtorName, setDebtorName] = useState('');
  const [debtorAmount, setDebtorAmount] = useState<number>(0);
  const [debtorObservation, setDebtorObservation] = useState('');

  // Add Creditor Form
  const [creditorName, setCreditorName] = useState('');
  const [creditorAmount, setCreditorAmount] = useState<number>(0);
  const [creditorInstallments, setCreditorInstallments] = useState<number>(12);
  const [creditorInterest, setCreditorInterest] = useState<number>(1.5);

  const handleAddDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtorName || debtorAmount <= 0) return;

    addDebtor({
      name: debtorName,
      amount: +debtorAmount,
      date: new Date().toISOString().split('T')[0],
      observation: debtorObservation,
      status: 'pending',
    });

    setDebtorName('');
    setDebtorAmount(0);
    setDebtorObservation('');
    setShowAddDebtor(false);
  };

  const handleAddCreditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditorName || creditorAmount <= 0) return;

    addCreditor({
      creditor: creditorName,
      amount: +creditorAmount,
      date: new Date().toISOString().split('T')[0],
      installmentsCount: +creditorInstallments,
      currentInstallment: 1,
      interestRate: +creditorInterest,
      status: 'pending',
    });

    setCreditorName('');
    setCreditorAmount(0);
    setShowAddCreditor(false);
  };

  // Perform dynamic payoff simulation for selected loan
  const handleQuittanceSimulate = (cred: Creditor) => {
    const remainingInstallments = cred.installmentsCount - cred.currentInstallment + 1;
    const totalRemainingNominal = remainingInstallments * cred.amount;

    // Simulate compound interest discount (e.g., present value formula)
    // PV = PMT * [1 - (1 + i)^-n] / i
    const rate = (cred.interestRate || 1.2) / 100;
    let presentValue = totalRemainingNominal;

    if (rate > 0) {
      presentValue = +(cred.amount * ((1 - Math.pow(1 + rate, -remainingInstallments)) / rate)).toFixed(2);
    } else {
      presentValue = +(totalRemainingNominal * 0.95).toFixed(2); // Simple 5% discount
    }

    const savings = +(totalRemainingNominal - presentValue).toFixed(2);

    return {
      remainingInstallments,
      totalRemainingNominal,
      presentValue,
      savings,
    };
  };

  const executePayoff = (cred: Creditor, pv: number) => {
    if (accounts.length === 0) {
      alert('Por favor, cadastre uma conta bancária primeiro.');
      return;
    }

    const firstAcc = accounts[0];
    if (firstAcc.balance < pv) {
      alert(`Saldo insuficiente na conta ${firstAcc.name} (Saldo: R$ ${firstAcc.balance.toFixed(2)}) para quitar esta dívida por R$ ${pv.toFixed(2)}.`);
      return;
    }

    if (confirm(`Confirmar quitação total do financiamento "${cred.creditor}" por R$ ${pv.toLocaleString('pt-BR')}?\n\nEconomia de juros simulada: R$ ${(cred.amount * (cred.installmentsCount - cred.currentInstallment + 1) - pv).toFixed(2)}\n\nO valor será deduzido de sua conta principal.`)) {
      // Set to paid
      deleteCreditor(cred.id);
      addCreditor({
        ...cred,
        currentInstallment: cred.installmentsCount,
        status: 'paid',
      });
      setSelectedCreditorForSimulation('');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Controle de Pendências</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Dívidas & Cobranças</h2>
          <p className="text-slate-500 text-sm mt-1">Monitore o que tem a receber e simule quitação antecipada de empréstimos com abatimento de juros.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'debtors' ? (
            <button
              onClick={() => setShowAddDebtor(true)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
              id="btn-open-add-debtor"
            >
              <Plus size={16} />
              <span>Quem Me Deve</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddCreditor(true)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
              id="btn-open-add-creditor"
            >
              <Plus size={16} />
              <span>Cadastrar Dívida</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200" id="tabs-debts">
        <button
          onClick={() => { setActiveTab('debtors'); setSelectedCreditorForSimulation(''); }}
          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${activeTab === 'debtors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Quem Me Deve (Recebíveis)
        </button>
        <button
          onClick={() => setActiveTab('creditors')}
          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${activeTab === 'creditors' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Quem Eu Devo (Financiamentos & Empréstimos)
        </button>
      </div>

      {/* Debtors Tab Content */}
      {activeTab === 'debtors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debtors.map(debt => (
              <div key={debt.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      debt.status === 'received' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      debt.status === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {debt.status === 'received' ? 'Recebido' : debt.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                    </span>
                    <div className="flex gap-1.5">
                      {debt.status !== 'received' && (
                        <button
                          onClick={() => updateDebtorStatus(debt.id, 'received')}
                          className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-all border border-slate-100"
                          title="Marcar como recebido"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      {debt.status === 'pending' && (
                        <button
                          onClick={() => updateDebtorStatus(debt.id, 'overdue')}
                          className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg transition-all border border-slate-100"
                          title="Marcar como atrasado"
                        >
                          <Calculator size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteDebtor(debt.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all border border-slate-100"
                        title="Excluir cobrança"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-4">{debt.name}</h4>
                  {debt.observation && <p className="text-xs text-slate-500 mt-1">{debt.observation}</p>}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-[10px] text-slate-400 font-medium">Acordado em: {new Date(debt.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  <p className="text-xl font-extrabold text-slate-900">
                    {debt.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            ))}
            {debtors.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-3xl">Nenhum devedor cadastrado.</div>
            )}
          </div>
        </div>
      )}

      {/* Creditors Tab Content */}
      {activeTab === 'creditors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creditors List */}
          <div className="lg:col-span-2 space-y-4">
            {creditors.map(cred => {
              const isPaid = cred.status === 'paid';
              return (
                <div
                  key={cred.id}
                  className={`bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 shadow-sm transition-all ${
                    selectedCreditorForSimulation === cred.id ? 'border-blue-500 ring-2 ring-blue-500/10' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {isPaid ? 'Quitada' : `${cred.currentInstallment}/${cred.installmentsCount} parcelas`}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-2 leading-none">{cred.creditor}</h4>
                    <p className="text-xs text-slate-500 mt-1.5">Taxa de juros pactuada: {cred.interestRate}% a.m.</p>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium">Valor Mensal</span>
                      <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                        {cred.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!isPaid && (
                        <>
                          <button
                            onClick={() => payCreditorInstallment(cred.id)}
                            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 rounded-xl transition-all shadow-sm"
                            title="Pagar Parcela Atual"
                          >
                            Pagar Parcela
                          </button>
                          <button
                            onClick={() => setSelectedCreditorForSimulation(cred.id)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all border border-blue-100/50"
                            title="Simular quitação com desconto de juros"
                          >
                            <Calculator size={15} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteCreditor(cred.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
                        title="Excluir dívida"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {creditors.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-2xl">
                Nenhum financiamento ou empréstimo cadastrado.
              </div>
            )}
          </div>

          {/* Payoff simulator card */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 self-start shadow-sm">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="text-blue-600" size={18} />
              Simular Quitação de Dívidas
            </h4>
            <p className="text-xs text-slate-500 mt-2">
              Selecione uma de suas dívidas ativas à esquerda clicando na calculadora correspondente para calcular a amortização e a redução de juros compostos.
            </p>

            {selectedCreditorForSimulation ? (() => {
              const credObj = creditors.find(c => c.id === selectedCreditorForSimulation);
              if (!credObj) return null;

              const sim = handleQuittanceSimulate(credObj);

              return (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="font-bold text-slate-900 text-sm">{credObj.creditor}</p>
                    <span className="text-[10px] text-slate-400 block">Restam {sim.remainingInstallments} parcelas pendentes</span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-500">Total Nominal Devido</span>
                      <span className="font-semibold text-slate-800">R$ {sim.totalRemainingNominal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-blue-600 font-semibold">Economia de Juros Amortizados</span>
                      <span className="font-bold text-blue-600">-R$ {sim.savings.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="py-2.5 flex justify-between items-end">
                      <span className="font-bold text-slate-900">Quitação à Vista Hoje</span>
                      <span className="font-extrabold text-slate-900 text-base">R$ {sim.presentValue.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => executePayoff(credObj, sim.presentValue)}
                    className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10 mt-4"
                  >
                    Efetuar Quitação
                  </button>
                </div>
              );
            })() : (
              <div className="mt-12 py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                Nenhum financiamento selecionado para simulação de quitação.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Debtor Modal */}
      {showAddDebtor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="add-debtor-modal">
          <form onSubmit={handleAddDebtor} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Novo Recebível (Quem Me Deve)</h3>
              <button
                type="button"
                onClick={() => setShowAddDebtor(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Nome do Devedor</label>
                <input
                  type="text"
                  required
                  value={debtorName}
                  onChange={e => setDebtorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Ex: Carlos Alberto"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Valor a Receber (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={debtorAmount || ''}
                  onChange={e => setDebtorAmount(+e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Observação / Finalidade</label>
                <textarea
                  value={debtorObservation}
                  onChange={e => setDebtorObservation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Ex: Empréstimo para conserto celular"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddDebtor(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10"
              >
                Adicionar Registro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Creditor Modal */}
      {showAddCreditor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="add-creditor-modal">
          <form onSubmit={handleAddCreditor} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Nova Dívida (Quem Eu Devo)</h3>
              <button
                type="button"
                onClick={() => setShowAddCreditor(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Creditor / Financiador</label>
                <input
                  type="text"
                  required
                  value={creditorName}
                  onChange={e => setCreditorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Ex: Financiamento Banco Itaú"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Valor da Parcela Mensal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={creditorAmount || ''}
                    onChange={e => setCreditorAmount(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Total de Parcelas</label>
                  <input
                    type="number"
                    required
                    value={creditorInstallments}
                    onChange={e => setCreditorInstallments(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Taxa de Juros de Contrato (% a.m.)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={creditorInterest}
                  onChange={e => setCreditorInterest(+e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCreditor(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10"
              >
                Salvar Financiamento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
