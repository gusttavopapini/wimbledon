// Acessibilidade: tema, contraste, voz, modo simples, dicas
(function(){
const TIPS={
  home:'Toque em "Agendar consulta" para marcar um horário. Se tiver dúvida, use o botão do WhatsApp.',
  agendar:'Escolha uma das duas opções. Se não souber qual médico procurar, toque na segunda.',
  especialidades:'Toque no desenho do problema que você quer tratar.',
  medicos:'Os médicos estão em ordem de distância da sua casa. Toque em "Agendar" no médico que preferir.',
  medico:'Confira o endereço e o valor. Para marcar, toque em "Agendar consulta" no fim da tela.',
  horario:'Primeiro toque em um dia com contorno. Depois toque em um horário.',
  revisao:'Confira tudo com calma. Se estiver certo, toque em "Confirmar agendamento".',
  consultas:'Aqui ficam suas consultas marcadas. Toque em "Ver detalhes" para remarcar ou cancelar.',
  consulta:'No dia, chegue 15 minutos antes e informe seu CPF na recepção.',
  triagem:'Toque em uma das respostas prontas ou escreva com suas palavras.',
  exames:'Toque em um exame para ver o resultado enviado pelo laboratório.',
  receitas:'Toque em "Ver receita" para ver os remédios e como tomar.',
  perfil:'Aqui ficam seus dados e seu endereço.',
  ajustes:'Aqui você muda o tamanho da letra, a cor da tela e outras opções.',
  acessibilidade:'As mudanças valem para todas as telas e ficam salvas.'
};
const LIGHT={'--page':'#eef4f4','--surface-2':'#f2f7f7'};
const DARK={'--page':'#081a1d','--surface-2':'#1a3438','--white':'#11272b','--ink':'#e8f1f1','--ink-muted':'#b2c7c9','--teal-600':'#5cc2ca','--teal-700':'#8ad6db','--teal-500':'#5cc2ca','--teal-100':'#1f4549','--border-subtle':'#2c4c50','--border-control':'#7fa3a6','--on-brand':'#08201f','--rose-100':'#f7e4e4','--shadow-card':'none','--shadow-nav':'0 -1px 0 #2c4c50'};
const HC={'--ink':'#0b1f22','--ink-muted':'#17393d','--border-subtle':'#17393d','--border-control':'#0b1f22','--teal-600':'#004b52','--teal-700':'#003a40','--teal-100':'#cfe3e5','--warning':'#5a3f00','--error':'#7d1913','--success':'#11492c','--qa-blue-ink':'#173f73','--qa-lilac-ink':'#46306d','--qa-rose-ink':'#76213b','--qa-sand-ink':'#5e3c16','--hq-blue':'#173f73','--hq-lilac':'#46306d','--hq-rose':'#76213b','--hq-sand':'#5e3c16'};
const HCD={'--ink-muted':'#e8f1f1','--border-subtle':'#b2c7c9','--border-control':'#e8f1f1','--teal-600':'#8ad6db'};
window.SPM_A11Y=function(c,v,o){
  const s=c.state,a=c.a,st=s.settings,setS=p=>a.set({settings:Object.assign({},st,p)});
  const theme=Object.assign({'--on-brand':'#ffffff'},LIGHT,st.dark?DARK:{},st.contrast?(st.dark?HCD:HC):{});
  v.themeStyle=Object.assign({},theme,{'--fs':String(v.fsScale||1),minHeight:'100dvh',background:'var(--page)',colorScheme:st.dark?'dark':'light'});
  v.rootClass=st.contrast?'spm-hc':'';
  v.headerBg=(st.contrast?'linear-gradient(rgba(0,28,38,.5),rgba(0,28,38,.5)), ':'')+'#00607a url(assets/fundo.png) center 30% / cover no-repeat';
  save(st);libras(!!st.libras);
  const tg=(on)=>({trackBg:on?'var(--teal-600)':'var(--border-control)',knob:on?'26px':'2px',on});
  v.a11y={
    sizes:['normal','grande','muito grande'].map(k=>({label:k==='normal'?'Normal':k==='grande'?'Grande':'Muito grande',selected:st.text===k,onClick:()=>setS({text:k})})),
    toggles:[
      ['moon','Tela escura','Fundo escuro que cansa menos a vista, principalmente à noite.','dark'],
      ['contrast','Alto contraste','Textos e contornos mais fortes, mais fáceis de enxergar.','contrast'],
      ['volume-2','Ler a tela em voz alta','Mostra o botão "Ouvir" em todas as telas.','voice'],
      ['layout-list','Modo simples','A tela inicial mostra só o essencial, com botões grandes.','simple'],
      ['lightbulb','Dicas em cada tela','Explica em uma frase o que fazer em cada tela.','tips']
    ].map(([icon,label,desc,k])=>Object.assign({icon,label,desc,onClick:()=>setS({[k]:!st[k]})},tg(st[k]))),
    onTest:()=>speak(c,'Olá, '+s.profile.name.split(' ')[0]+'. Esta é a leitura em voz alta do aplicativo Saúde na Palma da Mão.'),
    onOpen:()=>a.go('acessibilidade'),
    onPanel:()=>a.set({modal:'a11y'})
  };
  v.showA11yTop=!o.auth&&['consultas','perfil','ajustes'].includes(o.scr);
  v.modal.a11y=s.modal==='a11y';
  v.a11yM={
    sizes:[['normal','A','100%','Letra normal'],['grande','A+','125%','Letra grande'],['muito grande','A++','150%','Letra muito grande']].map(([k,l,pct,name],i)=>{const on=(st.text||'normal')===k;return {label:l,pct,aria:name+', '+pct,pressed:on?'true':'false',bg:on?'var(--teal-600)':'var(--white)',ink:on?'var(--on-brand)':'var(--teal-600)',size:['22px','27px','32px'][i],onClick:()=>setS({text:k})};}),
    voiceLabel:s.speaking?'Parar a leitura':'Ouvir esta tela',voiceIcon:s.speaking?'square':'volume-2',
    onVoice:()=>{if(s.speaking){try{speechSynthesis.cancel();}catch(e){}a.set({speaking:false});return;}const m=document.querySelector('main');speak(c,m?m.innerText:'');},
    hcLabel:'Alto contraste: '+(st.contrast?'Ligado':'Desligado'),hcPressed:st.contrast?'true':'false',hcBg:st.contrast?'var(--teal-600)':'var(--white)',hcInk:st.contrast?'var(--on-brand)':'var(--teal-600)',onHc:()=>setS({contrast:!st.contrast}),
    librasLabel:'Libras: '+(st.libras?'Ligado':'Desligado'),librasPressed:st.libras?'true':'false',librasBg:st.libras?'var(--teal-600)':'var(--white)',librasInk:st.libras?'var(--on-brand)':'var(--teal-600)',onLibras:()=>setS({libras:!st.libras}),
    onReset:()=>{try{speechSynthesis.cancel();}catch(e){}a.set({speaking:false,settings:Object.assign({},st,{text:'normal',contrast:false,libras:false})});a.toast('Acessibilidade voltou ao normal.');}
  };
  v.home.simple=!!st.simple;v.home.full=!st.simple;
  v.home.big=[['calendar-plus','Agendar consulta','var(--teal-600)','var(--on-brand)',()=>a.go('agendar')],['calendar','Minhas consultas','var(--qa-blue-bg)','var(--qa-blue-ink)',()=>a.tab('consultas')],['flask-conical','Meus exames','var(--qa-lilac-bg)','var(--qa-lilac-ink)',()=>a.go('exames')],['pill','Receitas médicas','var(--qa-rose-bg)','var(--qa-rose-ink)',()=>a.go('receitas')],['clipboard-list','Não sei qual médico procurar','var(--qa-sand-bg)','var(--qa-sand-ink)',()=>a.go('triagemIntro')]].map(([icon,label,bg,ink,onClick])=>({icon,label,bg,ink,onClick}));
  const tip=st.tips&&!o.auth?TIPS[o.scr]:'';v.tip=tip||'';v.hasTip=!!tip;
  v.showVoice=!!st.voice&&!o.auth;v.voiceLabel=s.speaking?'Parar':'Ouvir';v.voiceIcon=s.speaking?'square':'volume-2';
  v.onVoice=()=>{if(s.speaking){try{speechSynthesis.cancel();}catch(e){}a.set({speaking:false});return;}const m=document.querySelector('main');speak(c,m?m.innerText:'');};
  v.voiceBottom=v.showNav?'calc(72px + 20px*var(--fs,1) + env(safe-area-inset-bottom))':'calc(16px + env(safe-area-inset-bottom))';
  v.mainPad=v.showNav?'calc(88px + 24px*var(--fs,1) + env(safe-area-inset-bottom))':'calc(24px + env(safe-area-inset-bottom))';
};
const KEY='spm-acessibilidade';let lastSaved=null;
function save(st){try{const j=JSON.stringify({text:st.text,contrast:!!st.contrast,libras:!!st.libras,dark:!!st.dark,voice:!!st.voice,simple:!!st.simple,tips:!!st.tips});if(j!==lastSaved){if(lastSaved!==null)localStorage.setItem(KEY,j);lastSaved=j;}}catch(e){}}
window.SPM_A11Y_LOAD=function(settings){try{const sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv&&typeof sv==='object')Object.assign(settings,sv);}catch(e){}return settings;};
let vlOn=null;
function libras(on){if(on===vlOn)return;vlOn=on;setTimeout(()=>{
  let w=document.querySelector('[vw]');
  if(on&&!w){w=document.createElement('div');w.setAttribute('vw','');w.className='enabled';w.innerHTML='<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';document.body.appendChild(w);
    const sc=document.createElement('script');sc.src='https://vlibras.gov.br/app/vlibras-plugin.js';
    sc.onload=()=>{try{new window.VLibras.Widget('https://vlibras.gov.br/app');}catch(e){}};
    document.body.appendChild(sc);}
  if(w)w.style.display=on?'':'none';
  if(!document.getElementById('spm-libras-css')){const st=document.createElement('style');st.id='spm-libras-css';st.textContent='html.spm-no-libras [vw],html.spm-no-libras [id^="vlibras"]{display:none!important}';document.head.appendChild(st);}
  document.documentElement.classList.toggle('spm-no-libras',!on);},0);}
function speak(c,text){
  try{const u=new SpeechSynthesisUtterance(String(text).replace(/\s+/g,' ').slice(0,1800));u.lang='pt-BR';u.rate=.92;
    u.onend=u.onerror=()=>c.setState({speaking:false});speechSynthesis.cancel();speechSynthesis.speak(u);c.setState({speaking:true});}
  catch(e){c.a.toast('A leitura em voz alta não está disponível neste aparelho.');}
}
})();
