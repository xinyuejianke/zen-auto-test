import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Browser, Builder, Locator, until, WebDriver, WebElement} from "selenium-webdriver";

async function getFilePath(targetFileName: string, startDir: string = process.cwd()): Promise<string | null> {
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
    const target = await driver.findElement(locator)
    return driver.wait(until.elementIsVisible(target))
  } catch {
    if (maxTries > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
      return getElement(driver, locator, timeout, maxTries - 1)
    } else {
      throw new Error(`Exceed max retry, no such element with xpath: ${locator.toString()}`);
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

  if (status !== "complete" && maxTries > 0) {
    await new Promise((resolve) => setTimeout(resolve, timeout));
    await waitForPageLoaded(driver, timeout, maxTries - 1);
  } else if (status !== "complete" && maxTries <= 0) {
    throw new Error(
      `Failed to loaded page due to exceed max waiting time: ${timeout} seconds`
    );
  }
}

async function waitUntilNotVisible(
  driver: WebDriver = new Builder().forBrowser(Browser.CHROME).build(),
  locator: Locator,
  timeout: number = 5_000,
  maxTries: number = 3
) :Promise<void> {
  try {
    await driver.wait(until.elementLocated(locator), timeout)
    if (maxTries <= 0) {
      throw new Error( `Target element '${locator.toString()}' not in invisible status`);
    } else {
      await new Promise((r) => setTimeout(r, timeout));
      return await waitUntilNotVisible(driver, locator, timeout, maxTries - 1);
    }
  } catch {
    //the target element is invisible
  }
}

export { getFilePath, getElement, waitForPageLoaded, waitUntilNotVisible};