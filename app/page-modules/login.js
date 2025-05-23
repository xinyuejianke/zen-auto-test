function loginInputPath(placeholder = "") {
  return `//input[@placeholder='${placeholder}']`
}

function loginSpanPath(placeholder = "") {
  return `//span[text()='${placeholder}']/parent::button`
}

async function fillInput(driver, input, value) {
  return await driver.findElement(input).sendKeys(value);
}

export { loginInputPath, loginSpanPath, fillInput }