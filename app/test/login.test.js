import { Browser, Builder, By } from 'selenium-webdriver';
import Chrome from 'selenium-webdriver/chrome.js';
import { test } from 'vitest';
import { loginInputPath, loginSpanPath } from '../page-modules/login.js';
import { getPrimaryItem, getSecondaryItem } from '../page-modules/side-bar.js';
import { getTab } from '../page-modules/my-orders.js';
import { fillInputValue, getElement, waitForPageLoaded, waitUntilNotVisible} from '../common/tools.js';

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

test('user login with correct username and password', async() => {
  try {
    await driver.get('http://www.tcpjwtester.top')
    await fillInputValue(driver, By.xpath(loginInputPath('用户名')), '\\n周杰伦\\n')
    await fillInputValue(driver, By.xpath(loginInputPath('密码')), '1234abcd!')
    await getElement(driver, By.xpath(loginSpanPath('登录')), 2_000, 2).then(e => e.click())

    await waitForPageLoaded(driver)
    await waitUntilNotVisible(driver, By.xpath("//p[contains(text(), '登录成功')]/parent::div"))

    await getElement(driver, By.xpath(getPrimaryItem('我的订单')), 2_000, 3).then(e => e.click())
    await getElement(driver, By.xpath(getSecondaryItem('已买到的宝贝')), 2_000, 3).then(e => e.click())
    await waitForPageLoaded(driver)

    const tabs = [ '待付款', '待发货', '运输中', '待确认', '待评价', ]
    for (const tab of tabs) {
      await getElement(driver, By.xpath(getTab(tab)), 2_000, 3).then(e => e.click())
      await new Promise(resolve => setTimeout(resolve, 1_000));
    }

  } finally {
    await driver.quit()
  }
}, 90_000)