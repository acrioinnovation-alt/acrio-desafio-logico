// Modalidade Desafios Visuais — 50 fases originais, com imagem vetorial, resposta conferida e 4 alternativas.
(() => {
 const $=id=>document.getElementById(id), TOTAL=50, KEY="desafios_visuais_";
 let phase=1,locked=false,score=0;
 const shapes=["●","▲","■","◆","★","⬟"];
 const colors=["#35c7dc","#ffca62","#ff7185","#8e9eff","#67d7a5"];
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
 const opts=(answer,others)=>shuffle([String(answer),...others.map(String).filter(x=>String(x)!==String(answer)).slice(0,3)]);
 function svgFrame(inner){return '<svg viewBox="0 0 320 220" role="img" aria-label="Desafio visual" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="310" height="210" rx="18" fill="#f4f7fb"/>'+inner+'</svg>'}
 function text(x,y,t,size=24,color="#182b45",weight=800){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" font-family="Arial,sans-serif" font-weight="'+weight+'" fill="'+color+'">'+esc(t)+'</text>'}
 function rect(x,y,w,h,fill,stroke="#a9b8ca"){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2"/>'}
 function sequence(i){
  const step=2+(i%7),start=3+(i%9),nums=[start,start+step,start+2*step,start+3*step],answer=start+4*step;
  const inner=[0,1,2,3].map((n)=>rect(15+n*77,75,65,65,"#e3edf8")).join("")+nums.map((n,j)=>text(47+j*77,117,n,28)).join("")+rect(246,75,65,65,"#fff0c8","#d7a64b")+text(278,117,"?",30,"#a36b16");
  return {title:"Qual número completa a sequência?",image:svgFrame(inner),answer,options:opts(answer,[answer+step,answer-1,answer+2]),explain:"A sequência aumenta de "+step+" em "+step+". O próximo número é "+answer+"."};
 }
 function countShapes(i){
  const target=i%2===0?"▲":"●",total=14+(i%8),count=4+(i%7),items=[];
  for(let n=0;n<total;n++){const is=count>0 && (n*7+i*3)%total<count;const symbol=is?target:(target==="▲"?"●":"■");if(is){}items.push({symbol,is})}
  // Use a deterministic distribution with exactly count target symbols.
  const arr=Array.from({length:total},(_,n)=>n).sort((a,b)=>((a*13+i*5)%total)-((b*13+i*5)%total));
  const chosen=new Set(arr.slice(0,count));
  let inner="";
  for(let n=0;n<total;n++){const x=24+(n%7)*39,y=30+Math.floor(n/7)*66;const sym=chosen.has(n)?target:(target==="▲"?(n%2?"■":"●"):(n%2?"▲":"■"));inner+=text(x,y+15,sym,27,colors[(n+i)%colors.length])}
  return {title:"Quantos "+(target==="▲"?"triângulos":"círculos")+" aparecem na imagem?",image:svgFrame(inner),answer:count,options:opts(count,[count+2,count-1,count+3]),explain:"Contando apenas "+(target==="▲"?"os triângulos":"os círculos")+", há "+count+" figuras."};
 }
 function matrix(i){
  const base=i%3, seq=[0,1,2,0,1,2,0,1],answer=(base+2)%3;
  const symbols=["●","▲","■"],cols=["#35a9ce","#ed9f42","#8a78d6"];
  let inner="";
  for(let n=0;n<9;n++){const x=20+(n%3)*95,y=20+Math.floor(n/3)*65;inner+=rect(x,y,80,52,n===8?"#fff0c8":"#e5edf6");inner+=text(x+40,y+35,n===8?"?":symbols[(seq[n]+base)%3],26,n===8?"#a36b16":cols[(seq[n]+base)%3])}
  const answerText=symbols[answer];
  return {title:"Qual figura deve ocupar o espaço vazio?",image:svgFrame(inner),answer:answerText,options:opts(answerText,symbols.filter(s=>s!==answerText).concat(["★"])),explain:"O padrão repete as três figuras na mesma ordem em cada linha. A figura que falta é "+answerText+"."};
 }
 function rotation(i){
  const deg=(i%4)*90,answer=(deg+270)%360,arrows=[0,90,180,270];
  const arrow=(x,y,a)=>'<g transform="translate('+x+' '+y+') rotate('+a+')"><path d="M0 27 L0 -25 M-14 -10 L0 -27 L14 -10" fill="none" stroke="#236caa" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>';
  let inner=rect(35,42,250,136,"#e8f1fb");
  [0,1,2].forEach(n=>inner+=arrow(85+n*75,110,(deg+n*90)%360));
  inner+=rect(235,42,50,50,"#fff0c8","#d7a64b")+text(260,77,"?",26,"#a36b16");
  const a=String(answer)+"°";
  return {title:"Em qual direção a seta deve apontar para continuar o padrão?",image:svgFrame(inner),answer:a,options:opts(a,arrows.filter(v=>v!==answer).map(v=>v+"°")),explain:"A seta gira 90° a cada etapa. A direção correta é "+a+"."};
 }
 function odd(i){
  const total=20+(i%5),oddAt=(i*7+3)%total,base=i%2?"◆":"●",different=i%2?"★":"■";
  let inner="";
  for(let n=0;n<total;n++){const x=25+(n%5)*67,y=30+Math.floor(n/5)*42;inner+=text(x,y,n===oddAt?different:base,25,n===oddAt?"#e05c68":"#287aa8")}
  const answer=String(oddAt+1);
  return {title:"Qual é a posição da figura diferente? Conte da esquerda para a direita e de cima para baixo.",image:svgFrame(inner),answer,options:opts(answer,[((oddAt+3)%total)+1,((oddAt+7)%total)+1,((oddAt+11)%total)+1]),explain:"A figura diferente está na posição "+answer+" (contagem por linhas, da esquerda para a direita)."};
 }
 const builders=[sequence,countShapes,matrix,rotation,odd];
 const catalog=Array.from({length:TOTAL},(_,i)=>builders[i%builders.length](i));
 function completed(){try{return JSON.parse(localStorage.getItem(KEY+"done")||"[]")}catch(e){return []}}
 function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 window.showVisualPhases=()=>{const list=$("visualPhaseList");list.innerHTML="";const done=completed();for(let n=1;n<=TOTAL;n++){const b=document.createElement("button");b.className="phase-btn"+(done.includes(n)?" done":"");b.textContent=String(n).padStart(2,"0");b.onclick=()=>startVisual(n);list.appendChild(b)}$("levelPill").textContent="DESAFIOS VISUAIS";show("visualPhases")};
 function startVisual(n){phase=n;locked=false;score=0;show("visualGame");render()}
 function render(){const p=catalog[phase-1];$("visualLevel").textContent="FASE "+phase+" DE 50";$("visualProgress").style.width=(completed().length/50*100)+"%";$("visualQuestion").textContent=p.title;$("visualImage").innerHTML=p.image;$("visualAnswers").innerHTML="";$("visualFeedback").className="feedback";$("visualFeedback").textContent="";p.options.forEach((v,i)=>{const b=document.createElement("button");b.className="balance-option";b.textContent=String.fromCharCode(65+i)+") "+v;b.onclick=()=>choose(v,b);$("visualAnswers").appendChild(b)})}
 function choose(value,button){if(locked)return;locked=true;const p=catalog[phase-1],ok=String(value)===String(p.answer),fb=$("visualFeedback");if(ok){button.classList.add("correct");const d=completed();if(!d.includes(phase)){d.push(phase);d.sort((a,b)=>a-b);localStorage.setItem(KEY+"done",JSON.stringify(d))}fb.className="feedback show good";fb.textContent="Correto! "+p.explain}else{button.classList.add("wrong");fb.className="feedback show bad";fb.textContent="Não é essa. "+p.explain+" Resposta: "+p.answer+"."}const next=document.createElement("button");next.className="btn primary start";next.textContent=phase===TOTAL?"VOLTAR ÀS FASES":"PRÓXIMA FASE →";next.onclick=()=>phase===TOTAL?window.showVisualPhases():startVisual(phase+1);fb.appendChild(next)}
 window.startVisualChallenge=startVisual;
})();