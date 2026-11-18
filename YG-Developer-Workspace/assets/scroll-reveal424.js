/* Scroll-controlled welcome: no autoplay, no timed overlay, no forced waiting. */
(()=>{'use strict';
 const intro=document.getElementById('welcome-stage');if(!intro)return;
 const greeting=document.getElementById('scroll-intro-greeting');
 const hour=new Date().getHours();
 const period=hour>=5&&hour<12?'morning':hour>=12&&hour<17?'afternoon':hour>=17&&hour<21?'evening':'night';
 intro.dataset.period=period;
 const messages={morning:'Good morning, and welcome.',afternoon:'Good afternoon, and welcome.',evening:'Good evening, and welcome.',night:'Good night, and welcome.'};
 const labels={morning:'MORNING LIGHT',afternoon:'AFTERNOON SUN',evening:'EVENING SUNSET',night:'MOONLIGHT'};
 if(greeting)greeting.textContent=messages[period];
 const skyLabel=document.getElementById('scroll-sky-label');if(skyLabel)skyLabel.textContent=labels[period];
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const hero=document.querySelector('.unified-hero');
 if(!reduce&&hero&&'IntersectionObserver' in window){document.documentElement.classList.add('yg-scroll-enhanced');const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}},{threshold:.06});observer.observe(hero);}
 if(reduce)return;
 let pending=false;
 const update=()=>{pending=false;const height=Math.max(intro.offsetHeight,1);const p=Math.max(0,Math.min(1,window.scrollY/(height*.95)));intro.style.setProperty('--intro-progress',p.toFixed(3));};
 const onScroll=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});update();
})();
