import { IAccountManager } from '../interfaces/IAccountManager';
import { IAccount } from '../interfaces/IAccount';

export class AccountManager implements IAccountManager {
  public accounts: IAccount[];

  constructor() {
    this.accounts = [];
  }

  addAccount(account: IAccount): void {
    this.accounts.push(account);
  }

  removeAccount(accountId: string): boolean {
    const index = this.accounts.findIndex(a => a.id === accountId);
    if (index !== -1) {
      this.accounts.splice(index, 1);
      return true;
    }
    return false;
  }

  getAccount(accountId: string): IAccount | undefined {
    return this.accounts.find(a => a.id === accountId);
  }

  getAllAccounts(): IAccount[] {
    return this.accounts;
  }
}
