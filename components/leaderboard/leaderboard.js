const template = await fetch('/components/leaderboard/leaderboard.html')
  .then(response => response.text())
  .then(text => {
    const template = document.createElement('template');
    template.innerHTML = text;
    return template;
  });

const rowTemplateText = await fetch('/components/leaderboard/row.html')
  .then(response => response.text());

/**
 * @returns {HTMLElement}
 */
export const createLeaderboard = () => {
  const leaderboardNode = template.content.cloneNode(true);
  document.body.appendChild(leaderboardNode);
  return document.getElementById('leaderboard');
}

export const createRow = (name, score, time) => {
  const templatedText = rowTemplateText.replace('{name}', name)
    .replace('{score}', score)
    .replace('{time}', time);
  const template = document.createElement('template');
  template.innerHTML = templatedText;
  return template.content.cloneNode(true);
}
