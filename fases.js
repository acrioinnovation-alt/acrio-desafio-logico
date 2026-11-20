// Catálogo gerado localmente: 1.000 desafios com solução e dica.
(function(){
 const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
 const pick=a=>a[rand(0,a.length-1)];
 const rows=[];
 const add=(category,question,answer,explanation,hint,difficulty)=>rows.push({id:0,category,question,answer:String(answer),explanation,hint,difficulty});
 const bands=["Fácil","Intermediária","Difícil","Especialista"];
 const names=[["gato","cachorro","coelho"],["pato","gato","tartaruga"],["raposa","coelho","cachorro"],["cavalo","ovelha","gato"],["coelho","pato","cabra"]];
 const fruits=[["maçã","banana","uva"],["pera","limão","morango"],["laranja","kiwi","cereja"],["abacaxi","ameixa","melancia"],["manga","pêssego","jabuticaba"]];
 // 150 desafios de palitos: retirar um traço do + transforma-o em −.
 for(let i=0;i<150;i++){let a=rand(5,30),b=rand(1,a-1),d=bands[Math.min(3,Math.floor(i/38))];add("Palitos",`Um palito foi retirado do sinal + e colocado de lado, transformando a operação em −. Na expressão ${a} + ${b}, qual é o resultado depois da mudança?`,a-b,`O sinal + vira −. Então ${a} − ${b} = ${a-b}.`,"Lembre-se: ao retirar o traço vertical, o sinal de adição vira subtração.",d)}
 // 200 balanças de três animais.
 for(let i=0;i<200;i++){let [a,b,c]=pick(names),wa=rand(2,12),wb=rand(3,15),wc=rand(2,16),sum=wa+wb+wc,d=bands[Math.min(3,Math.floor(i/50))];let mode=i%3;
 if(mode===0)add("Balança dos animais",`A balança mostra ${a} + ${b} = ${wa+wb} kg e ${b} + ${c} = ${wb+wc} kg. Sabendo que ${b} pesa ${wb} kg, quanto pesa ${c}?`,wc,`${c} = ${wb+wc} − ${wb} = ${wc} kg.`,"Use o peso conhecido para retirar uma parte da soma.",d);
 else if(mode===1)add("Balança dos animais",`Três pesagens foram feitas: ${a}+${b}=${wa+wb} kg; ${a}+${c}=${wa+wc} kg. Se ${a} pesa ${wa} kg, quanto pesam os três animais juntos?`,sum,`Os pesos são ${wa}, ${wb} e ${wc} kg. Somando: ${wa}+${wb}+${wc}=${sum} kg.`,"Descubra o peso que falta e depois some os três.",d);
 else add("Balança dos animais",`Na primeira balança, ${a}+${b} pesam ${wa+wb} kg. Na segunda, ${b}+${c} pesam ${wb+wc} kg. Se ${a} pesa ${wa} kg e ${b} pesa ${wb} kg, qual é o peso de ${c}?`,wc,`A segunda pesagem informa ${wb+wc} kg. Retirando os ${wb} kg de ${b}, restam ${wc} kg.`,"Compare as pesagens e isole o animal pedido.",d)}
 // 100 atenção visual.
 for(let i=0;i<100;i++){let pairs=[["0","O"],["1","I"],["5","S"],["8","B"],["Q","O"]], [target,other]=pick(pairs),n=rand(12,25),pos=rand(1,n),arr=Array(n).fill(other);arr[pos-1]=target;add("Atenção visual",`Encontre o símbolo diferente e informe sua posição, contando da esquerda: ${arr.join(" ")}`,pos,`O símbolo diferente (${target}) está na posição ${pos}.`,"Compare a forma de cada caractere com calma.",bands[Math.min(3,Math.floor(i/25))])}
 // 200 matemática com frutas.
 for(let i=0;i<200;i++){let [f1,f2,f3]=pick(fruits),x=rand(2,12),y=rand(1,10),z=rand(1,9),mode=i%4,d=bands[Math.min(3,Math.floor(i/50))];
 if(mode===0)add("Matemática com figuras",`${f1} + ${f1} = ${2*x}. Se ${f1} + ${f2} = ${x+y}, quanto vale ${f2}?`,y,`Cada ${f1} vale ${x}. Portanto, ${f2} = ${x+y} − ${x} = ${y}.`,"Descubra primeiro o valor de uma fruta que aparece duas vezes.",d);
 else if(mode===1)add("Matemática com figuras",`Considere ${f1}=${x}, ${f2}=${y} e ${f3}=${z}. Calcule: (${f1} + ${f2}) × ${f3}.`,(x+y)*z,`Primeiro: ${x}+${y}=${x+y}. Depois: ${x+y}×${z}=${(x+y)*z}.`,"Resolva primeiro o que está entre parênteses.",d);
 else if(mode===2)add("Matemática com figuras",`Uma cesta tem 2 ${f1} e 1 ${f2}, totalizando ${2*x+y} pontos. Cada ${f1} vale ${x}. Quantos pontos vale ${f2}?`,y,`Os dois ${f1} valem ${2*x}. Sobram ${2*x+y} − ${2*x} = ${y} pontos.`,"Retire do total o valor das duas frutas iguais.",d);
 else add("Matemática com figuras",`Se ${f1} vale ${x}, ${f2} vale ${y} e ${f3} vale ${z}, calcule: ${f1} × ${f2} − ${f3}.`,x*y-z,`Substituindo: ${x} × ${y} − ${z} = ${x*y} − ${z} = ${x*y-z}.`,"Troque cada figura pelo valor indicado e respeite a ordem das operações.",d)}
 // 100 alturas e medidas.
 for(let i=0;i<100;i++){let h=rand(130,180),up=rand(5,18),down=rand(2,12),mode=i%3,d=bands[Math.min(3,Math.floor(i/25))];
 if(mode===0)add("Alturas e medidas",`Uma pessoa mede ${h} cm. Outra é ${up} cm mais alta. Qual é a altura da segunda pessoa?`,h+up,`Some: ${h} + ${up} = ${h+up} cm.`,"Mais alto significa adicionar a diferença.",d);
 else if(mode===1)add("Alturas e medidas",`Uma estante tem ${h+up} cm. Um armário é ${down} cm mais baixo. Qual é a altura do armário?`,h+up-down,`Subtraia a diferença: ${h+up} − ${down} = ${h+up-down} cm.`,"Mais baixo significa subtrair a diferença.",d);
 else add("Alturas e medidas",`Três caixas medem ${h} cm, ${h+up} cm e uma terceira que é ${down} cm menor que a segunda. Qual é a altura da terceira?`,h+up-down,`A segunda mede ${h+up} cm. A terceira mede ${h+up} − ${down} = ${h+up-down} cm.`,"Use a comparação com a segunda caixa.",d)}
 // 150 charadas e lógica, com situações variáveis.
 const riddles=[
 ["O que fica mais molhado quanto mais seca?","toalha","A toalha absorve a água enquanto seca outra coisa."],
 ["Tenho cidades, rios e florestas, mas não tenho casas, água nem árvores reais. O que sou?","mapa","O mapa representa esses lugares, mas não os contém de verdade."],
 ["O que pode viajar o mundo inteiro sem sair do canto?","selo","O selo fica no canto do envelope durante a viagem."],
 ["Quanto mais se tira, maior fica. O que é?","buraco","Retirar terra faz o buraco aumentar."],
 ["O que tem muitas teclas, mas não abre nenhuma porta?","piano","As teclas do piano não são chaves de fechadura."],
 ["O que tem pescoço, mas não tem cabeça?","garrafa","A parte estreita da garrafa é chamada de gargalo ou pescoço."],
 ["O que é seu, mas as outras pessoas usam mais do que você?","nome","As outras pessoas dizem seu nome ao conversar com você."],
 ["O que sobe com o passar do tempo e nunca volta?","idade","A idade aumenta continuamente."],
 ["O que tem dentes, mas não morde?","pente","Os dentes do pente servem para pentear."],
 ["O que pode ser quebrado sem ser tocado?","promessa","Uma promessa pode ser descumprida sem contato físico."],
 ["Duas mães e duas filhas saíram juntas, mas eram só três pessoas. Como?","avo mae filha","São avó, mãe e filha: três pessoas formam dois pares de mãe e filha."],
 ["Você entra num quarto escuro com uma vela e um fósforo. O que acende primeiro?","fosforo","É necessário acender o fósforo antes da vela."],
 ["Um barco tem uma escada na lateral. A maré sobe, a água cobre mais o casco. O que acontece com a parte submersa da escada?","continua igual","O barco flutua e sobe junto com a maré."],
 ["Um médico dá três comprimidos e manda tomar um a cada meia hora. Em quanto tempo termina?","uma hora","O primeiro é tomado na hora zero, o segundo em 30 minutos e o terceiro em 60 minutos."],
 ["Um pai tem quatro filhas e cada filha tem um irmão. Quantos filhos ele tem?","cinco","As quatro filhas compartilham o mesmo irmão: são cinco filhos."]
 ];
 for(let i=0;i<150;i++){let r=riddles[i%riddles.length];add("Charadas e lógica",r[0],r[1],r[2],"Leia literalmente e procure um significado alternativo para as palavras.",bands[Math.min(3,Math.floor(i/38))])}
 // 100 sequências.
 for(let i=0;i<100;i++){let mode=i%4,d=bands[Math.min(3,Math.floor(i/25))];
 if(mode===0){let a=rand(1,30),step=rand(2,12),v=[a,a+step,a+2*step,a+3*step],ans=a+4*step;add("Sequências numéricas",`Complete: ${v.join(", ")}, __`,ans,`A sequência aumenta de ${step} em ${step}; ${v[3]}+${step}=${ans}.`,"Calcule a diferença entre termos consecutivos.",d)}
 else if(mode===1){let a=rand(2,8),m=2,v=[a,a*m,a*m*m,a*m*m*m],ans=v[3]*m;add("Sequências numéricas",`Qual é o próximo número? ${v.join(", ")}, __`,ans,`Cada termo é multiplicado por ${m}; ${v[3]}×${m}=${ans}.`,"Observe se a sequência está multiplicando em vez de somar.",d)}
 else if(mode===2){let a=rand(1,10),b=rand(2,12),v=[a,b,a+b,a+2*b],ans=2*a+3*b;add("Sequências numéricas",`Descubra a regra: ${v.join(", ")}, __`,ans,`Cada termo é a soma dos dois anteriores: ${a+b}+${a+2*b}=${ans}.`,"Tente somar os dois termos anteriores.",d)}
 else {let n=rand(2,12),v=[n*n,(n+1)**2,(n+2)**2,(n+3)**2],ans=(n+4)**2;add("Sequências numéricas",`Complete a sequência de quadrados: ${v.join(", ")}, __`,ans,`São quadrados consecutivos; o próximo é ${n+4}² = ${ans}.`,"Pense nos quadrados de números inteiros consecutivos.",d)}}
 // Distribute and shuffle inside each difficulty band so categories are intercalated.
 const ordered=[];
 for(const d of bands){const part=rows.filter(x=>x.difficulty===d);for(let i=part.length-1;i>0;i--){let j=rand(0,i);[part[i],part[j]]=[part[j],part[i]]}ordered.push(...part)}
 ordered.forEach((p,i)=>p.id=i+1);
 window.PHASES=ordered;
})();