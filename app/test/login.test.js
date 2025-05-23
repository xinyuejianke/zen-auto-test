import { Browser, Builder, By, until } from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome.js';
import { test } from 'vitest';
import { loginInputPath, loginSpanPath, fillInput } from '../page-modules/login.js';
import { getPrimaryItem, getSecondaryItem } from '../page-modules/side-bar.js';
import { getTab } from '../page-modules/my-orders.js';
import { getElement, getFilePath, waitForPageLoaded } from '../common/tools.js';

const options = new Chrome.Options().addArguments([
  '--ignore-certificate-errors',
  '--allow-insecure-localhost',
  'window-size=700,700',
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

test ('test getFilePath', async() => {
  const path = await getFilePath('env.yaml')
  console.log(path)
}, 5_000)

test('user login with correct username and password', async() => {
  try {
    await driver.get('http://www.tcpjwtester.top')
    await fillInput(driver, By.xpath(loginInputPath('用户名')), '周杰伦')
    await fillInput(driver, By.xpath(loginInputPath('密码')), '1234abcd!')

    await getElement(driver, loginSpanPath('登录'), 2, 2_000).then(e => e.click())
    await driver.wait(until.elementLocated(By.xpath("//img[@class='el-image__inner']")), 5000)

    await driver.findElement(By.xpath(getPrimaryItem('我的订单'))).click()
    await new Promise(resolve => setTimeout(resolve, 2000));

    await driver.findElement(By.xpath(getSecondaryItem('已买到的宝贝'))).click()
    await waitForPageLoaded(driver)

    const tabs = [
      '待付款',
      '待发货',
      '运输中',
      '待确认',
      '待评价',
    ]

    for (const tab of tabs) {
      await driver.findElement(By.xpath(getTab(tab))).click()
      await new Promise(resolve => setTimeout(resolve, 1_000));
    }

  } finally {
    await driver.quit()
  }
}, 90_000)