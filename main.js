import puppeteer from 'puppeteer';
import 'dotenv/config';

/**
 * @param {number} time
 * @param {"seconds"|"minutes"|"hours"} unit
 * @returns {Promise<void>}
 */
async function waitTime(time, unit) {
  const timeInMilliseconds = {
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
  };

  if (!timeInMilliseconds[unit]) unit = "seconds";

  return new Promise((resolve) => {
      setTimeout(resolve, time * timeInMilliseconds[unit]);
  });
}

const buttonPlus1GbSelector = 'button[data-testid^="+1"]';

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  console.log("Loading login page...")
  // Navigate the page to a URL
  await page.goto('https://account.1und1.de/?redirect_url=https%3A%2F%2Fcontrol-center.1und1.de%2F');

  // Set screen size
  //await page.setViewport({width: 1080, height: 1024});

  console.log("Entering credentials...")
  await page.type("#login-form-user", process.env.MAIL);
  await page.type("#login-form-password", process.env.PASS);
  await page.click("#login-button");
  console.log("Logging in...");

  await page.waitForSelector("#consent_wall_optin");
  console.log("Accepting cookies...");
  await page.click("#consent_wall_optin");

  console.log("Loading usage page...");
  await page.goto("https://control-center.1und1.de/usages.html", {waitUntil:"networkidle2"});
  if(await page.$(buttonPlus1GbSelector)) {
    console.log("Login successful");
  }
  else console.log("Login failed");

  do {
    console.log("Loading usage page...");
    await page.goto("https://control-center.1und1.de/usages.html", {waitUntil:"networkidle2"});
    const isDisabled = await page.$eval(buttonPlus1GbSelector, button => button.disabled);
    if(isDisabled) {
      console.log("+1 GB Button is disabled");
    }
    else {
      console.log("Adding 1 GB of data volume :)");
      await page.click(buttonPlus1GbSelector);
    }
  } while(await waitTime(10, "minutes"))
  
  //await browser.close();
})();