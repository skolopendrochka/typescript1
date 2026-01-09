import { ITransaction } from './ITransaction';
import { ISummary } from './ISummary';

export interface IAccount {
  id: string;
  name: string;
  transactions: ITransaction[];
  getBalance(): number;
  getSummary(): ISummary;
  addTransaction(transaction: ITransaction): void;
  removeTransaction(transactionId: string): boolean;
  toString(): string;
  getSummaryString(): string;
  exportToCSV(): string;
}
