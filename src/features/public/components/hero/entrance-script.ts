// The landing's entrance, as inline scripts so it starts before hydration.
// PRE runs before first paint (from the header): it sets html.pre, which holds
// every foreground element at its first frame, and removes it after 4s
// whatever happens. No JS, no WAAPI or reduced motion: PRE never sets it and
// the hero renders finished. TIMELINE runs at the end of the hero: WAAPI only,
// four behaviours (rise, lift, settle, accent), then it removes html.pre and
// cancels itself. Phones run it at .86 of the timings. The numbers count up
// from 0 while they rise, drawn over the server's text (data-count, ::after),
// so the real value and its width never change under the count.

export const PRE_SCRIPT = `(function(){try{var h=document.documentElement;if(location.pathname!=="/"||!("animate" in h)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;h.classList.add("pre");setTimeout(function(){h.classList.remove("pre")},4000)}catch(e){}})();`;

export const TIMELINE_SCRIPT = `(function(){
var d=document,h=d.documentElement;if(!h.classList.contains("pre"))return;
var k=innerWidth<768?.86:1,E="cubic-bezier(.16,1,.3,1)",S="cubic-bezier(.22,.7,.25,1)",G="cubic-bezier(.2,.75,.28,1)",L=[],C=[];
function q(n){return d.querySelector('[data-hx="'+n+'"]')}
function go(el,kf,delay,dur,ease){if(el)L.push(el.animate(kf,{delay:delay*k,duration:dur*k,easing:ease,fill:"both"}))}
function rise(el,delay,dur){go(el,[{clipPath:"inset(100% 0 -14% 0)",translate:"0 .16em"},{clipPath:"inset(-18% 0 -14% 0)",translate:"0 0"}],delay,dur,E)}
function lift(el,delay,dist,dur){go(el,[{opacity:0,translate:"0 "+dist},{opacity:1,translate:"0 0"}],delay,dur,S)}
function settle(el,delay,dur,from,dist){go(el,[{opacity:0,scale:from,translate:"0 "+dist},{opacity:1,scale:1,translate:"0 0"}],delay,dur,G)}
function count(el,delay,dur){if(!el)return;var end=Number(el.getAttribute("data-value"));if(!(end>0))return;
var f=new Intl.NumberFormat(el.getAttribute("data-locale")||void 0),t0=performance.now()+delay*k,T=dur*k;
function tick(now){var p=Math.min(1,Math.max(0,(now-t0)/T));el.setAttribute("data-count",f.format(Math.round(end*(1-Math.pow(1-p,4)))));if(p<1)requestAnimationFrame(tick)}
el.setAttribute("data-count",f.format(0));requestAnimationFrame(tick);C.push(function(){el.removeAttribute("data-count")})}
lift(q("brand"),60,".55em",600);settle(q("nav"),150,700,.99,".5em");settle(q("cta"),200,700,.985,".5em");settle(q("burger"),150,700,.9,".4em");
lift(q("eyebrow"),300,".8em",520);rise(q("line1"),380,980);rise(q("line2"),470,980);
settle(q("play"),720,640,.88,".3em");lift(q("tag"),770,".7em",560);settle(q("panel"),800,880,.982,"1.4em");
go(q("badge"),[{scale:.86},{scale:1}],1020,700,E);go(q("dot"),[{scale:0},{scale:1}],1080,520,E);go(q("track"),[{scale:"0 1"},{scale:"1 1"}],1120,820,E);
rise(q("num1"),920,860);count(q("num1"),920,860);rise(q("num2"),990,860);count(q("num2"),990,860);
lift(q("lbl1"),1030,".6em",520);lift(q("lbl2"),1075,".6em",520);go(q("slash"),[{scale:"1 0"},{scale:"1 1"}],1010,700,E);
settle(q("meet"),1140,820,.985,"1.2em");
function done(){h.classList.remove("pre");for(var i=0;i<L.length;i++)L[i].cancel();L.length=0;for(var j=0;j<C.length;j++)C[j]()}
Promise.all(L.map(function(a){return a.finished})).then(done,done);
})();`;
