import { By } from "selenium-webdriver"
import { fillInputValue, getElement } from "../common/tools"
function loginInputPath(placeholder = "") {
  return `//input[@placeholder='${placeholder}']`
}

function loginSpanPath(placeholder = "") {
  return `//span[text()='${placeholder}']/parent::button`
}

async function login(driver, userInfo) {
    await fillInputValue(driver, By.xpath(loginInputPath('用户名')), userInfo.username)
    await fillInputValue(driver, By.xpath(loginInputPath('密码')), userInfo.password)
    await getElement(driver, By.xpath(loginSpanPath('登录')), 2_000, 2).then(e => e.click())
}

export { login }