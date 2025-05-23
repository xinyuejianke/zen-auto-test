function getPrimaryItem(itemName) {
  return `//aside[@class='el-aside']//span[text()='${itemName}']/ancestor::li`
}

function getSecondaryItem(itemName) {
  return `//aside[@class='el-aside']//span[text()='${itemName}']/parent::li`
}

export {getPrimaryItem, getSecondaryItem}