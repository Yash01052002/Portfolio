(() => {
  const $ = (s) => document.querySelector(s);
  const nav = $('#nav'), menu = $('.menu-button');
  if (nav && menu) {
    const close = () => {nav.classList.remove('open'); menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');};
    menu.addEventListener('click', () => {const open = nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');});
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
  }
  if ($('#year')) $('#year').textContent = new Date().getFullYear();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver(entries => entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px 60px 0px'});
    reveals.forEach(el=>observer.observe(el));
  } else reveals.forEach(el=>el.classList.add('visible'));

  const steps = [
    {title:'Crash received',desc:'Firmware sends an exception report and device context to the API.',html:'<span class="terminal-muted">$ blackbox ingest --device stm32</span><br><span class="terminal-green">✓</span> Crash report accepted<br><span class="terminal-muted">exception:</span> HardFault<br><span class="terminal-muted">status:</span> queued for analysis'},
    {title:'Context analyzed',desc:'Background workers process crash data and resolve symbols using firmware artifacts.',html:'<span class="terminal-muted">$ blackbox analyze --crash latest</span><br><span class="terminal-green">✓</span> Worker completed<br><span class="terminal-muted">symbol:</span> vSensorRead()<br><span class="terminal-muted">source:</span> ELF / MAP context'},
    {title:'Diagnosis generated',desc:'The system combines diagnostic context with retrieved knowledge to support investigation.',html:'<span class="terminal-muted">$ blackbox diagnose --with-kb</span><br><span class="terminal-green">✓</span> Analysis report ready<br><span class="terminal-muted">finding:</span> potential stack overflow<br><span class="terminal-muted">next:</span> review stack allocation'}
  ];
  const tabs = document.querySelectorAll('[data-step]');
  function activateStep(i){
    tabs.forEach((b,n)=>{b.setAttribute('aria-selected',String(n===i));b.tabIndex=n===i?0:-1;});
    $('#workflow-title').textContent=steps[i].title;$('#workflow-desc').textContent=steps[i].desc;$('#workflow-output').innerHTML=steps[i].html;
  }
  tabs.forEach((b,i)=>{
    b.addEventListener('click',()=>activateStep(i));
    b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activateStep(next);tabs[next].focus();}});
  });
  const outputs = {
    whoami:'Yash Gaidhane\nFull Stack Developer • Python Backend • AI Applications\nBuilding useful software, one problem at a time.',
    projects:'01  BlackBox — AI-powered firmware crash diagnosis\n02  Suraksha — mobile safety application\n03  Support Ticket System — backend (in progress)',
    stack:'Python · FastAPI · JavaScript · React · Next.js\nPostgreSQL · Redis · Celery · Docker · Firebase',
    contact:'Email: yashgaidhane2@gmail.com\nGitHub: github.com/Yash01052002\nOpen to junior developer opportunities.'
  };
  document.querySelectorAll('[data-command]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-command]').forEach(b=>b.classList.toggle('selected',b===btn));
    $('#command-text').textContent=btn.dataset.command;$('#command-output').textContent=outputs[btn.dataset.command];
  }));
  const toast = $('#toast');let toastTimer;
  function notify(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2500);}
  $('.copy-email')?.addEventListener('click',async()=>{
    const email='yashgaidhane2@gmail.com';
    try {await navigator.clipboard.writeText(email);notify('Email copied to clipboard');}
    catch(e){const t=document.createElement('textarea');t.value=email;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();let copied=false;try{copied=document.execCommand('copy');}catch(_){}t.remove();if(copied)notify('Email copied to clipboard');else window.prompt('Copy this email address:',email);}
  });
})();
/* YG Workspace 3.0: all additions work offline; no backend or external JS dependency. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // BlackBox: explain the actual architectural components, with illustrative values.
  const architecture = {
    device: ['01 / CRASH ORIGIN', 'Crash capture', 'An STM32 / FreeRTOS device produces an exception report and low-level context for investigation.', '{\n  "device": "stm32-demo",\n  "exception": "HardFault",\n  "status": "captured"\n}'],
    api: ['02 / INGESTION', 'Authenticated API', 'FastAPI accepts device and crash information and persists structured records in PostgreSQL.', 'POST /api/crashes\nAuthorization: Bearer [token]\n→ 201 Created (example)'],
    worker: ['03 / ASYNCHRONOUS PROCESSING', 'Queue and workers', 'Celery workers, coordinated through Redis, process diagnosis tasks outside the API request cycle.', 'task: analyze_crash\nqueue: redis\nstatus: completed (example)'],
    symbols: ['04 / FIRMWARE CONTEXT', 'ELF / MAP symbolization', 'Firmware symbol artifacts help connect raw addresses with readable function and source context.', 'address: 0x08002A1C\nfunction: vSensorRead()\nartifact: firmware.elf (example)'],
    rag: ['05 / AI-ASSISTED REASONING', 'Retrieved knowledge', 'Relevant knowledge-base documents provide supporting context for a diagnostic explanation.', 'retrieval: knowledge-base context\nresult: possible stack issue\nverify: manual investigation'],
    dashboard: ['06 / DEVELOPER EXPERIENCE', 'Diagnosis dashboard', 'The web interface presents crash groups, diagnostic results, and related context for review.', 'dashboard: Next.js\nview: crash detail\nstate: diagnosis available (example)']
  };
  function showArch(key) {
    const data=architecture[key]; if (!data) return;
    $('#arch-kicker').textContent=data[0];
    $('#arch-title').textContent=data[1];
    $('#arch-desc').textContent=data[2];
    $('#arch-code').textContent=data[3];
    $$('[data-arch]').forEach(b => {const active=b.dataset.arch===key;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
  }
  $$('[data-arch]').forEach(button=>button.addEventListener('click',()=>showArch(button.dataset.arch)));

  // Lightweight 3D CSS scene: user rotates the orbit, and nodes show project associations.
  const technologies={
    python: ['Python','Backend services, data processing, crash-analysis orchestration and API logic.',[['BlackBox','blackbox.html'],['Support Ticket System','support-ticket.html']]],
    fastapi: ['FastAPI','REST APIs, JWT authentication, device management and structured ticket endpoints.',[['BlackBox','blackbox.html'],['Support Ticket System','support-ticket.html']]],
    react: ['React / Next.js','Web interfaces for viewing diagnostic information and managing application workflows.',[['BlackBox','blackbox.html']]],
    postgres: ['PostgreSQL','Relational persistence for crashes, devices, tickets and structured application records.',[['BlackBox','blackbox.html'],['Support Ticket System','support-ticket.html']]],
    docker: ['Docker','Containerized local development and multi-service deployment workflows.',[['BlackBox','blackbox.html'],['Support Ticket System','support-ticket.html']]],
    flutter: ['Flutter','Cross-platform mobile UI for safety actions, contact flows and location-related features.',[['Suraksha','suraksha.html']]]
  };
  const techLinks=$('#tech-projects');
  function showTech(key){
    const info=technologies[key];if(!info)return;
    $('#tech-title').textContent=info[0];$('#tech-description').textContent=info[1];
    techLinks.replaceChildren(...info[2].map(([name,url])=>{const a=document.createElement('a');a.href=url;a.textContent=name+' ↗';return a;}));
    $$('[data-tech]').forEach(b=>{b.classList.toggle('is-active',b.dataset.tech===key);b.setAttribute('aria-pressed',String(b.dataset.tech===key));});
  }
  $$('[data-tech]').forEach(button=>button.addEventListener('click',()=>showTech(button.dataset.tech)));
  const stage=$('#universe-stage'),orbit=$('#universe-orbit');
  if(stage && orbit){
    let angle=0,startX=0,startAngle=0,dragging=false,moved=false;
    function setAngle(a){angle=a;orbit.style.setProperty('--orbit-rotation',a+'deg');}
    stage.addEventListener('pointerdown',e=>{
      if(e.target.closest('button'))return;
      dragging=true;moved=false;startX=e.clientX;startAngle=angle;
      stage.setPointerCapture(e.pointerId);orbit.classList.add('is-dragging');
    });
    stage.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-startX;if(Math.abs(dx)>5)moved=true;setAngle(startAngle+dx*.55);});
    const stop=()=>{dragging=false;orbit.classList.remove('is-dragging');};
    stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
    // Static starting perspective is intentional: no endless spin or motion sickness.
    if(!reduced)setAngle(-17);
  }

  // Desktop window manager: dock, close, minimize, maximize, stacking and drag.
  const desktop=$('#desktop-shell'),windowArea=$('#desktop-windows');
  let topZ=10;
  function bringFront(win){win.style.zIndex=String(++topZ);}
  function openWindow(key){
    const win=$(`.desktop-window[data-window="${key}"]`);if(!win)return;
    win.hidden=false;bringFront(win);
    if(window.matchMedia('(max-width:590px)').matches){
      $$('.desktop-window').filter(w=>w!==win).forEach(w=>w.hidden=true);
    }
  }
  $$('[data-open-window]').forEach(b=>b.addEventListener('click',()=>openWindow(b.dataset.openWindow)));
  $$('[data-close-window], [data-min-window]').forEach(b=>b.addEventListener('click',()=>{const win=b.closest('.desktop-window');win.hidden=true;}));
  $$('[data-max-window]').forEach(b=>b.addEventListener('click',()=>{const win=b.closest('.desktop-window');win.classList.toggle('is-max');bringFront(win);}));
  $$('.desktop-window').forEach(win=>{
    win.addEventListener('pointerdown',()=>bringFront(win));
    const handle=$('.window-titlebar',win);
    let active=false,originX=0,originY=0,left=0,top=0;
    handle.addEventListener('pointerdown',e=>{
      if(e.target.closest('button')||win.classList.contains('is-max')||window.matchMedia('(max-width:850px)').matches)return;
      active=true;bringFront(win);
      const bounds=win.getBoundingClientRect(),container=windowArea.getBoundingClientRect();
      originX=e.clientX;originY=e.clientY;left=bounds.left-container.left;top=bounds.top-container.top;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove',e=>{
      if(!active)return;
      const x=Math.max(0,Math.min(windowArea.clientWidth-win.offsetWidth,left+e.clientX-originX));
      const y=Math.max(0,Math.min(windowArea.clientHeight-65,top+e.clientY-originY));
      win.style.left=x+'px';win.style.top=y+'px';
    });
    handle.addEventListener('pointerup',()=>active=false);
    handle.addEventListener('pointercancel',()=>active=false);
  });
  const desktopClock=$('#desktop-clock');
  if(desktopClock){
    const renderTime=()=>{desktopClock.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});};
    renderTime();setInterval(renderTime,60000);
  }

  // Accessible Ctrl/Cmd+K palette with filtered results and keyboard navigation.
  const items=[
    {label:'Recruiter Quick Mode',detail:'Projects, skills, résumé and contact in one view',icon:'◈',url:'#recruiter-quick'},
    {label:'BlackBox',detail:'AI-powered firmware crash diagnosis',icon:'▣',url:'blackbox.html'},
    {label:'Suraksha',detail:'Mobile safety application',icon:'◇',url:'suraksha.html'},
    {label:'Support Ticket System',detail:'Backend ticket workflow · in progress',icon:'≡',url:'support-ticket.html'},
    {label:'Featured work',detail:'Go to selected projects',icon:'↗',url:'#work'},
    {label:'Skills & expertise',detail:'See my engineering focus',icon:'{ }',url:'#expertise'},
    {label:'BlackBox architecture',detail:'Explore the technical pipeline',icon:'⌘',url:'#architecture'},
    {label:'Technology universe',detail:'Explore the interactive tech stack',icon:'✦',url:'#universe'},
    {label:'Interactive workspace',detail:'Open the desktop app dock',icon:'▦',url:'#workspace'},
    {label:'Engineering journey',detail:'See the project timeline',icon:'◷',url:'#journey'},
    {label:'About me',detail:'Learn more about Yash',icon:'◎',url:'#about'},
    {label:'Contact',detail:'Send an email or connect',icon:'✉',url:'#contact'},
    {label:'Download resume',detail:'Download PDF',icon:'↓',url:'assets/Yash_Gaidhane_Resume.pdf',download:true},
    {label:'GitHub profile',detail:'Open GitHub in a new tab',icon:'⌘',url:'https://github.com/Yash01052002',external:true},
    {label:'LinkedIn',detail:'Open LinkedIn in a new tab',icon:'↗',url:'https://www.linkedin.com/in/yash-gaidhane-4946593a9/',external:true},
    {label:'Compose email',detail:'Open Gmail compose',icon:'✉',url:'https://mail.google.com/mail/?view=cm&fs=1&to=yashgaidhane2%40gmail.com',external:true}
  ];
  const backdrop=$('#palette-backdrop'),input=$('#palette-input'),results=$('#palette-results'),closeButton=$('#palette-close');
  let shown=[],selected=0,previousFocus=null;
  function closePalette(){if(backdrop.hidden)return;backdrop.hidden=true;document.body.style.overflow='';previousFocus?.focus();}
  function openPalette(){previousFocus=document.activeElement;backdrop.hidden=false;document.body.style.overflow='hidden';input.value='';renderResults();input.focus();}
  function navigate(item){
    closePalette();
    if(item.external){window.open(item.url,'_blank','noopener,noreferrer');return;}
    if(item.download){const a=document.createElement('a');a.href=item.url;a.download='';document.body.appendChild(a);a.click();a.remove();return;}
    window.location.href=item.url;
  }
  function markSelection(){
    $$('.palette-result',results).forEach((el,i)=>{el.classList.toggle('is-active',i===selected);el.setAttribute('aria-selected',String(i===selected));});
    const active=$$('.palette-result',results)[selected];if(active){input.setAttribute('aria-activedescendant',active.id);active.scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');
  }
  function renderResults(){
    const q=input.value.trim().toLowerCase();shown=items.filter(item=>(item.label+' '+item.detail).toLowerCase().includes(q));selected=0;
    results.replaceChildren();
    if(!shown.length){const empty=document.createElement('div');empty.className='palette-empty';empty.textContent='No results. Try “BlackBox”, “skills”, or “contact”.';results.appendChild(empty);return;}
    shown.forEach((item,i)=>{
      const row=document.createElement('button');row.type='button';row.className='palette-result';row.id='palette-option-'+i;row.setAttribute('role','option');
      const icon=document.createElement('span');icon.className='palette-result-icon';icon.textContent=item.icon;
      const label=document.createElement('span');label.className='palette-result-label';
      const strong=document.createElement('strong');strong.textContent=item.label;
      const small=document.createElement('small');small.textContent=item.detail;
      label.append(strong,small);
      const arrow=document.createElement('span');arrow.className='palette-result-arrow';arrow.textContent='↗';
      row.append(icon,label,arrow);
      row.addEventListener('mouseenter',()=>{selected=i;markSelection();});
      row.addEventListener('click',()=>navigate(item));results.appendChild(row);
    });markSelection();
  }
  $$('[data-open-palette]').forEach(b=>b.addEventListener('click',openPalette));
  closeButton?.addEventListener('click',closePalette);
  backdrop?.addEventListener('pointerdown',e=>{if(e.target===backdrop)closePalette();});
  input?.addEventListener('input',renderResults);
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();backdrop.hidden?openPalette():closePalette();return;}
    if(backdrop.hidden)return;
    if(e.key==='Escape'){e.preventDefault();closePalette();}
    else if(e.key==='ArrowDown'&&shown.length){e.preventDefault();selected=(selected+1)%shown.length;markSelection();}
    else if(e.key==='ArrowUp'&&shown.length){e.preventDefault();selected=(selected-1+shown.length)%shown.length;markSelection();}
    else if(e.key==='Enter'&&shown.length){e.preventDefault();navigate(shown[selected]);}
    else if(e.key==='Tab'){
      const focusable=[input,closeButton];const index=focusable.indexOf(document.activeElement);
      if(e.shiftKey&&index===0){e.preventDefault();closeButton.focus();}
      else if(!e.shiftKey&&index===1){e.preventDefault();input.focus();}
    }
  });
})();
