import { ApplicationController } from './classes/ApplicationController';
import { Account } from './classes/Account';
import { Transaction } from './classes/Transaction';

// Проверка поддержки интерактивного режима
if (!process.stdin.isTTY) {
  console.error('Ошибка: Терминал не поддерживает интерактивный режим.');
  console.error('Запустите приложение в интерактивном терминале (не через перенаправление ввода/вывода).');
  process.exit(1);
}

// Обработка необработанных ошибок
process.on('unhandledRejection', (error) => {
  console.error('\nНеобработанная ошибка:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\nВыход из приложения...');
  process.exit(0);
});

const controller = new ApplicationController();
setInitialState(controller);

controller.start().catch((error) => {
  console.error('\nПроизошла ошибка:', error);
  if (error instanceof Error && error.stack) {
    console.error('Стек ошибки:', error.stack);
  }
  process.exit(1);
});

function setInitialState(controller: ApplicationController) {
  const personalAccount = new Account('Личный бюджет');
  personalAccount.addTransaction(new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
  personalAccount.addTransaction(new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
  personalAccount.addTransaction(new Transaction(150, 'expense', '2023-01-09T00:00:00Z', 'Коммунальные услуги'));
  controller.accountManager.addAccount(personalAccount);

  const vacationAccount = new Account('Копилка на отпуск');
  vacationAccount.addTransaction(new Transaction(500, 'income', '2023-04-01T00:00:00Z', 'Премия'));
  vacationAccount.addTransaction(new Transaction(600, 'income', '2023-01-01T00:00:00Z', 'Возврат долга'));
  vacationAccount.addTransaction(new Transaction(300, 'expense', '2023-01-05T00:00:00Z', 'Билеты на самолёт'));
  vacationAccount.addTransaction(new Transaction(200, 'expense', '2023-01-09T00:00:00Z', 'Номер в отеле'));
  controller.accountManager.addAccount(vacationAccount);
}
