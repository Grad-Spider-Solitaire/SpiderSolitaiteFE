import {createCardElement, Card, flipCard} from "../components/card/card.js";
import {createBanner} from "../components/banner/banner.js";
import {createDeck, deal} from "../components/deck/deck.js";
import {formatTime, startTimer, stopTimer, totalMilliseconds} from "./timer.js";
import {createBoard} from "../components/board/board.js";
import {createLeaderboard, createRow} from "../components/leaderboard/leaderboard.js";
import {score} from "./scoring.js";
import {createLogin} from "../components/login/login.js";
import {getJWT, logout, signIn} from "./OAuth.js";
import {createDifficulty} from "../components/difficulty/difficulty.js";
import {getDifficulty, getHighScores, getUser, postScore} from "./api.js";
import {getCards} from "./constants.js";

const vibeDeck = createDeck();
vibeDeck
  .then(deck => {
    deck.className += ' vibing';
    getCards(4).sort(() => Math.random() -.5).forEach(async (card) => {
      deck.appendChild(await createCardElement(card));
    });
  });

let jwt = await getJWT();

if (!jwt) {
  const login = await createLogin();
  login.querySelector('button').addEventListener('click', () => {
    signIn().then(async () => jwt = await getJWT());
  }, {once: true});
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

const user = getUser(jwt);

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

const difficultyDetails = getDifficulty(difficulty);
(await vibeDeck).remove();

/**
 * @type {Array<{card: Card, element: HTMLButtonElement}>}
 */
export const deck = await Promise.all(getCards(difficulty).map(async card => ({card, element: await createCardElement(card)})));
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
  const highScores = getHighScores(difficulty);
  event.target.blur();
  stopTimer();
  const leaderBoard = await createLeaderboard();
  const leaderTable = leaderBoard.querySelector('table');
  const leaderBoardScoring = [...(await highScores), {
    username: (await user).username,
    score,
    game_duration: totalMilliseconds,
  }].sort((a,b) => {
    if (a.score > b.score) return -1;
    else if (b.score > a.score) return 1;
    else if (a.game_duration < b.game_duration) return -1;
    else if (b.game_duration < a.game_duration) return 1;
    return 0;
  });

  await postScore(score, totalMilliseconds, (await user).id, (await difficultyDetails).id);

  for (const {score, username, game_duration} of leaderBoardScoring) {
    leaderTable.appendChild(await createRow(username, score, formatTime(game_duration)));
  }

  const okButton = leaderBoard.querySelector('button');
  okButton.addEventListener('click', () => {
    leaderBoard.remove();
    location.reload();
  })
});
