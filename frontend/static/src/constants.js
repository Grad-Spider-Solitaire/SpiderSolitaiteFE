
/**
 * @type {Readonly<Array<Suit>>}
 */
export const suits = Object.freeze([{name: 'spades'}, {name: 'hearts'}, {name: 'clubs'}, {name: 'diamonds'}]);

export const getCards = (numSuits) => Array.from({length: 8}, (_, i) => Array.from({length: 13}, (_, value) => ({suit: suits.at(i % numSuits), value: value + 1}))).flat();

export const url = 'http://nodejs-env.eba-8buzdexv.eu-west-1.elasticbeanstalk.com/';
