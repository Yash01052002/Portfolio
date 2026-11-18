/* YG Living Code — decorative generative animation. No code is executed or transmitted. */
(() => {
  'use strict';
  const hero=document.getElementById('living-hero');
  if(!hero) return;
  const stage=document.getElementById('living-sculpture');
  const canvas=document.getElementById('living-canvas');
  const ctx=canvas.getContext('2d');
  const rig=document.getElementById('living-rig');
  const typed=document.getElementById('living-typed');
  const output=document.getElementById('living-output');
  const phase=document.getElementById('living-phase');
  const pauseBtn=document.getElementById('living-pause');
  const remixBtn=document.getElementById('living-remix');
  const modeBtn=document.getElementById('living-mode');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const snippets=[
    {code:'const ideas = await build();',result:'✓ compiling something wonderful',stage:'01 / COMPOSING'},
    {code:'while (curious) explore();',result:'↗ new paths discovered',stage:'02 / EXPLORING'},
    {code:'return create({ impact: true });',result:'✳ pixels become possibilities',stage:'03 / TRANSFORMING'},
    {code:'ship(idea).then(celebrate);',result:'✓ imagination deployed',stage:'04 / REBUILDING'},
    {code:'const future = code + creativity;',result:'✦ made with intent',stage:'05 / EVOLVING'}
  ];
  let w=400,h=340,dpr=1,raf=0,last=0,elapsed=0,active=0,chars=0,phaseElapsed=0,paused=false,burst=0;
  let rx=-12,ry=12,targetX=-12,targetY=12,drag=false,lastPointer=null,hasPointer=false,dragMoved=false,colors=0;
  const palette=[['#f3a448','#8bd6f5'],['#85d9ed','#bba4ff'],['#c5a1ff','#f5b477']];
  const stars=Array.from({length:90},(_,i)=>({seed:i*1.618,x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()*2-1,r:Math.random()*1.6+.3,twinkle:Math.random()*6.28}));
  const letters=Array.from({length:56},(_,i)=>({seed:i*0.314,angle:i*2.3999632,r:110+(i%5)*16,speed:.22+(i%7)*.025,glyph:'{}<>/01;=+'[i%10]}));
  function resize(){
    const r=stage.getBoundingClientRect();w=r.width||400;h=r.height||330;
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function rgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
  function paint(time){
    ctx.clearRect(0,0,w,h);
    const cx=w*.5,cy=h*.49,scale=Math.min(w/420,h/340,1.1);
    const [warm,cool]=palette[colors];
    // Background stars and orbiting glyphs form a subtle interactive particle field.
    for(const s of stars){
      const angle=elapsed*.00009+s.seed*2.1;
      const px=cx+(s.x*Math.cos(angle)-s.z*Math.sin(angle))*200*scale;
      const py=cy+s.y*142*scale+Math.sin(angle+s.twinkle)*7;
      const alpha=.10+.27*(.5+.5*Math.sin(elapsed*.002+s.twinkle));
      ctx.fillStyle=rgba(s.seed%2>w*.001?cool:warm,alpha);
      ctx.beginPath();ctx.arc(px,py,s.r*scale,0,Math.PI*2);ctx.fill();
    }
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.max(9,11*scale)}px ui-monospace, monospace`;
    for(const p of letters){
      const a=p.angle+elapsed*.0001*p.speed+(ry*.012);
      const z=Math.sin(a)*.8;
      const radius=p.r*scale*(1+z*.08);
      const x=cx+Math.cos(a)*radius;
      const y=cy+Math.sin(a*1.33+rx*.015)*radius*.62;
      const opacity=.1+.4*(z+1)/2;
      ctx.fillStyle=rgba((p.seed%2>1)?cool:warm,opacity);
      ctx.fillText(p.glyph,x,y);
    }
    ctx.restore();
    // Three-dimensional orbital paths, projected into the hero canvas.
    for(let ring=0;ring<3;ring++){
      ctx.beginPath();
      for(let j=0;j<=140;j++){
        const a=j/140*Math.PI*2;
        const yaw=(elapsed*.00009)*(ring%2?-1:1)+ry*Math.PI/180*.4;
        const tilt=[.39,.79,1.2][ring]+rx*Math.PI/180*.3;
        const rad=(108+ring*24)*scale;
        const X=rad*Math.cos(a),Y=rad*Math.sin(a)*Math.cos(tilt),Z=rad*Math.sin(a)*Math.sin(tilt);
        const x=cx+(X*Math.cos(yaw)+Z*Math.sin(yaw));
        const y=cy+Y*.79;
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=rgba(ring===1?cool:warm,[.23,.12,.13][ring]);ctx.lineWidth=ring===0?1.3:.8;
      ctx.stroke();
    }
    if(burst>0){
      for(let i=0;i<95;i++){
        const a=i*2.39996+elapsed*.00013;
        const dist=(1-burst)*170+Math.pow(i/95,.7)*burst*170;
        const x=cx+Math.cos(a)*dist*scale;
        const y=cy+Math.sin(a)*dist*.7*scale;
        ctx.fillStyle=rgba(i%3?warm:cool,burst*.85);
        ctx.fillRect(x,y,1.4+(i%4),1.4+(i%4));
      }
      burst=Math.max(0,burst-.021);
    }
  }
  function renderCode(){
    const snippet=snippets[active];
    const code=snippet.code.slice(0,chars);
    const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const tokens=/(\b(?:const|return|while|await|true|then)\b|\b(?:build|explore|create|ship|celebrate)\b|\b(?:ideas|curious|future|impact)\b)/g;
    typed.innerHTML=escape(code).replace(tokens,(word)=>{
      if(/^(const|return|while|await|true|then)$/.test(word))return `<span class="living-keyword">${word}</span>`;
      if(/^(build|explore|create|ship|celebrate)$/.test(word))return `<span class="living-func">${word}</span>`;
      return `<span class="living-variable">${word}</span>`;
    })+'<span class="living-caret">▌</span>';
    phase.textContent=snippet.stage;
    output.textContent=chars>=snippet.code.length?snippet.result:'// writing something new...';
  }
  function tick(t){
    if(!last)last=t;
    const dt=Math.min(40,t-last);last=t;
    if(!paused){
      elapsed+=dt;phaseElapsed+=dt;
      const snippet=snippets[active];
      chars=Math.min(snippet.code.length,Math.floor(phaseElapsed/65));
      if(phaseElapsed>5800){active=(active+1)%snippets.length;phaseElapsed=0;chars=0;burst=.7;}
      rx+=(targetX-rx)*.045;ry+=(targetY-ry)*.045;
      rig.style.setProperty('--living-rx',rx+'deg');rig.style.setProperty('--living-ry',ry+'deg');
      renderCode();paint(t);
    }
    raf=requestAnimationFrame(tick);
  }
  function remix(){
    active=(active+1)%snippets.length;phaseElapsed=0;chars=0;burst=1;
    hero.classList.remove('is-remixing');void hero.offsetWidth;hero.classList.add('is-remixing');
    setTimeout(()=>hero.classList.remove('is-remixing'),900);
    if(reduced&&paused)chars=snippets[active].code.length;
    renderCode();if(paused)paint(elapsed);
  }
  function togglePause(){paused=!paused;if(!paused&&!raf){last=0;raf=requestAnimationFrame(tick);}pauseBtn.setAttribute('aria-pressed',String(paused));pauseBtn.innerHTML=paused?'▶ <span>PLAY</span>':'Ⅱ <span>PAUSE</span>';hero.classList.toggle('is-paused',paused);if(paused)renderCode();}
  function cyclePalette(){colors=(colors+1)%3;hero.classList.toggle('palette-cyan',colors===1);hero.classList.toggle('palette-violet',colors===2);modeBtn.setAttribute('aria-label',`Change sculpture color mode. Current mode ${['amber','cyan','violet'][colors]}`);if(paused)paint(elapsed);}
  stage.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;drag=true;dragMoved=false;lastPointer={x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{
    if(drag&&lastPointer){const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;if(Math.abs(dx)+Math.abs(dy)>2)dragMoved=true;targetY=Math.max(-70,Math.min(70,targetY+dx*.6));targetX=Math.max(-60,Math.min(60,targetX-dy*.6));lastPointer={x:e.clientX,y:e.clientY};}
    else if(e.pointerType==='mouse'){const r=stage.getBoundingClientRect();targetY=(e.clientX-r.left-r.width/2)/r.width*38;targetX=-12-(e.clientY-r.top-r.height/2)/r.height*24;}
  });
  stage.addEventListener('pointerup',()=>{if(drag&&!dragMoved)remix();drag=false;lastPointer=null;});
  stage.addEventListener('pointercancel',()=>{drag=false;lastPointer=null;});
  stage.addEventListener('pointerleave',()=>{if(!drag){targetX=-12;targetY=12;}});
  stage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();remix();}});
  remixBtn.addEventListener('click',remix);pauseBtn.addEventListener('click',togglePause);modeBtn.addEventListener('click',cyclePalette);
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(stage);
  window.addEventListener('resize',resize,{passive:true});
  resize();renderCode();
  if(reduced){
    // A stable interactive composition is retained for visitors requesting less motion.
    paused=true;hero.classList.add('is-paused');chars=snippets[0].code.length;renderCode();paint(0);
    pauseBtn.setAttribute('aria-pressed','true');pauseBtn.innerHTML='▶ <span>PLAY</span>';
  } else {raf=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)last=0;});
})();
