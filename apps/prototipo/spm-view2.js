(function(){
const D=window.SPM_DATA,H=window.SPM_H,T=D.T;
const KI={confirmacao:['calendar-check','var(--teal-100)','var(--teal-700)'],lembrete:['bell-ring','var(--qa-blue-bg)','var(--qa-blue-ink)'],alteracao:['calendar-clock','var(--qa-sand-bg)','var(--qa-sand-ink)'],exame:['flask-conical','var(--qa-lilac-bg)','var(--qa-lilac-ink)'],receita:['pill','var(--qa-rose-bg)','var(--qa-rose-ink)']};
window.SPM_VIEW2=function(c,x){
  const s=c.state,a=c.a,v={};
  const ap=s.appts.find(y=>y.id===s.apptId)||x.upcoming[0]||s.appts[0];
  const ad=H.doc(ap.docId),acl=H.clinic(ad);
  // Horário
  const dr=s.draft,hd=H.doc(dr.docId),m=s.calMonth;
  const first=new Date(2026+Math.floor(m/12),m%12,1),days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
  const cells=[];for(let i=0;i<first.getDay();i++)cells.push({label:'',disabled:true,bg:'transparent',border:'transparent',color:'transparent',op:'1',weight:'400',aria:'',onClick:null});
  for(let d=1;d<=days;d++){const iso=H.iso(new Date(first.getFullYear(),first.getMonth(),d));const sl=H.slots(s,dr.docId,iso);const has=sl.m.length+sl.a.length>0;const sel=dr.date===iso;
    cells.push({label:String(d),disabled:!has,aria:H.fdl(iso)+(has?', com horários':', sem horários'),bg:sel?'var(--teal-600)':'#fff',border:sel?'var(--teal-600)':has?'var(--border-control)':'transparent',color:sel?'#fff':has?'var(--ink)':'var(--ink-muted)',op:has?'1':'.5',weight:sel||iso===T?'700':'400',onClick:()=>a.pickDate(iso)});}
  const sl=dr.date?H.slots(s,dr.docId,dr.date):{m:[],a:[]};
  const tb=t=>{const sel=dr.time===t;return {t,sel,bg:sel?'var(--teal-600)':'#fff',border:sel?'var(--teal-600)':'var(--border-control)',color:sel?'#fff':'var(--ink)',onClick:()=>a.pickTime(t)};};
  const isR=s.mode==='remarcar';
  v.ho={label:isR?'13 Reagendamento':'05 Data e horário',title:isR?'Remarcar consulta':'Escolha data e horário',isResched:isR,current:isR?H.fd(ap.date)+', '+ap.time:'',
    photoId:hd.id,hasPhoto:!!hd.photo,noPhoto:!hd.photo,initials:H.initials(hd.name),docName:hd.name,docSub:hd.spec+' · '+H.clinic(hd).name,
    hasError:!!s.slotError,error:s.slotError,month:H.monthLabel(m),noPrev:m<=10,noNext:m>=12,prevOp:m<=10?'.35':'1',nextOp:m>=12?'.35':'1',
    onPrev:()=>a.set({calMonth:Math.max(10,m-1)}),onNext:()=>a.set({calMonth:Math.min(12,m+1)}),cells,
    noDate:!dr.date,hasDate:!!dr.date,dateLabel:dr.date?H.fdl(dr.date):'',morning:sl.m.map(tb),afternoon:sl.a.map(tb),hasMorning:sl.m.length>0,hasAfternoon:sl.a.length>0,
    noSlots:!!dr.date&&!sl.m.length&&!sl.a.length,
    cant:!dr.date||!dr.time,cta:isR?'Remarcar para este horário':'Continuar',onContinue:a.continueTime};
  // Revisão
  const hcl=H.clinic(hd);
  v.rv={rows:[
    ['user','Paciente',s.profile.name,'',null],
    ['stethoscope','Médico',hd.name,hd.spec+' · '+hd.crm,()=>{a.back();a.back();}],
    ['building-2','Clínica',hcl.name,hcl.addr,null],
    ['route','Distância da sua casa',H.kmTxt(H.km(s,hd)),'',null],
    ['calendar','Data e horário',dr.date?H.fdl(dr.date):'',dr.time?'às '+dr.time:'',()=>a.back()],
    ['wallet','Valor',dr.payment==='convenio'?'Coberto pelo convênio':H.money(hd.price),dr.payment==='convenio'?s.profile.plan+' · carteirinha '+s.profile.card:'Pagamento na clínica',null]
  ].map(([icon,label,value,sub,ed])=>({icon,label,value,sub,hasSub:!!sub,hasEdit:!!ed,onEdit:ed})),
    pay:[['particular','Particular']].concat(hd.conv?[['convenio','Convênio']]:[]).map(([k,l])=>({label:l,selected:dr.payment===k,onClick:()=>a.set({draft:Object.assign({},dr,{payment:k})})})),
    payNote:hd.conv?'Este médico aceita o seu convênio.':'Este médico atende apenas particular.',
    convOk:!!hd.conv,noConv:!hd.conv,convBlocked:!hd.conv&&dr.payment==='convenio',
    convAlert:!hd.conv&&dr.payment==='convenio'?'Este médico não aceita convênio. Escolha Particular para continuar.':'Este médico não aceita convênio. A consulta será particular: '+H.money(hd.price)+'.',
    ctaDisabled:!!s.confirming||(!hd.conv&&dr.payment==='convenio'),ctaOpacity:(!hd.conv&&dr.payment==='convenio')?'.45':'1',
    docName:hd.name,docSpec:hd.spec,onEditDoc:()=>{a.back();a.back();},clinicName:hcl.name,clinicAddr:hcl.addr,kmTxt:H.kmTxt(H.km(s,hd)),
    dateTxt:dr.date?H.fdl(dr.date):'',timeTxt:dr.time?'às '+dr.time:'',onEditDate:()=>a.back(),
    payTitle:dr.payment==='convenio'?s.profile.plan:H.money(hd.price),paySub:dr.payment==='convenio'?'':'Pagamento na clínica',hasPaySub:dr.payment!=='convenio',
    payPills:[['particular','Particular'],['convenio','Convênio']].map(([k,l])=>{const on=dr.payment===k;return {label:l,pressed:on?'true':'false',bg:on?'#03757f':'#d7eaea',ink:on?'#ffffff':'#16302f',onClick:()=>a.set({draft:Object.assign({},dr,{payment:k})})};}),
    cta:s.confirming?'Confirmando…':'Confirmar agendamento',onConfirm:()=>{if(!hd.conv&&dr.payment==='convenio')return;a.confirmBooking();}};
  v.confirming=s.confirming;
  // Consulta (detalhe/confirmada)
  v.ap={name:ad.name,spec:ad.spec,img:H.spec(ad.spec).img,illo:H.spec(ad.spec).illo,dateShort:(()=>{const d=H.parse(ap.date);const M=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];const W=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];const [hh,mm]=ap.time.split(':');return d.getDate()+' '+M[d.getMonth()]+' '+d.getFullYear()+' · '+W[d.getDay()]+', às '+(+hh)+'h'+(mm!=='00'?mm:'');})(),orientList:[['clock',D.ORIENT_DAY[0]],['id-card',D.ORIENT_DAY[1]]].concat(ap.payment==='convenio'?[['credit-card','Leve a carteirinha do convênio.']]:[]).concat([['file-text',D.ORIENT_DAY[3]]]).map(([icon,text])=>({icon,text})),clinic:acl.name,addr:acl.addr,phone:acl.phone,km:H.kmTxt(H.km(s,ad)),date:H.fdl(ap.date),time:ap.time,when:H.fd(ap.date)+', '+ap.time,
    pay:ap.payment==='convenio'?'Convênio '+s.profile.plan:'Particular · '+H.money(ad.price),orient:D.ORIENT_DAY,isToday:ap.date===T,stageTxt:D.STAGES[ap.stage][0],
    rows:[['calendar','Data',H.fdl(ap.date)],['clock','Horário',ap.time],['building-2','Clínica',acl.name],['map-pin','Endereço',acl.addr],['route','Distância',H.kmTxt(H.km(s,ad))],['wallet','Atendimento',ap.payment==='convenio'?'Convênio '+s.profile.plan:'Particular · '+H.money(ad.price)]].map(([icon,label,value])=>({icon,label,value})),
    onView:()=>a.set({screen:'consulta',hist:['home']}),onHome:()=>a.tab('inicio'),onResched:()=>a.startResched(ap.id),onCancel:()=>a.set({modal:'cancel'}),onTrack:()=>a.go('acompanhamento',{apptId:ap.id}),
    onRebook:()=>{a.startBooking(ad.id);}};
  // Acompanhamento
  v.tr={steps:D.STAGES.map(([t,d],i)=>{const done=i<ap.stage,cur=i===ap.stage;return {title:t,desc:d,time:i<=ap.stage?(i===0?D.STAGE_TIMES[0]:D.STAGE_TIMES[i]):'',
      dot:done||cur?'var(--teal-600)':'#fff',dotBorder:done||cur?'var(--teal-600)':'var(--border-control)',icon:done?'check':cur?'circle-dot':'circle',iconColor:done||cur?'#fff':'var(--border-control)',
      line:i<ap.stage?'var(--teal-600)':'var(--border-subtle)',hasLine:i<5,weight:cur?'700':'500',color:i<=ap.stage?'var(--ink)':'var(--ink-muted)',cur};}),
    finished:ap.stage===5,notFinished:ap.stage<5,canAdvance:ap.status==='agendado'||ap.stage<5,
    nextActor:['Recepção: confirmar chegada pelo CPF','Recepção: enviar para a sala de espera','Médico: chamar paciente','Médico: iniciar atendimento','Médico: finalizar atendimento',''][ap.stage],
    onAdvance:a.advanceStage,onDocs:()=>a.go('historico',{apptId:ap.id}),updated:'Atualizado há 5 segundos'};
  // Histórico da consulta
  const refName=r=>r.type==='receita'?['pill','Receita médica','var(--qa-rose-bg)','var(--qa-rose-ink)']:r.type==='exame'?['flask-conical',(s.exams.find(e=>e.id===r.id)||{}).name||'Exame','var(--qa-lilac-bg)','var(--qa-lilac-ink)']:['file-text','Solicitação de exames','var(--qa-blue-bg)','var(--qa-blue-ink)'];
  v.hi={orient:ap.orient||'',hasOrient:!!ap.orient,noOrient:!ap.orient,status:({realizada:'Realizada',cancelada:'Cancelada',faltou:'Não compareceu'})[ap.status]||'Agendada',
    docs:(ap.docs||[]).map(r=>{const [icon,label,bg,ink]=refName(r);return {icon,label,bg,ink,type:r.type==='receita'?'Receita':r.type==='exame'?'Resultado de exame':'Solicitação',onClick:()=>a.openDocRef(r)};}),
    hasDocs:(ap.docs||[]).length>0,noDocs:!(ap.docs||[]).length};
  // Minhas consultas
  const isUp=s.consTab==='proximas',list=(isUp?x.upcoming:x.past).map(x.apptVM);
  v.cons={tabs:[['proximas','Próximas'],['historico','Histórico']].map(([k,l])=>({label:l,selected:s.consTab===k,onClick:()=>a.set({consTab:k})})),list,empty:!list.length,
    emptyTxt:isUp?'Você não tem consultas marcadas.':'Ainda não há consultas no histórico.',isUp,onBook:()=>a.go('agendar')};
  // Exames
  const eq=s.examQuery.trim().toLowerCase(),per=s.examPeriod;
  const lim={'30 dias':H.add(T,-30),'6 meses':H.add(T,-182),'Todos':'0'}[per];
  const ex=s.exams.filter(e=>(!eq||e.name.toLowerCase().includes(eq)||e.lab.toLowerCase().includes(eq))&&e.date>=lim).sort((p,q)=>q.date.localeCompare(p.date));
  const groups=[];ex.forEach(e=>{const g=H.fds(e.date).slice(3);let G=groups.find(y=>y.key===g);if(!G){const d=H.parse(e.date);G={key:g,title:['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][d.getMonth()]+' de '+d.getFullYear(),items:[]};groups.push(G);}
    const ok=e.status==='disponivel';G.items.push({name:e.name,icon:e.icon,date:'Realizado em '+H.fds(e.date),lab:e.lab,doctor:e.doctor?'Solicitado por '+e.doctor:'',badge:ok?'concluido':'aviso',badgeLabel:ok?'Resultado disponível':'Aguardando resultado',onClick:()=>a.guard('exame',{examId:e.id})});});
  v.exs={query:s.examQuery,onQuery:t=>a.set({examQuery:t}),periods:['Todos','30 dias','6 meses'].map(l=>({label:l,selected:per===l,onClick:()=>a.set({examPeriod:l})})),groups,empty:!groups.length,
    onClear:()=>a.set({examQuery:'',examPeriod:'Todos'})};
  const e=s.exams.find(y=>y.id===s.examId)||s.exams[0];
  v.ex={name:e.name,icon:e.icon,ready:e.status==='disponivel',waiting:e.status!=='disponivel',
    rows:[['calendar','Data de realização',H.fdl(e.date)],['building-2','Laboratório responsável',e.lab],['stethoscope','Médico solicitante',e.doctor||'Não informado'],['calendar-check','Resultado disponibilizado em',e.avail?H.fdl(e.avail):'Ainda não disponível']].map(([icon,label,value])=>({icon,label,value})),
    onView:()=>a.go('documento',{docRef:{type:'exame',id:e.id},page:0,zoom:1}),onPdf:()=>a.toast('PDF salvo em Downloads (demonstrativo).'),onShare:()=>a.set({modal:'share'})};
  Object.assign(v,window.SPM_VIEW3(c,x));
  return v;
};
})();
