import { Account, Card, Transaction, Investment, Debtor, Creditor, Goal } from './types';

export const INITIAL_ACCOUNTS: Account[] = [];
export const INITIAL_CARDS: Card[] = [];
export const INITIAL_INVESTMENTS: Investment[] = [];

export const getInitialAccounts = (): Account[] => INITIAL_ACCOUNTS;
export const getInitialCards = (): Card[] => INITIAL_CARDS;
export const getInitialInvestments = (): Investment[] => [];
export const getInitialDebtors = (): Debtor[] => [];
export const getInitialCreditors = (): Creditor[] => [];
export const getInitialGoals = (): Goal[] => [];
export const getInitialTransactions = (): Transaction[] => [];
