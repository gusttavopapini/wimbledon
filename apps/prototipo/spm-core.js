// Helpers, regras e ações do protótipo (demonstrativo)
(function(){
const D=window.SPM_DATA,T=D.T;
const W=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],WL=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const MO=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],ML=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const H={
  parse(i){const [y,m,d]=i.split('-').map(Number);return new Date(y,m-1,d);},
  iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');},
  add(i,n){const d=H.parse(i);d.setDate(d.getDate()+n);return H.iso(d);},
  fd(i){const d=H.parse(i);const r=i===T?'Hoje':i===H.add(T,1)?'Amanhã':W[d.getDay()];return r+', '+d.getDate()+' '+MO[d.getMonth()]+(d.getFullYear()!==2026?' '+d.getFullYear():'');},
  fdl(i){const d=H.parse(i);return cap(WL[d.getDay()])+', '+d.getDate()+' de '+ML[d.getMonth()]+' de '+d.getFullYear();},
  fds(i){const d=H.parse(i);return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();},
  monthLabel(m){return cap(ML[m%12])+' '+(2026+Math.floor(m/12));},
  money(n){return 'R$ '+n+',00';},
  doc(id){return D.docs.find(d=>d.id===id)||D.docs[0];},
  clinic(d){return D.C[d.clinic];},
  spec(l){return D.S.find(s=>s.label===l)||D.S[0];},
  initials(n){return n.replace(/^(Dra?\.)\s+/,'').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('');},
  hash(s){let h=7;for(const ch of s)h=(h*31+ch.charCodeAt(0))%9973;return h;},
  km(s,d){const c=H.clinic(d);if(s.locRef==='atual')return Math.round((c.km+0.4+(H.hash(d.clinic)%9)/10)*10)/10;if(s.locRef==='outro'&&s.altKm)return Math.round((Math.abs(c.km-2.2)+0.7+(H.hash(d.clinic+'o')%7)/10)*10)/10;return c.km;},
  kmTxt(n){return String(n).replace('.',',')+' km'+(n<2?' de você':'');},
  slots(s,docId,date){
    const d=H.parse(date),wd=d.getDay();if(wd===0||date<T)return {m:[],a:[]};
    const all=wd===6?['08:00','08:30','09:00','09:30','10:00','10:30','11:00']:['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
    const busy=s.appts.filter(a=>a.docId===docId&&a.date===date&&a.status==='agendado').map(a=>a.time).concat(s.taken.filter(t=>t.startsWith(docId+date)).map(t=>t.slice(-5)));
    const h=H.hash(docId+date);if(h%5===0)return {m:[],a:[]};
    const free=all.filter((t,i)=>(h+i*7)%3!==0&&!busy.includes(t)&&!(date===T&&t<'11:00'));
    return {m:free.filter(t=>t<'12:00'),a:free.filter(t=>t>'12:00')};
  },
  nextSlot(s,docId){for(let i=0;i<40;i++){const dt=H.add(T,i),sl=H.slots(s,docId,dt),f=sl.m.concat(sl.a);if(f.length)return {date:dt,time:f[0],txt:H.fd(dt)+', '+f[0]};}return {txt:'Sem horários'};},
  triageSpec(ans,free){
    const t=(ans.join(' ')+' '+free).toLowerCase();
    if(/peito|coração|palpita/.test(t))return 'Cardiologia';
    if(/falta de ar|tosse|respir|pulm|chiado/.test(t))return 'Pneumologia';
    if(/cabeça|tontura|formig|memória/.test(t))return 'Neurologia';
    if(/estômago|azia|refluxo|enjoo/.test(t))return 'Gastroenterologia';
    if(/intestin|barriga|evacua|hemorr/.test(t))return 'Coloproctologia';
    if(/rim|rins|urina|inchaço/.test(t))return 'Nefrologia';
    if(/articula|joelho|costas|coluna|osso|quadril/.test(t))return 'Ortopedia';
    if(/dente|boca|gengiva|dentadura/.test(t))return 'Odontologia';
    return null;
  },
  isEmergency(text){return /dor forte e repentina|desmaio|desmaiei|falta de ar intensa|não consigo respirar|nao consigo respirar/i.test(text);}
};

function A(c){
  const set=(p,cb)=>c.setState(p,cb), S=()=>c.state;
  const top=()=>{try{window.scrollTo(0,0);}catch(e){}};
  const toast=(t)=>{set({toast:t});clearTimeout(c._tt);c._tt=setTimeout(()=>set({toast:''}),2600);};
  const go=(screen,patch)=>{set(s=>Object.assign({},patch||{},{screen,hist:s.hist.concat([s.screen])}),top);};
  const back=()=>{set(s=>{const h=s.hist.slice();const p=h.pop()||'home';return {screen:p,hist:h};},top);};
  const loadList=()=>{set({loading:true,netError:false});clearTimeout(c._lt);c._lt=setTimeout(()=>set({loading:false,netError:!!c.props.simulateError}),750);};
  const needsLock=(s)=>s.settings.protectDocs&&!s.unlocked;
  const guard=(screen,patch)=>{const s=S();if(needsLock(s)){set({modal:'unlock',pending:[screen,patch||{}],unlockPw:'',unlockErr:''});}else go(screen,patch);};
  const a={
    set,go,back,toast,guard,
    tab(id){const map={inicio:'home',consultas:'consultas',perfil:'perfil',ajustes:'ajustes'};set({screen:map[id],hist:[],modal:null},top);},
    openSpec(label){go('medicos',{spec:label});loadList();},
    openDoctor(id){go('medico',{docId:id});},
    startBooking(docId){set({draft:{docId,date:null,time:null,payment:H.doc(docId).conv?'convenio':'particular'},mode:'novo',calMonth:10,slotError:''});go('horario');},
    startResched(apptId){const ap=S().appts.find(x=>x.id===apptId);set({apptId,draft:{docId:ap.docId,date:null,time:null,payment:ap.payment},mode:'remarcar',calMonth:H.parse(ap.date).getMonth()===11?11:10,slotError:''});go('horario');},
    pickDate(d){set(s=>({draft:Object.assign({},s.draft,{date:d,time:null}),slotError:''}));},
    pickTime(t){set(s=>({draft:Object.assign({},s.draft,{time:t}),slotError:''}));},
    continueTime(){const s=S();if(s.mode==='remarcar')set({modal:'resched'});else go('revisao');},
    confirmBooking(){
      const s=S();set({confirming:true});
      setTimeout(()=>{
        const s2=S(),dr=s2.draft;
        if(s2.forceConflict){set(x=>({confirming:false,forceConflict:false,taken:x.taken.concat([dr.docId+dr.date+dr.time]),slotError:'O horário das '+dr.time+' acabou de ser reservado por outra pessoa. Escolha outro horário — seus dados foram mantidos.',draft:Object.assign({},dr,{time:null}),screen:'horario',hist:x.hist.slice(0,-1)}),top);return;}
        const id='a'+Date.now();const d=H.doc(dr.docId);
        set(x=>({confirming:false,apptId:id,appts:[{id,docId:dr.docId,date:dr.date,time:dr.time,status:'agendado',payment:dr.payment,stage:0,docs:[]}].concat(x.appts),
          notifs:[{id:'n'+id,kind:'confirmacao',title:'Consulta confirmada',text:d.spec+' com '+d.name+', '+H.fd(dr.date)+' às '+dr.time+'.',time:'Agora',read:false,to:['consulta',{apptId:id}]}].concat(x.notifs),
          screen:'confirmada',hist:[]}),top);
      },700);
    },
    confirmResched(){const s=S(),dr=s.draft,d=H.doc(dr.docId);
      set(x=>({modal:null,appts:x.appts.map(ap=>ap.id===x.apptId?Object.assign({},ap,{date:dr.date,time:dr.time}):ap),
        notifs:[{id:'nr'+Date.now(),kind:'alteracao',title:'Horário alterado',text:'Sua consulta com '+d.name+' passou para '+H.fd(dr.date)+', às '+dr.time+'.',time:'Agora',read:false,to:['consulta',{apptId:x.apptId}]}].concat(x.notifs),
        screen:'consulta',hist:x.hist.slice(0,-1)}),top);toast('Consulta remarcada para '+H.fd(dr.date)+', '+dr.time+'.');},
    confirmCancel(){set(x=>({modal:null,appts:x.appts.map(ap=>ap.id===x.apptId?Object.assign({},ap,{status:'cancelada'}):ap),screen:'consultas',consTab:'historico',hist:[]}),top);toast('Consulta cancelada. A clínica foi avisada.');},
    advanceStage(){const s=S();const ap=s.appts.find(x=>x.id===s.apptId)||s.appts.find(x=>x.id==='a1');if(!ap||ap.status!=='agendado')return;
      const st=Math.min(5,ap.stage+1);
      set(x=>{const appts=x.appts.map(p=>p.id!==ap.id?p:Object.assign({},p,{stage:st},st===5?{status:'realizada',orient:'Manter a medicação atual. Medir a pressão em casa 3 vezes por semana e anotar. Retornar em 6 meses.',docs:[{type:'receita',id:'rx3'},{type:'solicitacao',id:'so2'}]}:{}));
        const extra=st===5?{rxs:[{id:'rx3',docId:ap.docId,date:ap.date,meds:[{name:'Losartana potássica',dose:'50 mg — 1 comprimido',freq:'1 vez ao dia, pela manhã',dur:'Uso contínuo'}],notes:'Manter o uso diário. Não interromper sem orientação médica.'}].concat(x.rxs),
          sols:[{id:'so2',docId:ap.docId,date:ap.date,items:['Ecocardiograma','Perfil lipídico']}].concat(x.sols),
          notifs:[{id:'nd'+Date.now(),kind:'receita',title:'Novos documentos da consulta',text:H.doc(ap.docId).name+' enviou uma receita e uma solicitação de exames.',time:'Agora',read:false,to:['historico',{apptId:ap.id}]}].concat(x.notifs)}:{};
        return Object.assign({appts},extra);});},
    openNotif(n){set(x=>({notifs:x.notifs.map(m=>m.id===n.id?Object.assign({},m,{read:true}):m)}));const [scr,p]=n.to;
      if(scr==='exame'||scr==='receita')guard(scr,p);else if(scr==='consulta'){const ap=S().appts.find(x=>x.id===p.apptId);go(ap&&ap.status!=='agendado'?'historico':'consulta',p);}else go(scr,p);},
    openDocRef(r){if(r.type==='exame'){const e=S().exams.find(x=>x.id===r.id);guard(e&&e.status==='aguardando'?'exame':'documento',{docRef:r,examId:r.id,page:0,zoom:1});}else if(r.type==='receita')guard('receita',{rxId:r.id});else guard('documento',{docRef:r,page:0,zoom:1});},
    unlock(bio){const s=S();if(!bio&&s.unlockPw!==s.login.pw){set({unlockErr:'Senha incorreta. Confira e tente de novo, ou use a digital.'});return;}const [scr,p]=s.pending||['home',{}];set({unlocked:true,modal:null,pending:null});go(scr,p);},
    triStart(){set({tri:{msgs:[{from:'ai',text:'Olá, '+S().profile.name.split(' ')[0]+'! Vou fazer algumas perguntas rápidas para sugerir a especialidade mais adequada. Isto não é um diagnóstico.'},{from:'ai',text:D.QS[0].q}],step:0,answers:[],input:S().symptom||'',typing:false,emergency:false,done:false}});go('triagem');},
    triAnswer(text){text=String(text||'').trim();if(!text)return;const s=S(),t=s.tri;
      const msgs=t.msgs.concat([{from:'me',text}]),answers=t.answers.concat([text]);
      if(H.isEmergency(text)){set({tri:Object.assign({},t,{msgs,answers,input:'',emergency:true})});return;}
      const step=t.step+1;
      set({tri:Object.assign({},t,{msgs,answers,input:'',typing:true})});
      setTimeout(()=>{const t2=S().tri;if(step>=D.QS.length){set({tri:Object.assign({},t2,{typing:false,done:true,step,msgs:t2.msgs.concat([{from:'ai',text:'Obrigado. Já tenho uma sugestão de especialidade para você.'}])})});return;}
        set({tri:Object.assign({},t2,{typing:false,step,msgs:t2.msgs.concat([{from:'ai',text:D.QS[step].q}])})});},800);},
    saveProfile(){const s=S(),f=s.pf;if(!f.name.trim()||!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(f.phone)){set({pfErr:'Confira o nome e o telefone no formato (81) 99999-9999.'});return;}set({profile:f,pf:null,pfErr:''});back();toast('Dados atualizados.');},
    saveAddress(){const s=S(),f=s.af;if(!/^\d{5}-?\d{3}$/.test(f.cep)){set({addrErr:'CEP inválido. Use 8 números, como 52011-000.'});return;}if(!f.street.trim()||!f.number.trim()){set({addrErr:'Preencha a rua e o número.'});return;}set({address:f,af:null,addrErr:''});back();toast('Endereço atualizado. As distâncias foram recalculadas.');},
    lookupCep(){set(s=>{const f=s.af;if(!/^\d{5}-?\d{3}$/.test(f.cep))return {addrErr:'CEP inválido. Use 8 números, como 52011-000.'};return {addrErr:'',af:Object.assign({},f,{street:f.street||'Rua do Futuro',district:'Aflitos',city:'Recife/PE'})};});},
    loadList,
    reset(){set(s=>Object.assign(D.initial(),{screen:'home',wide:s.wide,kbd:false,demoOpen:false}),top);}
  };
  return a;
}
window.SPM_H=H;window.SPM_A=A;
})();
