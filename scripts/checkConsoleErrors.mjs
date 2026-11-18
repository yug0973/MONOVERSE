import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:5180...');
  try {
    await page.goto('http://localhost:5180', { waitUntil: 'load', timeout: 20000 });
    console.log('Page loaded successfully. Checking HTML...');
    const content = await page.content();
    console.log('Title:', await page.title());
    console.log('Canvas count:', await page.locator('canvas').count());
  } catch (err) {
    console.error('Navigation error:', err.message);
  } finally {
    await browser.close();
  }
}

check();
