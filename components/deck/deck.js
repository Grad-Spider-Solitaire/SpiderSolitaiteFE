import {cardMoveStyling, moveCard} from "../../src/styling.js";
import {flipCard} from "../card/card.js";
import {validateForSelect} from "../../src/eventHandlers.js";
import {boardState, deck} from "../../src/main.js";

const template = await fetch('/components/deck/deck.html')
  .then(response => response.text())
  .then(text => {
    const template = document.createElement('template');
    template.innerHTML = text;
    return template;
  });

/**
 * @returns {HTMLElement}
 */
export const createDeck = () => {
    const deckNode = template.content.cloneNode(true);
    document.body.appendChild(deckNode);
    return document.getElementById('deck');
}

  /**
   * @param {number} cards
   * @param {number} [down]
   */
export const deal = (cards, down = 0) => {
  const deckDom = document.getElementById('deck');
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
