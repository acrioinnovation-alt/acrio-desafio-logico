// Desafio das Balanças — 32 desafios validados a partir das imagens de 21/11/2026.
(() => {
 const $=id=>document.getElementById(id);
 const catalog=[
  // Desafios com animais: somente imagens únicas, coerentes e com resposta verificável.
  {image:"balancas/desafio-01.jpg",type:"animal",answer:22},
  {image:"balancas/desafio-02.jpg",type:"animal",answer:27},
  {image:"balancas/desafio-03.jpg",type:"animal",answer:28},
  {image:"balancas/desafio-04.jpg",type:"animal",answer:31},
  {image:"balancas/desafio-05.jpg",type:"animal",answer:32},
  {image:"balancas/desafio-06.jpg",type:"animal",answer:19},
  {image:"balancas/desafio-07.jpg",type:"animal",answer:20},
  {image:"balancas/desafio-08.jpg",type:"animal",answer:32},
  {image:"balancas/desafio-09.jpg",type:"animal",answer:34},
  {image:"balancas/desafio-10.jpg",type:"animal",answer:39},
  {image:"balancas/desafio-11.jpg",type:"animal",answer:42},
  {image:"balancas/desafio-12.jpg",type:"animal",answer:46},
  {image:"balancas/desafio-13.jpg",type:"animal",answer:54},
  // Desafios de balança com bolas: resposta calculada pela igualdade dos dois pratos.
  {image:"balancas/desafio-14.jpg",type:"ball",answer:5},
  {image:"balancas/desafio-15.jpg",type:"ball",answer:5},
  {image:"balancas/desafio-16.jpg",type:"ball",answer:5},
  {image:"balancas/desafio-17.jpg",type:"ball",answer:5},
  {image:"balancas/desafio-18.jpg",type:"ball",answer:5},
  {image:"balancas/desafio-19.jpg",type:"ball",answer:6},
  {image:"balancas/desafio-20.jpg",type:"ball",answer:6},
  {image:"balancas/desafio-21.jpg",type:"ball",answer:6},
  {image:"balancas/desafio-22.jpg",type:"ball",answer:7},
  {image:"balancas/desafio-23.jpg",type:"ball",answer:7},
  {image:"balancas/desafio-24.jpg",type:"ball",answer:7},
  {image:"balancas/desafio-25.jpg",type:"ball",answer:7},
  {image:"balancas/desafio-26.jpg",type:"ball",answer:7},
  {image:"balancas/desafio-27.jpg",type:"ball",answer:7},
  {image:"balancas/desafio-28.jpg",type:"ball",answer:7},
  {image:"balancas/desafio-29.jpg",type:"ball",answer:12},
  {image:"balancas/desafio-30.jpg",type:"ball",answer:12},
  {image:"balancas/desafio-31.jpg",type:"ball",answer:12},
  {image:"balancas/desafio-32.jpg",type:"ball",answer:14}
 ];
 const TOTAL=catalog.length, STORE="balancas_imagens_v2_";
 let phase=1,locked=false;
 const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
 const optionsFor=answer=>shuffle([answer,answer-2,answer-1,answer+2]);
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
  $("balanceDifficulty").textContent=phase<=8?"INICIANTE":phase<=21?"INTERMEDIÁRIO":"DESAFIADOR";
  $("balanceQuestion").textContent=p.type==="animal"?"Qual é o peso total de todos os animais?":"Quanto pesa cada bola?";
  const img=$("balancePuzzleImage");
  img.src=p.image;img.alt="Desafio das balanças, fase "+phase;
  img.onerror=()=>{img.alt="Imagem do desafio "+phase+" indisponível"};
  const answers=$("balanceAnswers");answers.innerHTML="";
  optionsFor(p.answer).forEach((v,i)=>{
   const b=document.createElement("button");b.className="balance-option";
   b.textContent=String.fromCharCode(65+i)+")  "+v+" kg";
   b.dataset.value=String(v);b.onclick=()=>choose(v,b);answers.appendChild(b);
  });
  $("balanceFeedback").className="feedback";$("balanceFeedback").textContent="";
  updateProgress();
 }
 function choose(value,button){
  if(locked)return;locked=true;
  const p=catalog[phase-1],ok=value===p.answer;
  document.querySelectorAll("#balanceAnswers .balance-option").forEach(b=>{b.disabled=true});
  const fb=$("balanceFeedback");
  if(ok){
   const finished=done();if(!finished.includes(phase)){finished.push(phase);finished.sort((a,b)=>a-b);localStorage.setItem(STORE+"done",JSON.stringify(finished))}
   if(finished.length>best())localStorage.setItem(STORE+"best",String(finished.length));
   fb.className="feedback show good";fb.textContent="Correto! Muito bem!";
  }else{
   button.classList.add("wrong");fb.className="feedback show bad";
   fb.textContent="Não foi dessa vez. Observe as relações entre os pesos e tente novamente em outra rodada.";
  }
  updateProgress();
  const next=document.createElement("button");next.className="btn primary start";
  next.textContent=phase===TOTAL?"VOLTAR ÀS FASES":"PRÓXIMA FASE →";
  next.onclick=()=>phase===TOTAL?window.showBalancePhases():startBalance(phase+1);
  fb.appendChild(next);
 }
 window.startBalance=startBalance;
})();