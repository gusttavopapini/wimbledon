// Dados demonstrativos — Saúde na Palma da Mão (fictícios, região de Recife)
(function(){
const T='2026-11-19';
const C={
  gracas:{name:'Clínica Coração das Graças',addr:'Rua das Graças, 210 — Graças, Recife/PE · 52011-200',phone:'(81) 3000-0101',km:1.2,x:62,y:30,acc:['Rampa na entrada','Elevador','Banheiro adaptado','Atendimento prioritário 60+']},
  boavista:{name:'Centro Médico Boa Vista',addr:'Rua da Aurora, 845 — Boa Vista, Recife/PE · 50050-000',phone:'(81) 3000-0202',km:2.6,x:84,y:52,acc:['Elevador','Cadeira de rodas disponível','Atendimento prioritário 60+']},
  derby:{name:'Clínica Derby Saúde',addr:'Av. Agamenon Magalhães, 1500 — Derby, Recife/PE · 52010-040',phone:'(81) 3000-0303',km:3.4,x:36,y:74,acc:['Rampa na entrada','Vaga preferencial no estacionamento','Banheiro adaptado']},
  casaforte:{name:'Clínica Casa Forte',addr:'Av. Dezessete de Agosto, 980 — Casa Forte, Recife/PE · 52060-590',phone:'(81) 3000-0404',km:3.9,x:18,y:20,acc:['Atendimento no térreo, sem escadas','Banheiro adaptado','Estacionamento']},
  madalena:{name:'Instituto Madalena',addr:'Rua Real da Torre, 450 — Madalena, Recife/PE · 50610-000',phone:'(81) 3000-0505',km:2.1,x:12,y:56,acc:['Elevador','Piso tátil','Atendimento prioritário 60+']},
  espinheiro:{name:'Clínica Espinheiro',addr:'Rua do Espinheiro, 300 — Espinheiro, Recife/PE · 52020-020',phone:'(81) 3000-0606',km:0.9,x:56,y:14,acc:['Rampa na entrada','Elevador','Banheiro adaptado']},
  boaviagem:{name:'Clínica Boa Viagem Saúde',addr:'Av. Conselheiro Aguiar, 2200 — Boa Viagem, Recife/PE · 51020-020',phone:'(81) 3000-0707',km:7.8,x:74,y:88,acc:['Elevador','Vaga preferencial no estacionamento']},
  lab:{name:'Laboratório Recife Análises',addr:'Rua do Espinheiro, 512 — Espinheiro, Recife/PE',phone:'(81) 3000-0808',km:1.0,x:50,y:20,acc:[]}
};
// [rótulo, nome curto, profissional, ilustração (opcional)] — as 9 primeiras seguem a ordem da proposta de Especialidades
const S=[['Cardiologia','Cardiologia','Cardiologista','assets/ilustracoes/coracao.png'],['Gastroenterologia','Gastro­enterologia','Gastroenterologista','assets/ilustracoes/estomago.png'],['Neurologia','Neurologia','Neurologista','assets/ilustracoes/cerebro.png'],['Clínico Geral','Clínico Geral','Clínico geral','assets/ilustracoes/clinico-geral.png'],['Ortopedia','Ortopedia','Ortopedista','assets/ilustracoes/ortopedia.png'],['Ginecologia','Ginecologia','Ginecologista','assets/ilustracoes/ginecologia.png'],['Dermatologia','Dermatologia','Dermatologista','assets/ilustracoes/dermatologia.png'],['Imunologia','Imunologia','Imunologista','assets/ilustracoes/imunologia.png'],['Obstetrícia','Obstetrícia','Obstetra','assets/ilustracoes/obstetricia.png'],['Nefrologia','Nefrologia','Nefrologista','assets/ilustracoes/nefrologia.png'],['Pneumologia','Pneumologia','Pneumologista','assets/ilustracoes/pneumologia.png'],['Coloproctologia','Colo­proctologia','Coloproctologista','assets/ilustracoes/coloproctologia.png'],['Odontologia','Odontologia','Dentista','assets/ilustracoes/odontologia.png']]
  .map(([label,short,pro,illo])=>{const old='assets/icons/specialties/'+label.toLowerCase()+'.png';const hasOld=['cardiologia','gastroenterologia','neurologia','nefrologia','pneumologia','coloproctologia','ortopedia','odontologia'].includes(label.toLowerCase());return {label,short,pro,img:hasOld?old:illo,illo:illo||old};});
const M=(id,name,spec,clinic,price,crm,conv,bio)=>({id,name,spec,clinic,price,crm,conv,bio});
const docs=[
  M('carlos','Dr. Carlos Ribeiro','Cardiologia','gracas',280,'CRM-PE 12.345',true,'Cardiologista há 22 anos. Acompanha pressão alta e cuida de muitos pacientes acima de 60 anos, com consultas sem pressa.'),
  M('juliana','Dra. Juliana Goes','Cardiologia','boavista',220,'CRM-PE 15.872',true,'Atua na prevenção de doenças do coração e na reabilitação após internações. Explica cada etapa com calma.'),
  M('paulo','Dr. Paulo Gomes','Cardiologia','derby',190,'CRM-PE 18.204',false,'Cardiologista há 35 anos. Acompanha arritmias, cansaço e inchaço nas pernas, com atenção especial a pacientes acima de 70 anos.'),
  M('helena','Dra. Helena Cavalcanti','Gastroenterologia','casaforte',260,'CRM-PE 14.033',true,'Cuida de estômago e digestão. Experiência com azia, refluxo e má digestão.'),
  M('marcos','Dr. Marcos Albuquerque','Gastroenterologia','boavista',230,'CRM-PE 19.541',false,'Gastroenterologista com foco em digestão e acompanhamento de pacientes idosos.'),
  M('renata','Dra. Renata Lins','Neurologia','madalena',300,'CRM-PE 13.660',true,'Neurologista. Atende dores de cabeça, tonturas, alterações de memória e formigamentos.'),
  M('fabio','Dr. Fábio Moura','Neurologia','boaviagem',270,'CRM-PE 20.118',false,'Acompanha tremores, alterações de equilíbrio e sono.'),
  M('roberto','Dr. Roberto Melo','Nefrologia','derby',220,'CRM-PE 11.407',true,'Nefrologista. Cuida dos rins e da pressão alta, com acompanhamento próximo de pacientes idosos.'),
  M('tereza','Dra. Tereza Arruda','Nefrologia','gracas',260,'CRM-PE 14.688',true,'Acompanha a função dos rins, inchaços e exames de urina alterados.'),
  M('camila','Dra. Camila Freitas','Pneumologia','espinheiro',240,'CRM-PE 21.930',true,'Pneumologista. Cuida de tosse persistente, falta de ar, asma e bronquite.'),
  M('sergio','Dr. Sérgio Vasconcelos','Pneumologia','boavista',260,'CRM-PE 15.019',false,'Acompanha doenças respiratórias e orienta sobre vacinas para a pessoa idosa.'),
  M('lucia','Dra. Lúcia Prado','Coloproctologia','espinheiro',250,'CRM-PE 12.981',true,'Coloproctologista. Cuida do intestino, hemorroidas e prevenção do câncer de intestino.'),
  M('marina','Dra. Marina Pessoa','Ortopedia','casaforte',240,'CRM-PE 16.775',true,'Ortopedista. Cuida de joelhos, quadril e coluna, com foco em manter a autonomia.'),
  M('andre','Dr. André Barros','Ortopedia','boaviagem',210,'CRM-PE 22.306',false,'Atende dores nas articulações, ossos e prevenção de quedas.'),
  M('beatriz','Dra. Beatriz Tavares','Odontologia','madalena',180,'CRO-PE 7.452',true,'Dentista. Atende próteses, gengiva sensível e cuidados com a boca na terceira idade.'),
  M('ricardo','Dr. Ricardo Paes','Odontologia','derby',150,'CRO-PE 9.118',false,'Dentista clínico geral. Limpeza, restaurações e ajuste de dentaduras.'),
  M('thiago','Dr. Thiago Nóbrega','Coloproctologia','boaviagem',230,'CRM-PE 23.417',true,'Coloproctologista. Atende prisão de ventre, sangramentos e exames preventivos do intestino com calma e clareza.'),
  M('antonio','Dr. Antônio Siqueira','Clínico Geral','madalena',180,'CRM-PE 10.952',true,'Clínico geral há 30 anos. Faz check-ups, acompanha pressão, diabetes e orienta qual especialista procurar.'),
  M('laila','Dra. Laila Haddad','Clínico Geral','casaforte',200,'CRM-PE 24.083',false,'Clínica geral. Cuida da saúde da família, renova receitas e acompanha exames de rotina.'),
  M('sonia','Dra. Sônia Barbosa','Ginecologia','gracas',250,'CRM-PE 13.218',true,'Ginecologista há 25 anos. Acompanha a menopausa, exames preventivos e a saúde da mulher em todas as idades.'),
  M('rafael','Dr. Rafael Coutinho','Ginecologia','espinheiro',230,'CRM-PE 22.745',false,'Ginecologista. Faz exames preventivos e orienta sobre reposição hormonal e saúde íntima com cuidado e respeito.'),
  M('patricia','Dra. Patrícia Leal','Obstetrícia','boavista',280,'CRM-PE 19.306',true,'Obstetra. Acompanha a gestação do início ao parto, com consultas tranquilas e explicações claras.'),
  M('gustavo','Dr. Gustavo Lacerda','Obstetrícia','madalena',260,'CRM-PE 21.587',true,'Obstetra. Cuida do pré-natal e de gestações que precisam de atenção especial.'),
  M('isabela','Dra. Isabela Monteiro','Dermatologia','boaviagem',270,'CRM-PE 20.664',true,'Dermatologista. Avalia manchas e pintas, coceiras e cuida da pele sensível da pessoa idosa.'),
  M('felipe','Dr. Felipe Araújo','Dermatologia','casaforte',240,'CRM-PE 23.890',false,'Dermatologista. Trata feridas que demoram a cicatrizar, alergias de pele e queda de cabelo.'),
  M('lucas','Dr. Lucas Ferreira','Imunologia','derby',260,'CRM-PE 24.512',true,'Imunologista. Investiga alergias e orienta sobre vacinas importantes depois dos 60 anos.')
];
['carlos','juliana','paulo','helena','marcos','renata','fabio','roberto','tereza','camila','sergio','lucia','thiago','marina','andre','beatriz','ricardo','antonio','laila','sonia','rafael','patricia','gustavo','isabela','felipe','lucas'].forEach(id=>{docs.find(x=>x.id===id).photo='assets/medicos/'+id+'.png';});
const RESULTS={
  ex1:[['Hemácias','4,6 milhões/mm³','4,0 a 5,4'],['Hemoglobina','13,4 g/dL','12,0 a 16,0'],['Leucócitos','6.800 /mm³','4.000 a 11.000'],['Plaquetas','245.000 /mm³','150.000 a 450.000']],
  ex2:[['Glicose em jejum','98 mg/dL','70 a 99']],
  ex4:[],
  ex5:[['Colesterol total','182 mg/dL','menor que 190'],['HDL','52 mg/dL','maior que 40'],['LDL','108 mg/dL','menor que 130'],['Triglicerídeos','110 mg/dL','menor que 150']]
};
const QS=[
  {q:'O que você está sentindo?',opts:['Dor no peito','Falta de ar ou tosse','Dor de cabeça','Dor de estômago','Dor nas articulações','Dor de dente']},
  {q:'Há quanto tempo apresenta esse desconforto?',opts:['Começou hoje','Há alguns dias','Há mais de uma semana','Há mais de um mês']},
  {q:'Em qual região do corpo?',opts:['Peito','Cabeça','Barriga','Joelhos ou costas','Boca','Corpo todo']},
  {q:'Você apresenta algum outro sintoma?',opts:['Nenhum outro','Febre','Tontura','Cansaço','Dor forte e repentina','Desmaio','Falta de ar intensa']}
];
const WHY={
  'Cardiologia':'Dor ou aperto no peito e cansaço costumam ser avaliados primeiro pelo cardiologista, que cuida do coração e da circulação.',
  'Pneumologia':'Falta de ar e tosse que não passa são avaliadas pelo pneumologista, que cuida dos pulmões e da respiração.',
  'Gastroenterologia':'O gastroenterologista cuida do estômago e da digestão.',
  'Coloproctologia':'O coloproctologista cuida do intestino.',
  'Neurologia':'O neurologista avalia dores de cabeça frequentes, tonturas e formigamentos.',
  'Nefrologia':'O nefrologista cuida dos rins e do controle da pressão.',
  'Ortopedia':'O ortopedista cuida de ossos, articulações e coluna.',
  'Odontologia':'O dentista cuida dos dentes, da gengiva e da boca.'
};
const ORIENT_DAY=['Chegue 15 minutos antes do horário.','Leve um documento com foto e o seu CPF.','Leve a carteirinha do convênio, se for usar.','Leve exames e receitas anteriores, se tiver.','Na recepção, informe seu CPF para registrar a chegada.'];
const STAGES=[['Consulta agendada','Seu horário está reservado.'],['Chegada confirmada','A recepção confirmou sua identidade pelo CPF.'],['Aguardando atendimento','Aguarde na sala de espera. Avisaremos aqui.'],['Pronto para atendimento','O médico já sabe que você chegou.'],['Em atendimento','Você está em consulta com o médico.'],['Atendimento finalizado','Os documentos aparecem no app quando o médico enviar.']];
const STAGE_TIMES=['18 nov, 16:10','13:42','13:44','14:02','14:03','14:31'];
function initial(){return{
  screen:'login',hist:[],tab:'inicio',spec:'Cardiologia',locRef:'cadastrado',cep:'',cepError:'',altKm:false,filter:'proximidade',
  docId:'carlos',apptId:null,examId:'ex1',rxId:'rx1',docRef:{type:'exame',id:'ex1'},page:0,zoom:1,
  draft:{docId:'carlos',date:null,time:null,payment:'convenio'},mode:'novo',calMonth:10,slotError:'',conflictUsed:false,taken:[],
  appts:[
    {id:'h1',docId:'roberto',date:'2026-10-14',time:'09:00',status:'realizada',payment:'convenio',stage:5,orient:'Manter os remédios da pressão todos os dias pela manhã. Caminhar 30 minutos, 5 vezes por semana. Reduzir o sal nas refeições. Retornar em 3 meses com os exames solicitados.',docs:[{type:'receita',id:'rx1'},{type:'exame',id:'ex1'},{type:'exame',id:'ex2'},{type:'solicitacao',id:'so1'}]},
    {id:'h2',docId:'lucia',date:'2026-09-22',time:'15:30',status:'cancelada',payment:'particular',stage:0,docs:[]},
    {id:'h3',docId:'helena',date:'2026-08-05',time:'08:30',status:'faltou',payment:'convenio',stage:0,docs:[]},
    {id:'h4',docId:'carlos',date:'2026-07-10',time:'10:00',status:'realizada',payment:'convenio',stage:5,orient:'Continuar o AAS após o almoço. Repetir o exame de colesterol em 3 meses.',docs:[{type:'receita',id:'rx2'},{type:'exame',id:'ex5'}]}
  ],
  exams:[
    {id:'ex3',name:'Eletrocardiograma',icon:'activity',date:'2026-11-17',lab:'Clínica Coração das Graças',doctor:'Dr. Roberto Melo',status:'aguardando'},
    {id:'ex1',name:'Hemograma completo',icon:'droplet',date:'2026-10-20',lab:'Laboratório Recife Análises',doctor:'Dr. Roberto Melo',status:'disponivel',avail:'2026-10-23'},
    {id:'ex2',name:'Glicemia em jejum',icon:'flask-conical',date:'2026-10-20',lab:'Laboratório Recife Análises',doctor:'Dr. Roberto Melo',status:'disponivel',avail:'2026-10-22'},
    {id:'ex4',name:'Raio-X do joelho direito',icon:'scan-line',date:'2026-09-02',lab:'Clínica Casa Forte',doctor:'Dra. Marina Pessoa',status:'disponivel',avail:'2026-09-03'},
    {id:'ex5',name:'Colesterol total e frações',icon:'test-tube',date:'2026-07-12',lab:'Laboratório Recife Análises',doctor:'Dr. Carlos Ribeiro',status:'disponivel',avail:'2026-07-15'}
  ],
  rxs:[
    {id:'rx1',docId:'roberto',date:'2026-10-14',meds:[{name:'Losartana potássica',dose:'50 mg — 1 comprimido',freq:'1 vez ao dia, pela manhã',dur:'Uso contínuo'},{name:'Hidroclorotiazida',dose:'25 mg — 1 comprimido',freq:'1 vez ao dia, pela manhã',dur:'Uso contínuo'}],notes:'Tomar após o café da manhã, com água. Não interromper o uso sem falar com o médico.'},
    {id:'rx2',docId:'carlos',date:'2026-07-10',meds:[{name:'Ácido acetilsalicílico',dose:'100 mg — 1 comprimido',freq:'1 vez ao dia, após o almoço',dur:'Uso contínuo'}],notes:'Tomar sempre após uma refeição.'}
  ],
  sols:[{id:'so1',docId:'roberto',date:'2026-10-14',items:['Hemograma completo','Glicemia em jejum','Eletrocardiograma']}],
  notifs:[
    {id:'n2',kind:'exame',title:'Resultado de exame disponível',text:'O resultado de Glicemia em jejum já está no app.',time:'22 out',read:false,to:['exame',{examId:'ex2'}]},
    {id:'n4',kind:'receita',title:'Nova receita médica',text:'Dr. Roberto Melo enviou uma receita.',time:'14 out',read:true,to:['receita',{rxId:'rx1'}]}
  ],
  consTab:'proximas',examQuery:'',examPeriod:'Todos',specQuery:'',
  tri:{msgs:[],step:0,answers:[],input:'',typing:false,emergency:false,done:false},
  symptom:'',login:{email:'maria.gracas@exemplo.com',pw:'demo1234'},cad:{},
  profile:{name:'Maria das Graças Silva',birth:'07/05/1951',cpf:'123.456.789-00',phone:'(81) 99876-5432',email:'maria.gracas@exemplo.com',plan:'Saúde Recife',card:'0001 2345 6789'},
  pf:null,address:{cep:'52011-000',street:'Rua Amélia',number:'120',district:'Graças',city:'Recife/PE',comp:'Apto 302'},af:null,addrErr:'',
  settings:{text:'normal',contrast:false,dark:false,voice:false,simple:false,tips:false,libras:false,protectDocs:true},speaking:false,unlocked:false,pending:null,unlockPw:'',unlockErr:'',
  pwf:{cur:'',n1:'',n2:'',err:''},pfErr:'',
  modal:null,toast:'',loading:false,netError:false,confirming:false
};}
window.SPM_DATA={T,C,S,docs,RESULTS,QS,WHY,ORIENT_DAY,STAGES,STAGE_TIMES,initial};
})();
