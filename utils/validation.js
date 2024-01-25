module.exports.isEmail = (value) => {
  return value.includes('@');
}

module.exports.isNotEmpty = (value) => {
  return value.trim() !== '';
}

module.exports.hasMinLength = (value, minLength) => {
  return value.length >= minLength;
}
