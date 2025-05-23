function getTab(tabName) {
    return `//div[contains(@class,'nav')]/div[text()='${tabName}']`
}

export {getTab}