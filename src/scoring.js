
export const maxScore = 990;

export let score = 0;

export function addScore(number) {
  score += number;
  document.getElementById('score').innerText = `Score: ${score}`;
  return score;
}

export const uncoveredScore = 10;

export const emptyColScore = 15;

export const suitCompleteScore = 50;

export const chainScore = 2;
