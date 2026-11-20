// Modalidade Desafio das Balanças — 50 fases, 4 alternativas, progresso local.
(() => {
 const $=id=>document.getElementById(id);
 const TOTAL=50, STORE="balancas_";
 const animals=[
  {id:"mouse",name:"Rato",img:"https://c.pxhere.com/photos/28/d0/animals_close_up_domestic_funny_fur_isolated_mammal_mice-1119557.jpg!d"},
  {id:"cat",name:"Gato",img:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=180&h=180&fit=crop&crop=faces"},
  {id:"dog",name:"Cachorro",img:"https://images.unsplash.com/photo-1552053831-71594a27632d?w=180&h=180&fit=crop&crop=faces"},
  {id:"lion",name:"Leão",img:"https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=180&h=180&fit=crop"},
  {id:"elephant",name:"Elefante",img:"https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=180&h=180&fit=crop"},
  {id:"rabbit",name:"Coelho",img:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=180&h=180&fit=crop"},
  {id:"fox",name:"Raposa",img:"https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=180&h=180&fit=crop"},
  {id:"panda",name:"Panda",img:"https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=180&h=180&fit=crop"},
  {id:"tiger",name:"Tigre",img:"https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=180&h=180&fit=crop"},
  {id:"giraffe",name:"Girafa",img:"https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=180&h=180&fit=crop"}
 ];
 let phase=1,score=0,locked=false;
 let seed=20261120;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const int=(a,b)=>a+Math.floor(rand()*(b-a+1));
 const catalog=[];
 for(let i=1;i<=TOTAL;i++){
  const pool=[...animals], trio=[];
  while(trio.length<3){const j=Math.floor(rand()*pool.length);trio.push(pool.splice(j,1)[0])}
  const max=i<=10?8:i<=20?14:i<=30?20:i<=40?28:36;
  const weights=trio.map(()=>int(1,max));
  const [a,b,c]=weights;
  const sums=[a+b,b+c,a+c],answer=a+b+c;
  const opts=new Set([answer]);
  const spread=Math.max(3,Math.ceil(i/5));
  while(opts.size<4){let v=answer+int(-spread*2,spread*2);if(v>0&&v!==answer)opts.add(v)}
  const options=[...opts];for(let j=options.length-1;j>0;j--){const k=Math.floor(rand()*(j+1));[options[j],options[k]]=[options[k],options[j]]}
  catalog.push({trio,weights,sums,answer,options});
 }
 const done=()=>{try{return JSON.parse(localStorage.getItem(STORE+"done")||"[]")}catch(e){return []}};
 const best=()=>Number(localStorage.getItem(STORE+"best")||0);
 const show=id=>{document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")};
 window.showBalancePhases=()=>{
  $("levelPill").textContent="DESAFIO DAS BALANÇAS";
  const list=$("balancePhaseList");list.innerHTML="";
  const finished=done();
  for(let i=1;i<=TOTAL;i++){const b=document.createElement("button");b.className="phase-btn"+(finished.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.setAttribute("aria-label","Abrir fase "+i);b.onclick=()=>startBalance(i);list.appendChild(b)}
  show("balancePhases");
 };
 function startBalance(n){phase=Math.max(1,Math.min(TOTAL,n));score=0;locked=false;show("balances");render()}
 function render(){
  const p=catalog[phase-1];
  $("levelPill").textContent="BALANÇAS · FASE "+phase;
  $("balanceLevel").textContent="FASE "+phase+" DE 50";
  $("balanceDifficulty").textContent=phase<=10?"INICIANTE":phase<=20?"FÁCIL":phase<=30?"MÉDIO":phase<=40?"DIFÍCIL":"MESTRE";
  $("balanceDone").textContent=done().length+"/50";$("balanceBest").textContent=best();
  $("balanceBar").style.width=(done().length/50*100)+"%";
  $("balanceQuestion").textContent="Quanto pesam os três animais juntos?";
  const rows=[{pair:[0,1],sum:p.sums[0]},{pair:[1,2],sum:p.sums[1]},{pair:[0,2],sum:p.sums[2]}];
  const root=$("balanceClues");root.innerHTML="";
  rows.forEach((r,index)=>{
   const row=document.createElement("div");row.className="balance-row";
   row.innerHTML='<div class="balance-number">'+(index+1)+'</div><div class="balance-pan">'+animalMarkup(p.trio[r.pair[0]])+'<span class="balance-plus">+</span>'+animalMarkup(p.trio[r.pair[1]])+'</div><div class="balance-equals">=</div><div class="balance-weight">'+r.sum+'<small>kg</small></div>';
   root.appendChild(row);
  });
  const animalsRoot=$("balanceAnimals");animalsRoot.innerHTML="";
  p.trio.forEach((a,i)=>{const el=document.createElement("div");el.className="balance-animal-chip";el.innerHTML=animalMarkup(a)+'<span>'+a.name+'</span>';animalsRoot.appendChild(el)});
  const answers=$("balanceAnswers");answers.innerHTML="";
  p.options.forEach((v,i)=>{const b=document.createElement("button");b.className="balance-option";b.textContent=String.fromCharCode(65+i)+")  "+v+" kg";b.onclick=()=>choose(v,b);answers.appendChild(b)});
  $("balanceFeedback").className="feedback";$("balanceFeedback").textContent="";
 }
 function animalMarkup(a){return '<div class="balance-animal"><img src="'+a.img+'" alt="'+a.name+'" loading="lazy" referrerpolicy="no-referrer"><span>'+a.name+'</span></div>'}
 function choose(value,button){
  if(locked)return;locked=true;
  const p=catalog[phase-1],ok=value===p.answer;
  document.querySelectorAll(".balance-option").forEach(b=>{b.disabled=true;if(b.textContent.endsWith(p.answer+" kg"))b.classList.add("correct")});
  const fb=$("balanceFeedback");
  if(ok){
   score+=100;const finished=done();if(!finished.includes(phase)){finished.push(phase);finished.sort((a,b)=>a-b);localStorage.setItem(STORE+"done",JSON.stringify(finished))}
   if(score>best())localStorage.setItem(STORE+"best",String(score));
   fb.className="feedback show good";fb.textContent="Correto! Somando as três pesagens, cada animal aparece duas vezes. "+p.sums.join(" + ")+" = "+(p.sums.reduce((x,y)=>x+y,0))+"; dividindo por 2, o total é "+p.answer+" kg.";
   $("balanceDone").textContent=finished.length+"/50";$("balanceBest").textContent=best();$("balanceBar").style.width=(finished.length/50*100)+"%";
  }else{
   button.classList.add("wrong");
   fb.className="feedback show bad";fb.textContent="Ainda não! A soma das três pesagens é "+p.sums.reduce((x,y)=>x+y,0)+" kg. Como cada animal foi contado duas vezes, divida por 2. Resposta: "+p.answer+" kg.";
  }
  const next=document.createElement("button");next.className="btn primary start";next.textContent=phase===TOTAL?"VOLTAR ÀS FASES":"PRÓXIMA FASE →";next.onclick=()=>phase===TOTAL?window.showBalancePhases():startBalance(phase+1);fb.appendChild(next);
 }
 window.startBalance=startBalance;
})();
