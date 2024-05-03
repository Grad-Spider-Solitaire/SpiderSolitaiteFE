import {boardState} from "./main.js";

/**
 * @param {Element} selectedElement
 * @returns {Array<{card: Card, element: HTMLButtonElement}>}
 */
export const getSelectedCol = selectedElement => boardState
  .find(col => col.some(({element}) => element === selectedElement));

/**
 * @param {Element} selectedElement
 * @returns {{card: Card, element: HTMLButtonElement}}
 */
export const getSelectedCard = selectedElement => getSelectedCol(selectedElement)
  .find(({element}) => element === selectedElement);
