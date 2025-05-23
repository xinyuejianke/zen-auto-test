function getPrimaryItem(itemName) {
  return `//aside[@class='el-aside']//span[text()='${itemName}']/ancestor::li`
}

function getSecondaryItem(itemName) {
  return `//aside[@class='el-aside']//span[text()='${itemName}']/parent::li`
}

function waitForPageLoad(itemName) {
  return `//span[contains(@class, 'bread')]/span[contains(text(),'${itemName}')]`
}
export {getPrimaryItem, getSecondaryItem, waitForPageLoad}