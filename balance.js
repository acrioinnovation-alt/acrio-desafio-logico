// Desafio das Balanças — 10 imagens originais fornecidas pelo usuário.
(() => {
 const $=id=>document.getElementById(id);
 const TOTAL=10, STORE="balancas_imagens_v1_";
 const catalog=[
  {image:"balancas/desafio-01.jpg",sums:[12,11,13],answer:18,options:[16,18,20,22]},
  {image:"balancas/desafio-02.jpg",sums:[19,21,16],answer:28,options:[26,28,30,32]},
  {image:"balancas/desafio-03.jpg",sums:[12,11,13],answer:18,options:[16,18,20,22]},
  {image:"balancas/desafio-04.jpg",sums:[15,12,13],answer:20,options:[18,20,22,24]},
  {image:"balancas/desafio-05.jpg",sums:[9,11,8],answer:14,options:[12,14,16,18]},
  {image:"balancas/desafio-06.jpg",sums:[18,15,13],answer:23,options:[21,23,25,27]},
  {image:"balancas/desafio-07.jpg",sums:[24,19,15],answer:29,options:[27,29,31,33]},
  {image:"balancas/desafio-08.jpg",sums:[11,9,6],answer:13,options:[11,13,15,17]},
  {image:"balancas/desafio-09.jpg",sums:[11,13,8],answer:16,options:[14,16,18,20]},
  {image:"balancas/desafio-10.jpg",sums:[16,13,9],answer:19,options:[17,19,21,23]}
 ];
 let phase=1,locked=false;
 const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
 const done=()=>{try{const v=JSON.parse(localStorage.getItem(STORE+"done")||"[]");return Array.isArray(v)?v.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL):[]}catch(e){return []}};
 const best=()=>Number(localStorage.getItem(STORE+"best")||0);
 const show=id=>{document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")};
 function updateProgress(){
  const completed=done();
  $("balanceDone").textContent=completed.length+"/"+TOTAL;
  $("balanceBest").textContent=best();
  $("balanceBar").style.width=(completed.length/TOTAL*100)+"%";
 }
 window.showBalancePhases=()=>{
  $("levelPill").textContent="DESAFIO DAS BALANÇAS";
  $("balancePhaseCount").textContent=TOTAL+" DESAFIOS";
  const list=$("balancePhaseList");list.innerHTML="";
  const finished=done();
  for(let i=1;i<=TOTAL;i++){
   const b=document.createElement("button");b.className="phase-btn"+(finished.includes(i)?" done":"");
   b.textContent=String(i).padStart(2,"0");b.setAttribute("aria-label","Abrir fase "+i);
   b.onclick=()=>startBalance(i);list.appendChild(b);
  }
  updateProgress();show("balancePhases");
 };
 function startBalance(n){phase=Math.max(1,Math.min(TOTAL,n));locked=false;show("balances");render()}
 function render(){
  const p=catalog[phase-1];
  $("levelPill").textContent="BALANÇAS · FASE "+phase;
  $("balanceLevel").textContent="FASE "+phase+" DE "+TOTAL;
  $("balanceDifficulty").textContent=phase<=3?"INICIANTE":phase<=6?"INTERMEDIÁRIO":"DESAFIADOR";
  $("balanceQuestion").textContent="Qual é o peso total dos três animais?";
  const img=$("balancePuzzleImage");
  img.src=p.image;img.alt="Desafio das balanças, fase "+phase;
  img.onerror=()=>{img.alt="Não foi possível carregar a imagem do desafio "+phase};
  const answers=$("balanceAnswers");answers.innerHTML="";
  shuffle(p.options).forEach((v,i)=>{
   const b=document.createElement("button");b.className="balance-option";b.textContent=String.fromCharCode(65+i)+")  "+v+" kg";
   b.dataset.value=String(v);b.onclick=()=>choose(v,b);answers.appendChild(b);
  });
  $("balanceFeedback").className="feedback";$("balanceFeedback").textContent="";
  updateProgress();
 }
 function choose(value,button){
  if(locked)return;locked=true;
  const p=catalog[phase-1],ok=value===p.answer;
  document.querySelectorAll("#balanceAnswers .balance-option").forEach(b=>{
   b.disabled=true;if(Number(b.dataset.value)===p.answer)b.classList.add("correct");
  });
  const fb=$("balanceFeedback");
  const sum=p.sums.reduce((a,b)=>a+b,0);
  if(ok){
   const finished=done();if(!finished.includes(phase)){finished.push(phase);finished.sort((a,b)=>a-b);localStorage.setItem(STORE+"done",JSON.stringify(finished))}
   if(finished.length>best())localStorage.setItem(STORE+"best",String(finished.length));
   fb.className="feedback show good";
   fb.textContent="Correto! "+p.answer+" kg.";
  }else{
   button.classList.add("wrong");fb.className="feedback show bad";
   fb.textContent="Não foi dessa vez. Resposta: "+p.answer+" kg.";
  }
  updateProgress();
  const next=document.createElement("button");next.className="btn primary start";
  next.textContent=phase===TOTAL?"VOLTAR ÀS FASES":"PRÓXIMA FASE →";
  next.onclick=()=>phase===TOTAL?window.showBalancePhases():startBalance(phase+1);
  fb.appendChild(next);
 }
 window.startBalance=startBalance;
})();