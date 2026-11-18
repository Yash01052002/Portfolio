(()=>{'use strict';
  const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
  const meter=$('#page-progress-fill');
  const ids=['work','engineering-stories','about','journey','skills','contact','feedback'];
  const sections=ids.map(id=>document.getElementById(id)).filter(Boolean);
  const navLinks=$$('[data-section-link],#site-nav a[href^="#"]');
  let pending=false;
  function updateScroll(){pending=false;
    if(meter){const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);meter.style.transform='scaleX('+Math.max(0,Math.min(1,scrollY/max)).toFixed(4)+')';}
    if(!sections.length)return;
    const marker=innerHeight*.35;let active=null;
    for(const sec of sections){if(sec.getBoundingClientRect().top<=marker)active=sec.id;}
    navLinks.forEach(a=>{const on=a.getAttribute('href')==='#'+active || a.dataset.sectionLink===active;if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  }
  function request(){if(!pending){pending=true;requestAnimationFrame(updateScroll);}}
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});addEventListener('load',request);request();
  // Keyboard traversal for the enhanced, already-functional architecture inspector.
  const nodes=$$('.architecture-map [data-build-step]');
  nodes.forEach((n,i)=>n.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft'&&e.key!=='Home'&&e.key!=='End')return;e.preventDefault();let next=e.key==='Home'?0:e.key==='End'?nodes.length-1:(i+(e.key==='ArrowRight'?1:-1)+nodes.length)%nodes.length;nodes[next].focus();nodes[next].click();}));
  // Clipboard: fallback never asserts success if browser blocks copying.
  const copy=$('#copy-email'),status=$('#copy-email-status'),email='yashgaidhane2@gmail.com';
  if(copy&&status){copy.addEventListener('click',async()=>{
    let ok=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(email);ok=true;}}catch(_){}
    if(!ok){const temp=document.createElement('textarea');temp.value=email;temp.style.cssText='position:fixed;left:-9999px;opacity:0';document.body.append(temp);temp.select();try{ok=document.execCommand('copy');}catch(_){}temp.remove();}
    status.textContent=ok?'Email copied: '+email:'Copy unavailable here. Select this email address: '+email;
  });}
  // Count only verified local screenshot files that successfully load; concept SVGs don't count.
  const gallery=$('#screenshots');
  if(gallery){const images=$$('img[data-real-src]',gallery),counter=$('[data-media-count]',gallery);
    let ready=0,checked=0;const show=()=>{if(counter)counter.textContent=ready+' actual screenshot'+(ready===1?'':'s')+' / '+images.length+' slots · '+(ready<images.length?'remaining previews are labeled concepts':'all verified images loaded');};
    images.forEach(img=>{const probe=new Image();probe.onload=()=>{ready++;checked++;show();};probe.onerror=()=>{checked++;show();};probe.src=img.dataset.realSrc;});
    if(!images.length&&counter)counter.textContent='No screenshot slots';
  }
  // Video is only revealed when an actual local MP4 successfully loads metadata.
  $$('[data-project-video]').forEach(panel=>{const video=$('video',panel),empty=$('.video-empty',panel),status=$('.video-status',panel);if(!video)return;
    const loaded=()=>{video.hidden=false;if(empty)empty.hidden=true;if(status)status.textContent='Verified local recording available. Play when ready.';};
    const missing=()=>{video.hidden=true;if(empty)empty.hidden=false;if(status)status.textContent='No verified recording added yet.';};
    video.addEventListener('loadedmetadata',loaded,{once:true});video.addEventListener('error',missing);const source=$('source',video);if(source)source.addEventListener('error',missing);
    // preload metadata is not autoplay; a missing file retains the honest empty state.
    video.load();
  });
})();