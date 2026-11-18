(()=>{'use strict';
const steps=[
 {label:'STEP 01 / DEVICE',title:'Capture a firmware crash',description:'An STM32 / FreeRTOS device produces an exception report and relevant context for investigation.',code:'device: stm32-demo\nexception: HardFault\nstatus: captured'},
 {label:'STEP 02 / API',title:'Ingest and organize context',description:'FastAPI receives crash reports, validates access, and associates the report with a device and user.',code:'POST /crashes\nauth: device API key\nresponse: accepted'},
 {label:'STEP 03 / WORKERS',title:'Process work asynchronously',description:'Celery workers with Redis handle analysis tasks outside the immediate API request cycle.',code:'queue: crash-analysis\nworker: celery\nstate: processing'},
 {label:'STEP 04 / SYMBOLS',title:'Translate raw addresses',description:'ELF/MAP-aware symbolization connects addresses to meaningful firmware function and source context when symbols are available.',code:'pc: 0x08004A20\nsymbol: sensor_read()\nsource: firmware.elf'},
 {label:'STEP 05 / DIAGNOSIS',title:'Ground the explanation',description:'Retrieved knowledge-base material gives an AI-assisted diagnosis workflow relevant context to interpret crash evidence.',code:'retrieval: knowledge base\ncontext: matched\noutput: explanation draft'},
 {label:'STEP 06 / DASHBOARD',title:'Review the investigation',description:'The Next.js dashboard brings crash groups, symbolized traces, and diagnosis details into one navigable workflow.',code:'view: crash detail\ntrace: symbolized\nreport: available'}
];
const buttons=[...document.querySelectorAll('[data-build-step]')];const title=document.getElementById('build-detail-title'),label=document.getElementById('build-detail-label'),copy=document.getElementById('build-detail-copy'),code=document.getElementById('build-detail-code');
function selectStep(n){const s=steps[n];if(!s)return;buttons.forEach((b,i)=>{b.classList.toggle('is-active',i===n);b.setAttribute('aria-pressed',String(i===n));});title.textContent=s.title;label.textContent=s.label;copy.textContent=s.description;code.textContent=s.code.replaceAll('\\n','\n');}
buttons.forEach(b=>b.addEventListener('click',()=>selectStep(Number(b.dataset.buildStep))));
const dialog=document.getElementById('recruiter-brief');document.querySelectorAll('[data-open-brief]').forEach(b=>b.addEventListener('click',()=>{if(dialog?.showModal)dialog.showModal();}));document.querySelectorAll('[data-close-brief]').forEach(b=>b.addEventListener('click',()=>dialog?.close()));if(dialog){dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});}
})();
