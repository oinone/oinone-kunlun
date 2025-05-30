function deepClone(obj) {
  return obj == null ? obj : JSON.parse(JSON.stringify(obj));
}
export {
  deepClone
};
