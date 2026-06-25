import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { CreditCard, Plus, Trash2, HelpCircle, AlertCircle, Percent, ArrowDown } from 'lucide-react';
import { Card, CardBrand, Transaction } from '../types';

export const CardsView: React.FC = () => {
  const { cards, addCard, deleteCard, transactions, deleteTransaction, addTransaction, getCardInvoice } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnticipationModal, setShowAnticipationModal] = useState(false);

  // New Card State
  const [bank, setBank] = useState('');
  const [cardName, setCardName] = useState('');
  const [brand, setBrand] = useState<CardBrand>('mastercard');
  const [limit, setLimit] = useState<number>(5000);
  const [closingDay, setClosingDay] = useState<number>(5);
  const [dueDay, setDueDay] = useState<number>(12);
  const [color, setColor] = useState('#8a05be');

  // Anticipation Simulator State
  const [selectedTxRoot, setSelectedTxRoot] = useState<string>('');
  const [discountRate, setDiscountRate] = useState<number>(6.5); // % annual discount

  // Generate a list of unique installment roots for anticipation
  // An installment root has `originalTransactionId` and `installmentsCount` > 1.
  // We want to list unique installment purchases that still have remaining installments.
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const installmentRoots = Array.from(
    new Map<string, Transaction>(
      transactions
        .filter(t => t.originalTransactionId && t.installmentsCount && t.installmentsCount > 1)
        .map(t => [t.originalTransactionId!, t])
    ).values()
  );

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank || !cardName) return;
    addCard({
      bank,
      cardName,
      brand,
      limit: +limit,
      closingDay: +closingDay,
      dueDay: +dueDay,
      color,
    });
    setBank('');
    setCardName('');
    setShowAddModal(false);
  };

  // Perform anticipation simulation
  const handleAnticipate = () => {
    if (!selectedTxRoot) return;

    // Find all remaining installments for this root purchase
    const matchingTxs = transactions.filter(t => t.originalTransactionId === selectedTxRoot);
    const sortedTxs = [...matchingTxs].sort((a, b) => (a.currentInstallment || 0) - (b.currentInstallment || 0));

    // Find first unpaid/future installment (unpaid is anything starting next month or future)
    const futureTxs = sortedTxs.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return (d.getFullYear() > currentYear) || (d.getFullYear() === currentYear && d.getMonth() + 1 > currentMonth);
    });

    if (futureTxs.length === 0) {
      alert('Não existem parcelas futuras pendentes para este lançamento para serem antecipadas.');
      return;
    }

    const totalFutureAmount = futureTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    // Simple discount formula: Total * (1 - (Rate * Months / 12))
    const monthsToAnticipate = futureTxs.length;
    const discountAmount = +(totalFutureAmount * (discountRate / 100) * (monthsToAnticipate / 12)).toFixed(2);
    const finalAmountToPay = +(totalFutureAmount - discountAmount).toFixed(2);

    if (confirm(`Confirmar antecipação de ${monthsToAnticipate} parcelas? \n\nValor Original: R$ ${totalFutureAmount.toFixed(2)}\nDesconto obtido: R$ ${discountAmount.toFixed(2)}\nValor Final a pagar: R$ ${finalAmountToPay.toFixed(2)}\n\nIsso irá quitar as faturas futuras deste item.`)) {
      
      // 1. Delete all future transactions associated with this installment plan
      futureTxs.forEach(t => {
        deleteTransaction(t.id);
      });

      // 2. Post a single anticipated quittance transaction for the current month
      const sampleTx = futureTxs[0];
      addTransaction({
        description: `${sampleTx.description.split(' (')[0]} (Quitação Antecipada)`,
        amount: -finalAmountToPay,
        type: 'expense',
        date: today.toISOString().split('T')[0],
        category: sampleTx.category,
        accountId: sampleTx.accountId,
        cardId: sampleTx.cardId,
      });

      setSelectedTxRoot('');
      setShowAnticipationModal(false);
    }
  };

  const getCardBrandName = (brand: CardBrand) => {
    switch (brand) {
      case 'mastercard': return 'Mastercard';
      case 'visa': return 'Visa';
      case 'elo': return 'Elo';
      case 'amex': return 'American Express';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Faturas e Crédito</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Cartões de Crédito</h2>
          <p className="text-slate-500 text-sm mt-1">Monitore faturas correntes, gerencie limites e antecipe parcelas com desconto.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnticipationModal(true)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            id="btn-open-anticipation"
          >
            <Percent size={16} className="text-blue-600" />
            <span>Simular Antecipação</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            id="btn-open-add-card"
          >
            <Plus size={16} />
            <span>Cadastrar Cartão</span>
          </button>
        </div>
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cards.map(card => {
          const invoiceCurrent = getCardInvoice(card.id, currentYear, currentMonth);
          const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 15);
          const invoiceNext = getCardInvoice(card.id, nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1);

          const usedLimit = invoiceCurrent.total;
          const availableLimit = Math.max(0, card.limit - usedLimit);
          const usagePercent = Math.min(100, (usedLimit / card.limit) * 100);

          return (
            <div key={card.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-300 shadow-sm transition-all space-y-6">
              {/* Premium Visual Card */}
              <div
                className="relative h-44 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${card.color} 0%, #1e293b 100%)`,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-65">{card.bank}</span>
                    <h4 className="text-lg font-bold leading-tight mt-0.5">{card.cardName}</h4>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-white/10 backdrop-blur-sm uppercase tracking-wider">
                    {getCardBrandName(card.brand)}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[9px] opacity-60 block uppercase tracking-wider">Limite Total</span>
                    <p className="text-lg font-bold mt-0.5">
                      {card.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] opacity-60 block uppercase tracking-wider">Fechamento / Vencimento</span>
                    <p className="text-xs font-medium mt-0.5">Dia {card.closingDay} / Dia {card.dueDay}</p>
                  </div>
                </div>

                {/* Trash button absolute overlay */}
                <button
                  onClick={() => deleteCard(card.id)}
                  className="absolute top-4 right-4 text-white/50 hover:text-rose-300 p-1 rounded hover:bg-white/10 transition-all"
                  title="Excluir Cartão"
                  id={`btn-delete-card-${card.id}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Invoice Calculations & Limit Bar */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Fatura Atual (Junho)</span>
                  <p className="text-base font-extrabold text-rose-600 mt-1">
                    {invoiceCurrent.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Próxima Fatura (Julho)</span>
                  <p className="text-base font-extrabold text-slate-700 mt-1">
                    {invoiceNext.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>

              {/* Progress Limit Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Limite Utilizado: {usagePercent.toFixed(0)}%</span>
                  <span className="text-slate-800 font-bold">
                    Disponível: {availableLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${usagePercent}%`, backgroundColor: usagePercent > 75 ? '#e11d48' : '#059669' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {cards.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-3xl">
            Nenhum cartão cadastrado. Adicione um cartão para controlar faturas e limites!
          </div>
        )}
      </div>

      {/* Anticipation & Simulation Intro banner */}
      <section className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 shrink-0 flex items-center justify-center text-blue-600">
            <Percent size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Por que antecipar parcelas de cartões?</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Antecipar parcelas de compras sem juros ou financiamentos reduz a sua despesa futura comprometida e pode garantir descontos significativos no valor final se negociado ou simulado no aplicativo.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAnticipationModal(true)}
          className="w-full md:w-auto shrink-0 bg-blue-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl hover:bg-blue-700 shadow-sm transition-all"
          id="btn-open-anticipation-2"
        >
          Simular Agora
        </button>
      </section>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="add-card-modal">
          <form onSubmit={handleAddCard} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Adicionar Novo Cartão</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Instituição / Banco</label>
                  <input
                    type="text"
                    required
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Ex: Nubank"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Nome do Cartão</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="Ex: Nubank Violeta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Bandeira</label>
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value as CardBrand)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="mastercard">Mastercard</option>
                    <option value="visa">Visa</option>
                    <option value="elo">Elo</option>
                    <option value="amex">American Express</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Limite Total (R$)</label>
                  <input
                    type="number"
                    required
                    value={limit}
                    onChange={e => setLimit(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Dia de Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={closingDay}
                    onChange={e => setClosingDay(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Dia de Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={e => setDueDay(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Cor Visual</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer p-1"
                  />
                  <span className="text-[11px] text-slate-400">Cor para o cartão virtual</span>
                </div>
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
                Cadastrar Cartão
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Anticipation Simulation Modal */}
      {showAnticipationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="anticipation-modal">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Simulador de Antecipação de Faturas</h3>
              <button
                type="button"
                onClick={() => setShowAnticipationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Selecione uma compra parcelada</label>
                <select
                  required
                  value={selectedTxRoot}
                  onChange={e => setSelectedTxRoot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="">Selecione...</option>
                  {installmentRoots.map(root => {
                    // Count how many matching installments exist
                    const totalTxs = transactions.filter(t => t.originalTransactionId === root.originalTransactionId);
                    const paid = totalTxs.filter(t => {
                      const d = new Date(t.date + 'T00:00:00');
                      return (d.getFullYear() < currentYear) || (d.getFullYear() === currentYear && d.getMonth() + 1 <= currentMonth);
                    }).length;
                    const remaining = totalTxs.length - paid;
                    const totalRemainingVal = remaining * Math.abs(root.amount);

                    if (remaining === 0) return null;

                    return (
                      <option key={root.originalTransactionId} value={root.originalTransactionId}>
                        {root.description.split(' (')[0]} - {remaining} parcelas restantes (R$ {totalRemainingVal.toFixed(2)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Taxa de Desconto Anual Simulada (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={discountRate}
                  onChange={e => setDiscountRate(+e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {selectedTxRoot && (() => {
                const rootTx = transactions.find(t => t.originalTransactionId === selectedTxRoot);
                if (!rootTx) return null;

                const matchingTxs = transactions.filter(t => t.originalTransactionId === selectedTxRoot);
                const sorted = [...matchingTxs].sort((a, b) => (a.currentInstallment || 0) - (b.currentInstallment || 0));
                
                const futureTxs = sorted.filter(t => {
                  const d = new Date(t.date + 'T00:00:00');
                  return (d.getFullYear() > currentYear) || (d.getFullYear() === currentYear && d.getMonth() + 1 > currentMonth);
                });

                const monthsRemaining = futureTxs.length;
                const totalFutureAmount = futureTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const discountAmount = +(totalFutureAmount * (discountRate / 100) * (monthsRemaining / 12)).toFixed(2);
                const finalAmountToPay = +(totalFutureAmount - discountAmount).toFixed(2);

                return (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-inner">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Resultado da Simulação</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500">Parcelas Futuras</span>
                        <p className="font-semibold text-slate-900 mt-1">{monthsRemaining} parcelas</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Valor Total Original</span>
                        <p className="font-semibold text-slate-900 mt-1">R$ {totalFutureAmount.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <ArrowDown size={14} />
                        <span>Desconto Real (Economia)</span>
                      </div>
                      <span className="font-extrabold text-emerald-600">R$ {discountAmount.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">Custo de Quitação com Desconto</span>
                      <span className="font-extrabold text-slate-900 text-base">R$ {finalAmountToPay.toLocaleString('pt-BR')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAnticipate}
                      className="w-full bg-blue-600 text-white font-extrabold text-xs py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10 mt-2"
                      id="btn-confirm-anticipation"
                    >
                      Confirmar Antecipação na Fatura
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
