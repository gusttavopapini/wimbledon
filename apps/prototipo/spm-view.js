// View-model: transforma o estado em valores para o template
(function(){
const D=window.SPM_DATA,H=window.SPM_H,T=D.T;
const SB={agendado:['agendado','Agendada'],realizada:['concluido','Realizada'],cancelada:['aviso','Cancelada'],faltou:['aviso','Não compareceu']};
window.SPM_VIEW=function(c){
  const s=c.state,a=c.a,p=c.props,scr=s.screen;
  const flags={};['login','cadastro','home','agendar','especialidades','medicos','medico','horario','revisao','confirmada','triagemIntro','triagem','triagemResult','consultas','consulta','acompanhamento','historico','exames','exame','documento','receitas','receita','perfil','dados','endereco','ajustes','notificacoes','senha','privacidade','ajuda','acessibilidade'].forEach(k=>flags[k]=scr===k);
  const tabOf={home:'inicio',consultas:'consultas',consulta:'consultas',acompanhamento:'consultas',historico:'consultas',perfil:'perfil',dados:'perfil',endereco:'perfil',ajustes:'ajustes',notificacoes:'ajustes',senha:'ajustes',privacidade:'ajustes',ajuda:'ajustes'};
  const auth=scr==='login'||scr==='cadastro';
  const textSize=p.textSize&&p.textSize!=='app'?p.textSize:s.settings.text;
  // tamanho da letra: escala aplicada via variável CSS --fs (100%, 125%, 150%); o zoom de layout não é mais usado
  const fsScale={normal:1,grande:1.25,'muito grande':1.5}[textSize]||1;const zoom=1;
  const apptVM=(ap)=>{const d=H.doc(ap.docId),cl=H.clinic(d),sp=H.spec(d.spec),b=SB[ap.status];
    return {id:ap.id,img:sp.img,name:d.name,spec:d.spec,clinic:cl.name,when:H.fd(ap.date)+', '+ap.time,badge:b[0],badgeLabel:b[1],
      onOpen:()=>a.go(ap.status==='agendado'?'consulta':'historico',{apptId:ap.id})};};
  const upcoming=s.appts.filter(x=>x.status==='agendado').sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time));
  const past=s.appts.filter(x=>x.status!=='agendado').sort((x,y)=>(y.date+y.time).localeCompare(x.date+x.time));
  const unread=s.notifs.filter(n=>!n.read).length;
  const nx=upcoming[0];
  const v={
    s:flags,zoom,fsScale,auth,hero:auth,notHero:!auth,mainTop:scr==='login'?'-50px':scr==='home'?'-40px':'-32px',mainPadTop:scr==='login'?'32px':scr==='home'?'16px':'24px',mainPadX:scr==='login'?'24px':scr==='home'?'18px':'20px',mainShadow:scr==='login'||scr==='home'?'0 -10px 30px rgba(2,83,113,.16)':'none',showBack:scr!=='medicos'&&(!auth&&!tabOf[scr]||['dados','endereco','notificacoes','senha','privacidade','ajuda','consulta','acompanhamento','historico'].includes(scr)),
    onBack:a.back,showNav:!auth&&!s.kbd&&!['medico','horario','revisao','triagemIntro','triagem','documento'].includes(scr),showPanel:p.showPanel!==false&&s.wide,showDemoFab:p.showPanel!==false&&!s.wide&&!auth,demoOpen:!!s.demoOpen,panelVisible:p.showPanel!==false&&(s.wide||!!s.demoOpen),panelPos:s.wide?{position:'fixed',top:'24px',left:'calc(50% + 264px)',zIndex:7}:{position:'fixed',inset:'0',zIndex:11,background:'rgba(23,57,61,.55)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'calc(env(safe-area-inset-top) + 16px) 16px 16px'},onDemo:()=>a.set({demoOpen:!s.demoOpen}),photo:'assets/paciente.png',firstName:s.profile.name.split(' ')[0],
    navItems:[{id:'inicio',label:'Início',icon:'house'},{id:'consultas',label:'Consultas',icon:'calendar'},{id:'perfil',label:'Meu perfil',icon:'user'},{id:'ajustes',label:'Ajustes',icon:'settings'}],
    navActive:tabOf[scr]||'inicio',onTab:a.tab,
    toast:s.toast,hasToast:!!s.toast,dangerBtn:{background:'var(--error)',border:'2px solid var(--error)'},tallBtn:{minHeight:56},
    onWhats:()=>a.toast('Abrindo o WhatsApp da clínica (demonstrativo).'),
    onRoute:()=>a.toast('Abrindo rota no aplicativo de mapas (demonstrativo).'),
    onCall:()=>a.toast('Ligando para a clínica (demonstrativo).'),
    login:{email:s.login.email,pw:s.login.pw,onEmail:e=>a.set({login:Object.assign({},s.login,{email:e})}),onPw:e=>a.set({login:Object.assign({},s.login,{pw:e})}),
      onEnter:()=>a.set({screen:'home',hist:[]}),onCad:e=>{e&&e.preventDefault&&e.preventDefault();a.go('cadastro');},onBackLogin:e=>{e&&e.preventDefault&&e.preventDefault();a.back();},
      onCadDone:()=>{a.set({screen:'home',hist:[]});a.toast('Cadastro concluído (demonstrativo).');},onForgot:()=>a.toast('Enviamos um link para o seu e-mail (demonstrativo).'),onSocial:()=>a.toast('Entrada social indisponível no protótipo.')},
    symptom:s.symptom,
    home:{
      greet:(()=>{const h=new Date().getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';})()+', '+s.profile.name.split(' ')[0]+'!',unread:String(unread),hasUnread:unread>0,
      onProfile:()=>a.tab('perfil'),onBell:()=>a.go('notificacoes'),onSearch:()=>a.go('especialidades',{specQuery:''}),
      onSymptom:t=>a.set({symptom:t}),hasSymptom:!!s.symptom.trim(),onSymptomGo:()=>a.go('triagemIntro'),
      specs:D.S.slice(0,3).map(sp=>({label:sp.short,img:sp.img,illo:({Cardiologia:'assets/ilustracoes/coracao.png?v=2',Gastroenterologia:'assets/ilustracoes/estomago.png?v=2',Neurologia:'assets/ilustracoes/cerebro.png?v=2'})[sp.short.replace(/\u00AD/g,'')]||sp.img,onClick:()=>a.openSpec(sp.label)})),
      onAllSpecs:()=>a.go('especialidades',{specQuery:''}),onBook:()=>a.go('agendar'),
      hasNext:!!nx,next:nx?(()=>{const d=H.doc(nx.docId);const st=nx.stage>0?D.STAGES[nx.stage][0]:'';return {img:H.spec(d.spec).img,when:H.fd(nx.date)+', '+nx.time,line:d.name+' · '+H.clinic(d).name,hasStage:nx.stage>0,stage:st,onClick:()=>a.go('consulta',{apptId:nx.id})};})():{},
      qa:[['consultas','Minhas consultas',()=>a.tab('consultas')],['exames','Meus exames',()=>a.go('exames')],['receitas','Receitas médicas',()=>a.go('receitas')],['pretriagem','Pré-triagem',()=>a.go('triagemIntro')]].map(([k,l,f])=>Object.assign({kind:k,label:l,onClick:f},({consultas:{bg:'#e3ecfa',ink:'var(--hq-blue,#2c4f8f)',icon:'calendar'},exames:{bg:'#ece6f7',ink:'var(--hq-lilac,#5b3f8f)',icon:'flask-conical'},receitas:{bg:'#f8e3e7',ink:'var(--hq-rose,#8f3248)',icon:'pill'},pretriagem:{bg:'#f6ecd9',ink:'var(--hq-sand,#7a5a1f)',icon:'clipboard-list'}})[k]))
    },
    agendar:[
      {title:'Já sei qual médico preciso',text:'Escolha a especialidade e veja os médicos perto de você.',icon:'stethoscope',bg:'var(--teal-100)',ink:'var(--teal-700)',onClick:()=>a.go('especialidades',{specQuery:''})},
      {title:'Preciso de ajuda para escolher',text:'Responda algumas perguntas e receba uma sugestão de especialidade.',icon:'clipboard-list',bg:'var(--qa-sand-bg)',ink:'var(--qa-sand-ink)',onClick:()=>a.go('triagemIntro')}
    ]
  };
  // Especialidades
  const q=s.specQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const specList=D.S.filter(sp=>!q||sp.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q));
  v.esp={query:s.specQuery,onQuery:t=>a.set({specQuery:t}),empty:!specList.length,onClear:()=>a.set({specQuery:''}),count:specList.length+' especialidades',
    list:specList.map(sp=>({label:sp.short,img:sp.img,illo:sp.illo,onClick:()=>a.openSpec(sp.label)})),onTriage:()=>a.go('triagemIntro')};
  // Médicos
  const docs=D.docs.filter(d=>d.spec===s.spec).map(d=>{const km=H.km(s,d),nxs=H.nextSlot(s,d.id);return {d,km,nxs};});
  docs.sort((x,y)=>s.filter==='preco'?x.d.price-y.d.price:s.filter==='disponibilidade'?((x.nxs.date||'9')+(x.nxs.time||'')).localeCompare((y.nxs.date||'9')+(y.nxs.time||'')):x.km-y.km);
  const homePos=s.locRef==='atual'?{left:'46%',top:'58%',icon:'locate-fixed',label:'Você está aqui'}:s.locRef==='outro'&&s.altKm?{left:'30%',top:'40%',icon:'map-pin',label:'Outro endereço'}:{left:'58%',top:'48%',icon:'house',label:'Seu endereço'};
  v.med={title:s.spec,pro:H.spec(s.spec).pro,onBack:a.back,noDocs:!docs.length,
    locChips:[['cadastrado','Meu endereço'],['atual','Localização atual'],['outro','Outro endereço']].map(([k,l])=>({label:l,selected:s.locRef===k,onClick:()=>{a.set({locRef:k,cepError:''});if(k!=='outro')a.loadList();}})),
    showCep:s.locRef==='outro',cep:s.cep,onCep:t=>a.set({cep:t}),cepError:s.cepError,btnPad:s.cepError?'28px':'0px',
    onCepGo:()=>{if(!/^\d{5}-?\d{3}$/.test(s.cep)){a.set({cepError:'CEP inválido. Use 8 números.'});return;}a.set({altKm:true,cepError:''});a.loadList();},
    addrLine:s.locRef==='atual'?'Usando sua localização atual':s.locRef==='outro'?(s.altKm?'CEP '+s.cep:'Informe o CEP abaixo'):s.address.street+', '+s.address.number+' — '+s.address.district,
    filters:[['proximidade','Mais perto'],['preco','Menor preço'],['disponibilidade','Mais cedo']].map(([k,l])=>({label:l,selected:s.filter===k,onClick:()=>a.set({filter:k})})),
    home:homePos,
    pins:docs.map((x,i)=>({num:String(i+1),left:H.clinic(x.d).x+'%',top:H.clinic(x.d).y+'%'})),
    loading:s.loading,error:!s.loading&&s.netError,ready:!s.loading&&!s.netError,
    list:docs.map((x,i)=>({num:String(i+1),photoId:x.d.id,hasPhoto:!!x.d.photo,noPhoto:!x.d.photo,initials:H.initials(x.d.name),name:x.d.name,pro:H.spec(x.d.spec).pro,clinicName:H.clinic(x.d).name,kmTxt:H.kmTxt(x.km),priceTxt:H.money(x.d.price),next:x.nxs.txt,
      onOpen:()=>a.openDoctor(x.d.id),onBook:()=>a.startBooking(x.d.id),openLabel:'Ver detalhes de '+x.d.name,bookLabel:'Agendar com '+x.d.name,kmShort:String(x.km).replace('.',',')+' km',avatarBg:['#4f8f96','#8a6bb0','#b0704a','#5a7fb8'][i%4]}))};
  v.onRetry=()=>a.loadList();
  // Profissional
  const dr=H.doc(s.docId),dcl=H.clinic(dr);
  v.dr={photoId:dr.id,hasPhoto:!!dr.photo,noPhoto:!dr.photo,initials:H.initials(dr.name),name:dr.name,pro:H.spec(dr.spec).pro,crm:dr.crm,bio:dr.bio,
    rows:[['building-2','Clínica',dcl.name],['map-pin','Endereço',dcl.addr],['route','Distância',H.kmTxt(H.km(s,dr))+' (demonstrativo)'],['wallet','Valor da consulta',H.money(dr.price)+' (particular)']].map(([i,l,val])=>({icon:i,label:l,value:val})),
    hasConv:dr.conv,noConv:!dr.conv,conv:dr.conv?['Saúde Recife','Vida Mais PE','Bem-Estar Nordeste']:[],acc:dcl.acc,onBook:()=>a.startBooking(dr.id)};
  Object.assign(v,window.SPM_VIEW2(c,{apptVM,upcoming,past,unread}));
  window.SPM_A11Y(c,v,{scr,auth});
  return v;
};
})();
