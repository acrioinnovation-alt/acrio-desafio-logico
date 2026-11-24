(()=>{
"use strict";
const $=id=>document.getElementById(id);
const base=[
{name:"Barquinho",icon:"⛵",p:[[12,58],[25,76],[75,76],[88,58],[50,58],[50,18]]},
{name:"Casinha",icon:"⌂",p:[[18,84],[18,48],[50,18],[82,48],[82,84],[50,84],[50,58]]},
{name:"Peixe",icon:"🐟",p:[[18,50],[5,32],[5,68],[18,50],[35,72],[65,72],[82,50],[65,28],[35,28],[18,50]]},
{name:"Gato",icon:"🐈",p:[[22,78],[22,38],[12,16],[38,30],[62,30],[88,16],[78,38],[78,78]]},
{name:"Avião",icon:"✈",p:[[50,8],[50,58],[12,78],[50,68],[88,78],[50,92]]},
{name:"Árvore",icon:"♣",p:[[50,92],[50,70],[22,70],[40,48],[18,48],[50,10],[82,48],[60,48],[78,70]]},
{name:"Guarda-chuva",icon:"☂",p:[[10,48],[25,24],[50,12],[75,24],[90,48],[70,40],[50,48],[30,40],[10,48]]},
{name:"Flor",icon:"✿",p:[[50,50],[50,12],[68,28],[88,25],[76,48],[88,68],[64,68],[50,90],[36,68],[12,68],[24,48],[12,25],[32,28],[50,12]]},
{name:"Carro",icon:"🚗",p:[[12,68],[20,48],[35,48],[48,26],[72,26],[84,48],[92,52],[92,72],[12,72],[12,68]]},
{name:"Foguete",icon:"🚀",p:[[50,8],[70,34],[70,68],[86,82],[66,78],[50,92],[34,78],[14,82],[30,68],[30,34],[50,8]]}
];
function makePath(src,variant){
 // Mantém os desenhos-base limpos e reconhecíveis em todas as dificuldades.
 // A progressão ocorre pela escolha/ordem das figuras, não por rabiscos aleatórios.
 return src.map(([x,y])=>[x,y]);
}
const levels=[];
for(let i=0;i<50;i++){
 const motif=base[i%10],tier=Math.floor(i/10);
 levels.push({name:motif.name,icon:motif.icon,points:makePath(motif.p,tier),difficulty:tier===0?"FÁCIL":tier===1?"FÁCIL":tier===2?"MÉDIO":tier===3?"DIFÍCIL":"DESAFIADOR"});
}
let current=1,active=false,visited=new Set(),edges=[],nodes=[],adj={},moves=0,score=0;
const key=(a,b)=>a<b?a+"-"+b:b+"-"+a;
function buildGraph(level){
 const ids=new Map();
 nodes=[];
 level.points.forEach(([x,y])=>{
  const coord=x+","+y;
  if(!ids.has(coord)){const id=nodes.length;ids.set(coord,id);nodes.push({id,x,y});}
 });
 edges=[];adj={};const seen=new Set();
 for(let i=0;i<level.points.length-1;i++){
  const a=ids.get(level.points[i][0]+","+level.points[i][1]);
  const b=ids.get(level.points[i+1][0]+","+level.points[i+1][1]);
  const k=key(a,b);
  if(a===b||seen.has(k))continue;
  seen.add(k);edges.push({a,b,key:k});(adj[a]??=[]).push(b);(adj[b]??=[]).push(a);
 }
}
function showOneStrokePhases(){
 const list=$("oneStrokePhaseList");list.innerHTML="";
 let done=[];try{done=JSON.parse(localStorage.getItem("one_stroke_done")||"[]")}catch(e){}
 for(let i=1;i<=50;i++){
  const b=document.createElement("button");b.className="phase-btn"+(done.includes(i)?" done":"");b.textContent=String(i).padStart(2,"0");b.addEventListener("click",()=>startOneStroke(i));list.appendChild(b);
 }
 $("levelPill").textContent="UM SÓ TRAÇO";show("oneStrokePhases");
}
function startOneStroke(n){
 current=Math.max(1,Math.min(50,n));visited=new Set();moves=0;active=false;
 const level=levels[current-1];buildGraph(level);
 $("oneStrokeTag").textContent="FASE "+current+" · UM SÓ TRAÇO";
 $("oneStrokeName").textContent=level.icon+" "+level.name;
 $("oneStrokeDifficulty").textContent=level.difficulty;
 $("oneStrokeInstruction").textContent="Comece em qualquer bolinha. Passe por todos os trechos sem levantar o dedo e sem repetir linhas.";
 $("oneStrokeFeedback").className="feedback";$("oneStrokeFeedback").textContent="";
 $("oneStrokeMoves").textContent="0";$("oneStrokeDone").textContent=doneCount()+"/50";
 $("oneStrokeBest").textContent=Number(localStorage.getItem("one_stroke_best")||0);
 $("oneStrokeBar").style.width=(current/50*100)+"%";
 draw();$("levelPill").textContent="FASE "+current+" · UM SÓ TRAÇO";show("oneStrokeGame");
}
function doneCount(){try{return JSON.parse(localStorage.getItem("one_stroke_done")||"[]").length}catch(e){return 0}}
let svgElement=null,lineElements=[],nodeElements=[];
function draw(){
 const box=$("oneStrokeBoard");box.innerHTML="";
 svgElement=document.createElementNS("http://www.w3.org/2000/svg","svg");svgElement.setAttribute("viewBox","0 0 100 100");svgElement.setAttribute("role","img");svgElement.setAttribute("aria-label","Figura formada por linhas conectadas");
 lineElements=[];nodeElements=[];
 edges.forEach(e=>{const l=document.createElementNS(svgElement.namespaceURI,"line");l.setAttribute("x1",nodes[e.a].x);l.setAttribute("y1",nodes[e.a].y);l.setAttribute("x2",nodes[e.b].x);l.setAttribute("y2",nodes[e.b].y);l.setAttribute("class","one-stroke-edge");svgElement.appendChild(l);lineElements.push(l)});
 nodes.forEach(n=>{const dot=document.createElementNS(svgElement.namespaceURI,"circle");dot.setAttribute("cx",n.x);dot.setAttribute("cy",n.y);dot.setAttribute("r","2.8");dot.setAttribute("class","one-stroke-node");svgElement.appendChild(dot);nodeElements.push(dot)});
 box.appendChild(svgElement);svgElement.addEventListener("pointerdown",onDown);svgElement.addEventListener("pointermove",onMove);svgElement.addEventListener("pointerup",onUp);svgElement.addEventListener("pointercancel",onUp);updateDrawing();
}
function updateDrawing(){
 lineElements.forEach((el,i)=>el.setAttribute("class","one-stroke-edge"+(visited.has(edges[i].key)?" used":"")));
 nodeElements.forEach((el,i)=>{el.setAttribute("r",active&&i===activeNode?"4.5":"2.8");el.setAttribute("class","one-stroke-node"+(active&&i===activeNode?" current":""))});
}
let activeNode=null,pointerId=null;
function nearestNode(evt){
 const svg=evt.currentTarget,rect=svg.getBoundingClientRect(),x=(evt.clientX-rect.left)/rect.width*100,y=(evt.clientY-rect.top)/rect.height*100;
 let best=-1,dist=Infinity;nodes.forEach(n=>{const d=Math.hypot(n.x-x,n.y-y);if(d<dist){dist=d;best=n.id}});
 return dist<8?best:-1;
}
function onDown(e){
 const n=nearestNode(e);if(n<0)return;
 e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pointerId=e.pointerId;active=true;activeNode=n;updateDrawing();
}
function onMove(e){
 if(!active||e.pointerId!==pointerId)return;
 const n=nearestNode(e);if(n<0||n===activeNode)return;
 const edge=edges.find(v=>v.key===key(activeNode,n));
 if(!edge){feedback("bad","Esse ponto não está ligado ao atual. Continue por uma linha conectada.");return}
 if(visited.has(edge.key)){feedback("bad","Você já passou por esse trecho. Não pode repetir linhas.");return}
 visited.add(edge.key);activeNode=n;moves++;$("oneStrokeMoves").textContent=String(moves);
 updateDrawing();
 if(visited.size===edges.length){active=false;pointerId=null;finishOneStroke()}
}
function onUp(e){if(pointerId!==null&&e.pointerId===pointerId){active=false;pointerId=null;draw()}}
function feedback(type,msg){const f=$("oneStrokeFeedback");f.className="feedback show "+type;f.textContent=msg}
function finishOneStroke(){
 let done=[];try{done=JSON.parse(localStorage.getItem("one_stroke_done")||"[]")}catch(e){}
 if(!done.includes(current)){done.push(current);localStorage.setItem("one_stroke_done",JSON.stringify(done))}
 score=done.length;localStorage.setItem("one_stroke_best",String(Math.max(score,Number(localStorage.getItem("one_stroke_best")||0))));
 $("oneStrokeDone").textContent=done.length+"/50";$("oneStrokeBest").textContent=localStorage.getItem("one_stroke_best");
 feedback("good",current===50?"Parabéns! Você concluiu as 50 fases!":"Muito bem! Você percorreu todas as linhas sem repetir nenhum trecho.");
 if(current<50){const next=document.createElement("button");next.className="btn primary start";next.textContent="PRÓXIMA FASE →";next.addEventListener("click",()=>startOneStroke(current+1));$("oneStrokeFeedback").appendChild(next)}
}
function resetOneStroke(){startOneStroke(current)}
window.showOneStrokePhases=showOneStrokePhases;window.startOneStroke=startOneStroke;window.resetOneStroke=resetOneStroke;
})();