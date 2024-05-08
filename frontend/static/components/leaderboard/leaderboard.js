const template = await fetch('/components/leaderboard/leaderboard.html')
  .then(response => response.text())
  .then(text => {
    const template = document.createElement('template');
    template.innerHTML = text;
    return template;
  });

const rowTemplateText = fetch('/components/leaderboard/row.html')
  .then(response => response.text());

/**
 * @returns {Promise<HTMLTableElement>}
 */
export const createLeaderboard = async() => {
  const leaderboardNode = (await template).content.cloneNode(true);
  document.body.appendChild(leaderboardNode);
  return document.getElementById('leaderboard');
}

/**
 *
 * @param {string} name
 * @param {string|number} score
 * @param {string} time
 * @returns {Promise<Node>}
 */
export const createRow = async (name, score, time) => {
  const templatedText = (await rowTemplateText).replace('{name}', name)
    .replace('{score}', score)
    .replace('{time}', time);
  const template = document.createElement('template');
  template.innerHTML = templatedText;
  return template.content.cloneNode(true);
}
