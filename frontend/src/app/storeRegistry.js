// storeRegistry.js
// Breaks circular dependency: api.js needs store, but store imports slices that import api.js
// Solution: api.js calls setStore() after store is created, then uses getStore() synchronously

let _store = null;

export const setStore = (store) => { _store = store; };
export const getStore = () => _store;
