(()=>{'use strict';if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const cards=[...document.querySelectorAll('.depth-reveal')];if(!cards.length||!('IntersectionObserver' in window))return;
const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('is-in-view');observer.unobserve(e.target);}}},{threshold:.08});
cards.forEach(c=>observer.observe(c));document.documentElement.classList.add('yg-depth-ready');})();