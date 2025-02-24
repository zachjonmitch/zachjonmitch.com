/**
 * Controls all elements with `data-pause` attributes.
 * 
 * - Allows pausing/resuming of a specific element, by type, or all at once.
 * 
 * @returns {{
*   register: (element: HTMLElement, type: string, onPause: Function, onResume: Function),
*   pauseAll: Function,
*   resumeAll: Function,
*   pauseType: (type?: string),
*   resumeType: (type?: string),
*   resumeElement: (element: HTMLElement),
* }}
*/
export function pauseController() {
 if (!pauseController.instance) {
   let elements = new WeakMap();
   let trackedElements = new Set();

   pauseController.instance = {
     register: (element, type, onPause, onResume) => {
       if (!elements.has(element)) {
         elements.set(element, { type, pause: onPause, resume: onResume });
         trackedElements.add(element);

         if (element.hasAttribute('data-pause')) {
           onPause();
         }
       }
     },
     pauseAll: () => {
       trackedElements.forEach(element => {
         const entry = elements.get(element);
         if (entry) entry.pause();
       });
     },
     resumeAll: () => {
       trackedElements.forEach(element => {
         const entry = elements.get(element);
         if (entry) entry.resume();
       });
     },
     pauseType: (type = null) => {
       trackedElements.forEach(element => {
         const entry = elements.get(element);
         if (entry && (!type || entry.type === type)) {
           entry.pause();
         }
       });
     },
     resumeType: (type = null) => {
       trackedElements.forEach(element => {
         const entry = elements.get(element);
         if (entry && (!type || entry.type === type)) {
           entry.resume();
         }
       });
     },
     resumeElement: (element) => {
       const entry = elements.get(element);
       if (entry) entry.resume();
     }
   };
 }

 return pauseController.instance;
}