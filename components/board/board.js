const template = fetch('/components/board/board.html')
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
export const createBoard = async () => {
    const boardNode = (await template).content.cloneNode(true);
    document.body.appendChild(boardNode);
    return document.getElementById('board');
}
