/**
 * Manages window resize events.
 * 
 * @returns {{
*  subscribe: (callback: Function),
*  unsubscribe: (callback: Function)
* }}
*/
export function windowResizeController() {
 if (!windowResizeController.instance) {
   const subscribers = new Set();

   windowResizeController.instance = {
     subscribe: (callback) => subscribers.add(callback),
     unsubscribe: (callback) => subscribers.delete(callback)
   };

   window.addEventListener('resize', (event) => {
     subscribers.forEach(callback => callback(event));
   });
 }

 return windowResizeController.instance;
}