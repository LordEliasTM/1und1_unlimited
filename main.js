import puppeteer from 'puppeteer';
import 'dotenv/config';

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto('https://account.1und1.de/?redirect_url=https%3A%2F%2Fcontrol-center.1und1.de%2F');

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  await page.type("#login-form-user", process.env.MAIL);
  await page.type("#login-form-password", process.env.PASS);
  await page.click("#login-button");

  await page.waitForNetworkIdle();

  await page.click("#consent_wall_optin");

  await page.goto("https://control-center.1und1.de/usages.html")
  
  //await browser.close();
})();