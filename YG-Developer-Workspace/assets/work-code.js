/* YG v3.5 / Work section: ambient code is typed and animated only while selected work is visible.
   No evaluation or external requests. Pauses offscreen, with page visibility, FX off and reduced motion. */
(()=>{'use strict';
  const section=document.getElementById('work');
  const canvas=document.getElementById('work-code-canvas');
  const layer=section?.querySelector('.work-code-layer');
  if(!section||!canvas||!layer)return;
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene=document.getElementById('ambient-scene');
  let width=0,height=0,dpr=1,raf=0,last=0,frameTime=0,active=false,visible=!document.hidden;
  const lines=[
    ['async ','def ','diagnose','(crash):'],
    ['  symbols = ','elf.resolve','(crash.pc)'],
    ['  context = ','rag.retrieve','(symbols)'],
    ['  result = ','await ','analyze','(context)'],
    ['  return ','result.summary'],
    ['POST ','/api/crashes ','→ ','202 Accepted'],
    ['worker','[celery]','  task.completed'],
    ['SELECT ','device_id, pc ','FROM ','crashes;'],
    ['docker compose ','up ','--build'],
    ['const ','status = ','"diagnosed"',';'],
    ['print','(','"systems online"',')'],
    ['git ','commit ','-m ','"ship"']
  ];
  const flat=lines.map(parts=>parts.join(''));
  const colors=['#88d5e5','#e8a46d','#e4d5c2','#ad9de7'];
  const streams=Array.from({length:27},(_,i)=>({
    x:(i*.61803398875)%1,offset:(i*.381966011)%1,speed:7+(i*13)%23,
    size:10+(i%3),opacity:.15+(i%5)*.025,line:i%flat.length,
    tint:i%3===0?'#efa95d':i%3===1?'#8ed8e8':'#b6a3ed'
  }));
  function size(){
    const r=layer.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);
    dpr=Math.min(window.devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function shouldAnimate(){return active&&visible&&!reduced.matches&&!scene?.classList.contains('is-paused');}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
  function update(){
    const on=active&&visible&&!scene?.classList.contains('is-paused');
    layer.classList.toggle('is-active',on);
    if(!on){stop();ctx.clearRect(0,0,width,height);return;}
    if(reduced.matches){stop();render(0,true);return;}
    if(!raf)raf=requestAnimationFrame(tick);
  }
  function drawText(text,x,y,color,alpha,font){
    ctx.globalAlpha=alpha;ctx.font=font||'500 12px "Space Grotesk", ui-monospace, monospace';
    ctx.fillStyle=color;ctx.fillText(text,x,y);
  }
  function render(t,staticFrame=false){
    ctx.clearRect(0,0,width,height);
    const mobile=width<740;
    const seconds=t*.001;
    ctx.save();ctx.textBaseline='top';
    // Ambient snippets rise in the margins and through gaps between the project cards.
    streams.forEach((s,i)=>{
      const x=width*(.03+s.x*.91);
      const cycle=height+220;
      const y=height+65-((seconds*s.speed+s.offset*cycle)%cycle);
      const nearCenter=Math.abs(s.x-.5)<.22;
      const opacity=s.opacity*(nearCenter?.46:1)*(mobile?.45:1);
      const snippet=flat[s.line];
      const shown=snippet.slice(0,8+Math.floor((seconds*6+i*11)%Math.max(9,snippet.length)));
      drawText(shown,x,y,s.tint,opacity,`500 ${s.size}px "Space Grotesk", monospace`);
      if(i%3===0){ctx.strokeStyle=s.tint;ctx.globalAlpha=opacity*.30;ctx.beginPath();ctx.moveTo(x,y+16);ctx.lineTo(x,y+42);ctx.stroke();}
    });
    // A distinct typing sequence in the upper-right background, behind the section heading.
    // It never becomes an editor window or obscures interactive project content.
    if(!mobile){
      const x=Math.min(width*.59,width-380), y=18;
      ctx.globalAlpha=1;
      const glow=ctx.createRadialGradient(x+140,y+42,0,x+140,y+42,230);
      glow.addColorStop(0,'rgba(82,160,182,.085)');glow.addColorStop(1,'rgba(82,160,182,0)');
      ctx.fillStyle=glow;ctx.fillRect(x-35,0,430,150);
      drawText('// background process: blackbox',x,y-8,'#b5c7d1',.60,'600 11px "Space Grotesk",monospace');
      const sequence=[lines[0],lines[1],lines[2],lines[3]];
      const all=sequence.map(parts=>parts.join(''));
      const total=all.reduce((sum,s)=>sum+s.length,0);
      const progress=staticFrame?total:Math.floor((seconds*18)%(total+48));
      let remaining=progress;
      sequence.forEach((parts,index)=>{
        const length=all[index].length,shown=Math.max(0,Math.min(length,remaining));remaining-=length;
        if(shown<=0)return;
        let px=x;
        parts.forEach((part,partIndex)=>{
          if(shown<=0)return;
          const earlier=parts.slice(0,partIndex).join('').length;
          const chunk=part.slice(0,Math.max(0,shown-earlier));
          if(!chunk)return;
          const font='500 12px "Space Grotesk",monospace';
          drawText(chunk,px,y+21+index*21,colors[partIndex%colors.length],.75,font);
          ctx.font=font;px+=ctx.measureText(chunk).width;
        });
      });
      if(progress<total&&!staticFrame){
        const index=all.findIndex((_,i)=>all.slice(0,i+1).reduce((sum,s)=>sum+s.length,0)>=progress);
        if(index>=0){const before=all.slice(0,index).reduce((sum,s)=>sum+s.length,0);
          ctx.font='500 12px "Space Grotesk",monospace';
          const cursorX=x+ctx.measureText(all[index].slice(0,progress-before)).width;
          ctx.globalAlpha=(Math.sin(seconds*9)+1)*.35+.25;ctx.fillStyle='#ffbc72';ctx.fillRect(cursorX,y+21+index*21,6,14);
        }
      }
    } else {
      // Mobile: two short lines in the top padding, never over the project cards.
      const seq='await build(projects)';
      const length=staticFrame?seq.length:Math.floor((seconds*13)%(seq.length+18));
      drawText('// SELECTED WORK / LIVE CODE',18,27,'#8ccfe1',.48,'600 10px "Space Grotesk",monospace');
      drawText(seq.slice(0,length),18,49,'#e7a765',.62,'500 12px "Space Grotesk",monospace');
      if(!staticFrame&&length<seq.length){ctx.globalAlpha=.45;ctx.fillStyle='#ffb46a';ctx.fillRect(20+length*7.0,49,5,13);}
    }
    // Faint signal traces between code streams.
    for(let i=0;i<6;i++){
      const yy=340+i*235+(staticFrame?0:Math.sin(seconds*.4+i)*14);
      const xx=width*(.1+(i*.143)% .7);
      ctx.strokeStyle=i%2?'rgba(125,202,218,.055)':'rgba(244,162,78,.06)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+width*.16,yy);ctx.lineTo(xx+width*.19,yy+28);ctx.stroke();
    }
    ctx.restore();ctx.globalAlpha=1;
  }
  function tick(t){raf=0;if(!shouldAnimate())return;
    if(t-last>=33){last=t;frameTime+=33;render(frameTime,false);}raf=requestAnimationFrame(tick);
  }
  const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;update();},{threshold:0.025});
  size();observer.observe(section);
  const ro=new ResizeObserver(()=>{size();if(active)update();});ro.observe(layer);
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;update();});
  reduced.addEventListener?.('change',update);
  if(scene){new MutationObserver(update).observe(scene,{attributes:true,attributeFilter:['class']});}
  window.addEventListener('pagehide',stop);
})();
