import { ITransaction } from '../interfaces/ITransaction';
import { TransactionType } from '../interfaces/TransactionType';

export class Transaction implements ITransaction {
  public readonly id: string;
  public readonly amount: number;
  public readonly type: TransactionType;
  public readonly date: Date;
  public readonly description: string;

  constructor(amount: number, type: TransactionType, date: string | Date, description: string) {
    this.id = this.generateId();
    this.amount = amount;
    this.type = type;
    this.date = typeof date === 'string' ? new Date(date) : date;
    this.description = description;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  toString(): string {
    const dateStr = this.date.toLocaleDateString('ru-RU');
    const sign = this.type === 'income' ? '+' : '-';
    return `${this.id.substring(0, 8)} | ${dateStr} | ${sign}${this.amount} | ${this.description}`;
  }
}
