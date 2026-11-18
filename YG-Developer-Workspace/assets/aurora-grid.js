/* Cinematic Aurora + Interactive Cyber Grid (v3.3). No dependencies, no remote calls. */
(()=>{'use strict';
  const scene=document.getElementById('ambient-scene');
  const canvas=document.getElementById('cyber-grid-canvas');
  const toggle=document.getElementById('ambient-toggle');
  if(!scene||!canvas)return;
  const context=canvas.getContext('2d',{alpha:true});
  if(!context)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=window.matchMedia('(pointer: coarse)');
  let width=0,height=0,dpr=1,raf=0,last=0,paused=false,visible=!document.hidden;
  let mx=-1000,my=-1000,tx=-1000,ty=-1000,scrollY=0;
  let drift=0;
  const spacing=64;
  function resize(){
    width=window.innerWidth;height=window.innerHeight;
    dpr=Math.min(window.devicePixelRatio||1,1.5);
    canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
    context.setTransform(dpr,0,0,dpr,0,0);
  }
  function draw(t){
    raf=0;
    if(paused||reduced.matches||!visible)return;
    if(t-last<32){raf=requestAnimationFrame(draw);return;}
    last=t;
    context.clearRect(0,0,width,height);
    const desktop=!coarse.matches&&width>680;
    const targetX=desktop?tx:-1000,targetY=desktop?ty:-1000;
    mx+=(targetX-mx)*.11;my+=(targetY-my)*.11;
    drift=t*.00012;
    const shift=(scrollY*.045)%spacing;
    const radius=desktop?255:0;
    // Softly illuminated grid lines, concentrated around the cursor.
    for(let x=0;x<=width+spacing;x+=spacing){
      const dx=Math.abs(x-mx);
      const strength=desktop?Math.max(0,1-dx/radius):0;
      if(strength<.035)continue;
      const g=context.createLinearGradient(x,my-radius,x,my+radius);
      g.addColorStop(0,'rgba(106,178,193,0)');
      g.addColorStop(.5,`rgba(112,198,209,${(.16*strength).toFixed(3)})`);
      g.addColorStop(1,'rgba(106,178,193,0)');
      context.strokeStyle=g;context.lineWidth=1;
      context.beginPath();context.moveTo(x,Math.max(0,my-radius));context.lineTo(x,Math.min(height,my+radius));context.stroke();
    }
    for(let y=-spacing+shift;y<=height+spacing;y+=spacing){
      const dy=Math.abs(y-my);
      const strength=desktop?Math.max(0,1-dy/radius):0;
      if(strength<.035)continue;
      const g=context.createLinearGradient(mx-radius,y,mx+radius,y);
      g.addColorStop(0,'rgba(244,163,75,0)');
      g.addColorStop(.5,`rgba(244,163,75,${(.13*strength).toFixed(3)})`);
      g.addColorStop(1,'rgba(244,163,75,0)');
      context.strokeStyle=g;context.lineWidth=1;
      context.beginPath();context.moveTo(Math.max(0,mx-radius),y);context.lineTo(Math.min(width,mx+radius),y);context.stroke();
    }
    // Tiny traveling intersections: a subtle signal, not a particle storm.
    const cols=Math.ceil(width/spacing),rows=Math.ceil(height/spacing);
    for(let c=0;c<=cols;c++)for(let r=0;r<=rows;r++){
      const x=c*spacing,y=r*spacing+shift;
      const near=desktop?Math.max(0,1-Math.hypot(x-mx,y-my)/radius):0;
      const signal=(Math.sin(c*1.9+r*2.7+drift*8)+1)*.5;
      if(signal<.85&&near<.13)continue;
      const a=Math.min(.24,signal*.08+near*.21);
      context.fillStyle=`rgba(${near>.35?'247,176,91':'100,184,201'},${a.toFixed(3)})`;
      context.beginPath();context.arc(x,y,near>.45?1.8:1,0,Math.PI*2);context.fill();
    }
    if(desktop&&mx>-200&&mx<width+200){
      const g=context.createRadialGradient(mx,my,0,mx,my,190);
      g.addColorStop(0,'rgba(106,174,195,.047)');g.addColorStop(1,'rgba(106,174,195,0)');
      context.fillStyle=g;context.fillRect(mx-190,my-190,380,380);
    }
    raf=requestAnimationFrame(draw);
  }
  function schedule(){if(!raf&&!paused&&!reduced.matches&&visible)raf=requestAnimationFrame(draw);}
  function updateMotion(){
    if(reduced.matches){context.clearRect(0,0,width,height);scene.classList.add('is-reduced');toggle?.setAttribute('aria-pressed','false');}
    else{scene.classList.remove('is-reduced');toggle?.setAttribute('aria-pressed',String(!paused));schedule();}
  }
  resize();updateMotion();
  window.addEventListener('resize',()=>{resize();schedule();},{passive:true});
  window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen'){tx=e.clientX;ty=e.clientY;}},{passive:true});
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget){tx=-1000;ty=-1000;}},{passive:true});
  window.addEventListener('scroll',()=>{scrollY=window.scrollY;scene.style.setProperty('--ambient-parallax',(-Math.min(scrollY,1500)*.055).toFixed(1)+'px');},{passive:true});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(!visible){cancelAnimationFrame(raf);raf=0;}else schedule();});
  reduced.addEventListener?.('change',updateMotion);
  toggle?.addEventListener('click',()=>{
    if(reduced.matches)return;
    paused=!paused;scene.classList.toggle('is-paused',paused);
    toggle.setAttribute('aria-pressed',String(!paused));
    toggle.setAttribute('aria-label',paused?'Resume animated background':'Pause animated background');
    const label=toggle.querySelector('span');if(label)label.textContent=paused?'FX OFF':'FX ON';
    if(paused){cancelAnimationFrame(raf);raf=0;context.clearRect(0,0,width,height);}
    else schedule();
  });
})();
