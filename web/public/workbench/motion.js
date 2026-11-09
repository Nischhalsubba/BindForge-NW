const gsap=window.gsap,Flip=window.Flip;
if(gsap&&Flip)gsap.registerPlugin(Flip);
let reduce=false,systemReduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const targets='.view,.chain-row,.toast,.btn svg';
function reset(){if(!gsap)return;gsap.killTweensOf(targets);gsap.set(targets,{clearProps:'transform,opacity,visibility'});}
if(gsap){gsap.matchMedia().add({reduce:'(prefers-reduced-motion: reduce)',normal:'(prefers-reduced-motion: no-preference)'},context=>{systemReduce=context.conditions.reduce;if(systemReduce)reset();return ()=>reset()});}
const enabled=()=>!!gsap&&!reduce&&!systemReduce;
export function configureMotion(value){reduce=!!value;if(reduce)reset();}
export function revealView(element){if(!enabled())return;gsap.fromTo(element,{y:10,opacity:.6},{y:0,opacity:1,duration:.32,ease:'power3.out',clearProps:'transform,opacity',overwrite:true});}
export function revealToast(element){if(!enabled())return;gsap.fromTo(element,{y:8,opacity:.65},{y:0,opacity:1,duration:.22,ease:'power2.out',clearProps:'transform,opacity',overwrite:true});}
export function copiedFeedback(button){if(!enabled()||!button)return;const mark=button.querySelector('svg');if(mark)gsap.fromTo(mark,{scale:.75,opacity:.7},{scale:1,opacity:1,duration:.2,ease:'power2.out',clearProps:'transform,opacity'});}
export function captureChain(){return enabled()&&Flip?Flip.getState('.chain-row'):null;}
export function animateChain(previous){if(!enabled())return;if(previous&&Flip)Flip.from(previous,{duration:.28,ease:'power2.out',absolute:false,prune:true,onEnter:elements=>gsap.fromTo(elements,{y:8,opacity:.6},{y:0,opacity:1,duration:.25,clearProps:'transform,opacity'})});}
