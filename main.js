// 1. Імпортую необхідні модулі
const http = require('http'); // Для створення сервера
const fs = require('fs'); // Для перевірки файлу
const { program } = require('commander'); // Для зчитування аргументів

// 2. Налаштовую commander для трьох обов'язкових аргументів
program
  .requiredOption('-i, --input <path>', 'Input JSON file path')
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port');

// Паршу аргументи, які передали при запуску
program.parse(process.argv);
const options = program.opts();

// 3. Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1); // Виходимо з програми з кодом помилки
}

// 4. Створення та запуск HTTP-сервера
const server = http.createServer((request, response) => {
  
  // Ця частина буде реалізована в Частині 2
  // Поки що сервер просто відповідає, що він працює
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Server is running.\n');
  
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
  console.log(`Reading data from: ${options.input}`);
});