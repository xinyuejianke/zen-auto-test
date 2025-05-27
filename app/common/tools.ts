import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Browser, Builder, By, until, WebDriver, WebElementPromise} from "selenium-webdriver";

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
  xpath: string,
  maxTries: number = 3,
  timeout: number = 5_000
): Promise<WebElementPromise> {
  try {
    return await driver.findElement(By.xpath(xpath));
  } catch {
    if (maxTries > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
      return getElement(driver, xpath, maxTries - 1, timeout);
    } else {
      throw new Error(`Exceed max retry, no such element with xpath: ${xpath}`);
    }
  }
}

async function waitForPageLoaded(
  driver: WebDriver = new Builder().forBrowser(Browser.CHROME).build(),
  maxTries: number = 3,
  timeout: number = 5_000
): Promise<void> {
  let status: string;
  try {
    status = await driver.executeScript("return document.readyState");
  } catch (err) {
    throw new Error(`Failed to load page due to ${err}`);
  }

  if (status !== "complete" && maxTries > 0) {
    await new Promise((resolve) => setTimeout(resolve, timeout));
    await waitForPageLoaded(driver, maxTries - 1, timeout);
  } else if (status !== "complete" && maxTries <= 0) {
    throw new Error(
      `Failed to loaded page due to exceed max waiting time: ${timeout} seconds`
    );
  }
}

async function waitUntil(
  driver: WebDriver = new Builder().forBrowser(Browser.CHROME).build(),
  xpath: string,
  condition: 'visible' | 'notVisible',
  maxTries: number = 3,
  timeout: number = 5_000
) :Promise<void> {

  try {
    const targetElement = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout)
    if (condition == 'notVisible') {
      await driver.wait(until.elementIsNotVisible(targetElement), timeout)
    } else if (condition == 'visible') {
      await driver.wait(until.elementIsVisible(targetElement), timeout)
    } else {
      throw new Error(`Illegal condition: ${condition}`)
    }
  } catch(err) {
    if (maxTries > 0) {
      await waitUntil(driver, xpath, condition, maxTries - 1, timeout)
    } else {
      throw new Error(
        `Target element '${xpath}' not in '${condition}' status: ${err}`
      );
    } 
  }
}

export { getFilePath, getElement, waitForPageLoaded, waitUntil };