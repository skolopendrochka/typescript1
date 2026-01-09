import { IAccount } from './IAccount';

export interface IAccountManager {
  accounts: IAccount[];
  addAccount(account: IAccount): void;
  removeAccount(accountId: string): boolean;
  getAccount(accountId: string): IAccount | undefined;
  getAllAccounts(): IAccount[];
}
