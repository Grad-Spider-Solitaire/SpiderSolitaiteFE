import {createCardElement, Suit, Card} from "../components/card/card.js";
import {initBoardHandlers} from "./eventHandlers.js";


/**
 * @type {Readonly<Array<Suit>>}
 */
const suits = Object.freeze([{name: 'spades', color: 'black'}, {name: 'hearts', color: 'red'}, {name: 'clubs', color: 'black'}, {name: 'diamonds', color: 'red'}]);

/**
 * @type {Readonly<Array<Card>>}
 */
const cards = Object.freeze(suits.flatMap(suit => Array.from({length: 13}, (_, index) => ({suit, value: index + 1}))));

const deck = await Promise.all([...cards, ...cards].map(async card => ({card, element: await createCardElement(card)})));

// deck.sort(() => Math.random() - .5); // shuffling

document.body.innerHTML = await fetch('/components/board/board.html').then(value => value.text());

const initialDeal = Array.from({length: 54}, () => deck.pop());

/**
 * @type {Array<Array<{card: Card, element: HTMLButtonElement}>>}
 */
export const boardState = [[],[],[],[],[],[],[],[],[],[]];


initialDeal.forEach((value, index) => {
  boardState.at(index % boardState.length).push(value);
});

initBoardHandlers();
