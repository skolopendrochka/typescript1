import { IAccount } from '../interfaces/IAccount';
import { ITransaction } from '../interfaces/ITransaction';
import { ISummary } from '../interfaces/ISummary';
import { escapeCsvValue } from '../utils/escapeCsvValue';

export class Account implements IAccount {
  public readonly id: string;
  public name: string;
  public transactions: ITransaction[];

  constructor(name: string) {
    this.id = this.generateId();
    this.name = name;
    this.transactions = [];
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  getBalance(): number {
    return this.transactions.reduce((balance, transaction) => {
      return balance + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);
  }

  getSummary(): ISummary {
    const totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }

  addTransaction(transaction: ITransaction): void {
    this.transactions.push(transaction);
  }

  removeTransaction(transactionId: string): boolean {
    const index = this.transactions.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      this.transactions.splice(index, 1);
      return true;
    }
    return false;
  }

  toString(): string {
    return `${this.id.substring(0, 8)} | ${this.name} | Баланс: ${this.getBalance()}`;
  }

  getSummaryString(): string {
    const summary = this.getSummary();
    return `${this.name}\nБаланс: ${summary.balance}\nДоходы: ${summary.totalIncome}\nРасходы: ${summary.totalExpense}`;
  }

  exportToCSV(): string {
    const headers = 'ID,Дата,Тип,Сумма,Описание\n';
    const rows = this.transactions.map(t => {
      const dateStr = t.date.toISOString().split('T')[0];
      const id = escapeCsvValue(t.id.substring(0, 8));
      const date = escapeCsvValue(dateStr);
      const type = escapeCsvValue(t.type);
      const amount = escapeCsvValue(t.amount.toString());
      const description = escapeCsvValue(t.description);
      return `${id},${date},${type},${amount},${description}`;
    });
    return headers + rows.join('\n');
  }
}
