import {boardState} from "./main.js";
import {getSelectedCard, getSelectedCol} from "./selected.js";
import {flipCard} from "../components/card/card.js";
import {addScore, emptyColScore, maxScore, suitCompleteScore, uncoveredScore} from "./scoring.js";

const createEmpty = (col, dom) => {
  const empty = document.createElement('button');
  empty.className = 'empty';
  empty.disabled = true;
  dom.appendChild(empty);
  col.push({element: empty, card: null});

}

/**
 * @param {Array<{card: Card, element: HTMLButtonElement}>} col
 */
export const validateForSelect = col => {
  /**
   * @param {object} cardState
   * @param {Card} cardState.card
   * @param {HTMLButtonElement} cardState.element
   * @param {number} index
   * @param {Array<{card: Card, element: HTMLButtonElement}>}array
   * @returns {boolean}
   */
  const checkSeries = ({card, element}, index, array) => {
    if (element.children.item(0).style.getPropertyValue('rotate')) return false; // covered cards not included
    if (index === 0) return true; // start of series
    return card.value + 1 === array.at(index - 1).card.value && card.suit === array.at(index - 1).card.suit;
  }

  if (col.length >= 13 && col.slice(-13).every(checkSeries)) {
    const suit = col.splice(-13);
    const colDom = suit.at(0).element.parentElement;
    const transition = 1000;
    if (col.length === 0) setTimeout(() => createEmpty(col, colDom), transition + 50);
    const target = suit.at(0).element.getBoundingClientRect();
    suit.forEach(({element}) => {
      const current = element.getBoundingClientRect();
      element.className += ' collapsing';
      element.style.setProperty('--transition-duration-ms', `${transition}ms`);
      setTimeout(() => {
        element.style.top = `${target.top - current.top}px`; // in a timeout so transition occurs
      }, 0);
      setTimeout(() => {
        element.remove();
      }, transition);
    });
    if (addScore(suitCompleteScore) >= maxScore) document.getElementById('retire').click();
  }
  col.toReversed().forEach(({element, card}, index, array) => {
    if (!card) element.disabled = true;
    else if (index === 0) {
      if (element.children.item(0).style.getPropertyValue('rotate')) addScore(uncoveredScore + (array.length === 1 ? emptyColScore : 0));
      flipCard(element, false);
    }
    else if (element.children.item(0).style.getPropertyValue('rotate')) flipCard(element);
    else if (array.at(index -1).element.disabled) {
      element.disabled = true;
    }
    else if (card.suit === array.at(index - 1).card.suit && card.value === array.at(index - 1).card.value + 1) {
      element.style.removeProperty('pointer-events');
      element.disabled = false;
    } else {
      element.style.pointerEvents = 'none';
      element.disabled = true;
    }
  });
}

/**
 *
 * @param {Array<{card: Card, element: HTMLButtonElement}>} col
 * @param {HTMLElement} grabbedElement
 */
export const validateForGrab = (col, grabbedElement) => {
  if (col === getSelectedCol(grabbedElement)) {
    col.forEach((item, i, array) => {
      item.element.disabled = array.at(i + 1)?.element !== grabbedElement;
    })
    return;
  }

  col.forEach((item,i, array) => {
    if (array.at(i + 1)?.element === grabbedElement) {
      item.element.disabled = false;
    }
    else if (i + 1 !== array.length) item.element.disabled = true;
    else item.element.disabled = item.element !== grabbedElement && item.card && (item.card.suit !== getSelectedCard(grabbedElement).card.suit || item.card.value !== getSelectedCard(grabbedElement).card.value + 1);
  })
}

/**
 *
 * @param {HTMLElement} from
 * @param {HTMLElement} to
 */
const handleMove = (from, to) => {
  if (!to || !from) return;
  const fromCol = getSelectedCol(from);
  const toCol = getSelectedCol(to);
  if (fromCol === toCol) return;
  const selected = getSelectedCard(from);
  const lastTo = toCol.at(-1);
  const toEmpty = !lastTo.card;
  const matchesSuit = !toEmpty && lastTo.card.suit === selected.card.suit;
  const nextInLine = matchesSuit && selected.card.value + 1 === lastTo.card.value;
  if (!(toEmpty || nextInLine)) return;
  const fromColDom = from.parentElement;
  const toColDom = to.parentElement;
  const cards = fromCol.splice(fromCol.indexOf(selected));
  if (fromCol.length === 0) {
    createEmpty(fromCol, fromColDom);
  }

  if (toEmpty) {
    toCol.pop();
    toColDom.removeChild(lastTo.element);
  }

  for (const card of cards) {
    toColDom.appendChild(card.element);
    toCol.push(card);
  }
}

export const initHandlers = element => {
  let target;
  let click;

  /**
   * @param {MouseEvent|TouchEvent} event
   */
  const onMove = event => {
    const touch = event instanceof TouchEvent ? event.touches.item(0) : event;
    target = document.elementsFromPoint(touch.clientX, touch.clientY).find(item => boardState.some(col => col.some(({element: e}) => item === e)));
    element.style.setProperty('left', `${touch.clientX - click.clientX}px`);
    element.style.setProperty('top', `calc(${touch.clientY - click.clientY}px - 1rem)`);
    let styledElement = element;
    do {
      styledElement.style.setProperty('left', `${touch.clientX - click.clientX}px`);
      styledElement.style.setProperty('top', `calc(${touch.clientY - click.clientY}px)`);
      styledElement = styledElement.nextElementSibling;
    } while (styledElement);
  }

  const onGrabEnd = () => {
    let styledElement = element;
    do {
      styledElement.className.replace(' grabbed', '')
      styledElement.style.removeProperty('position');
      styledElement.style.removeProperty('left');
      styledElement.style.removeProperty('top');
      styledElement.style.removeProperty('z-index');
      styledElement.style.removeProperty('pointer-events');
      styledElement = styledElement.nextElementSibling;
    } while (styledElement);

    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('touchmove', onMove);
    handleMove(element, target);
    boardState.forEach(col => validateForSelect(col))
    target = null;
  }


  /**
   *
   * @param {MouseEvent|TouchEvent}event
   */
  const onHover = event => {
    const touch = event instanceof TouchEvent ? event.touches.item(0) : event;
    const maxRotation = 50;
    const bounding = element.getBoundingClientRect();
    const x = touch.clientX - bounding.left;
    const y = touch.clientY - bounding.top;
    const xPercentage = x / bounding.width;
    const yPercentage = y / bounding.height;
    const xRotation = (xPercentage - 0.5) * maxRotation;
    const yRotation = (0.5 - yPercentage) * maxRotation;

    element.style.setProperty('--x-rotation', `${yRotation}deg`);
    element.style.setProperty('--y-rotation', `${xRotation}deg`);
    element.style.setProperty('--x', `${xPercentage * 100}%`);
    element.style.setProperty('--y', `${yPercentage * 100}%`);
  }

  element.addEventListener('touchmove', onHover);
  element.addEventListener('mousemove', onHover);

  const onLeave = () => {
    element.style.removeProperty('--x-rotation');
    element.style.removeProperty('--y-rotation');
    element.style.removeProperty('--x');
    element.style.removeProperty('--y');
  }

  element.addEventListener('mouseleave', onLeave);
  element.addEventListener('touchend', onLeave);

  /**
   * @param {TouchEvent|MouseEvent} event
   */
  const onGrabStart = event => {
    event.preventDefault();
    if (event instanceof MouseEvent && event.button !== 0) return;
    click = event instanceof TouchEvent ? event.touches.item(0) : event;
    let styledElement = element;
    boardState.forEach(col => validateForGrab(col, element));
    do {
      styledElement.style.zIndex = '1';
      styledElement.style.position = 'relative';
      styledElement.style.pointerEvents = 'none';
      styledElement = styledElement.nextElementSibling;
    } while (styledElement);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);

    window.addEventListener('click', onGrabEnd, {once: true});
    window.addEventListener('touchend', onGrabEnd, {once: true});
  }

  element.addEventListener('touchstart', onGrabStart);
  element.addEventListener('mousedown', onGrabStart);

}
