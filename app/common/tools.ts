import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Browser, Builder, Locator, until, WebDriver, WebElement} from "selenium-webdriver";

async function getFilePath(
  targetFileName: string, 
  startDir: string = process.cwd()
): Promise<string | null> {
  try {
    const files = await readdirSync(startDir);

    for (const file of files) {
      const filePath = join(startDir, file);
      const stat = await statSync(filePath);

      if (stat.isDirectory()) {
        const foundPath = await getFilePath(targetFileName, filePath);
        if (foundPath) {
          return foundPath;
        }
      } else if (file === targetFileName) {
        return filePath;
      }
    }
    return null;
  } catch (err) {
    console.error(`Error reading directory ${startDir}:`, err);
    return null;
  }
}

async function getElement(
  driver: WebDriver = new Builder().forBrowser(Browser.CHROME).build(),
  locator: Locator,
  timeout: number = 5_000,
  maxTries: number = 3
): Promise<WebElement> {
  try {
    const target: WebElement = await driver.findElement(locator)
    return driver.wait(until.elementIsVisible(target))
  } catch {
    if (maxTries > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
      return getElement(driver, locator, timeout, maxTries - 1)
    } else {
      throw until.elementIsNotVisible(await driver.findElement(locator))
    }
  }
}

async function waitForPageLoaded(
  driver: WebDriver = new Builder().forBrowser(Browser.CHROME).build(),
  timeout: number = 5_000,
  maxTries: number = 3
): Promise<void> {
  let status: string;
  try {
    status = await driver.executeScript("return document.readyState");
  } catch (err) {
    throw new Error(`Failed to load page due to ${err}`);
  }

  if (maxTries < 0 && status !== 'complete') {
    throw new Error( `Failed to loaded page due to exceed max waiting time: ${timeout} seconds`);

  } else if (maxTries > 0 && status !== 'complete') {
    await new Promise((resolve) => setTimeout(resolve, timeout));
    return await waitForPageLoaded(driver, timeout, maxTries - 1);

  } else if (status === 'complete') {
    return
  }
}

async function waitUntilNotVisible(
  driver: WebDriver = new Builder().forBrowser(Browser.CHROME).build(),
  locator: Locator,
  timeout: number = 3_000,
  maxTries: number = 3
) :Promise<void> {
    try {
      const targetVisible: boolean = await driver.findElement(locator).isDisplayed()
      if (maxTries < 0) {
        throw new Error( `Target element '${locator.toString()}' not in invisible status`);
      } else if (targetVisible && maxTries > 0) {
        await new Promise((resolve) => setTimeout(resolve, timeout));
        return await waitUntilNotVisible(driver, locator, timeout, maxTries - 1)
      }
    } catch {
      return //the target element is invisible
    }
}

async function fillInputValue(
  driver: WebDriver = new Builder().forBrowser(Browser.CHROME).build(),
  locator: Locator,
  value: string,
  timeout: number = 5_000,
  maxTries: number = 3
): Promise<void> {
  await waitForPageLoaded(driver, timeout, maxTries)

  const targetInput = await getElement(driver, locator, timeout, maxTries)
  if (await targetInput.isDisplayed()) {
    await targetInput.clear()
    await targetInput.sendKeys(value.replace(/\\n/g, ''))
  }
}

export { getFilePath, getElement, waitForPageLoaded, waitUntilNotVisible, fillInputValue};