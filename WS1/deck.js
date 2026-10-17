const staticView = new URLSearchParams(location.search).has('static');
const reduced = staticView || matchMedia('(prefers-reduced-motion: reduce)').matches;
Reveal.initialize({width:1600,height:900,margin:0.035,minScale:0.15,maxScale:2,hash:true,center:false,controls:true,controlsTutorial:false,progress:true,slideNumber:'c/t',fragments:!staticView,transition:reduced?'none':'fade',transitionSpeed:'fast',backgroundTransition:reduced?'none':'fade',autoAnimate:!reduced,autoAnimateDuration:.7,autoAnimateEasing:'ease-in-out',pdfSeparateFragments:false,pdfMaxPagesPerSlide:1,view:'slide',plugins:[RevealNotes,RevealHighlight],highlight:{highlightOnLoad:true}});
document.querySelector('#jump-lab').addEventListener('click',()=>{location.hash='/kit';});
document.querySelector('#show-overview').addEventListener('click',()=>Reveal.toggleOverview());
document.querySelector('#speaker').addEventListener('click',()=>Reveal.getPlugin('notes').open());
Reveal.on('slidechanged',e=>{document.title=`SensWear · ${e.currentSlide.dataset.title || 'Workshop'}`;});
