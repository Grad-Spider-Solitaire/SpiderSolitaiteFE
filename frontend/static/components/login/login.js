const template = fetch('/components/login/login.html')
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
export const createLogin = async () => {
  const boardNode = (await template).content.cloneNode(true);
  document.body.appendChild(boardNode);
  return document.getElementById('login');
}
