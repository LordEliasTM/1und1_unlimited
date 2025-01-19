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

const pollRateMinutes = 2;

const buttonPlus1GbSelector = 'button[data-testid^="+1"]';
const buttonAdded1GbOkSelector = '[data-testid="overlay"] button[data-testid="Ok"]';
const volumeUsedTextSelector = '[data-testid="usage-volume-used"] strong';
const volumeAvailableTextSelector = '[data-testid="unlimited-refill-flag"]';

const loginPageLink = "https://account.1und1.de/?redirect_url=https%3A%2F%2Fcontrol-center.1und1.de%2F";
const usagePageLink = "https://control-center.1und1.de/usages.html";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  // Open login page
  console.log("Loading login page...")
  await page.goto(loginPageLink);

  // Enter credentials and log in
  console.log("Entering credentials")
  await page.type("#login-form-user", process.env.MAIL);
  await page.type("#login-form-password", process.env.PASS);
  await page.click("#login-button");
  console.log("Logging in...");

  // Accept cookies
  await page.waitForNavigation();
  await page.waitForSelector("#consent_wall_optin");
  console.log("Accepting cookies");
  await page.click("#consent_wall_optin");

  // Assert that usage page loads correctly
  console.log("Loading usage page...");
  await page.goto(usagePageLink);
  await page.waitForSelector(buttonPlus1GbSelector);
  if(await page.$(buttonPlus1GbSelector)) {
    console.log("Login successful");
  }
  else throw console.log("Login failed");

  // Loop to add more volume
  do {
    console.log("Loading usage page...");
    await page.goto(usagePageLink);
    await page.waitForSelector(buttonPlus1GbSelector);

    const volumeUsed = await page.$eval(volumeUsedTextSelector, a => a.innerText);
    const volumeAvailable = await page.$eval(volumeAvailableTextSelector, a => a.innerText);
    console.log(`Volume used: ${volumeUsed} of ${volumeAvailable}`);

    const isDisabled = await page.$eval(buttonPlus1GbSelector, button => button.disabled);
    if(isDisabled) {
      console.log("+1 GB Button is disabled");
    }
    else {
      console.log("Adding 1 GB of data volume :)");
      await page.click(buttonPlus1GbSelector);
      await page.waitForSelector(buttonAdded1GbOkSelector);
      await page.click(buttonAdded1GbOkSelector);
    }

    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`Waiting ${pollRateMinutes} minutes from ${currentTime}\n`);
    await waitTime(pollRateMinutes, "minutes");
  } while(true)
  
  //await browser.close();
})();