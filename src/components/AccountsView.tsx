import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { Coins, Plus, Trash2, ArrowRightLeft, Wallet, Landmark, PiggyBank } from 'lucide-react';
import { Account, AccountType } from '../types';

export const AccountsView: React.FC = () => {
  const { accounts, addAccount, deleteAccount, transactions, addTransaction } = useFinance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // New Account state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('checking');
  const [newBalance, setNewBalance] = useState<number>(0);
  const [newColor, setNewColor] = useState('#10b981');

  // Transfer state
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(0);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    addAccount({
      name: newName,
      type: newType,
      balance: +newBalance,
      color: newColor,
    });
    setNewName('');
    setNewBalance(0);
    setShowAddModal(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFrom || !transferTo || transferFrom === transferTo || transferAmount <= 0) return;

    const source = accounts.find(a => a.id === transferFrom);
    if (!source || source.balance < transferAmount) {
      alert('Saldo insuficiente na conta de origem para concluir a transferência.');
      return;
    }

    // Add negative transaction to source and positive transaction to destination
    addTransaction({
      description: `Transferência para ${accounts.find(a => a.id === transferTo)?.name}`,
      amount: -transferAmount,
      type: 'transfer',
      date: new Date().toISOString().split('T')[0],
      category: 'Outros',
      accountId: transferFrom,
    });

    addTransaction({
      description: `Recebido de ${source.name}`,
      amount: transferAmount,
      type: 'transfer',
      date: new Date().toISOString().split('T')[0],
      category: 'Outros',
      accountId: transferTo,
    });

    setTransferAmount(0);
    setShowTransferModal(false);
  };

  const getTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'checking':
        return <Landmark size={20} />;
      case 'savings':
        return <PiggyBank size={20} />;
      case 'digital_wallet':
        return <Wallet size={20} />;
      case 'cash':
        return <Coins size={20} />;
    }
  };

  const getTypeName = (type: AccountType) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'digital_wallet': return 'Carteira Digital';
      case 'cash': return 'Dinheiro em Espécie';
      default: return 'Outro';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Instituições Bancárias</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Contas Bancárias</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie saldos, realize transferências internas e concilie transações.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            id="btn-open-transfer"
          >
            <ArrowRightLeft size={16} className="text-blue-600" />
            <span>Transferência Interna</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            id="btn-open-add-account"
          >
            <Plus size={16} />
            <span>Adicionar Conta</span>
          </button>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accounts.map(acc => (
          <div
            key={acc.id}
            className="relative group overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 shadow-sm transition-all"
            style={{ borderLeft: `4px solid ${acc.color}` }}
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                {getTypeIcon(acc.type)}
              </div>
              <button
                onClick={() => deleteAccount(acc.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50 transition-all"
                title="Excluir conta"
                id={`btn-delete-acc-${acc.id}`}
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="mt-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{getTypeName(acc.type)}</span>
              <h4 className="text-base font-bold text-slate-900 mt-1 leading-tight">{acc.name}</h4>
              <p className="text-2xl font-extrabold text-slate-900 mt-4">
                {acc.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white border border-slate-200 rounded-2xl">
            Nenhuma conta bancária cadastrada. Adicione uma conta para começar!
          </div>
        )}
      </div>

      {/* Account Transactions History */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Lançamentos Recentes por Conta</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Conta</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.filter(t => !t.cardId).slice(-6).reverse().map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{t.description}</td>
                  <td className="py-3.5 px-4">{accounts.find(a => a.id === t.accountId)?.name || 'Outro'}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-medium">{t.category}</span>
                  </td>
                  <td className="py-3.5 px-4">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className={`py-3.5 px-4 text-right font-extrabold ${t.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
              {transactions.filter(t => !t.cardId).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">Nenhum lançamento recente encontrado nesta conta.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="add-account-modal">
          <form onSubmit={handleAddAccount} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Adicionar Nova Conta</h3>
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
                <label className="text-xs text-slate-500 font-semibold">Nome da Conta / Banco</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Ex: Banco do Brasil"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Tipo de Conta</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as AccountType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="digital_wallet">Carteira Digital</option>
                    <option value="cash">Dinheiro em Espécie</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold">Saldo Inicial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newBalance}
                    onChange={e => setNewBalance(+e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Cor de Identificação</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer p-1"
                  />
                  <span className="text-[11px] text-slate-400">Escolha uma cor para diferenciar no dashboard</span>
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
                Adicionar Conta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Internal Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-md" id="transfer-modal">
          <form onSubmit={handleTransfer} className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Transferência Interna</h3>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Origem</label>
                <select
                  required
                  value={transferFrom}
                  onChange={e => setTransferFrom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="">Selecione a conta de origem</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Saldo: R$ {a.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Destino</label>
                <select
                  required
                  value={transferTo}
                  onChange={e => setTransferTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="">Selecione a conta de destino</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Saldo: R$ {a.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold">Valor da Transferência (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={e => setTransferAmount(+e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10"
              >
                Realizar Transferência
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
