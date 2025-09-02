const https = require('https');

const API_URL = 'https://api.spinny.com/v3/api/listing/v3/?city=bangalore&product_type=cars&make=ford&category=used&page=1&show_max_on_assured=true&custom_budget_sort=true&prioritize_filter_listing=true&high_intent_required=false&active_banner=true';

const HEADERS = {
  'sec-ch-ua-platform': '"macOS"',
  'Referer': 'https://www.spinny.com/',
  'procurement-category': 'assured,luxury',
  'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
  'sec-ch-ua-mobile': '?0',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
  'anonymous-id': '2011517450.1755612422',
  'content-type': 'application/json',
  'platform': 'web'
};

// === Telegram Config ===
const TELEGRAM_TOKEN = "8224272603:AAE2eGDMBtgoeh4WwzMgTmTwcOdy38hs_tY";
const CHAT_ID = "1237891331";

function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
  https.get(url, (res) => {
    res.on('data', () => {}); // ignore response body
  }).on('error', err => {
    console.error('Telegram send error:', err);
  });
}

let seenIds = new Set();

function fetchFordCars() {
  https.get(API_URL, { headers: HEADERS }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const cars = json?.results || [];
        cars.forEach(car => {
          if (!seenIds.has(car.id)) {
            seenIds.add(car.id);
            const message = `🚗 New Ford Car Listed!\n\n` +
              `📌 Model: ${car.make} ${car.model} ${car.variant}\n` +
              `📅 Year: ${car.make_year}\n` +
              `⚡ Mileage: ${car.mileage} km\n` +
              `💰 Price: ₹${car.price}\n` +
              `🏙️ City: ${car.city}\n\n` +
              `🔗 Link: https://www.spinny.com${car.permanent_url}`;
            
            console.log(message);
            sendTelegramMessage(message);
          }
        });
      } catch (err) {
        console.error('Error parsing response:', err);
      }
    });
  }).on('error', err => {
    console.error('Request error:', err);
  });
}

// Initial fetch
fetchFordCars();
// Fetch every minute
setInterval(fetchFordCars, 60 * 1000);
