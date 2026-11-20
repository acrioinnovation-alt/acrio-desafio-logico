// Modalidade independente: Desafio dos Palitos — 50 fases, somente mover.
(() => {
 // Visual dos fósforos: madeira, cabeça vermelha e relevo, sem alterar a lógica do jogo.
 const matchstickStyle = document.createElement("style");
 matchstickStyle.id = "real-matchstick-style";
 matchstickStyle.textContent = ``;
 if (!document.getElementById("real-matchstick-style")) document.head.appendChild(matchstickStyle);

 const $=id=>document.getElementById(id);
 const SEG={
  0:"abcdef",1:"bc",2:"abged",3:"abgcd",4:"fgbc",5:"afgcd",
  6:"afgecd",7:"abc",8:"abcdefg",9:"abfgcd"
 };
 const DIGITS=Object.fromEntries(Object.entries(SEG).map(([n,s])=>[s.split("").sort().join(""),Number(n)]));
 const OPS=["+","−"];
 const key=s=>s.split("").sort().join("");
 function eqValid(vals,op){const [a,b,c]=vals;return op==="+"?a+b===c:a-b===c}
 function makeCatalog(){
  const correct=[];
  for(let a=0;a<=9;a++)for(let b=0;b<=9;b++)for(const op of OPS){const c=op==="+"?a+b:a-b;if(c>=0&&c<=9)correct.push({vals:[a,b,c],op})}
  const found=new Map();
  for(const good of correct){
   const masks=good.vals.map(n=>SEG[n]);
   for(let from=0;from<3;from++)for(const seg of masks[from]){
    const reduced=masks.map((m,i)=>i===from?m.replace(seg,""):m);
    for(let to=0;to<3;to++)if(to!==from){
     for(const add of "abcdefg")if(!reduced[to].includes(add)){
      const altered=reduced.map((m,i)=>i===to?m+add:m);
      const vals=altered.map(m=>DIGITS[key(m)]);
      if(vals.some(v=>v===undefined)||eqValid(vals,good.op))continue;
      const initial=altered.map(key).join("|")+good.op;
      if(!found.has(initial))found.set(initial,{initial:altered.map(key),solution:good.vals,op:good.op,from,fromSeg:seg,to,toSeg:add});
     }
    }
   }
  }
  const all=[...found.values()];
  // Embaralhamento determinístico: catálogo permanece igual em todos os aparelhos.
  let seed=20261120;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=all.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[all[i],all[j]]=[all[j],all[i]]}
  return all.slice(0,50);
 }
 const catalog=makeCatalog();
 let phase=1,score=0,best=Number(localStorage.getItem("palitos_best")||0),selected=null,board=[],locked=false;
 const completed=()=>{try{return JSON.parse(localStorage.getItem("palitos_completed")||"[]")}catch(e){return []}};
 function showScreen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
 window.showMatchPhases=()=>{
  $("levelPill").textContent="DESAFIO DOS PALITOS";
  const done=completed(),list=$("matchPhaseList");list.innerHTML="";
  for(let i=1;i<=50;i++){const b=document.createElement("button");b.className="phase-btn"+(done.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.onclick=()=>startMatch(i);list.appendChild(b)}
  showScreen("matchPhases");
 };
 function difficulty(n){return n<=10?"INICIANTE":n<=20?"FÁCIL":n<=30?"MÉDIO":n<=40?"DIFÍCIL":"MESTRE"}
 function startMatch(n){phase=n;score=0;best=Number(localStorage.getItem("palitos_best")||0);board=catalog[n-1].initial.map(s=>s);selected=null;locked=false;showScreen("matches");render()}
 function render(){
  $("levelPill").textContent="PALITOS · FASE "+phase;
  $("matchLevelTag").textContent="FASE "+phase+" · PALITOS";$("matchDifficulty").textContent=difficulty(phase);
  $("matchScore").textContent=score;$("matchDone").textContent=completed().length+"/50";$("matchRecord").textContent=best;
  $("matchBar").style.width=(completed().length/50*100)+"%";
  $("matchMoveLabel").textContent="1 movimento";$("matchStatus").textContent=selected?"Agora escolha um espaço vazio":"Escolha um palito";
  $("matchFeedback").className="feedback";$("matchFeedback").textContent="";
  const item=catalog[phase-1],root=$("matchBoard");root.innerHTML="";
  board.forEach((mask,pos)=>{
   const digit=document.createElement("div");digit.className="match-digit";
   for(const seg of "abcdefg"){
    const el=document.createElement("button");el.type="button";
    const on=mask.includes(seg);el.className="match-seg "+(seg==="a"||seg==="d"||seg==="g"?"h ":"v ")+(on?"on":"off")+(selected&&selected.pos===pos&&selected.seg===seg?" selected":"");
    el.classList.add(seg);el.setAttribute("aria-label",on?"Palito "+seg:"Espaço vazio "+seg);
    el.disabled=locked;
    el.onclick=()=>tapSegment(pos,seg,on);
    digit.appendChild(el);
   }
   root.appendChild(digit);
   if(pos===0||pos===1){const op=document.createElement("span");op.className="match-op";op.textContent=pos===0?item.op:"=";root.appendChild(op)}
  });
 }
 function tapSegment(pos,seg,on){
  if(locked)return;
  if(!selected){
   if(!on){$("matchStatus").textContent="Escolha um palito aceso";return}
   selected={pos,seg};render();return;
  }
  if(selected.pos===pos&&selected.seg===seg){selected=null;render();return}
  if(on){selected={pos,seg};render();return}
  const next=board.map(s=>s);
  next[selected.pos]=next[selected.pos].replace(selected.seg,"");
  next[pos]+=seg;
  const digits=next.map(s=>DIGITS[key(s)]);
  if(digits.some(v=>v===undefined)){selected=null;render();$("matchStatus").textContent="Essa forma não é um número";return}
  board=next;selected=null;
  if(eqValid(digits,catalog[phase-1].op)){render();win()}else{locked=true;render();$("matchFeedback").className="feedback show bad";$("matchFeedback").textContent="Essa movimentação não corrigiu a conta. Toque em RECOMEÇAR para tentar novamente.";$("matchStatus").textContent="Tentativa encerrada";}
 }
 function win(){
  locked=true;score=100+(phase*10);best=Math.max(best,score);localStorage.setItem("palitos_best",String(best));
  const done=completed();if(!done.includes(phase)){done.push(phase);done.sort((a,b)=>a-b);localStorage.setItem("palitos_completed",JSON.stringify(done))}
  $("matchFeedback").className="feedback show good";$("matchFeedback").textContent=phase===50?"Perfeito! Você concluiu as 50 fases!":"Muito bem! A conta está correta. Fase concluída!";
  $("matchStatus").textContent="Desafio resolvido";$("matchScore").textContent=score;$("matchDone").textContent=done.length+"/50";$("matchRecord").textContent=best;$("matchBar").style.width=(done.length/50*100)+"%";
  const next=phase<50?phase+1:null;
  const btn=document.createElement("button");btn.className="btn primary start";btn.textContent=next?"PRÓXIMA FASE →":"VER FASES";btn.onclick=()=>next?startMatch(next):showMatchPhases();$("matchFeedback").appendChild(btn);
 }
 window.resetMatchMove=()=>{board=catalog[phase-1].initial.map(s=>s);selected=null;locked=false;render()};
 window.startMatch=startMatch;
})();
