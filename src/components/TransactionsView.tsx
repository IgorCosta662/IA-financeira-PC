import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { Plus, Trash2, Search, Filter, Calendar, Coins, ArrowUpRight, ArrowDownRight, Tag, CreditCard, Landmark } from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory } from '../types';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    accounts,
    cards,
  } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<TransactionCategory>('Alimentação');
  const [accountId, setAccountId] = useState('');
  const [cardId, setCardId] = useState('');
  const [useCard, setUseCard] = useState(false);
  const [installments, setInstallments] = useState<number>(1);

  const categories: TransactionCategory[] = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Moradia',
    'Lazer',
    'Compras',
    'Outros',
  ];

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0 || !accountId) return;

    // Invert amount if it's an expense
    const finalAmount = type === 'expense' ? -amount : amount;

    addTransaction({
      description,
      amount: finalAmount,
      type,
      date,
      category,
      accountId,
      cardId: useCard ? cardId : undefined,
      installmentsCount: installments > 1 ? installments : undefined,
      currentInstallment: installments > 1 ? 1 : undefined,
    });

    // Reset Form
    setDescription('');
    setAmount(0);
    setInstallments(1);
    setUseCard(false);
    setShowAddModal(false);
  };

  // Filter Transactions
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesAccount = filterAccount === 'all' || t.accountId === filterAccount;

    return matchesSearch && matchesType && matchesCategory && matchesAccount;
  }).sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime());

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Extrato Consolidado</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Lançamentos Financeiros</h2>
          <p className="text-slate-500 text-sm mt-1">Monitore e filtre despesas, receitas, reembolsos e parcelamentos ativos.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all self-start md:self-auto"
          id="btn-open-add-tx"
        >
          <Plus size={16} />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4" id="filters-toolbar">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            placeholder="Buscar por descrição..."
          />
        </div>

        {/* Filter Type */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="transfer">Transferências</option>
            <option value="refund">Reembolsos</option>
          </select>
        </div>

        {/* Filter Category */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Tag size={14} className="text-slate-400" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filter Account */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Coins size={14} className="text-slate-400" />
          <select
            value={filterAccount}
            onChange={e => setFilterAccount(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas as Contas</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Descrição</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Conta / Cartão</th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-4 text-right">Valor</th>
                <th className="py-3.5 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.map(t => {
                const card = cards.find(c => c.id === t.cardId);
                const acc = accounts.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {t.description}
                      {t.installmentsCount && (
                        <span className="text-[9px] ml-2 text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded font-bold">
                          {t.currentInstallment}/{t.installmentsCount}x
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {t.amount > 0 ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <ArrowUpRight size={14} /> Receita
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                          <ArrowDownRight size={14} /> Despesa
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded text-[10px] font-semibold text-slate-600">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {card ? (
                        <span className="inline-flex items-center gap-1.5 text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          <CreditCard size={12} className="text-purple-600" /> {card.bank} ({card.cardName})
                        </span>
                      ) : acc ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          <Landmark size={12} className="text-slate-500" /> {acc.name}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`py-4 px-4 text-right font-extrabold ${t.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                        title="Excluir lançamento"
                        id={`btn-delete-tx-${t.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Nenhum lançamento corresponde aos filtros atuais.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="add-tx-modal">
          <form onSubmit={handleAddTransaction} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Novo Lançamento Financeiro</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setType('expense'); setCategory('Alimentação'); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Despesa (Saída)
                </button>
                <button
                  type="button"
                  onClick={() => { setType('income'); setCategory('Outros'); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${type === 'income' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Receita (Entrada)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Descrição / Detalhe</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Ex: Aluguel, Supermercado, Salário"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount || ''}
                    onChange={e => setAmount(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Categoria</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as TransactionCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Account Binding */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Conta Vinculada</label>
                <select
                  required
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="">Selecione...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (Saldo: R$ {acc.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              {/* Credit Card binding (Only for expense) */}
              {type === 'expense' && cards.length > 0 && (
                <div className="space-y-2 border-t border-slate-150 pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cb-use-card"
                      checked={useCard}
                      onChange={e => setUseCard(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="cb-use-card" className="text-xs text-slate-600 cursor-pointer">
                      Esta é uma compra no cartão de crédito
                    </label>
                  </div>

                  {useCard && (
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-semibold">Qual Cartão?</label>
                        <select
                          required={useCard}
                          value={cardId}
                          onChange={e => setCardId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        >
                          <option value="">Selecione...</option>
                          {cards.map(c => (
                            <option key={c.id} value={c.id}>{c.bank} {c.cardName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-semibold">Parcelamento (x)</label>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={installments}
                          onChange={e => setInstallments(+e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm"
              >
                Salvar Lançamento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
