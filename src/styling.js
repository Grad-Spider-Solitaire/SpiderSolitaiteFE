export const cardMoveStyling = (element, apply = true) => {
  if (apply) {
    element.style.position = 'absolute';
    element.style.zIndex = '1';
  } else {
    element.style.removeProperty('position');
    element.style.removeProperty('top');
    element.style.removeProperty('pointer-events');
    element.style.removeProperty('left');
    element.style.removeProperty('z-index');
  }
}

export const moveCard = (element, x, y) => {
  element.style.top = y;
  element.style.left = x;
}
