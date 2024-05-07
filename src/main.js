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

/**
 * @type {Array<Array<{card: Card, element: HTMLButtonElement}>>}
 */
export const boardState = [[],[],[],[],[],[],[],[],[],[]];

const deckDom = document.getElementById('deck');
deck.forEach(({element}) => {
  flipCard(element);
  deckDom.appendChild(element);
});

/**
 *
 * @param {number} cards
 * @param {number} [down]
 */
const deal = (cards, down = 0) => {
  deckDom.style.pointerEvents = 'none'
  const deals = [];
  for (let index = 0; index < cards; index++) {
    const card = deck.pop();
    if (!card) break;
    const col = boardState.at(index % boardState.length);
    const last = col.at(-1);
    const dealRow = Math.floor(index / boardState.length) + (last.card ? 1 : 0);
    const transitionDuration = 1000;
    card.element.style.setProperty('--transition-duration-ms', `${transitionDuration}ms`);
    const originalPos = card.element.getBoundingClientRect();
    card.element.style.margin = '0';
    cardMoveStyling(card.element);
    card.element.style.top = `${originalPos.top}px`;
    card.element.style.left = `${originalPos.left}px`;
    deals.push(new Promise((resolve) => {
      setTimeout(() => {
        card.element.style.zIndex = `${1 + index}`;
        flipCard(card.element, down > index);
        const yOffset = `calc(${last.element.getBoundingClientRect().top}px + calc(var(--card-height) * .2 * ${dealRow}))`;
        moveCard(card.element, `${last.element.getBoundingClientRect().left}px`, yOffset);
        setTimeout(() => {
          resolve({col, card, last});
        }, transitionDuration);
      }, 150 * index);
    }));
  }
  return Promise.all(deals)
    .then((dealt) => {
      dealt.forEach(({col, card, last}) => {
        const colDom = last.element.parentElement;
        col.push(card);
        cardMoveStyling(card.element, false);
        card.element.style.removeProperty('margin');
        colDom.appendChild(card.element);
      });
  })
    .then(() => {
      deckDom.style.removeProperty('pointer-events');
      if (!deck.length) deckDom.disabled = true;
      boardState.forEach(col => {
        if (col.length > 1 && !col.at(0).card) {
          const empty = col.shift();
          empty.element.parentElement.removeChild(empty.element);
        }
        validateForSelect(col);
      });
    });
}

deckDom.addEventListener('click', event => {
  event.target.blur();
  boardState.forEach(col => col.forEach(({element}) => element.disabled = true));
  return deal(10);
});

const boardTemplate = document.createElement('template');
boardTemplate.innerHTML = await fetch('/components/board/board.html').then(value => value.text());
const board = boardTemplate.content.cloneNode(true);
document.body.appendChild(board);
const [boardDom] = document.getElementsByClassName('board');

boardState.forEach((col, index) => {
  const colDom = boardDom.children.item(index);
  col.push({card: null, element: colDom.firstElementChild});
});

await deal(54, 44);
