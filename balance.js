// Modalidade Desafio das Balanças — 50 fases, 4 alternativas e progresso local.
(() => {
 const $=id=>document.getElementById(id);
 const TOTAL=50, STORE="balancas_";
 const animals=[
  {id:"mouse",name:"Rato",img:"https://c.pxhere.com/photos/28/d0/animals_close_up_domestic_funny_fur_isolated_mammal_mice-1119557.jpg!d"},
  {id:"cat",name:"Gato",img:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=240&h=240&fit=crop&crop=faces"},
  {id:"dog",name:"Cachorro",img:"https://images.unsplash.com/photo-1552053831-71594a27632d?w=240&h=240&fit=crop&crop=faces"},
  {id:"lion",name:"Leão",img:"https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=240&h=240&fit=crop"},
  {id:"elephant",name:"Elefante",img:"https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=240&h=240&fit=crop"},
  {id:"rabbit",name:"Coelho",img:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=240&h=240&fit=crop"},
  {id:"fox",name:"Raposa",img:"https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=240&h=240&fit=crop"},
  {id:"panda",name:"Panda",img:"https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=240&h=240&fit=crop"},
  {id:"tiger",name:"Tigre",img:"https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=240&h=240&fit=crop"},
  {id:"giraffe",name:"Girafa",img:"https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=240&h=240&fit=crop"}
 ];
 let phase=1,score=0,locked=false,seed=20261120;
 const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const int=(a,b)=>a+Math.floor(rand()*(b-a+1));
 const catalog=[];
 for(let i=1;i<=TOTAL;i++){
  const pool=[...animals],trio=[];
  while(trio.length<3){const j=Math.floor(rand()*pool.length);trio.push(pool.splice(j,1)[0])}
  const max=i<=10?8:i<=20?14:i<=30?20:i<=40?28:36;
  const weights=trio.map(()=>int(1,max));
  const [a,b,c]=weights,sums=[a+b,b+c,a+c],answer=a+b+c;
  const opts=new Set([answer]),spread=Math.max(3,Math.ceil(i/5));
  while(opts.size<4){const v=answer+int(-spread*2,spread*2);if(v>0)opts.add(v)}
  const options=[...opts];
  for(let j=options.length-1;j>0;j--){const k=Math.floor(rand()*(j+1));[options[j],options[k]]=[options[k],options[j]]}
  catalog.push({trio,weights,sums,answer,options});
 }
 function addVisualStyle(){
  if($("balanceVisualStyle"))return;
  const s=document.createElement("style");s.id="balanceVisualStyle";
  s.textContent=`
   .balance-scene{padding:12px 8px;background:linear-gradient(180deg,#f8fbff,#d9e9fa);border:1px solid #b6cee9}
   .balance-row{display:grid;grid-template-columns:22px minmax(0,1fr);gap:5px;padding:12px 1px 14px;border-bottom:1px solid #bfd2e7}
   .balance-row:last-child{border:0}
   .balance-number{align-self:start;margin-top:22px}
   .balance-scale{position:relative;min-width:0;padding-top:4px}
   .balance-equation{display:grid;grid-template-columns:minmax(0,1fr) 24px 65px;align-items:center;gap:4px}
   .balance-pan{min-height:78px;display:flex;align-items:center;justify-content:center;gap:3px;position:relative;padding:4px 2px 13px}
   .balance-pan:before{content:"";position:absolute;left:8%;right:8%;bottom:8px;height:5px;border-radius:50%;background:linear-gradient(90deg,#8ca6c2,#e5effa,#8ca6c2);box-shadow:0 2px 2px #526d8a55}
   .balance-pan:after{content:"";position:absolute;left:50%;bottom:12px;width:2px;height:25px;background:#8ca6c2;transform:translateX(-50%);z-index:0}
   .balance-beam{height:5px;width:78%;margin:0 auto -1px;border-radius:8px;background:linear-gradient(180deg,#8da9c7,#456b94);box-shadow:0 2px 2px #46627f55;position:relative}
   .balance-beam:before{content:"";position:absolute;left:50%;top:3px;width:3px;height:12px;background:#58799d}
   .balance-animal{width:58px;z-index:1}
   .balance-animal img{width:47px;height:47px;border-radius:50%;object-fit:cover;border:2px solid white;box-shadow:0 2px 6px #1e3d5d45}
   .balance-animal span{font-size:8px}
   .balance-plus{font-size:17px}
   .balance-equals{font-size:19px;color:#294f77}
   .balance-weight{font-size:21px;padding:8px 2px;border-radius:12px;background:linear-gradient(145deg,#fff,#dcecff);border:1px solid #9dbbdb;box-shadow:0 4px 0 #a9c3df}
   .balance-weight small{font-size:9px}
   .balance-animals{background:#10223b}
   @media(max-width:390px){.balance-equation{grid-template-columns:minmax(0,1fr) 18px 57px;gap:2px}.balance-animal{width:51px}.balance-animal img{width:42px;height:42px}.balance-weight{font-size:18px}}
  `;
  document.head.appendChild(s);
 }
 const done=()=>{try{return JSON.parse(localStorage.getItem(STORE+"done")||"[]")}catch(e){return []}};
 const best=()=>Number(localStorage.getItem(STORE+"best")||0);
 const show=id=>{document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")};
 window.showBalancePhases=()=>{
  $("levelPill").textContent="DESAFIO DAS BALANÇAS";const list=$("balancePhaseList");list.innerHTML="";
  const finished=done();
  for(let i=1;i<=TOTAL;i++){const b=document.createElement("button");b.className="phase-btn"+(finished.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.setAttribute("aria-label","Abrir fase "+i);b.onclick=()=>startBalance(i);list.appendChild(b)}
  show("balancePhases");
 };
 function startBalance(n){phase=Math.max(1,Math.min(TOTAL,n));score=0;locked=false;show("balances");render()}
 function render(){
  addVisualStyle();
  const p=catalog[phase-1];
  $("levelPill").textContent="BALANÇAS · FASE "+phase;$("balanceLevel").textContent="FASE "+phase+" DE 50";
  $("balanceDifficulty").textContent=phase<=10?"INICIANTE":phase<=20?"FÁCIL":phase<=30?"MÉDIO":phase<=40?"DIFÍCIL":"MESTRE";
  $("balanceDone").textContent=done().length+"/50";$("balanceBest").textContent=best();$("balanceBar").style.width=(done().length/50*100)+"%";
  $("balanceQuestion").textContent="Quanto pesam os três animais juntos?";
  const rows=[{pair:[0,1],sum:p.sums[0]},{pair:[1,2],sum:p.sums[1]},{pair:[0,2],sum:p.sums[2]}];
  const root=$("balanceClues");root.innerHTML="";
  rows.forEach((r,index)=>{
   const row=document.createElement("div");row.className="balance-row";
   row.innerHTML='<div class="balance-number">'+(index+1)+'</div><div class="balance-scale"><div class="balance-beam"></div><div class="balance-equation"><div class="balance-pan">'+animalMarkup(p.trio[r.pair[0]])+'<span class="balance-plus">+</span>'+animalMarkup(p.trio[r.pair[1]])+'</div><div class="balance-equals">=</div><div class="balance-weight">'+r.sum+'<small>kg</small></div></div></div>';
   root.appendChild(row);
  });
  const animalsRoot=$("balanceAnimals");animalsRoot.innerHTML="";
  p.trio.forEach(a=>{const el=document.createElement("div");el.className="balance-animal-chip";el.innerHTML=animalMarkup(a)+'<span>'+a.name+'</span>';animalsRoot.appendChild(el)});
  const answers=$("balanceAnswers");answers.innerHTML="";
  p.options.forEach((v,i)=>{const b=document.createElement("button");b.className="balance-option";b.textContent=String.fromCharCode(65+i)+")  "+v+" kg";b.onclick=()=>choose(v,b);answers.appendChild(b)});
  $("balanceFeedback").className="feedback";$("balanceFeedback").textContent="";
 }
 function animalMarkup(a){return '<div class="balance-animal"><img src="'+a.img+'" alt="'+a.name+'" loading="eager" referrerpolicy="no-referrer"><span>'+a.name+'</span></div>'}
 function choose(value,button){
  if(locked)return;locked=true;
  const p=catalog[phase-1],ok=value===p.answer;
  document.querySelectorAll(".balance-option").forEach(b=>{b.disabled=true;if(b.textContent.endsWith(p.answer+" kg"))b.classList.add("correct")});
  const fb=$("balanceFeedback");
  if(ok){
   score+=100;const finished=done();if(!finished.includes(phase)){finished.push(phase);finished.sort((a,b)=>a-b);localStorage.setItem(STORE+"done",JSON.stringify(finished))}
   if(score>best())localStorage.setItem(STORE+"best",String(score));
   fb.className="feedback show good";fb.textContent="Correto! Somando as três pesagens, cada animal aparece duas vezes. "+p.sums.join(" + ")+" = "+p.sums.reduce((x,y)=>x+y,0)+"; dividindo por 2, o total é "+p.answer+" kg.";
   $("balanceDone").textContent=finished.length+"/50";$("balanceBest").textContent=best();$("balanceBar").style.width=(finished.length/50*100)+"%";
  }else{button.classList.add("wrong");fb.className="feedback show bad";fb.textContent="Ainda não! A soma das três pesagens é "+p.sums.reduce((x,y)=>x+y,0)+" kg. Como cada animal foi contado duas vezes, divida por 2. Resposta: "+p.answer+" kg."}
  const next=document.createElement("button");next.className="btn primary start";next.textContent=phase===TOTAL?"VOLTAR ÀS FASES":"PRÓXIMA FASE →";next.onclick=()=>phase===TOTAL?window.showBalancePhases():startBalance(phase+1);fb.appendChild(next);
 }
 window.startBalance=startBalance;
})();