const template = await fetch('/components/board/board.html')
  .then(response => response.text())
  .then(text => {
    const template = document.createElement('template');
    template.innerHTML = text;
    return template;
  });

export const createBoard = () => {
    const boardNode = template.content.cloneNode(true);
    document.body.appendChild(boardNode);
    return document.getElementById('board');
}
