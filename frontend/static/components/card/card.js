import {initHandlers} from "../../src/eventHandlers.js";

/**
 * @property {'spades'|'hearts'|'clubs'|'diamonds'} name
 * @property {string} color
 */
export class Suit {}

/**
 * @property {Suit} suit
 * @property {number} value
 */
export class Card {}

const suitIcons = {};

/**
 * @param {Suit} suit
 * @returns {Promise<string>}
 */
const getIcon = async (suit) => {
  return suitIcons[suit.name] ??= fetch(`/public/${suit.name}.svg`).then(value => value.text());
};

/**
 * @param {number} value
 * @returns {string}
 */
const getValue = (value) => {
  switch (value) {
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return String(value);
  }
}

const bodyIcons = {
  ace: {},
  jack: {},
  queen: {},
  king: {},
};

/**
 * @param {Card} card
 * @returns {Promise<string>}
 */
const getBody = async ({suit, value}) => {
  switch (value) {
    case 1:
      return bodyIcons.ace[suit.name] ??= fetch(`/public/ace-of-${suit.name}.svg`).then(value => value.text());
    case 11:
      return bodyIcons.jack[suit.name] ??= fetch(`/public/jack-of-${suit.name}.svg`).then(value => value.text());
    case 12:
      return bodyIcons.queen[suit.name] ??= fetch(`/public/queen-of-${suit.name}.svg`).then(value => value.text());
    case 13:
      return bodyIcons.king[suit.name] ??= fetch(`/public/king-of-${suit.name}.svg`).then(value => value.text());
    default:
      return Promise.all(Array.from({length: value}, async () => getIcon(suit)))
        .then(body => body.join('\n'))
  }
}

const cardTemplateString = fetch('/components/card/card.html')
  .then(response => response.text());

/**
 * @param {Card} card
 * @returns {Promise<HTMLButtonElement>}
 */
export const createCardElement = async ({suit, value}) => {
  const card = (await cardTemplateString).replaceAll('{icon}', await getIcon(suit))
    .replaceAll('{value}', getValue(value))
    .replaceAll('{body}', await getBody({suit, value}));
  const wrapper = document.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'card-wrapper';
  wrapper.innerHTML = card;
  wrapper.style.setProperty('--color', suit.color);
  initHandlers(wrapper);
  return wrapper;
}

/**
 *
 * @param {HTMLButtonElement} element
 * @param {boolean} down
 */
export const flipCard = (element, down = true) => {
  if (down) {
    element.disabled = true;
    element.style.pointerEvents = 'none';
    element.children.item(0).style.rotate = 'Y .5turn';
  } else {
    element.disabled = false;
    element.style.removeProperty('pointer-events');
    element.children.item(0).style.removeProperty('rotate');
  }
}
