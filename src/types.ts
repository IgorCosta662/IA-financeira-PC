export type AccountType = 'checking' | 'savings' | 'digital_wallet' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex';

export interface Card {
  id: string;
  bank: string;
  cardName: string;
  brand: CardBrand;
  limit: number;
  closingDay: number; // Day of the month
  dueDay: number; // Day of the month
  color: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';

export type TransactionCategory =
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Moradia'
  | 'Lazer'
  | 'Compras'
  | 'Outros';

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Negative for expense, positive for income/refund
  type: TransactionType;
  date: string; // YYYY-MM-DD
  category: TransactionCategory;
  accountId: string; // Source/target account
  cardId?: string; // Optional credit card reference
  installmentsCount?: number; // 1 if not installment
  currentInstallment?: number; // 1-indexed
  originalTransactionId?: string; // Links recurring/installment instances
}

export type InvestmentType =
  | 'Tesouro Direto'
  | 'CDB'
  | 'LCI'
  | 'LCA'
  | 'Ações'
  | 'FIIs'
  | 'ETFs'
  | 'Criptomoedas';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentAmount: number;
  yieldRate: number; // Annual % rate or accumulated gain
  dividendsReceived: number;
  purchaseDate: string; // YYYY-MM-DD
}

export type DebtorStatus = 'received' | 'pending' | 'overdue';

export interface Debtor {
  id: string;
  name: string;
  amount: number;
  date: string; // YYYY-MM-DD
  observation: string;
  status: DebtorStatus;
}

export interface Creditor {
  id: string;
  creditor: string;
  amount: number;
  date: string; // YYYY-MM-DD
  installmentsCount: number;
  currentInstallment: number;
  interestRate: number; // % annual or fixed
  status: 'paid' | 'pending';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
}

export interface SecuritySettings {
  pinEnabled: boolean;
  pinCode: string; // 4 digits
  isLocked: boolean;
}

export interface AppSettings {
  userName: string;
  currency: 'BRL' | 'USD' | 'EUR';
  hideBalanceDefault: boolean;
  themeColor: 'blue' | 'purple' | 'emerald' | 'slate';
  customGeminiKey?: string;
  selectedModel?: string;
  selectedAgent?: string;
  selectedProvider?: 'gemini' | 'openai' | 'nvidia' | 'custom_openai';
  customOpenAiKey?: string;
  customNvidiaKey?: string;
  customOpenAiBase?: string;
  customOpenAiModel?: string;
}

