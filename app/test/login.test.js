import { Browser, Builder, By } from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome.js';
import { login } from '../page-modules/login.js';
import { getPrimaryItem, getSecondaryItem } from '../page-modules/side-bar.js';
import { getTab } from '../page-modules/my-orders.js';
import { getElement, getFilePath, waitForPageLoaded, waitUntilNotVisible} from '../common/tools.js';
import { log } from 'console';
import yaml from 'yaml'
import { test } from 'vitest';
import { readFileSync } from 'fs';

const options = new Chrome.Options().addArguments([
  '--ignore-certificate-errors',
  '--allow-insecure-localhost',
  // 'window-size=700,700',
  // '--incognito',
  // '--headless',
  //处理卡顿
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
]);
options.excludeSwitches(['--enable-automation']);

const driver = new Builder()
  .forBrowser(Browser.CHROME)
  .setChromeOptions(options)
  .build();

const config = await getFilePath("env.yaml");
const userInfo = await yaml.parse(readFileSync(config, "utf8"));

test('user login with correct username and password', async() => {
  try {
    log('direct to target webpage')
    await driver.get('http://www.tcpjwtester.top')

    log('fill in user info, then click login button')
    await login(driver, userInfo)

    log('wait for page loaded until login success alert invisible')
    await waitForPageLoaded(driver)
    await waitUntilNotVisible(driver, By.xpath("//p[contains(text(), '登录成功')]/parent::div"))

    log('direct to my-order > bought items')
    await getElement(driver, By.xpath(getPrimaryItem('我的订单')), 2_000, 3).then(e => e.click())
    await getElement(driver, By.xpath(getSecondaryItem('已买到的宝贝')), 2_000, 3).then(e => e.click())
    await waitForPageLoaded(driver)

    log('test order pannel displayment')
    const tabs = [ '待付款', '待发货', '运输中', '待确认', '待评价', ]
    for (const tab of tabs) {
      await getElement(driver, By.xpath(getTab(tab)), 2_000, 3).then(e => e.click())
      await new Promise(resolve => setTimeout(resolve, 1_000));
    }

  } finally {
    await driver.quit()
  }
}, 90_000)