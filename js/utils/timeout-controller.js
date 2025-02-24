/**
 * Allows for multiple timeouts to be tracked and cleared to avoid conflicts.
 * 
 * @returns {{
*   add: (id: number),
*   clearAll: Function
* }}
*/
export function timeoutController() {
 if (!timeoutController.instance) {
   let timeouts = new Set();

   timeoutController.instance = {
     add: (id) => timeouts.add(id),
     clearAll: () => {
       timeouts.forEach(clearTimeout);
       timeouts.clear();
     }
   };
 }

 return timeoutController.instance;
}