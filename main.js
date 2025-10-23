// 1. Імпортую модулі
const http = require('http'); 
const fs = require('fs'); 
const url = require('url');
const { program } = require('commander'); 
const { XMLBuilder } = require('fast-xml-parser');

// 2. Налаштовую commander
program
  .option('-i, --input <path>', 'Input JSON file path')
  .option('-h, --host <host>', 'Server host')
  .option('-p, --port <port>', 'Server port');

program.parse(process.argv);
const options = program.opts();

// 3. Власна перевірка обов'язкових параметрів
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

// 4. Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file'); 
  process.exit(1); 
}

// === ФУНКЦІЯ ЧИТАННЯ ФАЙЛУ ===
function readNDJSONFile(filePath) {
  // Обгортаю fs.readFile (який працює на колбеках) у Promise,
  // щоб вона могла використовувати async/await
  return new Promise((resolve, reject) => {
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      // 1. Обробка помилки читання файлу
      if (err) {
        if (err.code === 'ENOENT') {
          return reject(new Error('Cannot find input file'));
        }
        return reject(new Error('Error reading NDJSON file: ' + err.message));
      }

      // 2. Обробка даних (якщо читання успішне)
      try {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const jsonData = [];
        for (let i = 0; i < lines.length; i++) {
          try {
            const parsedLine = JSON.parse(lines[i]);
            jsonData.push(parsedLine);
          } catch (parseError) {
            console.warn(`Skipping invalid JSON at line ${i + 1}`);
          }
        }
        // Успішно - повертаємо дані
        resolve(jsonData); 
      
      } catch (processError) {
        // Помилка під час парсингу
        reject(new Error('Error processing file data: ' + processError.message));
      }
    });
  });
}

// === ФУНКЦІЯ ОБРОБКИ ДАНИХ === 
function processMtcarsData(data, queryParams) {
  let filteredData = Array.isArray(data) ? [...data] : [data];

  if (queryParams.max_mpg) {
    const maxMpg = parseFloat(queryParams.max_mpg);
    filteredData = filteredData.filter(car => {
      return car && car.mpg !== undefined && car.mpg !== null && car.mpg < maxMpg;
    });
  }
  const result = filteredData.map(car => {
    const transformedCar = {
      model: car.model || car.Model || 'Unknown',
      mpg: car.mpg || car.MPG || car.mpg || 0
    };
    if (queryParams.cylinders === 'true') {
      transformedCar.cyl = car.cyl || car.cylinders || car.Cyl || 0;
    }
    return transformedCar;
  });
  return result;
}


// 5. Створення та запуск HTTP-сервера
const server = http.createServer(async (request, response) => { // <-- Додано "async"
  
  if (request.url === '/favicon.ico') {
    response.writeHead(204); 
    response.end();
    return;
  }
  
  try {
    const parsedUrl = new URL(request.url, `http://${options.host}:${options.port}`);
    const queryParams = Object.fromEntries(parsedUrl.searchParams);

    // 1. ВИКЛИК ФУНКЦІЇ ЧИТАННЯ 
    const jsonData = await readNDJSONFile(options.input); // <-- Додано "await"

    // 2. ВИКЛИК ФУНКЦІЇ ОБРОБКИ 
    const processedData = processMtcarsData(jsonData, queryParams);

    // === СТВОРЕННЯ XML === 
    
    const builder = new XMLBuilder({
      format: true,
      arrayNodeName: "car" 
    });

    const rootObj = {
      cars: {
        car: processedData 
      }
    };
    
    const xmlOutput = builder.build(rootObj);
    
    // 4. ВІДПОВІДЬ СЕРВЕРА
    response.writeHead(200, { 'Content-Type': 'application/xml' });
    response.end(xmlOutput);

  } catch (error) { 
    console.error('Error processing request:', error.message);
    response.writeHead(500);
    response.end('Internal Server Error: ' + error.message);
  }
});

// Запуск сервера 
server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
  console.log(`Reading data from: ${options.input}`);
});