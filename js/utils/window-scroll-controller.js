/**
 * Manages window scroll events.
 * 
 * @returns {{
*  subscribe: (callback: Function),
*  unsubscribe: (callback: Function)
* }}
*/
export function windowScrollController() {
  if (!windowScrollController.instance) {
  const subscribers = new Set();

  windowScrollController.instance = {
    subscribe: (callback) => {
      subscribers.add(callback);
    },
    unsubscribe: (callback) => {
      subscribers.delete(callback);
    }
  }

  window.addEventListener('scroll', (event) => {
    subscribers.forEach(callback => {
      callback(event);
    });
  });
  }

  return windowScrollController.instance;
}