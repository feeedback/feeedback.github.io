const isShown = (el, myShiftY = -Math.round(window.innerHeight / 5)) => {
    const shiftY = window.innerHeight - el.getBoundingClientRect().y;
    return shiftY >= myShiftY;
};

const isShownElements = () => {
    const elements = [...document.querySelectorAll('.scroll-transition')].filter(isShown);

    elements.forEach((el) => el.classList.remove('scroll-transition'));
    return elements;
};
const runTransition = (elements) => {
    elements.forEach((el) => (el.style.width = el.dataset.width));
};
document.addEventListener('DOMContentLoaded', () => {
    runTransition(isShownElements());
    window.addEventListener('scroll', () => runTransition(isShownElements()));
    window.addEventListener('orientationchange', () => runTransition(isShownElements()));
    window.addEventListener('resize', () => runTransition(isShownElements()));
});
clg;
