function loginInputPath(placeholder = "") {
  return `//input[@placeholder='${placeholder}']`
}

function loginSpanPath(placeholder = "") {
  return `//span[text()='${placeholder}']/parent::button`
}

export { loginInputPath, loginSpanPath }