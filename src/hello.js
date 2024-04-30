import {createCardElement, Suit, Card} from "../components/card/card.js";


/**
 * @type {Readonly<Array<Suit>>}
 */
const suits = Object.freeze([{name: 'spades', color: 'black'}, {name: 'hearts', color: 'red'}, {name: 'clubs', color: 'black'}, {name: 'diamonds', color: 'red'}]);

/**
 * @type {Readonly<Array<Card>>}
 */
const cards = Object.freeze(suits.flatMap(suit => Array.from({length: 13}, (_, index) => ({suit, value: index + 1}))));

const deck = await Promise.all([...cards, ...cards].map(async card => ({card, element: await createCardElement(card)})));

document.body.innerHTML = await fetch('/components/board/board.html').then(value => value.text());
const [board] = document.getElementsByClassName('board');

const initialDeal = Array.from({length: 54}, () => deck.pop());

/**
 * @type {Array<Array<{card: Card, element: HTMLButtonElement}>>}
 */
const boardState = [[],[],[],[],[],[],[],[],[],[]];


initialDeal.forEach((value, index) => {
  boardState.at(index % boardState.length).push(value);
});

let click;
let end;

boardState.forEach((value, index) => {
  value.forEach(({element}, i, array) => {

    /**
     *
     * @param {MouseEvent|TouchEvent}event
     */
    const onMove = event => {
      const touch = event instanceof TouchEvent ? event.touches.item(0) : event;
      const maxRotation = 25;
      const bounding = event.currentTarget.getBoundingClientRect();
      const x = touch.clientX - bounding.left;
      const y = touch.clientY - bounding.top;
      const xPercentage = x / bounding.width;
      const yPercentage = y / bounding.height;
      const xRotation = (xPercentage - 0.5) * maxRotation;
      const yRotation = (0.5 - yPercentage) * maxRotation;

      event.currentTarget.style.setProperty('--x-rotation', `${yRotation}deg`);
      event.currentTarget.style.setProperty('--y-rotation', `${xRotation}deg`);
      event.currentTarget.style.setProperty('--x', `${xPercentage * 100}%`);
      event.currentTarget.style.setProperty('--y', `${yPercentage * 100}%`);
      if (click) {
        element.style.setProperty('left', `${touch.clientX - click.clientX}px`);
        element.style.setProperty('top', `calc(${touch.clientY - click.clientY}px - 1rem)`);
      }
    }

    element.addEventListener('touchmove', onMove);
    element.addEventListener('mousemove', onMove);

    const onLeave = event => {
      click = null;
      event.currentTarget.style.removeProperty('--x-rotation');
      event.currentTarget.style.removeProperty('--y-rotation');
      event.currentTarget.style.removeProperty('--x');
      event.currentTarget.style.removeProperty('--y');
      event.currentTarget.style.removeProperty('position');
      event.currentTarget.style.removeProperty('left');
      event.currentTarget.style.removeProperty('top');
      event.currentTarget.style.removeProperty('z-index');
    }

    element.addEventListener('mouseleave', onLeave);
    element.addEventListener('touchend', onLeave);

    /**
     * @param {TouchEvent|MouseEvent} event
     */
    const onClickStart = event => {
      click = event instanceof TouchEvent ? event.touches.item(0) : event;
      end = null;
      event.currentTarget.style.zIndex = '1';
      event.currentTarget.style.position = 'relative';
    }

    element.addEventListener('touchstart', onClickStart);
    element.addEventListener('mousedown', onClickStart);

    /**
     * @param {TouchEvent|MouseEvent} event
     */
    const onClickEnd = event => {
      end = event.currentTarget;
      event.currentTarget.style.removeProperty('position');
    }

    element.addEventListener('mouseup', onClickEnd);
    element.addEventListener('touchend', onClickEnd);

    board.children.item(index).appendChild(element);
    if (array.length !== i + 1) {
      element.disabled = true;
      element.children.item(0).style.setProperty('rotate', 'X 0.5turn');
    }
  })
})



// for (const {element} of deck) {
//   document.body.appendChild(element);
// }
