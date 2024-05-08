import {createCardElement, Suit, Card, flipCard} from "../components/card/card.js";
import {createBanner} from "../components/banner/banner.js";
import {createDeck, deal} from "../components/deck/deck.js";
import {formatTime, startTimer, stopTimer, totalMilliseconds} from "./timer.js";
import {createBoard} from "../components/board/board.js";
import {createLeaderboard, createRow} from "../components/leaderboard/leaderboard.js";
import {score} from "./scoring.js";


/**
 * @type {Readonly<Array<Suit>>}
 */
const suits = Object.freeze([{name: 'spades', color: 'black'}, {name: 'hearts', color: 'red'}, {name: 'clubs', color: 'black'}, {name: 'diamonds', color: 'red'}]);

const difficulty = window.confirm('1') ? 1 : window.confirm('2') ? 2 : 4;

const cards = Array.from({length: 8}, (_, i) => Array.from({length: 13}, (_, value) => ({suit: suits.at(i % difficulty), value: value + 1}))).flat();

/**
 * @type {Array<{card: Card, element: HTMLButtonElement}>}
 */

export const deck = await Promise.all(cards.map(async card => ({card, element: await createCardElement(card)})));
deck.sort(() => Math.random() - .5); // shuffling

/**
 * @type {Array<Array<{card: Card, element: HTMLButtonElement}>>}
 */
export const boardState = [[],[],[],[],[],[],[],[],[],[]];

const bannerDom = createBanner();

const deckDom = createDeck();

deck.forEach(({element}) => {
  flipCard(element);
  deckDom.appendChild(element);
});

deckDom.addEventListener('click', event => {
  event.target.blur();
  boardState.forEach(col => col.forEach(({element}) => element.disabled = true));
  return deal(10);
});

const boardDom = createBoard();
boardState.forEach((col, index) => {
  const colDom = boardDom.children.item(index);
  col.push({card: null, element: colDom.firstElementChild});
});

await deal(54, 44);

startTimer();
bannerDom.children.namedItem('retire').addEventListener('click', (event) => {
  event.target.blur();
  stopTimer();
  const leaderBoard = createLeaderboard();
  const leaderTable = leaderBoard.querySelector('table');
  const leaderBoardScoring = [...Array.from({length: 5}, () => ({ // TODO get from API
    name:'john',
    score: Math.floor(Math.random() * 990),
    time: Math.floor(Math.random() * 100000),
  })),
    {name: 'Me', score, time: totalMilliseconds}].sort(({score: a}, {score: b}) => b - a); // TODO get from token

  leaderBoardScoring.forEach(({score, name, time}) => {
    leaderTable.appendChild(createRow(name, score, formatTime(time)));
  });

  const okButton = leaderBoard.querySelector('button');
  okButton.addEventListener('click', () => {
    leaderBoard.remove();
    // TODO nav to select screen
  })
});
