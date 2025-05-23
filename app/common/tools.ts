import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Browser, Builder, By, WebDriver, WebElementPromise} from "selenium-webdriver";

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

export { getFilePath, getElement };