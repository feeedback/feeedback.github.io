const isShown=(el,myShiftY=-Math.round(window.innerHeight/5))=>window.innerHeight-el.getBoundingClientRect().y>=myShiftY,isShownElements=()=>{const elements=[...document.querySelectorAll(".scroll-transition")].filter(isShown);return elements.forEach(el=>el.classList.remove("scroll-transition")),elements},runTransition=elements=>{elements.forEach(el=>el.style.width=el.dataset.width)};document.addEventListener("DOMContentLoaded",()=>{runTransition(isShownElements()),window.addEventListener("scroll",()=>runTransition(isShownElements())),window.addEventListener("orientationchange",()=>runTransition(isShownElements())),window.addEventListener("resize",()=>runTransition(isShownElements()))});