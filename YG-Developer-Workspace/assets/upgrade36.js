/* YG Developer Workspace 3.6 — interactive project gallery, scroll scenes,
   debugging challenge, recruiter quick mode. Runs locally, no dependencies. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Swap in actual screenshots only if user-supplied assets load successfully.
  $$('img[data-real-src]').forEach(img => {
    const path=img.dataset.realSrc;
    const probe=new Image();
    probe.onload=()=>{
      img.src=path;img.dataset.imageType='real';
      img.alt=img.alt.replace(' — illustrative concept until a genuine screenshot is supplied',' — actual application screenshot');
      const card=img.closest('.gallery-card');
      const badge=card?.querySelector('[data-gallery-badge]');
      if(badge){badge.textContent='ACTUAL SCREENSHOT';badge.classList.add('is-real');}
      const caption=img.closest('.showcase-card')?.querySelector('.showcase-caption');
      if(caption)caption.textContent='ACTUAL SCREENSHOT · VIEW CASE STUDY';
    };
    probe.onerror=()=>{img.dataset.imageType='concept';};
    probe.src=path;
  });

  // Work-section cinematic scroll position is calculated afresh, not accumulated;
  // scrolling upward reverses every displacement without jumps.
  const work=$('#work');
  if(work && !reduced){
    let pending=false;
    const update=()=>{
      pending=false;
      const rect=work.getBoundingClientRect(), vh=innerHeight;
      if(rect.bottom < -120 || rect.top > vh+120)return;
      const p=Math.max(-1,Math.min(1,(vh*.35-rect.top)/Math.max(1,rect.height-vh*.3)));
      work.style.setProperty('--scene-progress',p.toFixed(3));
      work.style.setProperty('--scene-shift',(-p*7).toFixed(1)+'px');
      $$('.showcase-card',work).forEach((card,i)=>{
        const depth=[-18,13,-9][i];
        card.style.setProperty('--float-y',(p*depth).toFixed(1)+'px');
      });
    };
    const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
    $$('.showcase-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        if(e.pointerType==='touch')return;
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        card.style.setProperty('--tilt-x',(-y*7).toFixed(1)+'deg');
        card.style.setProperty('--tilt-y',(x*7).toFixed(1)+'deg');
      });
      card.addEventListener('pointerleave',()=>{
        card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');
      });
    });
  }

  // Thin cinematic light passes through every major section. Position is a pure
  // function of scroll, so reversing direction reverses the transition.
  const scenes=$$('.cinematic-section');
  if(scenes.length && !reduced){
    let scheduled=false;
    const drawScenes=()=>{
      scheduled=false;const vh=innerHeight;
      for(const scene of scenes){
        const r=scene.getBoundingClientRect();
        if(r.bottom < -100 || r.top > vh+100)continue;
        const progress=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)));
        scene.style.setProperty('--cinematic-offset',((progress-.5)*210).toFixed(1)+'px');
        scene.style.setProperty('--cinematic-opacity',(0.2+Math.sin(progress*Math.PI)*.52).toFixed(2));
      }
    };
    const request=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(drawScenes);}};
    addEventListener('scroll',request,{passive:true});addEventListener('resize',request);drawScenes();
  }

  // A fictional interactive exercise; answers are engineering reasoning, not AI.
  const scenarios=[
    {
      question:'A task crashes during sensor reads. What should you inspect first?',
      evidence:{
        trace:'HardFault_Handler()\n  ↳ vSensorRead() + 0x1c\n  ↳ SensorTask() + 0x40\n  ↳ vPortTaskWrapper()\n\nException: HardFault\nPC: 0x08002A1C  [example]',
        context:'Target: STM32 / FreeRTOS\nTask: SensorTask\nStack high-water mark: 12 words\nRecent change: larger local buffer\nFault: repeatable under load',
        symbols:'0x08002A1C → vSensorRead()\n0x08001FC0 → SensorTask()\nELF/MAP symbols: available\nSource context: sample only'
      },
      options:['Increase network request timeout','Inspect SensorTask stack usage and local allocations','Disable crash logging permanently'],
      correct:1,
      explain:'The very low stack high-water mark and recent local-buffer change point toward stack pressure. Check stack sizing, task watermarks and buffer allocations before concluding a root cause.'
    },
    {
      question:'You have raw addresses but no readable function names. What is missing?',
      evidence:{
        trace:'Exception: HardFault\nPC: 0x080032B8\nLR: 0x08001842\nBacktrace: [0x080032B8, 0x08001842]\n\nSymbols: unresolved',
        context:'Firmware build: sample-f407-v12\nCrash payload: received\nDevice ID: demo-device\nELF artifact: not attached',
        symbols:'0x080032B8 → ???\n0x08001842 → ???\nNo matching ELF/MAP for build\nSymbolization: pending'
      },
      options:['Attach the matching firmware ELF/MAP artifact','Clear the PostgreSQL database','Restart the browser animation'],
      correct:0,
      explain:'Symbolization requires the correct firmware build artifacts. Attach a matching ELF/MAP file so the raw addresses can be resolved into meaningful function context.'
    },
    {
      question:'A diagnosis is queued, but no result appears. Where do you look?',
      evidence:{
        trace:'POST /crashes → 201 Created\nTask ID: sample-task-003\nState: PENDING\nDiagnosis: not yet available',
        context:'FastAPI: responding\nPostgreSQL: connected\nRedis queue: 3 pending jobs\nCelery worker: no heartbeat',
        symbols:'ELF artifact: available\nSymbol map: loaded\nProcessing task: still pending\nOutput: none'
      },
      options:['Change the portfolio theme','Delete the incoming crash report','Check Celery worker health and Redis queue'],
      correct:2,
      explain:'The API accepted the request and the database is connected, but the worker has no heartbeat and jobs remain queued. Investigate worker availability, queue connectivity and task logs.'
    }
  ];
  const challenge=$('#debug-challenge');
  if(challenge){
    let scenario=0,evidence='trace',choice=-1,checked=false;
    const log=$('#debug-log'),options=$('#debug-options'),question=$('#debug-question'),counter=$('#debug-counter'),feedback=$('#debug-feedback'),submit=$('#debug-submit'),next=$('#debug-next');
    function draw(){
      const data=scenarios[scenario];
      counter.textContent=`SCENARIO ${String(scenario+1).padStart(2,'0')} / ${String(scenarios.length).padStart(2,'0')}`;
      question.textContent=data.question;log.textContent=data.evidence[evidence];
      $$('.debug-tabs button').forEach(b=>{const active=b.dataset.evidence===evidence;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
      options.replaceChildren();
      data.options.forEach((answer,i)=>{
        const b=document.createElement('button');b.type='button';b.className='debug-choice';b.setAttribute('aria-pressed',String(choice===i));b.disabled=checked;
        const span=document.createElement('span');span.className='debug-choice-index';span.textContent=String.fromCharCode(65+i);
        b.append(span,document.createTextNode(answer));
        b.addEventListener('click',()=>{choice=i;draw();});options.append(b);
      });
      submit.disabled=choice<0||checked;submit.hidden=checked;next.hidden=!checked;
      next.textContent=scenario===scenarios.length-1?'Try again ↻':'Next scenario →';
      if(!checked){feedback.textContent='';feedback.classList.remove('is-warning');}
    }
    $$('.debug-tabs button').forEach(b=>{
      b.addEventListener('click',()=>{evidence=b.dataset.evidence;draw();});
      b.addEventListener('keydown',e=>{
        if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
        e.preventDefault();const keys=['trace','context','symbols'];const n=keys.indexOf(evidence);evidence=keys[(n+(e.key==='ArrowRight'?1:2))%3];draw();$(`.debug-tabs button[data-evidence="${evidence}"]`).focus();
      });
    });
    submit.addEventListener('click',()=>{
      if(choice<0||checked)return;
      checked=true;const correct=choice===scenarios[scenario].correct;
      feedback.classList.toggle('is-warning',!correct);
      feedback.textContent=(correct?'Good investigation. ':'Not the strongest next step. ')+scenarios[scenario].explain;
      draw();
    });
    next.addEventListener('click',()=>{scenario=(scenario+1)%scenarios.length;evidence='trace';choice=-1;checked=false;draw();question.focus?.();});
    draw();
  }

  // Recruiter Quick Mode, available via header, mobile nav, and Ctrl/Cmd+K.
  const recruiter=$('#recruiter-backdrop');
  if(recruiter){
    let previous=null,oldOverflow='';
    const close=$('#recruiter-close');
    const open=()=>{
      if(!recruiter.hidden)return;
      previous=document.activeElement;oldOverflow=document.body.style.overflow;
      recruiter.hidden=false;document.body.style.overflow='hidden';close.focus();
    };
    const hide=()=>{
      if(recruiter.hidden)return;
      recruiter.hidden=true;document.body.style.overflow=oldOverflow;
      if(location.hash==='#recruiter-quick')history.replaceState(null,'',location.pathname+location.search);
      previous?.focus?.();
    };
    $$('[data-open-recruiter]').forEach(b=>b.addEventListener('click',open));
    close.addEventListener('click',hide);
    recruiter.addEventListener('pointerdown',e=>{if(e.target===recruiter)hide();});
    addEventListener('hashchange',()=>{if(location.hash==='#recruiter-quick')open();});
    if(location.hash==='#recruiter-quick')open();
    document.addEventListener('keydown',e=>{
      if(recruiter.hidden)return;
      if(e.key==='Escape'){e.preventDefault();hide();return;}
      if(e.key==='Tab'){
        const f=$$('a[href],button:not([disabled])',recruiter).filter(el=>el.getClientRects().length);
        const first=f[0],last=f[f.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
  }

  // Keyboard-accessible gallery lightbox with left/right navigation.
  const lightbox=$('#gallery-lightbox'),cards=$$('[data-gallery-item]');
  if(lightbox && cards.length){
    let current=0,previous=null,oldOverflow='';
    const close=$('#lightbox-close'),image=$('#lightbox-image'),label=$('#lightbox-label'),count=$('#lightbox-count');
    function render(){
      const card=cards[current],src=$('img',card),title=$('.gallery-title',card)?.textContent.trim()||'Project image';
      image.src=src.currentSrc||src.src;image.alt=src.alt;
      label.textContent=title+' / '+(src.dataset.imageType==='real'?'ACTUAL SCREENSHOT':'ILLUSTRATIVE CONCEPT');
      count.textContent=`${String(current+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    }
    function open(i){previous=document.activeElement;oldOverflow=document.body.style.overflow;current=i;render();lightbox.hidden=false;document.body.style.overflow='hidden';close.focus();}
    function hide(){lightbox.hidden=true;document.body.style.overflow=oldOverflow;previous?.focus?.();}
    function move(n){current=(current+n+cards.length)%cards.length;render();}
    cards.forEach((card,i)=>card.addEventListener('click',()=>open(i)));
    close.addEventListener('click',hide);
    $('#lightbox-prev').addEventListener('click',()=>move(-1));
    $('#lightbox-next').addEventListener('click',()=>move(1));
    lightbox.addEventListener('pointerdown',e=>{if(e.target===lightbox)hide();});
    document.addEventListener('keydown',e=>{
      if(lightbox.hidden)return;
      if(e.key==='Escape'){e.preventDefault();hide();}
      if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}
      if(e.key==='ArrowRight'){e.preventDefault();move(1);}
      if(e.key==='Tab'){
        const f=$$('button',lightbox);const first=f[0],last=f[f.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
  }
})();
