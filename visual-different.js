// Modalidade adicional: Ache o Desenho Diferente — 50 fases com pictogramas.
(function(){
"use strict";
const TOTAL_VISUAL_PHASES=50;
const visual$=id=>document.getElementById(id);
const visualSizeForLevel=n=>Math.min(18,10+Math.floor((n-1)/6));
const visualKey=suffix=>"ache_desenho_diferente_"+suffix;
let visualLevel=1,visualScore=0,visualLives=3,visualBest=0,visualLocked=false,visualOdd=-1,visualTimer=null;

const stroke='fill="none" stroke="#111111" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
function svg(body){return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" '+stroke+' aria-hidden="true">'+body+'</svg>'}
const drawings=[
 // Folhas: nervuras, ponta e pequeno recorte.
 (v)=>svg('<path d="M10 48 Q12 13 53 9 Q55 45 18 54 Q12 53 10 48Z"/><path d="M12 52 Q29 34 49 14"/><path d="M23 42 Q22 31 17 26"/><path d="M34 31 Q35 22 31 17"/>'+(v===0?'<path d="M28 38 Q39 37 43 43"/>':v===1?'<path d="M39 24 Q47 23 49 28"/>':v===2?'<path d="M16 47 Q21 47 23 51"/>':v===3?'<path d="M26 34 Q32 32 36 35"/>':v===4?'<path d="M44 18 Q48 14 51 15"/>':'')),
 // Flores: pequenas diferenças na pétala ou no miolo.
 (v)=>svg('<circle cx="32" cy="28" r="7"/><path d="M32 35 L32 57 M32 48 Q22 39 17 46"/>'+Array.from({length:5},(_,i)=>{let a=(Math.PI*2*i/5)-Math.PI/2;let x=32+Math.cos(a)*15,y=28+Math.sin(a)*15;return '<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="6.5" ry="10" transform="rotate('+(i*72)+' '+x.toFixed(1)+' '+y.toFixed(1)+')"/>'}).join('')+(v===0?'<circle cx="32" cy="28" r="2"/>':v===1?'<path d="M28 26 L36 30"/>':v===2?'<path d="M25 30 L29 33"/>':v===3?'<path d="M35 23 L38 20"/>':v===4?'<path d="M32 35 Q38 39 40 44"/>':'')),
 // Guarda-chuvas: pontas, costura e cabo.
 (v)=>svg('<path d="M7 31 Q12 9 32 9 Q52 9 57 31 Q50 26 43 31 Q37 25 32 31 Q24 25 18 31 Q12 26 7 31Z"/><path d="M32 10 L32 48 Q32 57 41 55 Q46 54 45 49"/>'+(v===0?'<path d="M19 28 L19 31"/>':v===1?'<path d="M43 28 L43 31"/>':v===2?'<path d="M25 14 Q32 19 39 14"/>':v===3?'<path d="M12 24 L15 27"/>':v===4?'<path d="M49 24 L52 27"/>':'')),
 // Engrenagens: um dente/entalhe discretamente diferente.
 (v)=>{let pts=[];for(let i=0;i<24;i++){let a=i*Math.PI/12-Math.PI/2,r=(i%3===0?25:21);if(v===0&&i===6)r=18;if(v===1&&i===12)r=18;if(v===2&&i===18)r=18;if(v===3&&i===0)r=18;if(v===4&&i===9)r=18;pts.push((32+Math.cos(a)*r).toFixed(1)+','+(32+Math.sin(a)*r).toFixed(1))}return svg('<polygon points="'+pts.join(' ')+'"/><circle cx="32" cy="32" r="9"/>')},
 // Balões: corda, amarração ou gominho.
 (v)=>svg('<path d="M32 7 C17 7 12 20 15 33 Q18 46 32 49 Q46 46 49 33 C52 20 47 7 32 7Z"/><path d="M25 49 L28 55 L36 55 L39 49 M28 55 L28 59 L36 59 L36 55"/>'+(v===0?'<path d="M24 13 Q20 24 24 34"/>':v===1?'<path d="M40 13 Q44 24 40 34"/>':v===2?'<path d="M32 9 L32 45"/>':v===3?'<path d="M21 40 Q32 46 43 40"/>':v===4?'<path d="M29 52 L35 52"/>':'')),
 // Peixes: barbatana, escama ou olho.
 (v)=>svg('<path d="M9 32 Q23 12 45 25 L56 16 L54 32 L56 48 L45 39 Q23 52 9 32Z"/><circle cx="22" cy="29" r="'+(v===0?3.8:3.2)+'"/>'+(v===1?'<path d="M32 23 Q39 32 32 41"/>':v===2?'<path d="M38 25 Q43 32 38 39"/>':v===3?'<path d="M14 31 L18 33"/>':v===4?'<path d="M28 21 Q34 16 39 21"/>':'<path d="M28 43 Q34 48 39 43"/>')),
 // Casinhas: telhado, chaminé e janelas.
 (v)=>svg('<path d="M8 30 L32 10 L56 30 V55 H8Z"/><path d="M25 55 V39 H39 V55"/><rect x="14" y="34" width="7" height="7" rx="1"/>'+(v===0?'<path d="M43 34 H50 V41 H43Z"/>':v===1?'<path d="M43 34 V41"/>':v===2?'<path d="M45 10 V19 H51 V15"/>':v===3?'<path d="M29 10 L32 7 L35 10"/>':v===4?'<path d="M8 30 H56"/>':'')),
 // Xícaras: alça, linha do líquido e detalhe da base.
 (v)=>svg('<path d="M12 20 H45 V43 Q45 54 33 54 H24 Q12 54 12 43Z"/><path d="M45 26 H50 Q59 26 57 36 Q56 43 45 43"/><path d="M18 59 H42"/>'+(v===0?'<path d="M17 29 H40"/>':v===1?'<path d="M17 32 Q28 28 40 32"/>':v===2?'<path d="M22 20 V16"/>':v===3?'<path d="M35 20 V16"/>':v===4?'<path d="M25 48 H33"/>':'')),
 // Borboletas: antena, ponto e pequena marca na asa.
 (v)=>svg('<path d="M31 30 C22 8 5 12 9 30 Q13 44 29 36 C20 53 8 57 17 59 Q29 59 32 40 C35 59 47 59 55 56 Q59 48 35 36 C51 44 60 35 55 22 Q49 8 33 30Z"/><path d="M31 27 Q25 15 21 12 M33 27 Q39 15 43 12"/>'+(v===0?'<circle cx="18" cy="28" r="2"/>':v===1?'<circle cx="46" cy="28" r="2"/>':v===2?'<path d="M17 39 Q22 35 25 39"/>':v===3?'<path d="M39 39 Q43 35 47 39"/>':v===4?'<path d="M30 31 L34 35"/>':'')),
 // Nuvens: uma gota/curva minúscula em posição diferente.
 (v)=>svg('<path d="M13 43 Q6 42 7 33 Q8 24 19 24 Q22 10 36 12 Q48 13 49 27 Q58 27 57 37 Q56 44 48 44Z"/>'+(v===0?'<path d="M20 49 Q17 53 20 57"/>':v===1?'<path d="M32 49 Q29 53 32 57"/>':v===2?'<path d="M44 49 Q41 53 44 57"/>':v===3?'<path d="M25 19 Q29 16 33 19"/>':v===4?'<path d="M38 20 Q42 18 45 21"/>':''))
];
const familyNames=["folha","flor","guarda-chuva","engrenagem","balão","peixe","casinha","xícara","borboleta","nuvem"];
function visualIcon(level,odd){const family=Math.floor((level-1)/5),variant=(level-1)%5;return drawings[family](odd?variant:99)}
// A mesma arte-base aparece em quase todo o quadro; a alteração é pequena e localizada.
function visualDifficulty(n){return n<=10?"ATENÇÃO":n<=20?"OBSERVAÇÃO":n<=30?"DESAFIADOR":n<=40?"DIFÍCIL":"EXTREMO"}
function visualCompleted(){try{const a=JSON.parse(localStorage.getItem(visualKey("completed"))||"[]");return Array.isArray(a)?a.filter(x=>Number.isInteger(x)&&x>=1&&x<=TOTAL_VISUAL_PHASES):[]}catch(e){return []}}
function setupVisualNavigation(){
 const head=document.querySelector("#phases .phase-head");
 if(head&&!document.getElementById("openVisualPhases")){
  const b=document.createElement("button");b.id="openVisualPhases";b.type="button";b.className="btn secondary";b.style.width="auto";b.style.padding="10px 13px";b.textContent="FASES DE DESENHOS";b.addEventListener("click",showVisualPhases);head.appendChild(b);
 }
 const section=visual$("visualPhases");
 if(section&&!section.querySelector(".visual-back")){
  const b=document.createElement("button");b.type="button";b.className="btn secondary visual-back";b.textContent="← VOLTAR ÀS 100 FASES";b.style.margin="0 0 12px";b.addEventListener("click",()=>window.showPhases&&window.showPhases());section.insertBefore(b,section.firstChild);
 }
}
function showVisualPhases(){
 if(visualTimer)clearTimeout(visualTimer);
 visual$("levelPill").textContent="ACHE O DESENHO DIFERENTE";
 visual$("visualPhaseList").innerHTML="";
 const done=visualCompleted();
 for(let i=1;i<=TOTAL_VISUAL_PHASES;i++){const b=document.createElement("button");b.className="phase-btn"+(done.includes(i)?" done":"");b.textContent=String(i).padStart(3,"0");b.setAttribute("aria-label","Abrir fase "+i);b.addEventListener("click",()=>startVisualPhase(i));visual$("visualPhaseList").appendChild(b)}
 show("visualPhases");
}
function startVisualPhase(n){visualLevel=Math.max(1,Math.min(TOTAL_VISUAL_PHASES,n));visualScore=0;visualLives=3;visualBest=Number(localStorage.getItem(visualKey("best"))||0)||0;visual$("levelPill").textContent="FASE "+visualLevel;show("visualGame");newVisualBoard()}
function updateVisualStats(){visual$("visualScore").textContent=visualScore;visual$("visualLives").textContent="❤️".repeat(visualLives)+"🖤".repeat(3-visualLives);visual$("visualBest").textContent=visualBest;visual$("levelPill").textContent="ACHE O DESENHO · FASE "+visualLevel;visual$("visualBar").style.width=(visualLevel/TOTAL_VISUAL_PHASES*100)+"%"}
function newVisualBoard(){
 if(visualTimer)clearTimeout(visualTimer);if(visualLives<=0)return endVisualGame();visualLocked=false;
 const n=visualSizeForLevel(visualLevel),total=n*n;visualOdd=Math.floor(Math.random()*total);
 visual$("visualLevelTag").textContent="FASE "+visualLevel+" · "+n+"×"+n;visual$("visualDifficulty").textContent=visualDifficulty(visualLevel);visual$("visualGridSize").textContent=total.toLocaleString("pt-BR")+" imagens";
 const grid=visual$("visualGrid");grid.innerHTML="";grid.style.gridTemplateColumns="repeat("+n+",minmax(0,1fr))";
 const frag=document.createDocumentFragment();
 for(let i=0;i<total;i++){const b=document.createElement("button");b.type="button";b.className="cell visual-cell";b.innerHTML=visualIcon(visualLevel,i===visualOdd);b.setAttribute("aria-label","Desenho "+(i+1));b.addEventListener("click",()=>chooseVisual(i,b));frag.appendChild(b)}
 grid.appendChild(frag);visual$("visualFeedback").className="feedback";visual$("visualFeedback").textContent="";updateVisualStats();
}
function chooseVisual(i,button){
 if(visualLocked||button.disabled)return;
 if(i===visualOdd){visualLocked=true;button.classList.add("correct");visualScore+=10+Math.min(visualLevel,20);if(visualScore>visualBest){visualBest=visualScore;localStorage.setItem(visualKey("best"),String(visualBest))}
 const done=visualCompleted();if(!done.includes(visualLevel)){done.push(visualLevel);done.sort((a,b)=>a-b);localStorage.setItem(visualKey("completed"),JSON.stringify(done))}
 visual$("visualFeedback").className="feedback show good";visual$("visualFeedback").textContent=visualLevel===TOTAL_VISUAL_PHASES?"Excelente! Você concluiu as 50 fases!":"Muito bem! Você encontrou o desenho diferente. Próxima fase…";updateVisualStats();
 visualTimer=setTimeout(()=>{if(visualLevel>=TOTAL_VISUAL_PHASES)endVisualCategory();else{visualLevel++;newVisualBoard()}},700);
 }else{visualLives--;button.classList.add("wrong");button.disabled=true;visual$("visualFeedback").className="feedback show bad";visual$("visualFeedback").textContent=visualLives>0?"Não é esse! Observe os pequenos detalhes e tente novamente.":"Suas vidas acabaram.";updateVisualStats();if(visualLives<=0){visualLocked=true;visualTimer=setTimeout(endVisualGame,850)}}
}
function endVisualGame(){show("visualFinish");visual$("visualFinishText").textContent="Você chegou à fase "+visualLevel+" de 50. Seu progresso continua salvo.";visual$("visualFinalScore").textContent=visualScore+" pontos · Recorde: "+visualBest;visual$("levelPill").textContent="FIM DE JOGO"}
function endVisualCategory(){show("visualFinish");visual$("visualFinishText").textContent="Você completou as 50 fases de Ache o Desenho Diferente!";visual$("visualFinalScore").textContent=visualScore+" pontos · Recorde: "+visualBest;visual$("levelPill").textContent="DESAFIOS CONCLUÍDOS"}
function restartVisual(){startVisualPhase(visualLevel)}
window.showVisualPhases=showVisualPhases;window.startVisualPhase=startVisualPhase;window.newVisualBoard=newVisualBoard;window.restartVisual=restartVisual;setupVisualNavigation();
})();