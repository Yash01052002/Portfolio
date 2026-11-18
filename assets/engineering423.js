(()=>{
'use strict';
for(const root of document.querySelectorAll('[data-trace-project]')){
  const dataNode=root.querySelector('.trace-data');
  if(!dataNode)continue;
  let data;
  try{data=JSON.parse(dataNode.textContent)}catch(e){continue}
  const scenarios=root.querySelector('.trace-scenarios'), steps=root.querySelector('.trace-steps');
  const count=root.querySelector('.trace-count'), title=root.querySelector('.trace-title'),desc=root.querySelector('.trace-description');
  const rationaleTitle=root.querySelector('.trace-rationale-title'),rationale=root.querySelector('.trace-rationale-copy');
  const output=root.querySelector('.trace-output'),tech=root.querySelector('.trace-stage-tech');
  const prev=root.querySelector('.trace-prev'),next=root.querySelector('.trace-next');
  let scene=data.scenarios[0][0],step=0;
  steps.style.setProperty('--trace-cols',String(data.steps.length));
  data.scenarios.forEach(([id,label])=>{
    const b=document.createElement('button');b.type='button';b.textContent=label;
    b.dataset.scene=id;b.setAttribute('aria-pressed',String(id===scene));
    b.addEventListener('click',()=>{scene=id;step=0;render()});scenarios.appendChild(b)
  });
  data.steps.forEach((item,i)=>{
    const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Stage ${i+1}: ${item[0]}`);
    const n=document.createElement('span');n.className='trace-step-num';n.textContent=String(i+1).padStart(2,'0');
    const t=document.createElement('span');t.className='trace-step-name';t.textContent=item[0];
    b.append(n,t);b.setAttribute('aria-pressed',String(i===step));b.addEventListener('click',()=>{step=i;render()});steps.appendChild(b)
  });
  function render(){
    const s=data.steps[step];
    count.textContent=`STEP ${String(step+1).padStart(2,'0')} / ${String(data.steps.length).padStart(2,'0')}`;
    title.textContent=s[2];desc.textContent=s[3];rationaleTitle.textContent=s[4];rationale.textContent=s[5];
    tech.textContent=s[1];
    // Text is written as textContent: no HTML interpolation or script execution.
    output.textContent=(data.examples[scene]?.[step]||'No example').replace(/\\n/g,'\n');
    scenarios.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===scene)));
    [...steps.querySelectorAll('button')].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===step)));
    prev.disabled=step===0;next.disabled=step===data.steps.length-1;
  }
  prev.addEventListener('click',()=>{if(step>0){step--;render()}});
  next.addEventListener('click',()=>{if(step<data.steps.length-1){step++;render()}});
  render();
}
})();
