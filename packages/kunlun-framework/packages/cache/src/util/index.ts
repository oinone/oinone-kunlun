export function getDB() {
  if (!('indexDB' in window)) {
    return window.indexedDB;
  } else {
    return false;
  }
}
