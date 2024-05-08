import {flipCard} from "../card/card.js";
import {validateForSelect} from "../../src/eventHandlers.js";
import {boardState, deck} from "../../src/main.js";

const template = fetch('/components/deck/deck.html')
  .then(response => response.text())
  .then(text => {
    const template = document.createElement('template');
    template.innerHTML = text;
    return template;
  });

/**
 * @returns {Promise<HTMLElement>}
 */
export const createDeck = async () => {
    const deckNode = (await template).content.cloneNode(true);
    document.body.appendChild(deckNode);
    return document.getElementById('deck');
}

  /**
   * @param {number} cards
   * @param {number} [down]
   */
export const deal = (cards, down = 0) => {
  const deckDom = document.getElementById('deck');
    deckDom.style.pointerEvents = 'none';
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
      card.element.style.setProperty('--y-offset', `${originalPos.top}px`);
      card.element.style.setProperty('--x-offset', `${originalPos.left}px`);
      deals.push(new Promise((resolve) => {
        setTimeout(() => {
          card.element.style.margin = '0';
          card.element.className += ' dealing';
          card.element.style.setProperty('--deal-row', `${dealRow}`);
          card.element.style.zIndex = `${1 + index}`;
          flipCard(card.element, down > index);
          card.element.style.setProperty('--y-offset', `${last.element.getBoundingClientRect().top}px`);
          card.element.style.setProperty('--x-offset', `${last.element.getBoundingClientRect().left}px`);
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
          card.element.style.removeProperty('--y-offset');
          card.element.style.removeProperty('--transition-duration-ms');
          card.element.style.removeProperty('--x-offset');
          card.element.style.removeProperty('--deal-row');
          card.element.style.removeProperty('z-index');
          card.element.style.removeProperty('margin');
          card.element.className = card.element.className.replace(' dealing', '');
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
