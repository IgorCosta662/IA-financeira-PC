import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Card, Transaction, Investment, Debtor, Creditor, Goal, SecuritySettings, AppSettings, TransactionType, TransactionCategory } from '../types';
import { getInitialAccounts, getInitialCards, getInitialInvestments, getInitialDebtors, getInitialCreditors, getInitialGoals, getInitialTransactions } from '../initialData';

// Polyfills/Backports for initial data since we modified initialData.ts
const initialAccounts: Account[] = [];
const initialCards: Card[] = [];

const defaultSettings: AppSettings = {
  userName: 'Finança AI',
  currency: 'BRL',
  hideBalanceDefault: false,
  themeColor: 'blue',
  customGeminiKey: '',
  selectedModel: 'gemini-2.5-flash',
  selectedAgent: 'default',
  selectedProvider: 'gemini',
  customOpenAiKey: '',
  customNvidiaKey: '',
  customOpenAiBase: '',
  customOpenAiModel: '',
};

interface FinanceContextType {
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
  investments: Investment[];
  debtors: Debtor[];
  creditors: Creditor[];
  goals: Goal[];
  security: SecuritySettings;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  pinVerified: boolean;
  setPinVerified: (verified: boolean) => void;
  alerts: string[];
  cloudBackupInfo: { timestamp: string | null; message: string | null };
  
  // State changers
  addAccount: (account: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  addCard: (card: Omit<Card, 'id'>) => void;
  deleteCard: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  deleteInvestment: (id: string) => void;
  addDebtor: (debtor: Omit<Debtor, 'id'>) => void;
  updateDebtorStatus: (id: string, status: Debtor['status']) => void;
  deleteDebtor: (id: string) => void;
  addCreditor: (creditor: Omit<Creditor, 'id'>) => void;
  payCreditorInstallment: (id: string) => void;
  deleteCreditor: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  fundGoal: (id: string, amount: number, sourceAccountId: string) => boolean;
  deleteGoal: (id: string) => void;
  updateSecurity: (settings: Partial<SecuritySettings>) => void;
  resetAllData: () => void;
  importBackup: (data: any) => boolean;
  exportBackup: () => string;
  saveToCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  
  // Future cashflow predictive engine helpers
  getMonthlyCommitments: (year: number, month: number) => {
    installments: number;
    subscriptions: number;
    debts: number;
    recurringBills: number;
    total: number;
    breakdown: Array<{ name: string; amount: number; category: string; source: string }>;
  };
  getFutureSummary: () => {
    nextMonthTotal: number;
    threeMonthsTotal: number;
    sixMonthsTotal: number;
    twelveMonthsTotal: number;
  };
  getCardInvoice: (cardId: string, year: number, month: number) => {
    total: number;
    transactions: Transaction[];
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('fai_accounts');
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('fai_cards');
    return saved ? JSON.parse(saved) : initialCards;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fai_transactions');
    return saved ? JSON.parse(saved) : getInitialTransactions();
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('fai_investments');
    return saved ? JSON.parse(saved) : getInitialInvestments();
  });

  const [debtors, setDebtors] = useState<Debtor[]>(() => {
    const saved = localStorage.getItem('fai_debtors');
    return saved ? JSON.parse(saved) : getInitialDebtors();
  });

  const [creditors, setCreditors] = useState<Creditor[]>(() => {
    const saved = localStorage.getItem('fai_creditors');
    return saved ? JSON.parse(saved) : getInitialCreditors();
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('fai_goals');
    return saved ? JSON.parse(saved) : getInitialGoals();
  });

  const [security, setSecurity] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem('fai_security');
    return saved ? JSON.parse(saved) : { pinEnabled: false, pinCode: '', isLocked: false };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('fai_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [pinVerified, setPinVerified] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [cloudBackupInfo, setCloudBackupInfo] = useState<{ timestamp: string | null; message: string | null }>({
    timestamp: null,
    message: null,
  });

  // Save changes to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('fai_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('fai_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('fai_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fai_investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('fai_debtors', JSON.stringify(debtors));
  }, [debtors]);

  useEffect(() => {
    localStorage.setItem('fai_creditors', JSON.stringify(creditors));
  }, [creditors]);

  useEffect(() => {
    localStorage.setItem('fai_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('fai_security', JSON.stringify(security));
  }, [security]);

  useEffect(() => {
    localStorage.setItem('fai_settings', JSON.stringify(settings));
  }, [settings]);

  // Generate intelligent alerts dynamically
  useEffect(() => {
    const generatedAlerts: string[] = [];
    const today = new Date();
    const currentDay = today.getDate();

    // 1. Credit Card invoice due dates approaching
    cards.forEach(card => {
      // Find invoice for current month
      const invoice = getCardInvoice(card.id, today.getFullYear(), today.getMonth() + 1);
      if (invoice.total > 0) {
        const daysToDue = card.dueDay - currentDay;
        if (daysToDue > 0 && daysToDue <= 5) {
          generatedAlerts.push(`Fatura do cartão ${card.cardName} vence em ${daysToDue} dias (R$ ${invoice.total.toFixed(2)}).`);
        } else if (daysToDue === 0) {
          generatedAlerts.push(`Fatura do cartão ${card.cardName} VENCE HOJE! Valor: R$ ${invoice.total.toFixed(2)}.`);
        }
      }

      // High credit usage alert
      const invoiceTotal = getCardInvoice(card.id, today.getFullYear(), today.getMonth() + 1).total;
      if (invoiceTotal > card.limit * 0.75) {
        generatedAlerts.push(`Uso de limite elevado no cartão ${card.cardName} (${((invoiceTotal / card.limit) * 100).toFixed(0)}% do limite utilizado).`);
      }
    });

    // 2. Low Balance Alerts
    accounts.forEach(acc => {
      if (acc.balance < 200 && acc.type === 'checking') {
        generatedAlerts.push(`Saldo baixo na conta ${acc.name}: R$ ${acc.balance.toFixed(2)}.`);
      }
    });

    // 3. Goal Achieved Alerts
    goals.forEach(goal => {
      if (goal.currentAmount >= goal.targetAmount) {
        generatedAlerts.push(`Parabéns! Você atingiu 100% da sua meta "${goal.name}".`);
      }
    });

    // 4. Debts Overdue Alerts
    debtors.forEach(debt => {
      if (debt.status === 'overdue') {
        generatedAlerts.push(`Cobrança atrasada de ${debt.name}: R$ ${debt.amount.toFixed(2)}.`);
      }
    });

    setAlerts(generatedAlerts);
  }, [accounts, cards, transactions, goals, debtors]);

  // Reset Lock on startup if PIN is enabled
  useEffect(() => {
    if (security.pinEnabled && !pinVerified) {
      setSecurity(prev => ({ ...prev, isLocked: true }));
    } else {
      setSecurity(prev => ({ ...prev, isLocked: false }));
    }
  }, [security.pinEnabled, pinVerified]);

  // Helper: Card Invoice recalculator
  // Accounts for card's closingDay and dueDay to map transactions to correct invoice months.
  const getCardInvoice = (cardId: string, year: number, month: number) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return { total: 0, transactions: [] };

    const cardTx = transactions.filter(t => t.cardId === cardId);
    let invoiceTotal = 0;
    const invoiceTx: Transaction[] = [];

    cardTx.forEach(tx => {
      const txDate = new Date(tx.date + 'T00:00:00');
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth() + 1; // 1-indexed
      const txDay = txDate.getDate();

      // Card billing month assignment:
      // If purchase day is strictly after closingDay, it falls into the NEXT invoice.
      // E.g. closingDay = 5. Purchase on June 6 falls into July invoice (which is due in July).
      // If purchase day <= closingDay, it falls into current month's invoice.
      let invoiceBillingMonth = txMonth;
      let invoiceBillingYear = txYear;

      if (txDay > card.closingDay) {
        invoiceBillingMonth += 1;
        if (invoiceBillingMonth > 12) {
          invoiceBillingMonth = 1;
          invoiceBillingYear += 1;
        }
      }

      // If it is an installment, each installment is offset by its index minus 1
      if (tx.installmentsCount && tx.currentInstallment) {
        // The transaction stored represents one specific installment.
        // It has a specific date. We should verify if its transaction date falls in the query month/year.
        // Let's check if the computed invoice billing month and year matches the requested year and month.
        if (invoiceBillingYear === year && invoiceBillingMonth === month) {
          invoiceTotal += Math.abs(tx.amount);
          invoiceTx.push(tx);
        }
      } else {
        // Normal card purchase
        if (invoiceBillingYear === year && invoiceBillingMonth === month) {
          invoiceTotal += Math.abs(tx.amount);
          invoiceTx.push(tx);
        }
      }
    });

    return { total: invoiceTotal, transactions: invoiceTx };
  };

  // Predictive Future Commitment Calculations
  // Iterates future months (1 to 12) to estimate total committed capital
  const getMonthlyCommitments = (year: number, month: number) => {
    const breakdown: Array<{ name: string; amount: number; category: string; source: string }> = [];
    let installmentsSum = 0;
    let subscriptionsSum = 0;
    let debtsSum = 0;
    let recurringBillsSum = 0;

    // 1. Credit Card Invoices due in this future month
    cards.forEach(card => {
      const invoice = getCardInvoice(card.id, year, month);
      if (invoice.total > 0) {
        installmentsSum += invoice.total;
        invoice.transactions.forEach(tx => {
          breakdown.push({
            name: tx.description,
            amount: Math.abs(tx.amount),
            category: tx.category,
            source: `Fatura ${card.bank}`,
          });
        });
      }
    });

    // 2. Active Creditor commitments (Quem Eu Devo)
    // E.g. loan installments
    creditors.forEach(cred => {
      const credDate = new Date(cred.date + 'T00:00:00');
      const startMonth = credDate.getMonth() + 1;
      const startYear = credDate.getFullYear();

      // Total months of duration
      const totalInstallments = cred.installmentsCount;
      const currentAtStart = cred.currentInstallment;
      const remainingAtStart = totalInstallments - currentAtStart + 1;

      // Check if requested month falls within the loan duration
      // Compute month offset
      const monthsDiff = (year - startYear) * 12 + (month - startMonth);
      if (monthsDiff >= 0 && monthsDiff < remainingAtStart && cred.status === 'pending') {
        const estAmount = cred.amount;
        debtsSum += estAmount;
        breakdown.push({
          name: `${cred.creditor} (Parc. ${currentAtStart + monthsDiff}/${totalInstallments})`,
          amount: estAmount,
          category: 'Dividas',
          source: 'Dívidas Ativas',
        });
      }
    });

    // 3. Subscriptions (Assinaturas)
    // Subscriptions run every month. We look at transactions in the current month categorized as "Lazer" or containing "Assinatura" and simulate them.
    // Or we look at existing transactions marked as recurring subscription in initial data
    const activeSubs = transactions.filter(t => t.description.toLowerCase().includes('assinatura') || t.description.toLowerCase().includes('recorrente'));
    // Unique list by description
    const uniqueSubs = Array.from(new Map<string, Transaction>(activeSubs.map(item => [item.description, item])).values());
    
    uniqueSubs.forEach(sub => {
      const amt = Math.abs(sub.amount);
      subscriptionsSum += amt;
      breakdown.push({
        name: sub.description,
        amount: amt,
        category: sub.category,
        source: sub.cardId ? `Cartão: ${cards.find(c => c.id === sub.cardId)?.bank || 'Crédito'}` : 'Débito em Conta',
      });
    });

    // 4. Fixed Recurring Bills (e.g. Aluguel, Internet, Academia)
    const fixedBills = transactions.filter(t => 
      t.description.toLowerCase().includes('aluguel') || 
      t.description.toLowerCase().includes('academia') || 
      t.description.toLowerCase().includes('fibra') ||
      t.description.toLowerCase().includes('internet')
    );
    const uniqueFixed = Array.from(new Map<string, Transaction>(fixedBills.map(item => [item.description, item])).values());

    uniqueFixed.forEach(bill => {
      const amt = Math.abs(bill.amount);
      recurringBillsSum += amt;
      breakdown.push({
        name: bill.description,
        amount: amt,
        category: bill.category,
        source: 'Conta Bancária',
      });
    });

    return {
      installments: installmentsSum,
      subscriptions: subscriptionsSum,
      debts: debtsSum,
      recurringBills: recurringBillsSum,
      total: installmentsSum + subscriptionsSum + debtsSum + recurringBillsSum,
      breakdown,
    };
  };

  // Computes summary of commitments for next 1, 3, 6, and 12 months ahead
  const getFutureSummary = () => {
    const today = new Date();
    let nextMonthTotal = 0;
    let threeMonthsTotal = 0;
    let sixMonthsTotal = 0;
    let twelveMonthsTotal = 0;

    for (let i = 1; i <= 12; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 15);
      const year = futureDate.getFullYear();
      const month = futureDate.getMonth() + 1;
      const mCommit = getMonthlyCommitments(year, month);

      if (i === 1) nextMonthTotal = mCommit.total;
      if (i <= 3) threeMonthsTotal += mCommit.total;
      if (i <= 6) sixMonthsTotal += mCommit.total;
      twelveMonthsTotal += mCommit.total;
    }

    return {
      nextMonthTotal,
      threeMonthsTotal,
      sixMonthsTotal,
      twelveMonthsTotal,
    };
  };

  // Data Modifiers
  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = { ...acc, id: `acc_${Date.now()}` };
    setAccounts(prev => [...prev, newAcc]);
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    // Unbind transactions
    setTransactions(prev => prev.filter(t => t.accountId !== id));
  };

  const addCard = (card: Omit<Card, 'id'>) => {
    const newCard: Card = { ...card, id: `card_${Date.now()}` };
    setCards(prev => [...prev, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setTransactions(prev => prev.filter(t => t.cardId !== id));
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    // If installments is configured, create all installments sequentially
    if (tx.installmentsCount && tx.installmentsCount > 1) {
      const installmentsList: Transaction[] = [];
      const rootId = `tx_inst_${Date.now()}`;
      const baseDate = new Date(tx.date + 'T00:00:00');
      const installmentAmount = +(tx.amount / tx.installmentsCount).toFixed(2);

      for (let i = 1; i <= tx.installmentsCount; i++) {
        const d = new Date(baseDate);
        d.setMonth(baseDate.getMonth() + (i - 1));
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        installmentsList.push({
          id: `${rootId}_p_${i}`,
          description: `${tx.description} (Parcela ${i}/${tx.installmentsCount})`,
          amount: installmentAmount,
          type: tx.type,
          date: `${year}-${month}-${day}`,
          category: tx.category,
          accountId: tx.accountId,
          cardId: tx.cardId,
          installmentsCount: tx.installmentsCount,
          currentInstallment: i,
          originalTransactionId: rootId,
        });
      }

      setTransactions(prev => [...prev, ...installmentsList]);

      // Deduct/Add from account only if not credit card.
      // If it's a credit card transaction, it accumulates on the card limit, not checking account immediately.
      if (!tx.cardId) {
        setAccounts(prev => prev.map(a => {
          if (a.id === tx.accountId) {
            return { ...a, balance: a.balance + tx.amount };
          }
          return a;
        }));
      }
    } else {
      // Normal transaction
      const newTx: Transaction = { ...tx, id: `tx_${Date.now()}` };
      setTransactions(prev => [...prev, newTx]);

      // Update account balance
      if (!tx.cardId) {
        setAccounts(prev => prev.map(a => {
          if (a.id === tx.accountId) {
            return { ...a, balance: a.balance + tx.amount };
          }
          return a;
        }));
      }
    }
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Refund the account balance if it wasn't a credit card charge
    if (!tx.cardId) {
      setAccounts(prev => prev.map(a => {
        if (a.id === tx.accountId) {
          return { ...a, balance: a.balance - tx.amount };
        }
        return a;
      }));
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addInvestment = (inv: Omit<Investment, 'id'>) => {
    const newInv: Investment = { ...inv, id: `inv_${Date.now()}` };
    setInvestments(prev => [...prev, newInv]);
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const addDebtor = (debt: Omit<Debtor, 'id'>) => {
    const newDebt: Debtor = { ...debt, id: `debt_${Date.now()}` };
    setDebtors(prev => [...prev, newDebt]);
  };

  const updateDebtorStatus = (id: string, status: Debtor['status']) => {
    setDebtors(prev => prev.map(d => {
      if (d.id === id) {
        // If marked as received, optionally credit the first checking account
        if (status === 'received' && d.status !== 'received') {
          if (accounts.length > 0) {
            setAccounts(accs => accs.map((a, idx) => idx === 0 ? { ...a, balance: a.balance + d.amount } : a));
          }
        }
        return { ...d, status };
      }
      return d;
    }));
  };

  const deleteDebtor = (id: string) => {
    setDebtors(prev => prev.filter(d => d.id !== id));
  };

  const addCreditor = (cred: Omit<Creditor, 'id'>) => {
    const newCred: Creditor = { ...cred, id: `cred_${Date.now()}` };
    setCreditors(prev => [...prev, newCred]);
  };

  const payCreditorInstallment = (id: string) => {
    setCreditors(prev => prev.map(c => {
      if (c.id === id) {
        // Deduct from first checking account
        if (accounts.length > 0) {
          setAccounts(accs => accs.map((a, idx) => idx === 0 ? { ...a, balance: a.balance - c.amount } : a));
        }

        const nextInstallment = c.currentInstallment + 1;
        if (nextInstallment > c.installmentsCount) {
          return { ...c, currentInstallment: c.installmentsCount, status: 'paid' as const };
        }
        return { ...c, currentInstallment: nextInstallment };
      }
      return c;
    }));
  };

  const deleteCreditor = (id: string) => {
    setCreditors(prev => prev.filter(c => c.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goal, id: `goal_${Date.now()}` };
    setGoals(prev => [...prev, newGoal]);
  };

  const fundGoal = (id: string, amount: number, sourceAccountId: string) => {
    const account = accounts.find(a => a.id === sourceAccountId);
    if (!account || account.balance < amount) return false;

    // Deduct from account
    setAccounts(prev => prev.map(a => a.id === sourceAccountId ? { ...a, balance: a.balance - amount } : a));
    // Add to goal
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
    return true;
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateSecurity = (settings: Partial<SecuritySettings>) => {
    setSecurity(prev => ({ ...prev, ...settings }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetAllData = () => {
    setAccounts(initialAccounts);
    setCards(initialCards);
    setTransactions(getInitialTransactions());
    setInvestments(getInitialInvestments());
    setDebtors(getInitialDebtors());
    setCreditors(getInitialCreditors());
    setGoals(getInitialGoals());
    setSecurity({ pinEnabled: false, pinCode: '', isLocked: false });
    setSettings(defaultSettings);
    setPinVerified(false);
  };

  const exportBackup = () => {
    const data = {
      accounts,
      cards,
      transactions,
      investments,
      debtors,
      creditors,
      goals,
      security,
      settings,
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackup = (data: any) => {
    try {
      if (data.accounts) setAccounts(data.accounts);
      if (data.cards) setCards(data.cards);
      if (data.transactions) setTransactions(data.transactions);
      if (data.investments) setInvestments(data.investments);
      if (data.debtors) setDebtors(data.debtors);
      if (data.creditors) setCreditors(data.creditors);
      if (data.goals) setGoals(data.goals);
      if (data.security) setSecurity(data.security);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const saveToCloud = async () => {
    try {
      const backupStr = exportBackup();
      const res = await fetch('/api/backup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.parse(backupStr) }),
      });
      const data = await res.json();
      if (data.success) {
        setCloudBackupInfo({ timestamp: data.timestamp, message: data.message });
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const loadFromCloud = async () => {
    try {
      const res = await fetch('/api/backup/load');
      const data = await res.json();
      if (data.success && data.backup?.payload) {
        importBackup(data.backup.payload);
        setCloudBackupInfo({
          timestamp: data.backup.timestamp,
          message: 'Sincronizado da nuvem com sucesso!',
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        cards,
        transactions,
        investments,
        debtors,
        creditors,
        goals,
        security,
        settings,
        updateSettings,
        activeView,
        setActiveView,
        pinVerified,
        setPinVerified,
        alerts,
        cloudBackupInfo,
        addAccount,
        deleteAccount,
        addCard,
        deleteCard,
        addTransaction,
        deleteTransaction,
        addInvestment,
        deleteInvestment,
        addDebtor,
        updateDebtorStatus,
        deleteDebtor,
        addCreditor,
        payCreditorInstallment,
        deleteCreditor,
        addGoal,
        fundGoal,
        deleteGoal,
        updateSecurity,
        resetAllData,
        importBackup,
        exportBackup,
        saveToCloud,
        loadFromCloud,
        getMonthlyCommitments,
        getFutureSummary,
        getCardInvoice,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
