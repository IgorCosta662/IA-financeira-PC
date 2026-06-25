import React, { useState } from 'react';
import { useFinance } from './FinanceContext';
import { FileText, Download, Printer, Filter, Calendar, TrendingUp, CreditCard, Landmark } from 'lucide-react';
import { Transaction } from '../types';

export const ReportsView: React.FC = () => {
  const { transactions, accounts, cards } = useFinance();

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Moradia',
    'Lazer',
    'Compras',
    'Outros',
  ];

  // Filtering transactions for report
  const filteredTxs = transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    const matchesMonth = d.getMonth() + 1 === selectedMonth;
    const matchesYear = d.getFullYear() === selectedYear;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    return matchesMonth && matchesYear && matchesCategory;
  });

  // Calculate totals
  const incomeTxs = filteredTxs.filter(t => t.amount > 0);
  const expenseTxs = filteredTxs.filter(t => t.amount < 0);

  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = Math.abs(expenseTxs.reduce((sum, t) => sum + t.amount, 0));
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;

  // Handle Export CSV
  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      alert('Não há lançamentos no período filtrado para exportar.');
      return;
    }

    // Prepare CSV header and lines
    const headers = ['Descricao', 'Valor', 'Tipo', 'Categoria', 'Data', 'Vinculo'];
    const csvLines = [
      headers.join(','),
      ...filteredTxs.map(t => {
        const value = t.amount.toString();
        const type = t.amount > 0 ? 'Receita' : 'Despesa';
        const card = cards.find(c => c.id === t.cardId);
        const acc = accounts.find(a => a.id === t.accountId);
        const ref = card ? `Cartao ${card.bank}` : acc ? `Conta ${acc.name}` : 'Outro';

        return [
          `"${t.description.replace(/"/g, '""')}"`,
          value,
          type,
          `"${t.category}"`,
          t.date,
          `"${ref}"`,
        ].join(',');
      }),
    ];

    const csvContent = '\uFEFF' + csvLines.join('\n'); // Add UTF-8 BOM for Excel support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Financa_AI_Relatorio_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full print:p-0 text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Relatórios de Caixa</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Exportação & Relatórios</h2>
          <p className="text-slate-500 text-sm mt-1">Gere fechamentos mensais de competência, imprima extratos e baixe planilhas CSV.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-750 hover:bg-slate-50 transition-all shadow-sm"
            id="btn-print"
          >
            <Printer size={16} />
            <span>Imprimir Extrato</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            id="btn-export-csv"
          >
            <Download size={16} />
            <span>Exportar para CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Calendar size={14} className="text-slate-400" />
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(+e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value={1}>Janeiro</option>
            <option value={2}>Fevereiro</option>
            <option value={3}>Março</option>
            <option value={4}>Abril</option>
            <option value={5}>Maio</option>
            <option value={6}>Junho</option>
            <option value={7}>Julho</option>
            <option value={8}>Agosto</option>
            <option value={9}>Setembro</option>
            <option value={10}>Outubro</option>
            <option value={11}>Novembro</option>
            <option value={12}>Dezembro</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Calendar size={14} className="text-slate-400" />
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(+e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
            <option value={2028}>2028</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Competence Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Receitas do Mês</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">
            {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Despesas do Mês</span>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2">
            {totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Resultado</span>
          <h3 className={`text-2xl font-extrabold mt-2 ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Taxa de Poupança</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
            <TrendingUp size={18} className="text-blue-600" />
            {savingsRate.toFixed(1)}%
          </h3>
        </div>
      </div>

      {/* Printable transactions breakdown */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Extrato de Competência Simplificado</h3>
            <p className="text-xs text-slate-400 mt-0.5">Competência de Referência: {selectedMonth.toString().padStart(2, '0')}/{selectedYear}</p>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Finança AI Ultimate</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Lançamento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Método / Origem</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.map(t => {
                const card = cards.find(c => c.id === t.cardId);
                const acc = accounts.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{t.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {card ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CreditCard size={14} className="text-purple-600" />
                          <span>Cartão {card.bank}</span>
                        </span>
                      ) : acc ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Landmark size={14} className="text-slate-500" />
                          <span>Conta {acc.name}</span>
                        </span>
                      ) : (
                        'Outro'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-extrabold ${t.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                );
              })}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">Nenhum lançamento no período filtrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
