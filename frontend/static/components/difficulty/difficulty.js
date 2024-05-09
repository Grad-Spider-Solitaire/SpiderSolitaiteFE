const template = fetch('/components/difficulty/difficulty.html')
  .then(response => response.text())
  .then(text => {
    const template = document.createElement('template');
    template.innerHTML = text;
    return template;
  });

/**
 *
 * @returns {Promise<HTMLElement>}
 */
export const createDifficulty = async () => {
  const boardNode = (await template).content.cloneNode(true);
  document.body.appendChild(boardNode);
  return document.getElementById('difficulty');
}
