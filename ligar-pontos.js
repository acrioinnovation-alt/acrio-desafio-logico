(()=>{
"use strict";
const $=id=>document.getElementById(id);
const layouts=[
{n:"Triângulo duplo",p:[[15,18],[50,18],[85,18],[15,50],[50,50],[85,50],[15,82],[50,82],[85,82]],c:[[0,1,4,3],[1,2,5,4],[3,4,7,6],[4,5,8,7],[0,1,2,5,8,7,6,3]]},
{n:"Estrela",p:[[50,8],[72,28],[92,50],[72,72],[50,92],[28,72],[8,50],[28,28],[50,50]],c:[[0,2,4,6],[1,3,5,7],[0,1,8,7],[2,3,8,1],[4,5,8,3],[6,7,8,5]]},
{n:"Casa geométrica",p:[[15,45],[50,12],[85,45],[85,85],[15,85],[50,45],[50,85],[50,63]],c:[[0,1,2,5,0],[0,4,6,5,0],[2,3,6,5,2],[1,5,7,1]]},
{n:"Hexágonos",p:[[25,15],[50,15],[75,15],[12,50],[38,50],[62,50],[88,50],[25,85],[50,85],[75,85]],c:[[0,1,4,3],[1,2,5,4],[2,6,5],[3,4,7],[4,5,8],[5,6,9,8],[0,1,2,6,9,8,7,3]]},
{n:"Pipa",p:[[50,8],[82,38],[50,68],[18,38],[50,38],[50,92]],c:[[0,1,2,3],[0,4,2,1],[3,4,1,2],[2,5,4,2]]},
{n:"Flor de seis pétalas",p:[[50,50],[50,10],[78,30],[78,70],[50,90],[22,70],[22,30]],c:[[0,1,2],[0,2,3],[0,3,4],[0,4,5],[0,5,6],[0,6,1]]},
{n:"Diamantes",p:[[50,10],[90,50],[50,90],[10,50],[50,50],[30,30],[70,30],[70,70],[30,70]],c:[[0,5,4,6],[6,1,7,4],[4,7,2,8],[8,3,5,4],[0,1,2,3]]},
{n:"Ponte",p:[[10,25],[35,25],[65,25],[90,25],[10,75],[35,75],[65,75],[90,75]],c:[[0,1,5,4],[1,2,6,5],[2,3,7,6],[0,1,2,3,7,6,5,4]]},
{n:"Espiral quadrada",p:[[15,15],[50,15],[85,15],[85,50],[85,85],[50,85],[15,85],[15,50],[35,35],[65,35],[65,65],[35,65]],c:[[0,1,2,3,4,5,6,7,0],[8,9,10,11,8],[0,1,9,8,7,6,11,10,5,4,3,2]]},
{n:"Constelação",p:[[15,20],[50,10],[85,20],[90,55],[65,88],[35,88],[10,55],[50,50]],c:[[0,1,7,6],[1,2,7],[2,3,7],[3,4,7],[4,5,7],[5,6,7],[6,0,7],[0,1,2,3,4,5,6]]}
];
const levels=[];
layouts.forEach((l,k)=>{for(let v=0;v<5;v++){const cycles=l.c.slice(0,Math.min(l.c.length,Math.max(2,2+v)));levels.push({name:l.n,points:l.p,cycles,difficulty:v===0?"FÁCIL":v===1?"FÁCIL":v===2?"MÉDIO":v===3?"DIFÍCIL":"DESAFIADOR"});}});
let current=1,points=[],edges=[],visited=new Set(),active=false,activeNode=-1,pointerId=null,moves=0;
const key=(a,b)=>a<b?a+"-"+b:b+"-"+a;
function build(level){points=level.points.map(([x,y],id)=>({id,x,y}));edges=[];const seen=new Set();const cycles=[points.map((_,i)=>i),...level.cycles];cycles.forEach(c=>{for(let i=0;i<c.length;i++){const a=c[i],b=c[(i+1)%c.length],k=key(a,b);if(a!==b&&!seen.has(k)){seen.add(k);edges.push({a,b,key:k});}}});}
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");}
function completed(){try{return JSON.parse(localStorage.getItem("dots_no_repeat_done")||"[]")}catch(e){return[]}}
function showDotsPhases(){const list=$("dotsPhaseList");list.innerHTML="";const done=completed();for(let i=1;i<=50;i++){const b=document.createElement("button");b.className="phase-btn"+(done.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.addEventListener("click",()=>startDots(i));list.appendChild(b);} $("dotsDone").textContent=done.length+"/50";$("levelPill").textContent="LIGAR OS PONTOS";show("dotsPhases");}
function startDots(n){current=Math.max(1,Math.min(50,n));const l=levels[current-1];build(l);visited=new Set();active=false;activeNode=-1;pointerId=null;moves=0;$("dotsLevel").textContent="FASE "+current+" · LIGAR OS PONTOS";$("dotsName").textContent=l.name;$("dotsDifficulty").textContent=l.difficulty;$("dotsMoves").textContent="0";$("dotsDone").textContent=completed().length+"/50";$("dotsProgress").style.width=current*2+"%";$("dotsFeedback").className="feedback";$("dotsFeedback").textContent="";$("levelPill").textContent="FASE "+current;draw();show("dotsGame");}
let svg=null,lineEls=[],nodeEls=[];
function draw(){const box=$("dotsBoard");box.innerHTML="";svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 100 100");svg.setAttribute("role","img");svg.setAttribute("aria-label","Pontos ligados por segmentos");lineEls=[];nodeEls=[];edges.forEach(e=>{const el=document.createElementNS(svg.namespaceURI,"line");el.setAttribute("x1",points[e.a].x);el.setAttribute("y1",points[e.a].y);el.setAttribute("x2",points[e.b].x);el.setAttribute("y2",points[e.b].y);el.setAttribute("class","dots-edge");svg.appendChild(el);lineEls.push(el);});points.forEach(p=>{const el=document.createElementNS(svg.namespaceURI,"circle");el.setAttribute("cx",p.x);el.setAttribute("cy",p.y);el.setAttribute("r","3.4");el.setAttribute("class","dots-node");svg.appendChild(el);nodeEls.push(el);});box.appendChild(svg);svg.addEventListener("pointerdown",down);svg.addEventListener("pointermove",move);svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);paint();}
function paint(){lineEls.forEach((el,i)=>el.setAttribute("class","dots-edge"+(visited.has(edges[i].key)?" used":"")));nodeEls.forEach((el,i)=>el.setAttribute("class","dots-node"+(active&&i===activeNode?" current":"")+(visited.size&&edges.some(e=>visited.has(e.key)&&(e.a===i||e.b===i))?" touched":"")));}
function nearest(e){const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;let id=-1,d=1e9;points.forEach(p=>{const q=Math.hypot(p.x-x,p.y-y);if(q<d){d=q;id=p.id;}});return d<9?id:-1;}
function down(e){const id=nearest(e);if(id<0||visited.size)return;e.preventDefault();svg.setPointerCapture(e.pointerId);pointerId=e.pointerId;active=true;activeNode=id;msg("good","Continue seguindo as linhas conectadas sem soltar o dedo.");paint();}
function move(e){if(!active||e.pointerId!==pointerId)return;const id=nearest(e);if(id<0||id===activeNode)return;const edge=edges.find(x=>(x.a===activeNode&&x.b===id)||(x.b===activeNode&&x.a===id));if(!edge){msg("bad","Esses pontos não estão ligados diretamente. Siga um segmento existente.");return;}if(visited.has(edge.key)){msg("bad","Esse segmento já foi usado. Não pode repetir.");return;}visited.add(edge.key);activeNode=id;moves++;$("dotsMoves").textContent=String(moves);paint();if(visited.size===edges.length){active=false;pointerId=null;finish();}}
function up(e){if(!active||e.pointerId!==pointerId)return;active=false;pointerId=null;if(visited.size!==edges.length){visited.clear();moves=0;$("dotsMoves").textContent="0";paint();msg("bad","Você soltou antes de terminar. A fase foi reiniciada; tente novamente sem levantar o dedo.");}}
function msg(type,t){const f=$("dotsFeedback");f.className="feedback show "+type;f.textContent=t;}
function finish(){const done=completed();if(!done.includes(current)){done.push(current);localStorage.setItem("dots_no_repeat_done",JSON.stringify(done));} $("dotsDone").textContent=done.length+"/50";msg("good",current===50?"Incrível! Você concluiu as 50 fases!":"Muito bem! Você percorreu todos os segmentos sem repetir nenhum.");if(current<50){const b=document.createElement("button");b.className="btn primary start";b.textContent="PRÓXIMA FASE →";b.addEventListener("click",()=>startDots(current+1));$("dotsFeedback").appendChild(b);}}
function resetDots(){startDots(current);}
window.showDotsPhases=showDotsPhases;window.startDots=startDots;window.resetDots=resetDots;
})();