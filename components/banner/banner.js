const template = fetch('/components/banner/banner.html')
  .then(response => response.text())
  .then(text => {
    const template = document.createElement('template');
    template.innerHTML = text;
    return template;
  });

/**
 * @returns {Promise<HTMLElement>}
 */
export const createBanner = async () => {
    const bannerNode = (await template).content.cloneNode(true);
    document.body.appendChild(bannerNode);
    return document.getElementById('banner');
  }
