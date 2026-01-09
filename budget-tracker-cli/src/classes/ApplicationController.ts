import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { AccountManager } from './AccountManager';
import { Account } from './Account';
import { Transaction } from './Transaction';
import { IAccount } from '../interfaces/IAccount';
import { TransactionType } from '../interfaces/TransactionType';

export class ApplicationController {
  public accountManager: AccountManager;

  constructor() {
    this.accountManager = new AccountManager();
  }

  async start(): Promise<void> {
    console.clear();
    await this.showMainMenu();
  }

  private async showMainMenu(): Promise<void> {
    const accounts = this.accountManager.getAllAccounts();

    const choices = [
      ...accounts.map(account => ({
        name: account.toString(),
        value: account.id
      })),
      { name: '➕ Создать новый счёт', value: 'create' },
      { name: '❌ Выход', value: 'exit' }
    ];

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Выберите действие:',
        choices
      }
    ]);

    if (answer.action === 'exit') {
      console.log('До свидания!');
      process.exit(0);
    } else if (answer.action === 'create') {
      await this.createAccount();
    } else {
      const account = this.accountManager.getAccount(answer.action);
      if (account) {
        await this.watchAccount(account);
      }
    }
  }

  async createAccount(): Promise<void> {
    console.clear();

    try {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Введите название счёта:',
          validate: (input: string) => {
            const trimmed = (input || '').trim();
            if (!trimmed) {
              return 'Название счёта не может быть пустым';
            }
            return true;
          },
          filter: (input: string) => {
            return (input || '').trim();
          }
        }
      ]);

      const accountName = answer?.name?.trim();
      if (accountName) {
        const account = new Account(accountName);
        this.accountManager.addAccount(account);

        console.log(`✅ Счёт "${accountName}" успешно создан!`);
        await this.waitForEnter();
        await this.start();
      } else {
        console.log('❌ Название счёта не было введено.');
        await this.waitForEnter();
        await this.start();
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'isTtyError' in error) {
        console.error('❌ Ошибка ввода. Убедитесь, что терминал поддерживает интерактивный режим.');
      } else {
        console.error('❌ Ошибка при создании счёта:', error instanceof Error ? error.message : 'Неизвестная ошибка');
      }
      await this.waitForEnter();
      await this.start();
    }
  }

  async watchAccount(account: IAccount): Promise<void> {
    console.clear();
    console.log('════════════════════════════════════════');
    console.log(account.getSummaryString());
    console.log('════════════════════════════════════════\n');

    if (account.transactions.length > 0) {
      console.log('Транзакции:');
      account.transactions.forEach((transaction, index) => {
        console.log(`${index + 1}. ${transaction.toString()}`);
      });
      console.log('');
    } else {
      console.log('Транзакций пока нет.\n');
    }

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Выберите действие:',
        choices: [
          { name: '➕ Добавить транзакцию', value: 'add' },
          { name: '🗑️  Удалить транзакцию', value: 'remove' },
          { name: '📊 Экспортировать в CSV', value: 'export' },
          { name: '❌ Удалить счёт', value: 'delete' },
          { name: '⬅️  Вернуться к списку счетов', value: 'back' }
        ]
      }
    ]);

    switch (answer.action) {
      case 'add':
        await this.addTransaction(account);
        break;
      case 'remove':
        await this.removeTransaction(account);
        break;
      case 'export':
        await this.exportTransactionsToCSV(account);
        break;
      case 'delete':
        await this.removeAccount(account);
        break;
      case 'back':
        await this.start();
        break;
    }
  }

  async addTransaction(account: IAccount): Promise<void> {
    console.clear();

    const today = new Date().toISOString().split('T')[0];

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'amount',
        message: 'Введите сумму транзакции:',
        validate: (input: string) => {
          const amount = parseFloat(input);
          if (isNaN(amount) || amount <= 0) {
            return 'Сумма должна быть положительным числом';
          }
          return true;
        },
        filter: (input: string) => parseFloat(input)
      },
      {
        type: 'list',
        name: 'type',
        message: 'Выберите тип транзакции:',
        choices: [
          { name: '💰 Доход', value: 'income' },
          { name: '💸 Расход', value: 'expense' }
        ]
      },
      {
        type: 'input',
        name: 'date',
        message: 'Введите дату транзакции (YYYY-MM-DD):',
        default: today,
        validate: (input: string) => {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(input)) {
            return 'Неверный формат даты. Используйте YYYY-MM-DD';
          }
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            return 'Неверная дата';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Введите описание транзакции:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Описание не может быть пустым';
          }
          return true;
        }
      }
    ]);

    const dateTime = `${answers.date}T00:00:00Z`;
    const transaction = new Transaction(
      answers.amount,
      answers.type as TransactionType,
      dateTime,
      answers.description
    );

    account.addTransaction(transaction);

    console.log('✅ Транзакция успешно добавлена!');
    await this.waitForEnter();
    await this.watchAccount(account);
  }

  async removeTransaction(account: IAccount): Promise<void> {
    console.clear();

    if (account.transactions.length === 0) {
      console.log('⚠️  В этом счёте нет транзакций для удаления.');
      await this.waitForEnter();
      await this.watchAccount(account);
      return;
    }

    const choices = account.transactions.map((transaction, index) => ({
      name: `${index + 1}. ${transaction.toString()}`,
      value: transaction.id
    }));

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'transactionId',
        message: 'Выберите транзакцию для удаления:',
        choices
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Вы уверены, что хотите удалить эту транзакцию?',
        default: false
      }
    ]);

    if (answer.confirm) {
      const success = account.removeTransaction(answer.transactionId);
      if (success) {
        console.log('✅ Транзакция успешно удалена!');
      } else {
        console.log('❌ Ошибка при удалении транзакции.');
      }
    } else {
      console.log('❌ Удаление отменено.');
    }

    await this.waitForEnter();
    await this.watchAccount(account);
  }

  async removeAccount(account: IAccount): Promise<void> {
    console.clear();

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Вы уверены, что хотите удалить счёт "${account.name}"? Все транзакции будут удалены.`,
        default: false
      }
    ]);

    if (answer.confirm) {
      const success = this.accountManager.removeAccount(account.id);
      if (success) {
        console.log(`✅ Счёт "${account.name}" успешно удалён!`);
      } else {
        console.log('❌ Ошибка при удалении счёта.');
      }
    } else {
      console.log('❌ Удаление отменено.');
    }

    await this.waitForEnter();
    await this.start();
  }

  async exportTransactionsToCSV(account: IAccount): Promise<void> {
    console.clear();

    if (account.transactions.length === 0) {
      console.log('⚠️  В этом счёте нет транзакций для экспорта.');
      await this.waitForEnter();
      await this.watchAccount(account);
      return;
    }

    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Введите имя файла (без расширения):',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Имя файла не может быть пустым';
          }
          if (!/^[a-zA-Zа-яА-Я0-9_-]+$/.test(input)) {
            return 'Имя файла может содержать только буквы, цифры, дефисы и подчёркивания';
          }
          return true;
        }
      }
    ]);

    try {
      const csvContent = account.exportToCSV();
      const filePath = path.join(process.cwd(), `${answer.filename}.csv`);

      fs.writeFileSync(filePath, csvContent, 'utf-8');

      console.log(`✅ Транзакции успешно экспортированы в файл "${answer.filename}.csv"`);
      console.log(`📁 Путь: ${filePath}`);
    } catch (error) {
      console.log(`❌ Ошибка при экспорте: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }

    await this.waitForEnter();
    await this.watchAccount(account);
  }

  private async waitForEnter(): Promise<void> {
    try {
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: 'Нажмите Enter для продолжения...',
          default: ''
        }
      ]);
    } catch (error) {
      // Игнорируем ошибки при ожидании Enter, просто продолжаем
      console.log('');
    }
  }
}
