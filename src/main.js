import {createCardElement, Suit, Card, flipCard} from "../components/card/card.js";
import {validateForSelect} from "./eventHandlers.js";


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

const initialDeal = Array.from({length: 54}, () => deck.pop());

/**
 * @type {Array<Array<{card: Card, element: HTMLButtonElement}>>}
 */
export const boardState = [[],[],[],[],[],[],[],[],[],[]];

const deckDom = document.getElementById('deck');
deck.forEach(({element}) => {
  element.disabled = true;
  element.children.item(0).style.rotate = 'Y .5turn';
  element.style.pointerEvents = 'none'
  deckDom.appendChild(element);
});

deckDom.addEventListener('click', () => {
  boardState.forEach(col => {
    const card = deck.pop();
    card.element.disabled = false;
    card.element.style.removeProperty('pointer-events');
    card.element.children.item(0).style.removeProperty('rotate');
    const last = col.at(-1);
    const colDom = last.element.parentElement;
    if (!last.card) {
      colDom.removeChild(last.element);
      col.pop();
    }
    colDom.appendChild(card.element);
    col.push(card);
    validateForSelect(col);
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
