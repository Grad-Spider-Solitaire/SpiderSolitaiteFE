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

/**
 * @param {Suit} suit
 * @returns {Promise<string>}
 */
const getIcon = async (suit) => await fetch(`/public/${suit.name}.svg`).then(value => value.text());

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

/**
 * @param {Card} card
 * @returns {Promise<string>}
 */
const getBody = async ({suit, value}) => {
  switch (value) {
    case 1:
      return fetch(`/public/ace-of-${suit.name}.svg`).then(value => value.text())
    case 11:
      return fetch(`/public/jack-of-${suit.name}.svg`).then(value => value.text())
    case 12:
      return fetch(`/public/queen-of-${suit.name}.svg`).then(value => value.text())
    case 13:
      return fetch(`/public/king-of-${suit.name}.svg`).then(value => value.text())
    default:
      return Promise.all(Array.from({length: value}, async () => await fetch(`/public/${suit.name}.svg`).then(value => value.text())))
        .then(body => body.join('\n'))
  }
}

/**
 * @param {Card} card
 * @returns {Promise<HTMLButtonElement>}
 */
export const createCardElement = ({suit, value}) => {
  return fetch('/components/card/card.html')
    .then(response => response.text())
    .then(async card => card.replaceAll('{icon}', await getIcon(suit)))
    .then(async card => card.replaceAll('{value}', getValue(value)))
    .then(async card => card.replaceAll('{body}', await getBody({suit, value})))
    .then(card => {
      const wrapper = document.createElement('button');
      wrapper.type = 'button';
      wrapper.className = 'card-wrapper';
      wrapper.innerHTML = card;
      wrapper.style.setProperty('--color', suit.color);
      initHandlers(wrapper);
      return wrapper;
    });
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
