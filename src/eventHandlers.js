import {boardState} from "./main.js";
import {getSelectedCard, getSelectedCol} from "./selected.js";

/**
 * @param {Array<{card: Card, element: HTMLElement}>}col
 */
export const validateForSelect = col => {
  let [cur, ...rest] = col.toReversed();
  let done = false;
  let prev;
  while (cur && !done) {
    if (prev) {
      done = cur.element.style.getPropertyValue('rotate')
        || cur.card.suit !== prev.card.suit
        || cur.card.value !== prev.card.value + 1;
      if (done) continue;
    }
    cur.element.disabled = false;
    cur.element.children.item(0)?.style.removeProperty('rotate');
    prev = cur;
    [cur, ...rest] = rest;
  }
}

/**
 *
 * @param {Array<{card: Card, element: HTMLButtonElement}>} col
 * @param {HTMLElement} grabbedElement
 */
const validateForGrab = (col, grabbedElement) => {
  if (col === getSelectedCol(grabbedElement)) {
    col.forEach((item, i, array) => {
      if (array.at(i +1)?.element === grabbedElement) item.element.disabled = false;
    })
    return;
  }

  col.forEach((item,i, array) => {
    if (array.at(i + 1)?.element === grabbedElement) {
      console.log(item.card);
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
    const empty = document.createElement('button');
    empty.className = 'empty';
    empty.disabled = true;
    fromColDom.appendChild(empty);
    fromCol.push({element: empty, card: null});
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

export const initBoardHandlers = () => {

  const [board] = document.getElementsByClassName('board');
  let target;
  let click;



//


  boardState.forEach((value, index) => {
    value.forEach(({element}, i, array) => {

      /**
       *
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


      board.children.item(index).appendChild(element);
      if (array.length !== i + 1) {
        element.disabled = true;
        element.children.item(0).style.setProperty('rotate', 'Y 0.5turn');
      }
    })
  });

}
