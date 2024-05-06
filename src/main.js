import {createCardElement, Suit, Card, flipCard} from "../components/card/card.js";
import {validateForSelect} from "./eventHandlers.js";
import {cardMoveStyling, moveCard} from "./styling.js";


/**
 * @type {Readonly<Array<Suit>>}
 */
const suits = Object.freeze([{name: 'spades', color: 'black'}, {name: 'hearts', color: 'red'}, {name: 'clubs', color: 'black'}, {name: 'diamonds', color: 'red'}]);

const difficulty = window.confirm('1') ? 1 : window.confirm('2') ? 2 : 4;

const cards = Array.from({length: 8}, (_, i) => Array.from({length: 13}, (_, value) => ({suit: suits.at(i % difficulty), value: value + 1}))).flat();

/**
 * @type {Array<{card: Card, element: HTMLButtonElement}>}
 */

const deck = await Promise.all(cards.map(async card => ({card, element: await createCardElement(card)})));
deck.sort(() => Math.random() - .5); // shuffling

const initialDeal = Array.from({length: 10}, () => deck.pop());

/**
 * @type {Array<Array<{card: Card, element: HTMLButtonElement}>>}
 */
export const boardState = [[],[],[],[],[],[],[],[],[],[]];

const deckDom = document.getElementById('deck');
deck.forEach(({element}) => {
  flipCard(element);
  deckDom.appendChild(element);
});

deckDom.addEventListener('click', event => {
  deckDom.style.pointerEvents = 'none';
  event.target.blur();
  boardState.forEach((col, index, array) => {
    const card = deck.pop();
    const transitionDuration = 1000;
    card.element.style.setProperty('--transition-duration-ms', `${transitionDuration}ms`);
    cardMoveStyling(card.element);
    card.element.style.margin = '0';
    const last = col.at(-1);
    setTimeout(() => {
      flipCard(card.element, false);
      const yOffset = `calc(${last.element.getBoundingClientRect().top}px + ${!last.card ? '0px' : 'calc(var(--card-height) * .2)'})`;
      moveCard(card.element, `${last.element.getBoundingClientRect().left}px`, yOffset);
      setTimeout(() => {
        const colDom = last.element.parentElement;
        cardMoveStyling(card.element, false);
        card.element.style.removeProperty('margin');
        if (!last.card) {
          colDom.removeChild(last.element);
          col.pop();
        }
        colDom.appendChild(card.element);
        col.push(card);
        validateForSelect(col);
        if (index +1 === array.length && deck.length !== 0) {
          deckDom.style.removeProperty('pointer-events');
        }
      }, transitionDuration);
    }, 150 * index);
  });
  if (deck.length === 0) deckDom.style.pointerEvents = 'none';
});

const boardTemplate = document.createElement('template');
boardTemplate.innerHTML = await fetch('/components/board/board.html').then(value => value.text());
const board = boardTemplate.content.cloneNode(true);
document.body.appendChild(board);
const [boardDom] = document.getElementsByClassName('board');

initialDeal.forEach((value, index) => {
  boardState.at(index % boardState.length).push(value);
});

boardState.forEach((col, index) => {
  col.forEach(({element}, i, array) => {
    flipCard(element, i + 1 !== array.length);
    boardDom.children.item(index).appendChild(element)
  });
})
