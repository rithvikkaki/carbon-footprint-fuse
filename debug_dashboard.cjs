const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.type('#email', 'demo@ecofuse.org');
  await page.type('#password', 'password123');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  const html = await page.evaluate(() => document.body.innerText);
  console.log('DASHBOARD TEXT SNIPPET:\n', html.substring(0, 1000));
  await browser.close();
})();
