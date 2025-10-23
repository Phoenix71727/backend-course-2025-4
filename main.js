// 1. Імпортуємо необхідні модулі
const http = require('http'); // Для створення сервера
const fs = require('fs'); // Для перевірки файлу
const { program } = require('commander'); // Для зчитування аргументів

// 2. Налаштовуємо commander (БЕЗ .requiredOption())
program
  .option('-i, --input <path>', 'Input JSON file path')
  .option('-h, --host <host>', 'Server host')
  .option('-p, --port <port>', 'Server port');

// Парсимо аргументи, які передали при запуску
program.parse(process.argv);
const options = program.opts();

// 6. ВЛАСНА ПЕРЕВІРКА обов'язкових параметрів (англійською)
if (!options.input) {
  console.error('Error: Required option --input is missing.');
  process.exit(1);
}
if (!options.host) {
  console.error('Error: Required option --host is missing.');
  process.exit(1);
}
if (!options.port) {
  console.error('Error: Required option --port is missing.');
  process.exit(1);
}

// 3. Перевірка існування файлу (вже була англійською)
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file'); 
  process.exit(1); // Виходимо з програми з кодом помилки
}

// 4. Створення та запуск HTTP-сервера
const server = http.createServer((request, response) => {
  
  // Ця частина буде реалізована в Частині 2
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Server is running. Part 2 (mtcars logic) is not implemented yet.');
  
});

// Сервер починає "слухати" на вказаних хості та порті
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
  console.log(`Reading data from: ${options.input}`);
});