/* Original teaching diagrams. All waveforms and numerical scenarios are synthetic. */
'use strict';
const $ = s => document.querySelector(s);
const SVG_NS = 'http://www.w3.org/2000/svg';
const C = {cyan:'#62e5d0',coral:'#ff947e',muted:'#a8b8c7',line:'#294050',ink:'#f2f4f2'};
const svgElement = (name, attrs={}, content='') => {
  const el=document.createElementNS(SVG_NS,name);
  for(const [key,value] of Object.entries(attrs)) el.setAttribute(key,value);
  if(content!==undefined) el.textContent=content;
  return el;
};
function add(parent,name,attrs,content){const el=svgElement(name,attrs,content);parent.append(el);return el;}
function label(svg,x,y,content,attrs={}){return add(svg,'text',{x,y,fill:C.muted,'font-size':22,...attrs},content);}

// Causal pulse with a visible foot. No human subject data are used.
function pulse(t){
  if(t<=0)return 0;
  const primary=(1-Math.exp(-t/10))*Math.exp(-t/45)*1.8;
  const reflection=t>62 ? .10*Math.exp(-Math.pow((t-80)/11,2)) : 0;
  return primary+reflection;
}
function wavePath(foot,base){
  let d='';
  for(let t=0;t<=300;t+=.5){const x=150+t*2.65,y=base-85*pulse(t-foot);d+=(t?' L':'M')+x.toFixed(2)+','+y.toFixed(2);}
  return d;
}
function drawWaveChart(svg, offset=0, showGhost=false){
  svg.replaceChildren();
  const wristFoot=50,fingerFoot=90+offset,wx=150+wristFoot*2.65,fx=150+fingerFoot*2.65;
  for(let t=0;t<=300;t+=50){
    const x=150+t*2.65;
    add(svg,'line',{x1:x,x2:x,y1:34,y2:330,class:'gridline'});
    label(svg,x,377,t+'',{'text-anchor':'middle',class:'axistext'});
  }
  label(svg,550,413,'Time on the shared timeline (ms)',{'text-anchor':'middle','font-size':18});
  label(svg,20,94,'Wrist',{fill:C.cyan,class:'trace-label'});
  label(svg,20,251,'Finger',{fill:C.coral,class:'trace-label'});
  for(const y of [145,302])add(svg,'line',{x1:150,x2:945,y1:y,y2:y,stroke:C.line,'stroke-width':1.2});
  if(showGhost)add(svg,'path',{d:wavePath(90,302),fill:'none',stroke:'#69818e','stroke-width':3,'stroke-dasharray':'5 6',opacity:.7});
  add(svg,'path',{d:wavePath(wristFoot,145),fill:'none',stroke:C.cyan,'stroke-width':4,'stroke-linecap':'round'});
  add(svg,'path',{d:wavePath(fingerFoot,302),fill:'none',stroke:C.coral,'stroke-width':4,'stroke-linecap':'round'});
  add(svg,'line',{x1:wx,x2:wx,y1:55,y2:345,stroke:C.cyan,'stroke-width':1.4,'stroke-dasharray':'4 6'});
  add(svg,'line',{x1:fx,x2:fx,y1:214,y2:345,stroke:C.coral,'stroke-width':1.4,'stroke-dasharray':'4 6'});
  add(svg,'circle',{cx:wx,cy:145,r:5,fill:C.cyan});add(svg,'circle',{cx:fx,cy:302,r:5,fill:C.coral});
  add(svg,'line',{x1:wx,x2:fx,y1:344,y2:344,stroke:C.ink,'stroke-width':2});
  [wx,fx].forEach(x=>add(svg,'line',{x1:x,x2:x,y1:339,y2:349,stroke:C.ink,'stroke-width':2}));
  label(svg,(wx+fx)/2,329,(40+offset)+' ms',{'text-anchor':'middle',fill:C.ink,'font-size':22,'font-weight':700});
  label(svg,940,35,showGhost?'Dashed outline = true finger signal':'Same beat · corresponding upstrokes',{'text-anchor':'end',class:'chartnote'});
}
drawWaveChart($('#pulse-chart'));
function updateClock(){
  const offset=Number($('#clock-offset').value),delay=40+offset,speed=.2/(delay/1000),pct=(speed/5-1)*100;
  $('#offset-label').value=(offset>0?'+':'')+offset+' ms';
  $('#observed-delay').innerHTML=delay+'<span>ms</span>';
  $('#observed-speed').innerHTML=speed.toFixed(1)+'<span>m/s</span>';
  $('#speed-error').textContent=offset===0?'Clock bias removed':Math.abs(pct).toFixed(0)+'% '+(pct<0?'below':'above')+' the true value';
  $('#speed-error').style.color=offset===0?C.cyan:C.coral;
  $('#sync-button').textContent=offset===0?'Clocks synchronized':'Synchronize clocks';
  $('#clock-chart').setAttribute('aria-label',`Synthetic pulse waveforms. Clock offset ${offset} milliseconds. Apparent delay ${delay} milliseconds. Estimated pulse wave velocity ${speed.toFixed(1)} metres per second.`);
  drawWaveChart($('#clock-chart'),offset,true);
}
$('#clock-offset').addEventListener('input',updateClock);
$('#sync-button').addEventListener('click',()=>{$('#clock-offset').value=0;updateClock();});
$('#offset-reset').addEventListener('click',()=>{$('#clock-offset').value=10;updateClock();});
updateClock();

// Tube-model visualization. v ∝ sqrt(effective stiffness), fixed geometry and pressure.
const stiffnessSvg=$('#stiffness-chart');
let stiffness=2.25,paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let phase=0,lastFrame=null,playing=false;
label(stiffnessSvg,170,31,'Reference',{fill:C.cyan,'font-size':23,'font-weight':650});
label(stiffnessSvg,900,31,'5.0 m/s · 40.0 ms',{'text-anchor':'end','font-size':21});
label(stiffnessSvg,170,196,'Adjusted stiffness',{fill:C.coral,'font-size':23,'font-weight':650});
const adjustedLabel=label(stiffnessSvg,900,196,'7.5 m/s · 26.7 ms',{'text-anchor':'end','font-size':21});
const tubes=[];
for(const [y,color] of [[101,C.cyan],[265,C.coral]]){
  add(stiffnessSvg,'line',{x1:170,x2:900,y1:y,y2:y,stroke:'#244150','stroke-width':1,'stroke-dasharray':'4 6'});
  const fill=add(stiffnessSvg,'path',{fill:color,'fill-opacity':.08,stroke:'none'});
  const upper=add(stiffnessSvg,'path',{fill:'none',stroke:color,'stroke-width':2.3});
  const lower=add(stiffnessSvg,'path',{fill:'none',stroke:color,'stroke-width':2.3});
  const dot=add(stiffnessSvg,'circle',{cx:170,cy:y,r:10,fill:color});
  const end=add(stiffnessSvg,'circle',{cx:900,cy:y,r:8,fill:'#08121d',stroke:color,'stroke-width':2});
  tubes.push({y,color,fill,upper,lower,dot,end});
}
label(stiffnessSvg,170,357,'Assumed path: 0.20 m',{'font-size':19});
label(stiffnessSvg,900,357,'Motion slowed 50× · schematic, not anatomy',{'font-size':18,'text-anchor':'end'});
function renderTube(tube,speed,amplitude,time){
  const duration=(.2/speed)*1000*50,progress=Math.min(time/duration,1),px=170+730*progress;
  const active=time<=duration;
  let upper='',lower='';const lowerPoints=[];
  for(let x=170;x<=900;x+=5){
    const expansion=active?amplitude*Math.exp(-Math.pow((x-px)/38,2)):0;
    const top=tube.y-25-expansion,bottom=tube.y+25+expansion;
    upper+=(x===170?'M':'L')+x+','+top.toFixed(2);lower+=(x===170?'M':'L')+x+','+bottom.toFixed(2);lowerPoints.push([x,bottom]);
  }
  tube.upper.setAttribute('d',upper);tube.lower.setAttribute('d',lower);
  tube.fill.setAttribute('d',upper+lowerPoints.reverse().map(p=>'L'+p[0]+','+p[1]).join('')+'Z');
  tube.dot.setAttribute('cx',px);tube.dot.setAttribute('opacity',active?'1':'0');
  tube.end.setAttribute('fill',active?'#08121d':tube.color);
}
function drawStiffness(time=phase){renderTube(tubes[0],5,16,time);renderTube(tubes[1],5*Math.sqrt(stiffness),16/stiffness,time);}
function updateStiffness(){
  stiffness=Number($('#stiffness-input').value);const speed=5*Math.sqrt(stiffness),transit=200/speed;
  $('#stiffness-label').value=stiffness.toFixed(2)+'×';
  $('#stiffness-speed').innerHTML=speed.toFixed(1)+'<span>m/s</span>';
  $('#stiffness-time').textContent=transit.toFixed(1)+' ms transit';
  adjustedLabel.textContent=speed.toFixed(1)+' m/s · '+transit.toFixed(1)+' ms';
  stiffnessSvg.setAttribute('aria-label',`Idealized tube model. Relative wall stiffness ${stiffness.toFixed(2)}. Wave speed ${speed.toFixed(1)} metres per second, transit ${transit.toFixed(1)} milliseconds. Pressure and geometry held fixed.`);
  drawStiffness();
}
$('#stiffness-input').addEventListener('input',updateStiffness);
$('#replay-wave').addEventListener('click',()=>{phase=0;lastFrame=null;paused=false;updatePause();});
function updatePause(){ $('#pause-wave').textContent=paused?'Resume motion':'Pause motion';$('#pause-wave').setAttribute('aria-pressed',String(paused));if(paused&&phase===0){phase=850;drawStiffness();}}
$('#pause-wave').addEventListener('click',()=>{paused=!paused;lastFrame=null;updatePause();});
function animate(now){
  if(playing&&!paused){if(lastFrame!==null)phase=(phase+Math.min(now-lastFrame,100))%3000;drawStiffness();}
  lastFrame=now;requestAnimationFrame(animate);
}
updateStiffness();updatePause();requestAnimationFrame(animate);

// Acquisitions align; reception times differ. Values are schematic, not measurements.
const timingSvg=$('#timing-chart');
label(timingSvg,24,40,'Acquisition time',{fill:C.ink,'font-size':24,'font-weight':650});
label(timingSvg,925,40,'Phone arrival',{'text-anchor':'end',fill:C.muted,'font-size':24});
for(const [y,name,color,points,arrivals] of [[130,'Wrist',C.cyan,[210,325,440],[665,695,880]],[260,'Finger',C.coral,[210,325,440],[735,815,848]]]){
  label(timingSvg,24,y+7,name,{fill:color,'font-size':24,'font-weight':650});
  add(timingSvg,'line',{x1:175,x2:485,y1:y,y2:y,stroke:C.line,'stroke-width':2});
  add(timingSvg,'line',{x1:625,x2:925,y1:y,y2:y,stroke:C.line,'stroke-width':2});
  points.forEach((x,i)=>{
    add(timingSvg,'circle',{cx:x,cy:y,r:7,fill:color});
    add(timingSvg,'path',{d:`M ${x} ${y} Q ${(x+arrivals[i])/2} ${y-75-i*15} ${arrivals[i]} ${y}`,fill:'none',stroke:color,'stroke-opacity':.25,'stroke-width':2});
    add(timingSvg,'rect',{x:arrivals[i]-6,y:y-6,width:12,height:12,rx:2,fill:color});
  });
}
[210,325,440].forEach(x=>add(timingSvg,'line',{x1:x,x2:x,y1:105,y2:282,stroke:C.muted,'stroke-dasharray':'4 6',opacity:.4}));
label(timingSvg,325,330,'Shared timeline',{'text-anchor':'middle',fill:C.cyan,'font-size':23});
label(timingSvg,775,330,'Variable packet delays',{'text-anchor':'middle','font-size':22});
label(timingSvg,475,380,'Schematic transport example; independent of physiological pulse delay',{'text-anchor':'middle','font-size':17});

const reveal=Reveal.initialize({width:1600,height:900,margin:0.025,minScale:0.15,maxScale:2,hash:true,center:false,controls:false,progress:true,transition:'fade',transitionSpeed:'fast',backgroundTransition:'fade',slideNumber:false,totalTime:600,history:true,loop:false,overview:true,keyboard:true,help:false,plugins:[RevealNotes],pdfSeparateFragments:false,pdfMaxPagesPerSlide:1});
function slideState(){
  const slide=Reveal.getCurrentSlide();
  const index=Reveal.getIndices().h;
  $('#slide-counter').textContent=String(index+1).padStart(2,'0')+' / 10';
  document.body.classList.toggle('on-light',slide?.classList.contains('light-slide'));
  $('#footer-brand').style.opacity=index===0?'0':'1';
  playing=slide?.id==='stiffness';lastFrame=null;
  if(playing){phase=paused?850:0;drawStiffness();}
}
reveal.then(slideState);Reveal.on('slidechanged',slideState);
// Keep range-keyboard interaction independent of slide navigation.
document.querySelectorAll('input,button').forEach(el=>el.addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Home','End','PageUp','PageDown'].includes(e.key))e.stopPropagation();
}));
$('#help-toggle').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();
document.addEventListener('keydown',e=>{if($('#help-dialog').open)e.stopPropagation();},true);
if(new URLSearchParams(location.search).has('print-pdf')){phase=850;paused=true;drawStiffness();}
window.deckTest={updateClock,updateStiffness,drawStiffness,getState:()=>({stiffness,phase,paused,playing}),freezeAnimation:(time=850)=>{paused=true;phase=time;drawStiffness();}};
