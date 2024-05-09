import {createCardElement, Suit, Card, flipCard} from "../components/card/card.js";
import {createBanner} from "../components/banner/banner.js";
import {createDeck, deal} from "../components/deck/deck.js";
import {formatTime, startTimer, stopTimer, totalMilliseconds} from "./timer.js";
import {createBoard} from "../components/board/board.js";
import {createLeaderboard, createRow} from "../components/leaderboard/leaderboard.js";
import {score} from "./scoring.js";
import {createLogin} from "../components/login/login.js";
import {getJWT, logout, signIn} from "./OAuth.js";
import {createDifficulty} from "../components/difficulty/difficulty.js";

let jwt = await getJWT();

if (!jwt) {
  const login = await createLogin();
  login.querySelector('button').addEventListener('click', () => {
    signIn().then(async () => jwt = await getJWT());
  });
  while(!jwt) {
    jwt = await new Promise((resolve) => {
      login.querySelector('button')
        .addEventListener('click', () => {
          resolve(signIn().then(async () => getJWT()));
        }, {once: true});
    });
  }
  login.remove();
}

const difficultySelect = await createDifficulty();

const difficulty = await new Promise (resolve => {
  const difficulties = difficultySelect.getElementsByTagName('button');
  for (let i = 0; i < difficulties.length; i++) {
    difficulties.item(i).addEventListener('click', () => {
      resolve(Math.pow(2, i));
    }, {once: true})
  }
});

difficultySelect.remove();

/**
 * @type {Readonly<Array<Suit>>}
 */
const suits = Object.freeze([{name: 'spades'}, {name: 'hearts'}, {name: 'clubs'}, {name: 'diamonds'}]);

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

const bannerDom = await createBanner();

bannerDom.children.namedItem('logout').addEventListener('click', () => logout());

const deckDom = await createDeck();

deck.forEach(({element}) => {
  flipCard(element);
  deckDom.appendChild(element);
});

deckDom.addEventListener('click', event => {
  event.target.blur();
  boardState.forEach(col => col.forEach(({element}) => element.disabled = true));
  return deal(10);
});

const boardDom = await createBoard();
boardState.forEach((col, index) => {
  const colDom = boardDom.children.item(index);
  col.push({card: null, element: colDom.firstElementChild});
});

await deal(54, 44);

startTimer();
bannerDom.children.namedItem('retire').addEventListener('click', async (event) => {
  event.target.blur();
  stopTimer();
  const leaderBoard = await createLeaderboard();
  const leaderTable = leaderBoard.querySelector('table');
  const leaderBoardScoring = [...Array.from({length: 5}, () => ({ // TODO get from API
    name: 'john',
    score: Math.floor(Math.random() * 990),
    time: Math.floor(Math.random() * 100000),
  })),
    {name: 'Me', score, time: totalMilliseconds}].sort((a,b) => {
    if (a.score > b.score) return -1;
    else if (b.score > a.score) return 1;
    else if (a.time < b.time) return -1;
    else if (b.time < a.time) return 1;
    return 0;
  }); // TODO get from API

  for (const {score, name, time} of leaderBoardScoring) {
    leaderTable.appendChild(await createRow(name, score, formatTime(time)));
  }

  const okButton = leaderBoard.querySelector('button');
  okButton.addEventListener('click', () => {
    leaderBoard.remove();
    location.reload();
  })
});
