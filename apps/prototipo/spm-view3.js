(function(){
const D=window.SPM_DATA,H=window.SPM_H,T=D.T;
window.SPM_VIEW3=function(c,x){
  const s=c.state,a=c.a,v={};
  // Documento
  const r=s.docRef||{type:'exame',id:'ex1'};let doc;
  if(r.type==='exame'){const e=s.exams.find(y=>y.id===r.id)||s.exams[0];const res=D.RESULTS[e.id]||[];
    doc={kind:'Resultado de exame',title:e.name,issuer:e.lab,date:'Coleta: '+H.fds(e.date)+(e.avail?' · Liberado: '+H.fds(e.avail):''),by:'Solicitante: '+(e.doctor||'—'),
      pages:[{rows:res.length?res.map(([n,val,ref])=>({n,val,ref})):[],text:res.length?'':'Laudo: articulação sem alterações ósseas agudas. Espaço articular preservado. (texto demonstrativo)',hasRows:res.length>0},
             {rows:[],hasRows:false,text:'Valores de referência conforme metodologia do laboratório. Este documento é o laudo original enviado pelo laboratório e não foi interpretado pelo aplicativo. Responsável técnico: Dra. Sílvia Rocha — CRF-PE 0000 (demonstrativo).'}]};}
  else if(r.type==='receita'){const rx=s.rxs.find(y=>y.id===r.id)||s.rxs[0],d=H.doc(rx.docId);
    doc={kind:'Receita médica',title:'Receituário',issuer:H.clinic(d).name,date:'Emitida em '+H.fds(rx.date),by:d.name+' · '+d.crm,
      pages:[{rows:rx.meds.map((m,i)=>({n:(i+1)+'. '+m.name,val:m.dose,ref:m.freq+' · '+m.dur})),hasRows:true,text:rx.notes}]};}
  else {const so=s.sols.find(y=>y.id===r.id)||s.sols[0],d=H.doc(so.docId);
    doc={kind:'Solicitação de exames',title:'Pedido de exames',issuer:H.clinic(d).name,date:'Emitida em '+H.fds(so.date),by:d.name+' · '+d.crm,
      pages:[{rows:so.items.map((it,i)=>({n:(i+1)+'. '+it,val:'',ref:''})),hasRows:true,text:'Levar este pedido ao laboratório de sua preferência.'}]};}
  const pg=Math.min(s.page,doc.pages.length-1),P=doc.pages[pg];
  v.dv={kind:doc.kind,title:doc.title,issuer:doc.issuer,date:doc.date,by:doc.by,patient:'Paciente: '+s.profile.name,rows:P.rows,hasRows:P.hasRows,text:P.text,hasText:!!P.text,
    pageTxt:'Página '+(pg+1)+' de '+doc.pages.length,noPrev:pg===0,noNext:pg>=doc.pages.length-1,prevOp:pg===0?'.35':'1',nextOp:pg>=doc.pages.length-1?'.35':'1',
    onPrev:()=>a.set({page:Math.max(0,pg-1)}),onNext:()=>a.set({page:Math.min(doc.pages.length-1,pg+1)}),
    width:Math.round(s.zoom*100)+'%',zoomTxt:Math.round(s.zoom*100)+'%',onZoomIn:()=>a.set({zoom:Math.min(2,s.zoom+0.25)}),onZoomOut:()=>a.set({zoom:Math.max(1,s.zoom-0.25)}),
    onPdf:()=>a.toast('PDF salvo em Downloads (demonstrativo).'),onShare:()=>a.set({modal:'share'})};
  // Receitas
  v.rxs=s.rxs.slice().sort((p,q)=>q.date.localeCompare(p.date)).map(rx=>{const d=H.doc(rx.docId);return {name:d.name,spec:d.spec,date:'Emitida em '+H.fds(rx.date),clinic:H.clinic(d).name,onClick:()=>a.guard('receita',{rxId:rx.id})};});
  v.noRx=!v.rxs.length;
  const rx=s.rxs.find(y=>y.id===s.rxId)||s.rxs[0],rd=H.doc(rx.docId);
  v.rx={meds:rx.meds.map(m=>({name:m.name,rows:[['Dosagem',m.dose],['Frequência',m.freq],['Duração',m.dur]].map(([l,val])=>({l,val}))})),notes:rx.notes,doctor:rd.name,crm:rd.crm+' · '+rd.spec,clinic:H.clinic(rd).name,date:H.fdl(rx.date),
    onView:()=>a.go('documento',{docRef:{type:'receita',id:rx.id},page:0,zoom:1}),onPdf:()=>a.toast('PDF salvo em Downloads (demonstrativo).'),onShare:()=>a.set({modal:'share'})};
  // Pré-triagem
  const t=s.tri,qn=D.QS[Math.min(t.step,D.QS.length-1)];
  const sug=H.triageSpec(t.answers,''),sp=H.spec(sug);
  v.tri={msgs:t.msgs.map(m=>({text:m.text,ai:m.from==='ai',me:m.from==='me'})),typing:t.typing,opts:(!t.typing&&!t.done&&!t.emergency)?qn.opts.map(o=>({label:o,onClick:()=>a.triAnswer(o)})):[],
    showInput:!t.done&&!t.emergency,input:t.input,onInput:val=>a.set({tri:Object.assign({},t,{input:val})}),onSend:()=>a.triAnswer(t.input),
    progress:'Pergunta '+Math.min(t.step+1,D.QS.length)+' de '+D.QS.length,done:t.done,emergency:t.emergency,
    onResult:()=>a.go('triagemResult'),onManual:()=>a.go('especialidades',{specQuery:''}),onStart:a.triStart,
    onSamu:()=>a.toast('Ligando para o SAMU 192 (demonstrativo).'),onUpa:()=>a.toast('Abrindo UPAs próximas no mapa (demonstrativo).'),
    sug:sug||'',hasSug:!!sug,noSug:!sug,img:sp.img,why:sug?D.WHY[sug]:'',summary:t.answers.map((ans,i)=>({q:D.QS[i]?D.QS[i].q:'',ans})),
    onFind:()=>sug&&a.openSpec(sug),illo:sp.illo,
    plain:({Cardiologia:'Médico do coração',Gastroenterologia:'Médico do estômago e da digestão',Neurologia:'Médico do cérebro e dos nervos','Clínico Geral':'Médico para cuidados gerais',Ortopedia:'Médico dos ossos e articulações',Ginecologia:'Médico da saúde da mulher',Dermatologia:'Médico da pele',Imunologia:'Médico das alergias e da imunidade','Obstetrícia':'Médico da gravidez',Nefrologia:'Médico dos rins',Pneumologia:'Médico dos pulmões',Coloproctologia:'Médico do intestino',Odontologia:'Dentista'})[sug]||'',
    rows:t.answers.map((ans,i)=>({q:['Sente','Há quanto tempo','Onde','Outro sintoma'][i]||(D.QS[i]?D.QS[i].q:''),ans}))};
  // Perfil
  const pr=s.profile,ad=s.address;
  v.pf={name:pr.name,initials:H.initials(pr.name),sub:'CPF '+pr.cpf.slice(0,4)+'•••.•••-'+pr.cpf.slice(-2),addr:ad.street+', '+ad.number+' — '+ad.district,
    items:[['user-round','Dados pessoais',()=>{a.set({pf:Object.assign({},pr),pfErr:''});a.go('dados');}],['house','Meu endereço',()=>{a.set({af:Object.assign({},ad),addrErr:''});a.go('endereco');}],
      ['history','Histórico de consultas',()=>{a.set({consTab:'historico'});a.tab('consultas');}],['flask-conical','Meus exames',()=>a.go('exames')],['pill','Receitas médicas',()=>a.go('receitas')]].map(([icon,label,onClick])=>({icon,label,onClick}))};
  const f=s.pf||pr,fs=k=>val=>a.set({pf:Object.assign({},f,{[k]:val})});
  v.dp={name:f.name,birth:f.birth,cpf:f.cpf,phone:f.phone,email:f.email,plan:f.plan+' · '+f.card,onName:fs('name'),onPhone:fs('phone'),onEmail:fs('email'),err:s.pfErr,hasErr:!!s.pfErr,onSave:a.saveProfile};
  const g=s.af||ad,gs=k=>val=>a.set({af:Object.assign({},g,{[k]:val})});
  v.en={cep:g.cep,street:g.street,number:g.number,district:g.district,city:g.city,comp:g.comp,onCep:gs('cep'),onStreet:gs('street'),onNumber:gs('number'),onDistrict:gs('district'),onCity:gs('city'),onComp:gs('comp'),
    err:s.addrErr,hasErr:!!s.addrErr,onLookup:a.lookupCep,onSave:a.saveAddress};
  // Ajustes
  const st=s.settings,setS=p=>a.set({settings:Object.assign({},st,p)});
  v.aj={sizes:['normal','grande','muito grande'].map(k=>({label:k==='normal'?'Normal':k==='grande'?'Grande':'Muito grande',selected:st.text===k,onClick:()=>setS({text:k})})),
    unread:x.unread?x.unread+' novas':'Nenhuma nova',
    rows:[['accessibility','Acessibilidade',()=>a.go('acessibilidade')],['bell','Notificações',()=>a.go('notificacoes')],['shield-check','Privacidade e segurança',()=>a.go('privacidade')],['key-round','Alterar senha',()=>{a.set({pwf:{cur:'',n1:'',n2:'',err:''}});a.go('senha');}],['life-buoy','Ajuda e suporte',()=>a.go('ajuda')]].map(([icon,label,onClick])=>({icon,label,onClick})),
    onLogout:()=>a.set({modal:'logout'})};
  v.priv={protect:st.protectDocs,protectTxt:st.protectDocs?'Ativado':'Desativado',onToggle:()=>setS({protectDocs:!st.protectDocs}),toggleBg:st.protectDocs?'var(--teal-600)':'var(--border-control)',knob:st.protectDocs?'26px':'2px',
    onLock:()=>{a.set({unlocked:false});a.toast('Documentos bloqueados novamente.');}};
  const pw=s.pwf,pws=k=>val=>a.set({pwf:Object.assign({},pw,{[k]:val,err:''})});
  v.pw={cur:pw.cur,n1:pw.n1,n2:pw.n2,err:pw.err,onCur:pws('cur'),onN1:pws('n1'),onN2:pws('n2'),
    onSave:()=>{if(pw.cur!==s.login.pw)return a.set({pwf:Object.assign({},pw,{err:'A senha atual não confere.'})});if(pw.n1.length<8)return a.set({pwf:Object.assign({},pw,{err:'A nova senha precisa ter pelo menos 8 caracteres.'})});if(pw.n1!==pw.n2)return a.set({pwf:Object.assign({},pw,{err:'As duas senhas novas não são iguais.'})});a.set({login:Object.assign({},s.login,{pw:pw.n1})});a.back();a.toast('Senha alterada.');}};
  // Notificações
  const KI={confirmacao:['calendar-check','var(--teal-100)','var(--teal-700)'],lembrete:['bell-ring','var(--qa-blue-bg)','var(--qa-blue-ink)'],alteracao:['calendar-clock','var(--qa-sand-bg)','var(--qa-sand-ink)'],exame:['flask-conical','var(--qa-lilac-bg)','var(--qa-lilac-ink)'],receita:['pill','var(--qa-rose-bg)','var(--qa-rose-ink)']};
  v.nt={list:s.notifs.map(n=>{const [icon,bg,ink]=KI[n.kind];return {title:n.title,text:n.text,time:n.time,icon,bg,ink,unread:!n.read,border:n.read?'var(--border-subtle)':'var(--teal-600)',onClick:()=>a.openNotif(n)};}),
    empty:!s.notifs.length,hasUnread:x.unread>0,onReadAll:()=>a.set({notifs:s.notifs.map(n=>Object.assign({},n,{read:true}))})};
  // Modais
  v.modal={any:!!s.modal,cancel:s.modal==='cancel',resched:s.modal==='resched',logout:s.modal==='logout',unlock:s.modal==='unlock',share:s.modal==='share',
    close:()=>a.set({modal:null}),onCancelYes:a.confirmCancel,onReschedYes:a.confirmResched,onLogoutYes:()=>a.set({modal:null,screen:'login',hist:[],unlocked:false}),
    cancelTxt:'Sua consulta com '+H.doc((s.appts.find(y=>y.id===s.apptId)||s.appts[0]).docId).name+' em '+H.fd((s.appts.find(y=>y.id===s.apptId)||s.appts[0]).date)+' será cancelada e o horário ficará livre para outra pessoa.',
    reschedFrom:(()=>{const p=s.appts.find(y=>y.id===s.apptId)||s.appts[0];return H.fd(p.date)+', '+p.time;})(),reschedTo:s.draft.date?H.fd(s.draft.date)+', '+(s.draft.time||''):'',
    pw:s.unlockPw,onPw:val=>a.set({unlockPw:val,unlockErr:''}),pwErr:s.unlockErr,onUnlock:()=>a.unlock(false),onBio:()=>a.unlock(true),
    onShareWhats:()=>{a.set({modal:null});a.toast('Link seguro enviado. Ele expira em 24 horas (demonstrativo).');},onShareMail:()=>{a.set({modal:null});a.toast('Documento enviado por e-mail (demonstrativo).');}};
  // Painel de demonstração
  const live=s.appts.find(y=>y.id==='a1');
  v.demo={stage:live?D.STAGES[live.stage][0]:'—',canAdvance:!!live&&live.stage<5,done:!live||live.stage>=5,onAdvance:()=>{a.set({apptId:'a1'});setTimeout(a.advanceStage,0);},
    onTrack:()=>{a.set({apptId:'a1',screen:'acompanhamento',hist:['home']});},conflict:!!s.forceConflict,conflictTxt:s.forceConflict?'Ativado para o próximo agendamento':'Desativado',onConflict:()=>a.set({forceConflict:!s.forceConflict}),
    onReset:a.reset,onEmpty:()=>a.set({appts:s.appts.filter(y=>y.status!=='agendado'),screen:'home',hist:[]}),
    jumps:[['Login','login'],['Início','home'],['Pré-triagem','triagemIntro'],['Meus exames','exames'],['Receitas','receitas'],['Notificações','notificacoes']].map(([l,k])=>({label:l,onClick:()=>a.set({screen:k,hist:k==='home'||k==='login'?[]:['home'],modal:null})}))};
  return v;
};
})();
