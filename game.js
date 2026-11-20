let current=Number(localStorage.getItem("dl_current")||1), streak=0;
let solved=new Set(JSON.parse(localStorage.getItem("dl_solved")||"[]"));
const total=PHASES.length;
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active")}
function startGame(){if(current>total){show("finish");return}show("game");render()}
function goHome(){show("home")}
function render(){const p=PHASES[current-1];if(!p){show("finish");return}
$("levelPill").textContent="FASE "+current+" / "+total.toLocaleString("pt-BR");
$("category").textContent=p.category.toUpperCase();$("difficulty").textContent=p.difficulty.toUpperCase();
$("question").textContent=p.question;$("answer").value="";$("answer").disabled=false;
$("feedback").className="feedback";$("feedback").textContent="";$("nextBtn").disabled=!solved.has(current);
$("done").textContent=solved.size;$("streak").textContent=streak;
$("percent").textContent=Math.floor(solved.size/total*100)+"%";$("bar").style.width=(current/total*100)+"%"}
function norm(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[.,!?;:]/g,"").replace(/\s+/g," ").trim()}
function checkAnswer(){const p=PHASES[current-1],v=norm($("answer").value),a=norm(p.answer);if(!v)return;
let ok=v===a;if(!ok&&v!==""&&a!==""&&!isNaN(Number(v))&&!isNaN(Number(a)))ok=Number(v)===Number(a);
const f=$("feedback");if(ok){f.className="feedback show good";f.innerHTML="<b>Resposta correta! ✨</b><br>"+p.explanation;solved.add(current);localStorage.setItem("dl_solved",JSON.stringify([...solved]));$("nextBtn").disabled=false;$("answer").disabled=true;streak++}else{f.className="feedback show bad";f.innerHTML="<b>Não foi dessa vez.</b> Revise as pistas e tente novamente.";streak=0}
$("done").textContent=solved.size;$("streak").textContent=streak;$("percent").textContent=Math.floor(solved.size/total*100)+"%"}
function showHint(){const p=PHASES[current-1],f=$("feedback");f.className="feedback show";f.textContent="DICA: "+p.hint}
function nextPhase(){if(!solved.has(current))return;current++;localStorage.setItem("dl_current",current);if(current>total)show("finish");else render()}
function restart(){current=1;streak=0;solved.clear();localStorage.removeItem("dl_current");localStorage.removeItem("dl_solved");startGame()}
$("answer").addEventListener("keydown",e=>{if(e.key==="Enter")checkAnswer()});