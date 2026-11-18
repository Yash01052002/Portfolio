(()=>{'use strict';
const root=document.getElementById('code-preview');if(!root)return;
const data=document.getElementById('project-code-data');if(!data)return;
let scenes=[];try{scenes=JSON.parse(data.textContent);}catch(e){return;}
if(!Array.isArray(scenes)||!scenes.length)return;
const code=root.querySelector('#code-preview-lines'),file=root.querySelector('#code-preview-file'),description=root.querySelector('#code-preview-description'),state=root.querySelector('#code-preview-state'),motion=root.querySelector('#code-preview-motion'),buttons=[...root.querySelectorAll('[data-code-scene]')];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let active=0,paused=false,visible=false,timer=null,token=0,position=0;
function cancel(){if(timer!==null){clearTimeout(timer);timer=null;}token++;}
function updateButtons(){buttons.forEach((b,i)=>{const selected=i===active;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected));});}
function render(lines,caretIndex=-1){code.replaceChildren();lines.forEach((line,i)=>{const row=document.createElement('div');row.className='code-preview-line';const number=document.createElement('span');number.className='code-preview-number';number.textContent=String(i+1);const text=document.createElement('span');text.className='code-preview-text';text.textContent=line;if(i===caretIndex){const caret=document.createElement('span');caret.className='code-preview-caret';caret.setAttribute('aria-hidden','true');text.append(caret);}row.append(number,text);code.append(row);});}
function staticScene(){const scene=scenes[active];file.textContent=scene.file;description.textContent=scene.description;render(scene.lines);state.textContent=reduced.matches?'STATIC':paused?'PAUSED':'PREVIEW';updateButtons();}
function tick(myToken){if(myToken!==token||paused||!visible||reduced.matches||document.hidden)return;const scene=scenes[active];const all=scene.lines.join('\n');if(position<=all.length){const partial=all.slice(0,position);const lines=partial.split('\n');render(lines,lines.length-1);position++;timer=setTimeout(()=>tick(myToken),position===1?320:35);return;}
 state.textContent='READY';timer=setTimeout(()=>{if(myToken!==token||paused||!visible||document.hidden)return;active=(active+1)%scenes.length;start();},3100);
}
function start(){cancel();position=0;const scene=scenes[active];file.textContent=scene.file;description.textContent=scene.description;updateButtons();if(reduced.matches||paused||!visible||document.hidden){staticScene();return;}state.textContent='TYPING';render([''],0);const myToken=token;timer=setTimeout(()=>tick(myToken),250);}
function setPause(value){paused=value;motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Resume code animation':'Pause code animation');motion.innerHTML=paused?'Play <span aria-hidden="true">▶</span>':'Pause <span aria-hidden="true">Ⅱ</span>';if(paused){cancel();staticScene();}else start();}
buttons.forEach(b=>b.addEventListener('click',()=>{active=Number(b.dataset.codeScene);start();}));motion.addEventListener('click',()=>setPause(!paused));
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{const next=entries.some(e=>e.isIntersecting);if(next!==visible){visible=next;if(visible)start();else{cancel();staticScene();}}},{threshold:.15});observer.observe(root);}else{visible=true;start();}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancel();staticScene();}else if(visible)start();});
const handleMotion=()=>{cancel();staticScene();if(!reduced.matches&&visible&&!paused)start();};if(reduced.addEventListener)reduced.addEventListener('change',handleMotion);else if(reduced.addListener)reduced.addListener(handleMotion);
staticScene();
})();
