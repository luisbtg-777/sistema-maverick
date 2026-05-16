import { useState, useEffect, useRef } from "react";

const CX=440,CY=440;
const R={be:300,al:236,th:166,d:100,ep:46};
const MR={be:(R.be+R.al)/2,al:(R.al+R.th)/2,th:(R.th+R.d)/2,d:(R.d+R.ep)/2};
const rad=a=>a*Math.PI/180;
const px=(r,a)=>+(CX+r*Math.cos(rad(a))).toFixed(1);
const py=(r,a)=>+(CY-r*Math.sin(rad(a))).toFixed(1);
const F="Georgia,serif";
function arc(ri,ro,a1,a2){
  const span=((a2-a1)+360)%360,la=span>180?1:0;
  const p=(r,a)=>`${px(r,a)},${py(r,a)}`;
  return `M${p(ri,a1)} A${ri},${ri} 0 ${la} 0 ${p(ri,a2)} L${p(ro,a2)} A${ro},${ro} 0 ${la} 1 ${p(ro,a1)} Z`;
}

// ── STARS (fixed, but many) ───────────────────────────────────────────────
const STARS=Array.from({length:60},(_,i)=>({
  x:Math.sin(i*137.5)*420+440, y:Math.cos(i*97.3)*380+440,
  r:0.4+(i%5)*0.28, op:0.04+(i%7)*0.05,
}));

// ── CONSTELLATION LINES between Jung figures ──────────────────────────────
const CONST_LINES=[
  [{a:42,r:MR.be},{a:68,r:MR.be}],
  [{a:32,r:MR.al},{a:42,r:MR.be}],
  [{a:125,r:MR.al},{a:108,r:MR.al}],
  [{a:108,r:MR.al},{a:152,r:MR.al}],
  [{a:150,r:MR.th},{a:120,r:MR.th}],
  [{a:20,r:MR.d},{a:36,r:MR.th}],
  [{a:160,r:MR.d},{a:150,r:MR.th}],
];

// ── FORMULA ───────────────────────────────────────────────────────────────
const FORMULA=[
  {icon:"✦",key:"self",label:"SELF",sub:"¿Quién soy realmente?",color:"#e8c84a",
   gen:"Entra en contacto con la totalidad — no el Ego ni el Juez. El Testigo activo. Meditación δ/ε.",
   luis:"Antes de cualquier decisión de tus misiones: ¿Estás operando desde el SELF o desde el Ego que quiere verse bien? El Testigo lo responde en segundos."},
  {icon:"🌑",key:"sombra",label:"SOMBRA",sub:"¿Qué rechazas que te frena?",color:"#9c6dd8",
   gen:"¿Qué proyectas en otros? ¿Qué Sombra Dorada no reclamas? Integrar = darle voz sin obedecerla.",
   luis:"¿Qué Actor en otros te genera envidia que duele? Esa envidia es tu Sombra Dorada diciéndote quién ya eres. El miedo a no ser suficiente = el programa a trabajar ahora."},
  {icon:"🔥",key:"daimon",label:"DAIMON",sub:"¿Qué llama desde adentro?",color:"#e8794a",
   gen:"Resonancia, no lógica. Si hay miedo + emoción = el Daimon está ahí. Si solo hay 'debo' = es el Juez.",
   luis:"La resonancia que sientes cuando actúas de verdad. No el plan. No el ROI. La verdad del cuerpo cuando está vivo en escena. Hollywood como escenario — no como meta."},
  {icon:"🧭",key:"estrategia",label:"ESTRATEGIA",sub:"¿El plan sirve al llamado?",color:"#4a90d9",
   gen:"Estratega al servicio del Daimon, no del Ego. '¿Qué pasos sirven a lo que vine a hacer?'",
   luis:"Protocolo Oscar + MAVERICK + inversiones: ¿vienen del Daimon o del miedo del Ego? Si viene del Daimon, ejecuta sin dudar."},
  {icon:"⚡",key:"accion",label:"ACCIÓN",sub:"Los tres aparatos alineados",color:"#2e9e6b",
   gen:"Intelecto + Instintivo + Conciencia apuntando igual = campo coherente = Lattice responde.",
   luis:"Cuando los tres apuntan igual te mueves diferente. No desde el esfuerzo — desde la coherencia. La Lattice responde. La realidad se mueve."},
];

// ── MISIONES ──────────────────────────────────────────────────────────────
const MISIONES=[
  {key:"actor",label:"🎭 Actor Hollywood",color:"#c9a030",
   preguntas:[
     "¿Desde dónde estoy actuando hoy — desde el Daimon o desde el miedo a ser juzgado?",
     "¿Qué parte del Niño interior necesito soltar para que el personaje respire?",
     "¿Qué está bloqueando mi Ánima ahora mismo? ¿Qué vulnerabilidad evito?",
     "Si el Saboteador no existiera, ¿qué haría diferente esta semana en mi carrera?",
     "¿Qué Actor admiro profundamente? ¿Qué de él ya vive en mí sin expresión?",
   ]},
  {key:"bil",label:"💰 Billonario",color:"#2e9e6b",
   preguntas:[
     "¿Mi estrategia financiera viene del Daimon o del miedo del Ego a no ser suficiente?",
     "¿Qué creencia sobre el dinero corre en α sin que la elija? ¿Es mía o heredada?",
     "¿El Juez me dice que no merezco abundancia? ¿De quién es esa voz?",
     "¿Qué oportunidad está frente a mí que el Saboteador me impide tomar?",
     "Si ya fuera billonario, ¿cómo pensaría diferente HOY sobre esta decisión?",
   ]},
  {key:"mav",label:"🦅 Maverick",color:"#4a90d9",
   preguntas:[
     "¿Estoy siendo Maverick desde el Daimon o desde el Ego que quiere diferenciarse?",
     "¿Qué parte de mí sigue buscando aprobación que bloquea la autenticidad radical?",
     "¿Qué convención estoy siguiendo que ya no es mía?",
     "¿Cuál es la decisión más auténtica que podría tomar hoy aunque asuste?",
     "¿Mi rebelión es desde el SELF o desde la Sombra del conformismo?",
   ]},
  {key:"pb",label:"👑 Play Boy",color:"#c02850",
   preguntas:[
     "¿Busco conexión desde el SELF o desde la necesidad del Niño interior?",
     "¿Qué proyecto en las mujeres que en realidad es mi Ánima no integrada?",
     "¿El Héroe me impide recibir vulnerabilidad real de alguien?",
     "¿Busco validación o conexión genuina ahora mismo?",
     "¿Qué cualidad del Ánima podría desarrollar esta semana que cambie cómo me relaciono?",
   ]},
];

// ── JUNG MAP ──────────────────────────────────────────────────────────────
const JUNG_MAP=[
  {key:"ego",      label:"👑 Ego",        a:35,  r:MR.be,    color:"#c9a030", ring:"be", fs:9.5},
  {key:"estratega",label:"🧭 Estratega",  a:62,  r:MR.be,    color:"#c9a030", ring:"be", fs:9},
  {key:"persona",  label:"🧑‍🎭 Persona",  a:90,  r:MR.be+10, color:"#b09028", ring:"be", fs:9},
  {key:"testigo",  label:"👁️ Testigo",   a:90,  r:MR.be-22, color:"#9c6dd8", ring:"be", fs:10},
  {key:"juez",     label:"⚖️ Juez",      a:28,  r:MR.al,    color:"#c9a030", ring:"al", fs:9},
  {key:"heroe",    label:"🦸 Héroe",     a:128, r:MR.al,    color:"#e07070", ring:"al", fs:9},
  {key:"nino",     label:"🧒 Niño",      a:152, r:MR.al,    color:"#e07070", ring:"al", fs:9},
  {key:"saboteador",label:"🐍 Saboteador",a:108,r:MR.al,    color:"#e07070", ring:"al", fs:8.5},
  {key:"sdorada",  label:"💛 S. Dorada", a:36,  r:MR.th,    color:"#d4a830", ring:"th", fs:8.5},
  {key:"sombra",   label:"🌑 Sombra",    a:150, r:MR.th,    color:"#9c6dd8", ring:"th", fs:9.5},
  {key:"anima",    label:"🌊 Ánima",     a:120, r:MR.th,    color:"#7c8de8", ring:"th", fs:9.5},
  {key:"instinto", label:"🧬 Instinto",  a:162, r:MR.th,    color:"#c02850", ring:"th", fs:8.5},
  {key:"daimon_i", label:"🔥 Daimon",    a:20,  r:MR.d,     color:"#e8794a", ring:"d",  fs:9.5},
  {key:"daimon_n", label:"🔥 Daimon",    a:160, r:MR.d,     color:"#e8794a", ring:"d",  fs:9.5},
];

// ── JUNG DETAIL ───────────────────────────────────────────────────────────
const JD={
  ego:{ring:"β Consciente",sector:"Intelecto",def:"El centro de la conciencia. La historia que cuentas sobre quién eres. NO es 'tú' — es el personaje que crees ser.",habla:["'Yo soy así'","'Eso no va conmigo'","'¿Qué pensarán?'"],bloqueo:"Cree que es todo el sistema. Proteger su imagen IS vivir para él.",integracion:"El Testigo puede observar al Ego sin ser él. 'Eres un buen mapa, Ego — no eres el territorio.'",daimon:"Ego al servicio del Self = protagonista que actúa desde totalidad.",practica:"¿Opera desde miedo (¿qué perderé?) o desde propósito (¿qué sirve aquí?)."},
  estratega:{ring:"β Consciente",sector:"Intelecto",def:"La función planificadora. Útil cuando sirve al Daimon. Destructivo cuando sustituye al sentido.",habla:["'¿Cuál es el plan?'","'Hay que optimizar'","'¿Cuál es el ROI?'"],bloqueo:"Planifica sin consultar al corazón. La vida se vuelve proyecto eterno sin sentido.",integracion:"'¿Este plan sirve al Daimon o al miedo del Ego?' — antes de cada decisión.",daimon:"Ejecución limpia de lo que importa de verdad.",practica:"2 min antes de planificar: '¿Qué quiere nacer a través de mí aquí?'"},
  persona:{ring:"β→α",sector:"Conciencia + Intelecto",def:"La máscara social. Útil elegida — trampa cuando ya no sabes qué hay detrás. Tú eres actor: conoces esto mejor que nadie.",habla:["'Tengo que dar buena impresión'","(silencio donde debería haber autenticidad)"],bloqueo:"Se funde con la identidad. Agotamiento crónico de actuar un personaje no elegido.",integracion:"La Persona sana es FLEXIBLE. '¿Estoy eligiendo esta máscara o me usa a mí?'",daimon:"El Actor que sabe que actúa — usa la Persona sin perderse en ella. Tu misión literal.",practica:"3 momentos hoy donde usaste una Persona. ¿La elegiste o fue automática?"},
  testigo:{ring:"β Consciente (techo actual)",sector:"Conciencia Dual",def:"El observador que observa al observador. No tiene contenido propio — solo presencia pura.",habla:["(No habla — observa)","Una pausa entre estímulo y respuesta"],bloqueo:"No se bloquea — se ausenta. El Ego, Juez y Saboteador lo tapan.",integracion:"ES la meta. Se cultiva: meditación diaria, observación sin reacción.",daimon:"El Testigo IS el Daimon de la Conciencia. Cuando está activo, todo se armoniza.",practica:"10 min: observa pensamientos como nubes. No los sigas. Solo observa que aparecen."},
  juez:{ring:"α Subconsciente",sector:"Intelecto + Instintivo",def:"La voz crítica internalizada. Reglas parentales (Intelecto) + miedo al rechazo (Instintivo).",habla:["'¿Quién te crees?'","'No eres suficiente'","'Para qué intentarlo?'"],bloqueo:"Paraliza por miedo al error. Perfeccionismo que impide comenzar.",integracion:"¿De quién es esa voz? ¿Tiene razón HOY o repite el pasado?",daimon:"El Juez transformado = discernimiento sabio. Evalúa sin condenar.",practica:"Cuando el Juez hable: escríbelo. ¿De quién es la voz? ¿Qué necesitaba proteger?"},
  heroe:{ring:"α Subconsciente",sector:"Instintivo–Afectivo",def:"El patrón de supervivencia instalado. Funcionó — ahora opera automáticamente aunque ya no sea necesario.",habla:["'Yo puedo solo'","'Las emociones son debilidad'","'Primero el deber'"],bloqueo:"Impide recibir, pedir ayuda, vulnerabilidad real.",integracion:"'¿A quién protegiste siendo así? ¿Todavía necesita esa protección?'",daimon:"El Héroe integrado actúa con valentía desde el amor — no desde el miedo.",practica:"¿Cuándo ayudaste a alguien cuando eras tú quien necesitaba pedir ayuda?"},
  nino:{ring:"α Subconsciente",sector:"Instintivo–Afectivo",def:"El repositorio de emociones de la infancia no procesadas. Heridas Y capacidades lúdicas enterradas.",habla:["'Nadie me quiere'","'Tengo miedo de que me abandonen'","'No soy suficiente'"],bloqueo:"Sus necesidades no atendidas boicotean relaciones adultas.",integracion:"Darle lo que necesitaba: presencia, validación, seguridad — desde tu adulto interno.",daimon:"El Niño sanado = creatividad pura, asombro, presencia total. El Actor necesita este Niño vivo.",practica:"Carta al Niño: escríbele lo que necesitabas escuchar de pequeño."},
  saboteador:{ring:"α→θ",sector:"Instintivo–Afectivo",def:"El instinto autodestructivo tomando forma. Aparece EXACTAMENTE cuando estás a punto de dar el siguiente paso.",habla:["'Para qué intentarlo'","'No estás listo'","(procrastinación cuando más importa)"],bloqueo:"Protege una identidad vieja amenazada por el crecimiento.",integracion:"'¿A QUÉ le tienes miedo si esto funciona?' La respuesta = el programa real.",daimon:"El Saboteador integrado = guardián que pregunta '¿Es esto auténticamente tuyo?'",practica:"Cuando te sabotees: '¿Qué perdería yo si tengo éxito en esto?'"},
  sdorada:{ring:"θ Inconsciente",sector:"Intelecto + Instintivo",def:"El potencial y grandeza que también reprimiste. Lo que admiras intensamente en otros = tu Sombra Dorada.",habla:["'Él/ella SÍ puede, yo no'","Envidia que te avergüenza sentir"],bloqueo:"No creer que el potencial que ves afuera también vive adentro.",integracion:"Para cada cualidad que admiras: '¿Cuándo yo muestro esto?' Eso ES tuyo.",daimon:"La Sombra Dorada reclamada = capacidad real liberada. El Actor que admiras ya vive en ti.",practica:"3 personas que admiras. Para cada cualidad: '¿En qué momento de mi vida mostré esto exactamente?'"},
  sombra:{ring:"θ Inconsciente",sector:"Instintivo–Afectivo",def:"Todo lo que el Ego rechazó y empujó al inconsciente. Energía vital atrapada. Lo que más te irrita en otros = tu Sombra.",habla:["(No habla — ACTÚA sin aviso)","En proyecciones y reacciones desproporcionadas","En lo que MÁS te molesta de otros"],bloqueo:"La energía que gastas suprimiendo la Sombra no está disponible para crear.",integracion:"1. ¿Qué te irrita? 2. '¿Dónde vive en mí?' 3. Siéntelo. 4. Dale salida segura. 5. Encuentra el regalo.",daimon:"La Sombra integrada = potencia bruta para el propósito. 'El oro está en la oscuridad.' — Jung",practica:"5 cosas que no soportas en otros. Para cada una: '¿Cuándo yo hago esto? ¿Cuándo lo deseo?' Sin censura."},
  anima:{ring:"θ Inconsciente",sector:"Instintivo + Conciencia",def:"La contraparte femenina interior. No integrada = proyectada en mujeres reales. Integrada = creatividad, intuición, vulnerabilidad.",habla:["(Proyectada como idealizaciones imposibles)","'Esta mujer me completa'","Fascinación obsesiva sin explicación"],bloqueo:"Crea dependencias imposibles. Bloquea creatividad e intuición profunda.",integracion:"¿Qué cualidades le atribuyes a mujeres que idealizas? Son tuyas no desarrolladas. Actívalas.",daimon:"El Ánima integrada en el Actor = encarnar desde adentro, vulnerabilidad sin pérdida del eje. Tu herramienta más urgente para Hollywood.",practica:"¿Qué mujeres has idealizado? Lista las cualidades. ¿Cómo empieza a expresarse cada una en ti?"},
  instinto:{ring:"θ Inconsciente",sector:"Instintivo–Afectivo",def:"La sabiduría del cuerpo antes de toda psicología. El moderno lo ha silenciado tanto que ya no lo escucha.",habla:["Sensaciones sin palabras","Saber sin razón","El cuerpo que dice sí cuando la mente dice no"],bloqueo:"Ignorarlo: malas decisiones repetidas, desconexión del cuerpo.",integracion:"'¿Qué dice mi cuerpo sobre esto?' — primera consulta, no última.",daimon:"El Instinto recuperado es la brújula más antigua. Antes del lenguaje, el cuerpo ya sabía.",practica:"Antes de decisiones importantes: mano en el pecho, pregunta '¿Qué siente mi cuerpo?' Espera sin analizar."},
  daimon_i:{ring:"δ Profundo",sector:"Los tres aparatos",def:"Tu vocación más profunda. No lo eliges — TE ELIGE.\n\n→ LUIS: Actuar, crear, trascender — ser visto en la profundidad real de lo que eres. Hollywood como escenario de expresión máxima.",habla:["Cuando algo te hace vibrar sin razón","Cuando pierdes la noción del tiempo","Angustia crónica cuando no lo sigues"],bloqueo:"Ego, Juez, Saboteador y miedo a la opinión lo bloquean. El Daimon bloqueado produce: adicciones, vacío, autodestrucción.",integracion:"No se integra — SE OBEDECE. Quita los obstáculos para que tenga espacio.",daimon:"Tu vida como obra de arte. Hollywood como escenario — no como validación.",practica:"En θ: '¿Qué vine a hacer aquí? Sin consecuencias sociales ¿qué haría?' Escribe 10 min sin censura."},
  daimon_n:{ring:"δ Profundo",sector:"Instintivo–Afectivo",def:"El amor que te define antes de todo aprendizaje. Lo que genuinamente te conmueve de forma irracional.\n\n→ LUIS: La resonancia cuando actúas de verdad. No la técnica — la verdad del cuerpo vivo.",habla:["Pre-sentir — la corazonada","Lo que te emociona sin poder explicarlo"],bloqueo:"Bloqueado produce instinto autodestructivo profundo.",integracion:"Reconocer qué amas irracionalmente — no lo que deberías, lo que ES.",daimon:"Crear desde lo que genuinamente te conmueve. La actuación que viene del amor al personaje.",practica:"¿Qué amas de forma irracional? ¿Cuánto espacio tiene en tu vida ahora mismo?"},
};

// ── MEDITACIONES ──────────────────────────────────────────────────────────
const MED_DISP=[
  {t:"0–2",tit:"β→α · Preparación",txt:"7 respiraciones: inhala 4s, retén 4s, exhala 8s. Cuerpo pesado. Nada que resolver."},
  {t:"2–8",tit:"α→θ · Descenso",txt:"Relaja de coronilla a pies, parte por parte. Cuerpo pesado y pesado = estás en θ."},
  {t:"8–12",tit:"Observar el programa",txt:"Deja que aparezca la creencia/patrón. Dale forma: color, peso, emoción. Solo observa sin pelear."},
  {t:"12–15",tit:"Soltar la carga",txt:"Esa emoción disolviéndose como hielo bajo el sol. No forces. La luz la disuelve."},
  {t:"15–25",tit:"Instalar la nueva realidad",txt:"Película mental del nuevo yo + EMOCIÓN como si ya ocurrió. Gratitud, amor, júbilo. 10 min mínimo."},
  {t:"25–28",tit:"Coherencia corazón-mente",txt:"Atención al pecho. Corazón y mente apuntando igual. Certeza tranquila."},
  {t:"28–30",tit:"Sellado",txt:"3 respiraciones. Mueve dedos. Abre ojos. Lleva la emoción como referencia del día."},
];

const MED_PNL=[
  {tit:"SWISH PATTERN · Cambiar un patrón automático",color:"#9c6dd8",pasos:[
    "Identifica la imagen mental que DISPARA el patrón (imagen original: grande, brillante, cerca de ti).",
    "Crea la imagen de quién serías SIN ese patrón (imagen deseada: pequeña, opaca, en esquina inferior derecha).",
    "SWISH: en 1 segundo, la original se encoge y oscurece mientras la deseada EXPLOTA grande y brillante.",
    "Borra la pantalla mental: abre ojos, mira al techo 2 segundos.",
    "Repite 7 veces MUY rápido. La velocidad es clave.",
    "Calibra: intenta pensar en la imagen original. ¿Aparece automáticamente la nueva? Entonces funcionó.",
  ]},
  {tit:"ANCLAJE DE RECURSO · Acceder a estados peak",color:"#e8794a",pasos:[
    "Recuerda un momento donde sentiste el recurso que necesitas (confianza, presencia, poder total).",
    "Revívelo con todos los sentidos: ¿qué ves, escuchas, sientes en el cuerpo?",
    "Cuando la sensación esté en su PICO (8-10/10) — aprieta fuerte el puño izquierdo durante 5 segundos.",
    "Suelta. Sacude la mano. Repite 3-5 veces con el mismo recuerdo.",
    "Añade 2-3 recuerdos más de estados peak al mismo ancla.",
    "Calibra: aprieta el puño. ¿Aparece el estado? Ese es tu recurso disponible en cualquier momento.",
  ]},
  {tit:"DISOCIACIÓN V-K · Reprocesar memorias limitantes",color:"#4a90d9",pasos:[
    "Imagina que estás en un cine. Tú en la butaca, pantalla frente a ti.",
    "En la pantalla: una foto en BLANCO Y NEGRO de ti justo ANTES de la experiencia difícil.",
    "Flota hacia la cabina de proyección — ahora ves a ti mismo en la butaca mirando la pantalla.",
    "Desde la cabina: pasa la película en B/N hasta el final. Congela la última imagen.",
    "Entra a la pantalla, coloriza todo y REBOBINA muy rápido (2 seg) hasta el inicio.",
    "Repite 5 veces. Luego calibra: piensa en la memoria original. ¿Tiene menos carga emocional?",
  ]},
  {tit:"META BIEN FORMADA · Instalación de objetivo",color:"#2e9e6b",pasos:[
    "¿Qué quieres exactamente? Descríbelo en positivo, específico y propio (no 'no quiero X' — 'quiero Y').",
    "¿Cómo sabrás cuando lo tengas? Define la evidencia sensorial: ¿qué verás, escucharás, sentirás?",
    "¿Dónde, cuándo y con quién? Contextualiza para que el cerebro pueda buscarlo.",
    "¿Qué recursos ya tienes? ¿Cuáles necesitas desarrollar?",
    "¿Es ecológico para todas las partes de ti? ¿Hay alguna parte que se resiste? ¿Qué le preocupa?",
    "Future pace: muévete al futuro donde ya tienes la meta. Mira hacia atrás — ¿qué pasos tomaste? Trae esa claridad al presente.",
  ]},
];

// ── SPIRAL ────────────────────────────────────────────────────────────────
const SPIRAL={
  be:{levels:["🟡 Amarillo — Integral","🩵 Turquesa — Holístico","🪸 Coral — Unitivo"],hawkins:["Razón 400","Amor 500","Alegría 540","Paz 600"],hz:"β: 14–30Hz · γ: 30–100Hz"},
  al:{levels:["🟠 Naranja — Logro","🟢 Verde — Comunitario"],hawkins:["Valentía 200","Voluntad 310","Aceptación 350"],hz:"α: 8–14Hz"},
  th:{levels:["🔵 Azul — Orden","🔴 Rojo — Poder","🟣 Púrpura — Tribal"],hawkins:["Vergüenza 20","Miedo 100","Ira 150"],hz:"θ: 4–8Hz"},
  d:{levels:["🟤 Beige — Supervivencia","Arquetípico pre-racional"],hawkins:["Pre-calibrable","Impulso biológico puro"],hz:"δ: 0.5–4Hz"},
  ep:{levels:["✨ Más allá del Espiral"],hawkins:["Iluminación 700–1000"],hz:"ε: <0.5Hz"},
};

const SD_T=[
  {n:9,e:"🪸",c:"Coral",nom:"Unitivo",acc:"<.4%",tot:"<0.01%",h:"700-1000",hz:"ε",feel:"Todo es uno. La conciencia observa sin identificarse con ningún nivel."},
  {n:8,e:"🩵",c:"Turquesa",nom:"Holístico",acc:"<1%",tot:"<0.1%",h:"540-700",hz:"δ/ε",feel:"El cosmos como ser vivo. Sintonía con grandes ciclos."},
  {n:7,e:"🟡",c:"Amarillo",nom:"Integral",acc:"5%",tot:"1%",h:"400-540",hz:"α/β",feel:"Veo múltiples perspectivas. Sistemas dentro de sistemas."},
  {n:6,e:"🟢",c:"Verde",nom:"Comunitario",acc:"15%",tot:"3%",h:"310-400",hz:"α",feel:"Todos deberíamos poder ser quienes somos."},
  {n:5,e:"🟠",c:"Naranja",nom:"Logro",acc:"28%",tot:"10%",h:"200-310",hz:"β",feel:"El éxito viene del esfuerzo y la inteligencia."},
  {n:4,e:"🔵",c:"Azul",nom:"Orden",acc:"40%",tot:"25%",h:"100-200",hz:"θ/β",feel:"Hay reglas correctas. El sacrificio trae recompensa futura."},
  {n:3,e:"🔴",c:"Rojo",nom:"Poder",acc:"70%",tot:"70%",h:"50-150",hz:"θ",feel:"Si no domino, me dominan. El mundo es una jungla."},
  {n:2,e:"🟣",c:"Púrpura",nom:"Tribal",acc:"99.6%",tot:"70%",h:"20-75",hz:"δ",feel:"La tribu debe sobrevivir. Hay fuerzas mágicas invisibles."},
  {n:1,e:"🟤",c:"Beige",nom:"Supervivencia",acc:"99.6%",tot:"90%",h:"<20",hz:"δ/ε",feel:"Hambre, frío, miedo, sexo. El presente es todo."},
];

const CELL={
  int:{
    be:{title:"INTELECTUAL · β CONSCIENTE",jung:["ego","estratega"],core:["Pensar — juego voluntario de ideas","Razón: adecuación idea ↔ realidad","Lenguaje externo: concepto → palabra → interlocutor","Ideas complejas: libertad, justicia, maldad","Inteligencia: velocidad + flexibilidad + adecuación","Shifting · Extrapolación · Indagación científica"],q:"¿Desde qué idea estoy operando ahora mismo?"},
    al:{title:"INTELECTUAL · α SUBCONSCIENTE",jung:["juez"],core:["Lógica como hábito automático","Lenguaje interno: la voz que corre sola","Ideas simples ya grabadas","Análisis–Síntesis automático","Saber–Conocer rutinario"],q:"¿Qué ideas filtran mi realidad sin que las elija?"},
    th:{title:"INTELECTUAL · θ INCONSCIENTE",jung:["sdorada"],core:["Excitabilidad neurológica — no controlable","Asociación automática (RAM mental)","Sistema binario: sí/no, verdadero/falso","Memoria: almacenamiento sin esfuerzo","Datos brutos sin etiquetar"],q:"¿Qué procesa mi mente sin que yo lo sepa?"},
    d:{title:"INTELECTUAL · δ PROFUNDO",jung:["daimon_i"],core:["Intuición Intelectual → PRE-DICCIÓN","Saltar pasos lógicos para ver el resultado","Conocimiento pre-verbal","Ver patrones antes de articularlos"],q:"¿Qué está sabiendo mi mente antes de que lo piense?"},
  },
  ins:{
    be:{title:"INSTINTIVO–AFECTIVO · β CONSCIENTE",jung:[],core:["Reconocimiento emocional deliberado","Afectos vitales: estables, profundos","Afectos expansivos cultivados: solidaridad, amor, fe","Manipulación indirecta: se entrenan, no se controlan","Integración afecto–intelecto → Voluntad"],q:"¿Qué siento y qué elijo hacer con eso?"},
    al:{title:"INSTINTIVO–AFECTIVO · α SUBCONSCIENTE",jung:["heroe","nino","saboteador"],core:["Sentimientos crónicos: resentimiento, angustia, fe habitual","Afectos condicionados por crianza/trauma","Afectos constrictivos que bloquean sin notarlo","El 'adicto al yo' de Dispenza vive aquí"],q:"¿Qué patrón emocional está corriendo solo ahora?"},
    th:{title:"INSTINTIVO–AFECTIVO · θ INCONSCIENTE",jung:["sombra","anima","instinto"],core:["Instinto de conservación: alimentación, defensa, reproducción","Instinto autodestructivo: descuido, adicción","Emoción bruta ANTES del pensamiento","Respuesta global e instantánea","Biología pre-psicológica"],q:"¿Qué me está moviendo sin que yo lo decida?"},
    d:{title:"INSTINTIVO–AFECTIVO · δ PROFUNDO",jung:["daimon_n"],core:["Intuición Afectiva → PRE-SENTIR · Corazonada","Impulso de muerte silencioso","Amor sin condicionamiento","Conexión con ciclos biológicos universales"],q:"¿Qué impulso profundo opera bajo todo lo demás?"},
  },
};

const CSC={
  be:{label:"β CONSCIENTE — Sistema Conciencia",color:"#4a90d9",jung:["testigo","persona"],items:["👁️ EL TESTIGO: observar sin juzgar adentro Y afuera simultáneamente","Conciencia Dual ↕ — techo actual del ser humano","Foco → Sí mismo · Foco → Exterior (ELEGIDO)","Alertamiento modulado · Amplitud del campo","Temporalidad ACTUAL · Comprensión · Adecuación","Acto voluntario · Imaginación activa · PRE-VISIÓN"],q:"¿Estoy observando mi realidad o estoy dentro de ella sin saberlo?"},
  al:{label:"α SUBCONSCIENTE — Sistema Conciencia",color:"#c9a030",jung:["persona"],items:["Foco automático al exterior — sin elegirlo","'Es más fácil ver la paja en el ojo ajeno...'","Movilidad del foco inquieto","Campo con nitidez irregular · Imaginación pasiva","Conciencia tardía · Creencias como filtros invisibles"],q:"¿Qué filtro invisible colorea lo que percibo ahora?"},
  th:{label:"θ INCONSCIENTE — Sistema Conciencia",color:"#c02850",jung:["sombra","anima"],items:["Alertamiento base sin decisión consciente","Percepción automática: esquivar un coche sin pensar","Campo sin pureza — distorsiones no detectadas","La conciencia actúa ANTES de que 'tú' aparezcas"],q:"¿Qué percibe mi sistema nervioso que yo no registro?"},
  d:{label:"δ PROFUNDO — Sistema Conciencia",color:"#7c4daa",jung:["daimon_i","daimon_n"],items:["Intuición de Conciencia → PRE-VISIÓN directa","Los visionarios operan desde aquí","Estado entre sueño y vigilia — máxima maleabilidad","Disipación del 'yo' — identidad se hace porosa","Visión M (mística) · Presente puro"],q:"¿Puedo soltar mi identidad actual aunque sea por un momento?"},
  ep:{label:"ε · SELF — Supraconciencia · Holy Spirit",color:"#e8c84a",jung:[],items:["✦ La totalidad integrada — el centro que contiene todo","Holy Spirit · Espíritu — modo más amplio de captar la realidad","Jung: Self = Ego + Sombra + Ánima + Daimon integrados","Dispenza: coherencia total — el 'yo' se disuelve en campo","Grinberg: campo neuronal fusionado con la Lattice","Jesús: 'El Reino de Dios está dentro de ti'","Valores universales: amor, verdad, libertad — reconocidos, no aprendidos"],q:"¿Puedo operar desde la totalidad de lo que soy?"},
};

const RK=["be","al","th","d"];
const RR={be:[R.al,R.be],al:[R.th,R.al],th:[R.d,R.th],d:[R.ep,R.d]};

export default function App(){
  const[sel,setSel]=useState(null);
  const[cscSel,setCscSel]=useState(null);
  const[tab,setTab]=useState("contenido");
  const[jungSel,setJungSel]=useState(null);
  const[showJung,setShowJung]=useState(true);
  const[fKey,setFKey]=useState("self");
  const[medType,setMedType]=useState(null); // null | "disp" | "pnl"
  const[pnlIdx,setPnlIdx]=useState(0);
  const[mision,setMision]=useState(null);
  const[pregIdx,setPregIdx]=useState(0);
  const[pulse,setPulse]=useState(0);

  // Filósofos section (nuevo)
  const[expandedPhilo,setExpandedPhilo]=useState(null);
  const[pillarsChecked,setPillarsChecked]=useState({});
  const[pillarOpen,setPillarOpen]=useState(null);

  // Tab system v9
  const[activeTab,setActiveTab]=useState("mapa");
  const[expandedNivel,setExpandedNivel]=useState(null);
  const[aqalOpen,setAqalOpen]=useState(false);
  const tabAnchor=useRef(null);

  useEffect(()=>{
    tabAnchor.current?.scrollIntoView({behavior:"auto",block:"start"});
  },[activeTab]);

  // Pulse animation for core
  useEffect(()=>{
    const t=setInterval(()=>setPulse(p=>(p+1)%100),80);
    return()=>clearInterval(t);
  },[]);
  const pulseR=R.ep+2+Math.sin(pulse/100*Math.PI*2)*4;
  const pulseOp=0.15+Math.sin(pulse/100*Math.PI*2)*0.12;

  const activeRing=sel?.ring||cscSel;
  const glowCol=sel?(sel.sector==="int"?"201,160,48":"192,40,80"):"74,144,217";
  const gStops={be:[0.64,0.86],al:[0.46,0.66],th:[0.32,0.50],d:[0.18,0.33],ep:[0.04,0.16]};
  const[g1,g2]=activeRing?gStops[activeRing]:[0,0];

  const getAD=()=>{
    if(sel) return CELL[sel.sector]?.[sel.ring]||null;
    if(cscSel&&CSC[cscSel]) return{title:CSC[cscSel].label,jung:CSC[cscSel].jung||[],core:CSC[cscSel].items||[],q:CSC[cscSel].q};
    return null;
  };
  const AD=getAD();
  const selC=sel?(sel.sector==="int"?"rgba(201,160,48,0.45)":"rgba(192,40,80,0.45)"):"rgba(74,144,217,0.40)";
  const selB=sel?(sel.sector==="int"?"#c9a030":"#c02850"):"#4a90d9";
  const fmla=FORMULA.find(f=>f.key===fKey);
  const mis=MISIONES.find(m=>m.key===mision);

  return(
  <div style={{background:"#06030d",minHeight:"100vh",fontFamily:F,color:"#e8d5a3"}}>
  <style>{`
    @keyframes shimmer{0%{opacity:.28}50%{opacity:.55}100%{opacity:.28}}
    @keyframes floatUp{0%{transform:translateY(0);opacity:.5}100%{transform:translateY(-18px);opacity:0}}
    .ring-lbl:hover{opacity:1!important;cursor:pointer}
    .filo-ritual{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
    .filo-cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
    .filo-pillars{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
    .filo-ritual-q{font-size:22px;line-height:1.35}
    .tab-bar{display:flex;justify-content:center;gap:4px;padding:14px 8px 0;margin:0 0 22px;border-bottom:1px solid rgba(212,175,55,0.18);flex-wrap:wrap}
    .tab-btn{background:transparent;border:none;color:rgba(232,213,163,0.45);padding:10px 18px 13px;cursor:pointer;font-family:Georgia,serif;font-size:10.5px;letter-spacing:0.18em;transition:color .25s;position:relative;text-transform:uppercase}
    .tab-btn:hover{color:rgba(232,213,163,0.85)}
    .tab-btn.active{color:#d4af37}
    .tab-btn.active::after{content:"";position:absolute;bottom:-1px;left:14%;right:14%;height:1.5px;background:#d4af37}
    .hawk-table{width:100%;border-collapse:collapse;font-family:Georgia,serif;font-size:10.5px}
    .hawk-table th{background:rgba(20,12,32,0.9);color:#d4af37;font-weight:normal;letter-spacing:1.5px;text-transform:uppercase;font-size:8.5px;padding:10px 8px;border-bottom:1px solid rgba(212,175,55,0.25);text-align:left;white-space:nowrap}
    .hawk-table td{padding:10px 8px;border-bottom:1px solid rgba(232,213,163,0.08);color:#c8b88a;vertical-align:top;line-height:1.5}
    .hawk-table tbody tr:hover{background:rgba(212,175,55,0.04)}
    .hawk-table tr.threshold td{border-top:2px solid #d4af37;background:rgba(212,175,55,0.06)}
    .hawk-wrap{overflow-x:auto;border:1px solid rgba(212,175,55,0.18);border-radius:6px;background:rgba(10,6,22,0.55)}
    @media (max-width: 720px){
      .filo-ritual,.filo-cards,.filo-pillars{grid-template-columns:1fr}
      .filo-ritual-q{font-size:18px}
      .tab-btn{padding:8px 12px 11px;font-size:9.5px;letter-spacing:0.14em}
      .hawk-table{font-size:9.5px}
      .hawk-table th{font-size:7.5px;padding:8px 6px}
      .hawk-table td{padding:8px 6px;min-width:90px}
    }
  `}</style>
  <div style={{maxWidth:1040,margin:"0 auto",padding:"10px 10px"}}>

    {/* ═══════════ TAB BAR ═══════════ */}
    <div ref={tabAnchor}/>
    <div className="tab-bar">
      {[
        {k:"mapa",label:"Mapa"},
        {k:"diag",label:"Diagnóstico"},
        {k:"niveles",label:"Niveles"},
        {k:"freq",label:"Frecuencias"},
      ].map(t=>(
        <button key={t.k} className={`tab-btn ${activeTab===t.k?"active":""}`} onClick={()=>setActiveTab(t.k)}>
          {t.label}
        </button>
      ))}
    </div>

    {activeTab==="mapa" && (<>
    {/* HEADER */}
    <div style={{textAlign:"center",marginBottom:14}}>
      <div style={{fontSize:13,letterSpacing:5,color:"#e8d5a3",marginBottom:2}}>MAPA INTEGRAL DE LA PSIQUE</div>
      <div style={{fontSize:7.5,letterSpacing:2,color:"rgba(200,165,70,0.35)"}}>Luis · Andaur Vignolo · Jung · Dispenza · Grinberg · Spiral Dynamics</div>
    </div>

    {/* FORMULA — HERO */}
    <div style={{marginBottom:12}}>
      <div style={{fontSize:7.5,letterSpacing:2,color:"rgba(200,165,70,0.38)",marginBottom:6,textAlign:"center"}}>LA FÓRMULA · Filtro para ser quien realmente eres</div>
      <div style={{display:"flex",border:"1px solid rgba(200,165,70,0.20)",borderRadius:6,overflow:"hidden",background:"rgba(0,0,0,0.38)"}}>
        {FORMULA.map((f,i)=>(
          <button key={f.key} onClick={()=>setFKey(p=>p===f.key?null:f.key)} style={{
            flex:1,padding:"11px 4px",
            background:fKey===f.key?`${f.color}22`:"transparent",
            border:"none",borderRight:i<4?`1px solid rgba(200,165,70,0.09)`:"none",
            cursor:"pointer",color:fKey===f.key?f.color:"rgba(200,165,70,0.48)",
            fontFamily:F,transition:"background .2s",
          }}>
            <div style={{fontSize:22,marginBottom:4}}>{f.icon}</div>
            <div style={{fontSize:9.5,letterSpacing:1,fontWeight:"bold"}}>{f.label}</div>
            <div style={{fontSize:7,marginTop:2,opacity:.7,lineHeight:1.3}}>{f.sub}</div>
          </button>
        ))}
      </div>
      {fmla&&(
        <div style={{background:`${fmla.color}0d`,border:`1px solid ${fmla.color}35`,borderRadius:"0 0 6px 6px",padding:"12px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <div style={{fontSize:7.5,color:"rgba(200,165,70,0.42)",letterSpacing:1,marginBottom:5}}>PRINCIPIO</div>
            <p style={{fontSize:10,color:"#d4c48a",lineHeight:1.65,margin:0}}>{fmla.gen}</p>
          </div>
          <div style={{borderLeft:`1px solid ${fmla.color}22`,paddingLeft:12}}>
            <div style={{fontSize:7.5,color:fmla.color,letterSpacing:1,marginBottom:5,opacity:.70}}>→ LUIS</div>
            <p style={{fontSize:10,color:"#e8d5a3",lineHeight:1.65,margin:0,fontStyle:"italic"}}>{fmla.luis}</p>
          </div>
        </div>
      )}
    </div>

    {/* MISIONES */}
    <div style={{display:"flex",gap:5,marginBottom:12,justifyContent:"center",flexWrap:"wrap"}}>
      {[{key:"actor",label:"🎭 Actor Hollywood",c:"#c9a030"},{key:"bil",label:"💰 Billonario",c:"#2e9e6b"},{key:"mav",label:"🦅 Maverick",c:"#4a90d9"},{key:"pb",label:"👑 Play Boy",c:"#c02850"}].map(m=>(
        <span key={m.key} style={{fontSize:8.5,padding:"3px 11px",background:"rgba(200,165,70,0.06)",border:"1px solid rgba(200,165,70,0.16)",borderRadius:3,color:"rgba(200,165,70,0.55)"}}>{m.label}</span>
      ))}
    </div>

    {/* MEDITATION — FEATURED */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
      <button onClick={()=>setMedType(p=>p==="disp"?null:"disp")} style={{
        padding:"12px 14px",fontFamily:F,cursor:"pointer",textAlign:"left",
        background:medType==="disp"?"rgba(232,200,74,0.12)":"rgba(232,200,74,0.05)",
        border:`1px solid rgba(232,200,74,${medType==="disp"?"0.50":"0.22"})`,
        borderRadius:5,color:"#e8d5a3",transition:"background .2s",
      }}>
        <div style={{fontSize:20,marginBottom:4}}>🧘</div>
        <div style={{fontSize:11,color:"#e8c84a",letterSpacing:.5,marginBottom:2}}>Meditación Dispenza</div>
        <div style={{fontSize:8.5,color:"rgba(200,165,70,0.50)"}}>Reprogramación profunda · 30 min · β→θ→instalación</div>
      </button>
      <button onClick={()=>setMedType(p=>p==="pnl"?null:"pnl")} style={{
        padding:"12px 14px",fontFamily:F,cursor:"pointer",textAlign:"left",
        background:medType==="pnl"?"rgba(156,109,216,0.15)":"rgba(156,109,216,0.06)",
        border:`1px solid rgba(156,109,216,${medType==="pnl"?"0.55":"0.24"})`,
        borderRadius:5,color:"#e8d5a3",transition:"background .2s",
      }}>
        <div style={{fontSize:20,marginBottom:4}}>🧠</div>
        <div style={{fontSize:11,color:"#c090f0",letterSpacing:.5,marginBottom:2}}>PNL · Sapos a Príncipes</div>
        <div style={{fontSize:8.5,color:"rgba(156,109,216,0.55)"}}>Swish · Anclaje · Disociación V-K · Meta Bien Formada</div>
      </button>
    </div>

    {/* DISPENZA MEDITATION PANEL */}
    {medType==="disp"&&(
      <div style={{background:"rgba(10,6,22,0.97)",border:"1px solid rgba(232,200,74,0.32)",borderRadius:6,padding:"14px 18px",marginBottom:12}}>
        <div style={{fontSize:11,color:"#e8c84a",letterSpacing:1.5,marginBottom:10}}>🧘 MEDITACIÓN DISPENZA · 30 min</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:7}}>
          {MED_DISP.map((m,i)=>(
            <div key={i} style={{background:"rgba(232,200,74,0.04)",border:"1px solid rgba(232,200,74,0.13)",borderRadius:4,padding:"9px 11px"}}>
              <div style={{display:"flex",gap:7,alignItems:"baseline",marginBottom:4}}>
                <span style={{fontSize:8,color:"rgba(232,200,74,0.42)",flexShrink:0}}>{m.t} min</span>
                <span style={{fontSize:9.5,color:"#e8c84a"}}>{m.tit}</span>
              </div>
              <p style={{fontSize:9.5,color:"#c8b88a",lineHeight:1.55,margin:0}}>{m.txt}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:8,padding:"7px 12px",background:"rgba(232,200,74,0.04)",borderLeft:"2px solid rgba(232,200,74,0.30)",fontSize:9.5,color:"rgba(232,213,163,0.55)",fontStyle:"italic"}}>
          30 días consecutivos para instalar el nuevo programa. El programa viejo resiste los primeros 10 días. Persiste.
        </div>
      </div>
    )}

    {/* PNL MEDITATION PANEL */}
    {medType==="pnl"&&(
      <div style={{background:"rgba(10,6,22,0.97)",border:"1px solid rgba(156,109,216,0.30)",borderRadius:6,padding:"14px 18px",marginBottom:12}}>
        <div style={{fontSize:11,color:"#c090f0",letterSpacing:1.5,marginBottom:4}}>🧠 PNL · Sapos a Príncipes — Bandler & Grinder</div>
        <div style={{fontSize:8.5,color:"rgba(156,109,216,0.50)",marginBottom:12}}>4 técnicas de reprogramación y transformación. Elige la que necesitas hoy.</div>
        {/* Technique tabs */}
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
          {MED_PNL.map((t,i)=>(
            <button key={i} onClick={()=>setPnlIdx(i)} style={{
              padding:"5px 11px",fontSize:8.5,fontFamily:F,cursor:"pointer",
              background:pnlIdx===i?`${t.color}22`:"transparent",
              border:`1px solid ${pnlIdx===i?t.color+"55":"rgba(200,165,70,0.15)"}`,
              color:pnlIdx===i?t.color:"rgba(200,165,70,0.45)",borderRadius:3,
            }}>{i+1}. {t.tit.split("·")[0].trim()}</button>
          ))}
        </div>
        {(()=>{const t=MED_PNL[pnlIdx];return(
          <div style={{background:`${t.color}0d`,border:`1px solid ${t.color}25`,borderRadius:5,padding:"12px 16px"}}>
            <div style={{fontSize:11,color:t.color,marginBottom:10,letterSpacing:.5}}>{t.tit}</div>
            {t.pasos.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(200,165,70,0.07)",alignItems:"flex-start"}}>
                <span style={{width:22,height:22,borderRadius:"50%",background:`${t.color}20`,border:`1px solid ${t.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:t.color,flexShrink:0,fontWeight:"bold"}}>{i+1}</span>
                <span style={{fontSize:10,color:"#d4c48a",lineHeight:1.6}}>{p}</span>
              </div>
            ))}
          </div>
        );})()}
      </div>
    )}

    {/* MAP + SIDEBAR */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 255px",gap:10,alignItems:"start"}}>
    <svg viewBox="0 0 880 760" style={{width:"100%",height:"auto"}}>
      <defs>
        <radialGradient id="bg7" cx="50%" cy="52%" r="62%">
          <stop offset="0%" stopColor="#1a0f2e"/><stop offset="100%" stopColor="#06030d"/>
        </radialGradient>
        <radialGradient id="cG7" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe97a" stopOpacity="0.92"/>
          <stop offset="50%" stopColor="#c9820a" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#c9820a" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="fl7" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`rgb(${glowCol})`} stopOpacity="0"/>
          <stop offset={`${Math.max(0,Math.round(g1*100)-5)}%`} stopColor={`rgb(${glowCol})`} stopOpacity="0"/>
          <stop offset={`${Math.round(g1*100)}%`} stopColor={`rgb(${glowCol})`} stopOpacity="0.60"/>
          <stop offset={`${Math.round((g1+g2)/2*100)}%`} stopColor={`rgb(${glowCol})`} stopOpacity="0.25"/>
          <stop offset={`${Math.min(100,Math.round(g2*100))}%`} stopColor={`rgb(${glowCol})`} stopOpacity="0.06"/>
          <stop offset="100%" stopColor={`rgb(${glowCol})`} stopOpacity="0"/>
        </radialGradient>
        <filter id="gw7"><feGaussianBlur stdDeviation="9" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sg7"><feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="jg7"><feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      <rect width="880" height="760" fill="url(#bg7)"/>

      {/* STARS */}
      {STARS.map((s,i)=>(
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e8d5a3" opacity={s.op}
          style={{animation:`shimmer ${2+(i%5)*0.7}s ease-in-out ${(i%7)*0.4}s infinite`}}/>
      ))}

      {/* CONSTELLATION LINES */}
      {showJung&&CONST_LINES.map(([a,b],i)=>(
        <line key={i} x1={px(a.r,a.a)} y1={py(a.r,a.a)} x2={px(b.r,b.a)} y2={py(b.r,b.a)}
          stroke="rgba(156,109,216,0.12)" strokeWidth="0.6" strokeDasharray="3,6"
          style={{pointerEvents:"none"}}/>
      ))}

      {/* FLASHLIGHT */}
      {activeRing&&<circle cx={CX} cy={CY} r={R.be+12} fill="url(#fl7)" style={{pointerEvents:"none"}}/>}

      {/* SECTOR FILLS */}
      {RK.map(rk=>{
        const[ri,ro]=RR[rk];
        const iI=sel?.ring===rk&&sel?.sector==="int";
        const iN=sel?.ring===rk&&sel?.sector==="ins";
        return(<g key={rk}>
          <path d={arc(ri,ro,-90,90)} style={{cursor:"pointer",transition:"fill .25s"}}
            fill={iI?"rgba(201,160,48,0.58)":"rgba(201,160,48,0.10)"}
            stroke={iI?"rgba(201,160,48,0.30)":"rgba(201,160,48,0.14)"} strokeWidth="0.5"
            onClick={()=>{if(sel?.sector==="int"&&sel?.ring===rk)setSel(null);else{setSel({sector:"int",ring:rk});setCscSel(null);setJungSel(null);setTab("contenido");}}}/>
          <path d={arc(ri,ro,90,270)} style={{cursor:"pointer",transition:"fill .25s"}}
            fill={iN?"rgba(192,40,80,0.58)":"rgba(192,40,80,0.10)"}
            stroke={iN?"rgba(192,40,80,0.30)":"rgba(192,40,80,0.14)"} strokeWidth="0.5"
            onClick={()=>{if(sel?.sector==="ins"&&sel?.ring===rk)setSel(null);else{setSel({sector:"ins",ring:rk});setCscSel(null);setJungSel(null);setTab("contenido");}}}/>
        </g>);
      })}

      {/* CONCENTRIC CIRCLES */}
      {[{r:R.be,c:"rgba(74,144,217,0.42)",w:1.5,rk:"be"},{r:R.al,c:"rgba(200,165,70,0.30)",w:1,rk:"al"},{r:R.th,c:"rgba(192,40,80,0.28)",w:1,rk:"th"},{r:R.d,c:"rgba(124,77,170,0.35)",w:1,rk:"d"}].map(({r,c,w,rk})=>(
        <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke={c} strokeWidth={w}
          style={{cursor:"pointer"}}
          onClick={()=>{if(cscSel===rk)setCscSel(null);else{setCscSel(rk);setSel(null);setJungSel(null);setTab("contenido");}}}/>
      ))}

      {/* VERTICAL DIVIDER */}
      <line x1={CX} y1={CY-R.be} x2={CX} y2={CY+R.be}
        stroke="rgba(200,165,70,0.40)" strokeWidth="1" strokeDasharray="6,5"/>

      {/* PULSING CORE AURA */}
      <circle cx={CX} cy={CY} r={pulseR} fill="none"
        stroke="rgba(255,215,90,0.18)" strokeWidth="1.5"
        style={{pointerEvents:"none",transition:"r .08s,opacity .08s"}}
        opacity={pulseOp}/>

      {/* CORE */}
      <circle cx={CX} cy={CY} r={R.ep} fill="url(#cG7)"
        stroke="rgba(255,215,90,0.90)" strokeWidth="2.5" filter="url(#gw7)"
        style={{cursor:"pointer"}}
        onClick={()=>{setSel(null);setCscSel(p=>p==="ep"?null:"ep");setTab("contenido");}}/>
      <text x={CX} y={CY-8} textAnchor="middle" dominantBaseline="middle"
        fill="#fff8d0" fontSize={12} fontFamily={F} fontWeight="bold" filter="url(#sg7)">SELF</text>
      <text x={CX} y={CY+8} textAnchor="middle" dominantBaseline="middle"
        fill="#fff0b0" fontSize={7} fontFamily={F} filter="url(#sg7)">ε · Holy Spirit</text>

      {/* RING LABELS */}
      {[{r:R.be,l:"β · CONSCIENTE",sub:"Body",c:"rgba(74,144,217,0.80)",rk:"be"},{r:R.al,l:"α · SUBCONSCIENTE",sub:"Soul",c:"rgba(200,165,70,0.72)",rk:"al"},{r:R.th,l:"θ · INCONSCIENTE",sub:"Spirit",c:"rgba(192,40,80,0.72)",rk:"th"},{r:R.d,l:"δ · PROFUNDO",sub:"",c:"rgba(124,77,170,0.72)",rk:"d"}].map(({r,l,sub,c,rk})=>(
        <g key={r} style={{cursor:"pointer"}} className="ring-lbl"
          onClick={()=>{if(cscSel===rk)setCscSel(null);else{setCscSel(rk);setSel(null);setJungSel(null);setTab("contenido");}}}>
          <text x={CX} y={CY-r-8} textAnchor="middle" dominantBaseline="middle"
            fill={c} fontSize={9.5} fontFamily={F} letterSpacing="0.8"
            fontWeight={cscSel===rk?"bold":"normal"}>{l}</text>
          {sub&&<text x={CX} y={CY-r+5} textAnchor="middle" dominantBaseline="middle"
            fill={c.replace("0.80","0.32").replace("0.72","0.28")} fontSize={7.5} fontFamily={F}>{sub}</text>}
        </g>
      ))}

      {/* SECTOR LABELS */}
      <text x={CX+R.be-58} y={CY-R.be+26} textAnchor="middle" fill="rgba(220,165,50,0.65)" fontSize={11.5} fontFamily={F} letterSpacing="1">INTELECTUAL</text>
      <text x={CX-R.be+52} y={CY-R.be+26} textAnchor="middle" fill="rgba(210,70,105,0.65)" fontSize={10} fontFamily={F}>INSTINTIVO</text>
      <text x={CX-R.be+46} y={CY-R.be+40} textAnchor="middle" fill="rgba(210,70,105,0.52)" fontSize={9.5} fontFamily={F}>AFECTIVO</text>
      <text x={CX} y={CY-R.be-20} textAnchor="middle" fill="rgba(74,144,217,0.38)" fontSize={8.5} fontFamily={F} letterSpacing="2">SISTEMA CONCIENCIA</text>

      {/* JUNG FIGURES + CONSTELLATIONS */}
      {showJung&&JUNG_MAP.map(j=>(
        <text key={j.key} x={px(j.r,j.a)} y={py(j.r,j.a)}
          textAnchor="middle" dominantBaseline="middle"
          fill={j.color} fontSize={j.fs||9} fontFamily={F}
          fontWeight={jungSel===j.key?"bold":"normal"}
          filter={jungSel===j.key?"url(#jg7)":undefined}
          style={{pointerEvents:"none",opacity:jungSel&&jungSel!==j.key?0.38:1,transition:"opacity .2s"}}>{j.label}</text>
      ))}

      {/* BRAINWAVE labels */}
      {[{r:R.be,l:"β",c:"rgba(74,144,217,0.75)"},{r:R.al,l:"α",c:"rgba(200,165,70,0.75)"},{r:R.th,l:"θ",c:"rgba(192,40,80,0.75)"},{r:R.d,l:"δ",c:"rgba(124,77,170,0.75)"},{r:R.ep,l:"ε",c:"rgba(255,215,90,0.95)"}].map(({r,l,c})=>(
        <g key={l}>
          <line x1={CX+r} y1={CY} x2={CX+r+10} y2={CY} stroke={c} strokeWidth="0.7"/>
          <text x={CX+r+13} y={CY} textAnchor="start" dominantBaseline="middle" fill={c} fontSize={12} fontFamily={F}>{l}</text>
        </g>
      ))}

      {/* FUNNELS */}
      <path d={`M${CX+14},${CY-R.be} C${CX+74},${CY-R.be-60} ${CX+212},${CY-R.be-88} ${CX+240},${CY-R.be-125}`} fill="none" stroke="rgba(201,160,48,0.26)" strokeWidth="1.2"/>
      <path d={`M${CX-14},${CY-R.be} C${CX-74},${CY-R.be-60} ${CX-212},${CY-R.be-88} ${CX-240},${CY-R.be-125}`} fill="none" stroke="rgba(192,40,80,0.26)" strokeWidth="1.2"/>
      <line x1={CX} y1={CY-R.be} x2={CX} y2={CY-R.be-125} stroke="rgba(74,144,217,0.20)" strokeWidth="1" strokeDasharray="4,4"/>

      {/* SYSTEM BOXES */}
      {[{cx:CX-240,l:"Instintivo–Afectivo",f:"rgba(192,40,80,0.15)",st:"rgba(210,70,105,0.46)"},{cx:CX,l:"Conciencia (anillos)",f:"rgba(74,144,217,0.12)",st:"rgba(90,150,240,0.44)"},{cx:CX+240,l:"Intelectual",f:"rgba(201,160,48,0.15)",st:"rgba(220,170,55,0.46)"}].map(({cx,l,f,st})=>(
        <g key={cx}>
          <rect x={cx-102} y={CY-R.be-168} width="204" height="38" rx="3" fill={f} stroke={st} strokeWidth="1"/>
          <text x={cx} y={CY-R.be-156} textAnchor="middle" dominantBaseline="middle" fill="#f0dfa8" fontSize={9} fontFamily={F}>Sistema</text>
          <text x={cx} y={CY-R.be-144} textAnchor="middle" dominantBaseline="middle" fill="#f0dfa8" fontSize={9} fontFamily={F}>{l}</text>
          <line x1={cx} y1={CY-R.be-168} x2={cx} y2={CY-R.be-136} stroke="rgba(200,165,70,0.18)" strokeWidth="0.8"/>
        </g>
      ))}

      {/* REALIDAD BAR */}
      <rect x="50" y={CY-R.be-218} width="780" height="34" rx="3" fill="rgba(200,165,70,0.06)" stroke="rgba(200,165,70,0.40)" strokeWidth="1.1"/>
      <text x={CX} y={CY-R.be-201} textAnchor="middle" dominantBaseline="middle" fill="#e8d5a3" fontSize={11} fontFamily={F} letterSpacing="2">REALIDAD — LA LUZ — CAMPO CUÁNTICO</text>

      {[[52,726,52,752,80,752],[828,726,828,752,800,752],[52,26,52,8,80,8],[828,26,828,8,800,8]].map(([x1,y1,x2,y2,x3,y3],i)=>(
        <path key={i} d={`M${x1},${y1} L${x2},${y2} L${x3},${y3}`} fill="none" stroke="rgba(200,165,70,0.18)" strokeWidth="1"/>
      ))}
    </svg>

    {/* SIDEBAR */}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>

      {/* Controls */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        <button onClick={()=>setShowJung(!showJung)} style={{
          flex:1,padding:"6px 8px",fontSize:8.5,fontFamily:F,cursor:"pointer",
          background:showJung?"rgba(156,109,216,0.20)":"transparent",
          border:`1px solid rgba(156,109,216,${showJung?"0.55":"0.22"})`,
          color:showJung?"#c090f0":"rgba(156,109,216,0.50)",borderRadius:3,
        }}>{showJung?"✓ ":""}👁️ Figuras Jung</button>
      </div>

      {/* Ring info */}
      {activeRing&&SPIRAL[activeRing]&&(
        <div style={{background:"rgba(14,8,24,0.95)",border:"1px solid rgba(200,165,70,0.16)",borderRadius:5,padding:"10px 12px"}}>
          <div style={{fontSize:7.5,color:"rgba(200,165,70,0.42)",letterSpacing:1,marginBottom:6}}>CAPA SELECCIONADA</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:7}}>
            {SPIRAL[activeRing].levels.map(l=>(
              <span key={l} style={{fontSize:7.5,padding:"2px 6px",background:"rgba(200,165,70,0.08)",border:"1px solid rgba(200,165,70,0.18)",borderRadius:2,color:"#d4b870"}}>{l}</span>
            ))}
          </div>
          <div style={{fontSize:8,color:"rgba(126,200,227,0.58)",marginBottom:3}}>📊 Hawkins</div>
          {SPIRAL[activeRing].hawkins.map(h=>(
            <div key={h} style={{fontSize:8.5,color:"rgba(157,216,232,0.65)",padding:"2px 0"}}>{h}</div>
          ))}
          <div style={{marginTop:7,fontSize:9.5,color:"#a0e8b0",fontWeight:"bold",borderTop:"1px solid rgba(200,165,70,0.10)",paddingTop:6}}>{SPIRAL[activeRing].hz}</div>
        </div>
      )}

      {/* Jung quick select */}
      {showJung&&(
        <div style={{background:"rgba(14,8,24,0.95)",border:"1px solid rgba(156,109,216,0.20)",borderRadius:5,padding:"10px 12px"}}>
          <div style={{fontSize:7.5,color:"rgba(156,109,216,0.52)",letterSpacing:1,marginBottom:6}}>FIGURAS JUNG</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
            {JUNG_MAP.map(j=>(
              <button key={j.key} onClick={()=>{setJungSel(p=>p===j.key?null:j.key);setTab("jung");}} style={{
                fontSize:8,padding:"3px 6px",
                background:jungSel===j.key?"rgba(156,109,216,0.28)":"rgba(156,109,216,0.07)",
                border:`1px solid rgba(156,109,216,${jungSel===j.key?"0.65":"0.20"})`,
                borderRadius:2,color:jungSel===j.key?"#c090f0":"rgba(192,144,240,0.60)",
                cursor:"pointer",fontFamily:F,
              }}>{j.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* HOW TO READ */}
      <div style={{background:"rgba(14,8,24,0.88)",border:"1px solid rgba(200,165,70,0.10)",borderRadius:5,padding:"10px 12px"}}>
        <div style={{fontSize:7.5,color:"rgba(200,165,70,0.38)",letterSpacing:1,marginBottom:5}}>CÓMO LEER</div>
        {[["🟡 Derecha","Intelecto","#c9a030"],["🔴 Izquierda","Instintivo–Afect.","#c02850"],["🔵 Anillos","Sistema Conciencia","#4a90d9"],["✦ Núcleo","SELF · ε","#e8c84a"]].map(([s,d,c])=>(
          <div key={s} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:"1px solid rgba(200,165,70,0.05)"}}>
            <span style={{fontSize:8,color:c,width:66,flexShrink:0}}>{s}</span>
            <span style={{fontSize:8,color:"rgba(200,165,70,0.42)"}}>{d}</span>
          </div>
        ))}
      </div>

    </div>
    </div>{/* end grid */}

    {/* DETAIL PANEL */}
    {(AD||jungSel)&&(
      <div style={{background:"rgba(12,6,24,0.97)",border:`1px solid ${selC}`,borderRadius:6,padding:"14px 18px",marginTop:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{fontSize:11,color:selB,letterSpacing:1}}>{AD?.title||""}</div>
          <button onClick={()=>{setSel(null);setCscSel(null);setJungSel(null);}}
            style={{background:"transparent",border:"1px solid rgba(200,165,70,0.18)",color:"rgba(200,165,70,0.40)",cursor:"pointer",borderRadius:3,padding:"3px 8px",fontSize:10,fontFamily:F}}>✕</button>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",borderBottom:"1px solid rgba(200,165,70,0.10)",paddingBottom:8}}>
          {[{k:"contenido",l:"📋 Contenido"},{k:"jung",l:"🟣 Jung"},{k:"dispenza",l:"🟢 Dispenza"},{k:"sdtable",l:"📊 Spiral Dynamics"}].map(({k,l})=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              padding:"5px 10px",fontSize:9,fontFamily:F,cursor:"pointer",
              background:tab===k?"rgba(200,165,70,0.12)":"transparent",
              border:`1px solid rgba(200,165,70,${tab===k?"0.38":"0.14"})`,
              color:tab===k?"#e8d5a3":"rgba(200,165,70,0.38)",borderRadius:3,
            }}>{l}</button>
          ))}
        </div>

        {tab==="contenido"&&AD&&!jungSel&&(
          <div>
            {AD.core.map((item,i)=>(
              <div key={i} style={{display:"flex",gap:6,padding:"4px 0",borderBottom:"1px solid rgba(200,165,70,0.06)",alignItems:"flex-start"}}>
                <span style={{color:"rgba(200,165,70,0.35)",fontSize:7,marginTop:3,flexShrink:0}}>◆</span>
                <span style={{fontSize:10,color:"#d4c48a",lineHeight:1.5}}>{item}</span>
              </div>
            ))}
            {AD.q&&<div style={{marginTop:10,padding:"8px 12px",background:"rgba(200,165,70,0.05)",borderLeft:"2px solid rgba(200,165,70,0.35)",fontSize:10.5,color:"rgba(232,213,163,0.65)",fontStyle:"italic"}}>{AD.q}</div>}
          </div>
        )}

        {tab==="jung"&&(
          <div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
              {JUNG_MAP.map(j=>(
                <button key={j.key} onClick={()=>setJungSel(p=>p===j.key?null:j.key)} style={{
                  fontSize:8.5,padding:"4px 10px",
                  background:jungSel===j.key?"rgba(156,109,216,0.28)":"rgba(156,109,216,0.08)",
                  border:`1px solid rgba(156,109,216,${jungSel===j.key?"0.65":"0.25"})`,
                  borderRadius:3,color:jungSel===j.key?"#c090f0":"rgba(192,144,240,0.60)",
                  cursor:"pointer",fontFamily:F,
                }}>{j.label} <span style={{opacity:.45,fontSize:7.5}}>· {j.ring}</span></button>
              ))}
            </div>
            {jungSel&&JD[jungSel]&&(()=>{
              const d=JD[jungSel];const jm=JUNG_MAP.find(j=>j.key===jungSel);
              return(
                <div style={{background:"rgba(156,109,216,0.06)",border:"1px solid rgba(156,109,216,0.22)",borderRadius:5,padding:"14px 16px"}}>
                  <div style={{fontSize:12,color:"#c090f0",marginBottom:2}}>{jm?.label}</div>
                  <div style={{fontSize:7.5,color:"rgba(156,109,216,0.48)",marginBottom:12}}>{d.ring} · {d.sector}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:10}}>
                    {[{l:"📖 ¿QUÉ ES?",t:d.def,c:"rgba(192,168,248,0.65)"},{l:"💬 CÓMO HABLA",t:Array.isArray(d.habla)?d.habla.join("\n"):d.habla,c:"rgba(192,168,248,0.55)"},{l:"🔓 CÓMO SOLTARLO",t:d.integracion,c:"rgba(46,200,130,0.65)"},{l:"⚠️ QUÉ BLOQUEA",t:d.bloqueo,c:"rgba(192,40,80,0.65)"}].map(({l,t,c})=>(
                      <div key={l} style={{background:"rgba(156,109,216,0.06)",borderRadius:3,padding:"9px 11px"}}>
                        <div style={{fontSize:8.5,color:c,marginBottom:5}}>{l}</div>
                        <p style={{fontSize:9.5,color:"#d0c0e8",lineHeight:1.55,margin:0,whiteSpace:"pre-line"}}>{t}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"rgba(232,180,50,0.07)",border:"1px solid rgba(232,180,50,0.22)",borderRadius:4,padding:"10px 12px",marginBottom:8}}>
                    <div style={{fontSize:8.5,color:"rgba(232,200,74,0.62)",marginBottom:5}}>🔥 EXPRESIÓN DEL DAIMON</div>
                    <p style={{fontSize:10,color:"#f0d880",lineHeight:1.6,margin:0}}>{d.daimon}</p>
                  </div>
                  <div style={{background:"rgba(46,158,107,0.06)",borderLeft:"2px solid rgba(46,158,107,0.35)",padding:"9px 12px",borderRadius:"0 4px 4px 0"}}>
                    <div style={{fontSize:8.5,color:"rgba(46,158,107,0.58)",marginBottom:4}}>🧘 PRÁCTICA</div>
                    <p style={{fontSize:9.5,color:"#a0d8b8",lineHeight:1.55,margin:0}}>{d.practica}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab==="dispenza"&&(
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {[{n:1,icon:"👁️",color:"#4a90d9",title:"DIAGNÓSTICO",sub:"El Testigo · Andaur",desc:"Activa el Testigo (β Conciencia Dual). Observa sin juzgar: ¿qué figura Jung opera ahora?",accion:"Siéntate. Cierra ojos. '¿Quién está operando ahora?' Solo observa."},{n:2,icon:"🌊",color:"#c9a030",title:"DESCENSO β→θ",sub:"Acceso",desc:"Baja de β a α→θ con respiración y relajación progresiva.",accion:"Inhala 4s · retén 4s · exhala 8s. Repite 7 veces. Relaja de coronilla a pies."},{n:3,icon:"🌑",color:"#9c6dd8",title:"DESINSTALACIÓN",sub:"Trabajo de Sombra",desc:"En θ, observa la creencia vieja y su carga sin pelear. Ver hasta que la energía se libere.",accion:"Visualiza la emoción como objeto. Obsérvala disolverse en luz dorada."},{n:4,icon:"✦",color:"#e8c84a",title:"INSTALACIÓN",sub:"Nueva identidad",desc:"Imagen clara del nuevo yo + Emoción elevada como si ya ocurrió.",accion:"En θ: película mental del nuevo yo + EMOCIÓN. Gratitud, amor, júbilo. 15 min."},{n:5,icon:"⚡",color:"#2e9e6b",title:"COHERENCIA",sub:"Dispenza + Grinberg",desc:"Corazón y mente apuntando igual → campo coherente → cerebro se recablea.",accion:"Atención al pecho. Certeza tranquila. Regresa cada vez que el programa viejo aparezca."},{n:6,icon:"🌐",color:"#e8794a",title:"MANIFESTACIÓN",sub:"Grinberg · Lattice",desc:"Tu campo cambió de frecuencia. Lo que se mueve afuera refleja lo que cambió adentro.",accion:"Observa sincronicidades. Actúa desde el nuevo programa cuando aparezcan."}].map(ds=>(
              <div key={ds.n} style={{display:"flex",gap:11,alignItems:"flex-start",background:`${ds.color}0d`,border:`1px solid ${ds.color}22`,borderRadius:5,padding:"10px 13px"}}>
                <div style={{flexShrink:0,width:32,height:32,borderRadius:"50%",background:`${ds.color}20`,border:`1px solid ${ds.color}48`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{ds.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:3}}>
                    <span style={{fontSize:11,color:ds.color,letterSpacing:.8}}>{ds.n}. {ds.title}</span>
                    <span style={{fontSize:8,color:"rgba(200,165,70,0.40)"}}>{ds.sub}</span>
                  </div>
                  <p style={{fontSize:9.5,color:"#c8b88a",margin:"0 0 5px",lineHeight:1.55}}>{ds.desc}</p>
                  <div style={{padding:"5px 9px",background:"rgba(0,0,0,0.20)",borderLeft:`2px solid ${ds.color}38`,borderRadius:"0 3px 3px 0"}}>
                    <span style={{fontSize:9.5,color:"#b8d0a8"}}>{ds.accion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="sdtable"&&(
          <div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:8.5,fontFamily:F}}>
                <thead><tr>{["Niv","Color","Nombre","H%acc","H%tot","Hawkins","Hz","Cómo se siente"].map(h=>(
                  <th key={h} style={{padding:"6px 8px",textAlign:"left",color:"rgba(200,165,70,0.50)",borderBottom:"1px solid rgba(200,165,70,0.14)",fontSize:8,whiteSpace:"nowrap"}}>{h}</th>
                ))}</tr></thead>
                <tbody>{SD_T.map((sd,i)=>(
                  <tr key={sd.n} style={{background:i%2===0?"rgba(200,165,70,0.03)":"transparent",borderBottom:"1px solid rgba(200,165,70,0.05)"}}>
                    <td style={{padding:"6px 8px",color:"rgba(200,165,70,0.65)",fontWeight:"bold"}}>{sd.n}</td>
                    <td style={{padding:"6px 8px"}}>{sd.e} {sd.c}</td>
                    <td style={{padding:"6px 8px",color:"#e8d5a3",whiteSpace:"nowrap"}}>{sd.nom}</td>
                    <td style={{padding:"6px 8px",color:"rgba(200,165,70,0.65)"}}>{sd.acc}</td>
                    <td style={{padding:"6px 8px",color:"rgba(200,165,70,0.50)"}}>{sd.tot}</td>
                    <td style={{padding:"6px 8px",color:"rgba(126,200,227,0.68)",whiteSpace:"nowrap"}}>{sd.h}</td>
                    <td style={{padding:"6px 8px",color:"rgba(160,232,176,0.68)"}}>{sd.hz}</td>
                    <td style={{padding:"6px 8px",color:"#c8b88a",fontSize:8,lineHeight:1.4}}>{sd.feel}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

    {/* CIERRE DEL LOOP — APLÍCALO HOY */}
    <div style={{marginTop:14,background:"rgba(10,6,22,0.97)",border:"1px solid rgba(200,165,70,0.22)",borderRadius:6,padding:"16px 20px"}}>
      <div style={{fontSize:11,color:"#e8d5a3",letterSpacing:1.5,marginBottom:4}}>APLÍCALO HOY</div>
      <div style={{fontSize:8.5,color:"rgba(200,165,70,0.42)",marginBottom:12}}>La fórmula conectada con tu misión de esta semana</div>

      {/* Mission selector */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {MISIONES.map(m=>(
          <button key={m.key} onClick={()=>{setMision(p=>p===m.key?null:m.key);setPregIdx(0);}} style={{
            padding:"7px 14px",fontSize:9.5,fontFamily:F,cursor:"pointer",
            background:mision===m.key?`${m.color}22`:"rgba(0,0,0,0.30)",
            border:`1px solid ${mision===m.key?m.color+"55":"rgba(200,165,70,0.18)"}`,
            color:mision===m.key?m.color:"rgba(200,165,70,0.52)",borderRadius:4,
            transition:"background .2s",
          }}>{m.label}</button>
        ))}
      </div>

      {mis&&(
        <div style={{background:`${mis.color}0d`,border:`1px solid ${mis.color}30`,borderRadius:5,padding:"14px 16px"}}>
          <div style={{fontSize:8.5,color:"rgba(200,165,70,0.40)",marginBottom:10,letterSpacing:1}}>
            PREGUNTA PARA HOY · {mis.label}
          </div>
          <div style={{fontSize:15,color:mis.color,lineHeight:1.65,marginBottom:14,fontStyle:"italic",padding:"4px 0"}}>
            "{mis.preguntas[pregIdx]}"
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",gap:4}}>
              {mis.preguntas.map((_,i)=>(
                <button key={i} onClick={()=>setPregIdx(i)} style={{
                  width:8,height:8,borderRadius:"50%",border:`1px solid ${mis.color}60`,
                  background:pregIdx===i?mis.color:"transparent",cursor:"pointer",padding:0,
                }}/>
              ))}
            </div>
            <button onClick={()=>setPregIdx(p=>(p+1)%mis.preguntas.length)} style={{
              fontSize:8.5,padding:"4px 12px",fontFamily:F,cursor:"pointer",
              background:"rgba(200,165,70,0.08)",border:"1px solid rgba(200,165,70,0.20)",
              borderRadius:3,color:"rgba(200,165,70,0.55)",marginLeft:4,
            }}>Siguiente pregunta →</button>
          </div>
          <div style={{marginTop:12,padding:"8px 12px",background:"rgba(0,0,0,0.25)",borderLeft:`2px solid ${mis.color}40`,fontSize:9.5,color:"rgba(232,213,163,0.55)",fontStyle:"italic"}}>
            Responde desde el SELF, no desde el Ego. La fórmula: Self → Sombra → Daimon → Estrategia → Acción.
          </div>
        </div>
      )}

      {!mis&&(
        <div style={{textAlign:"center",padding:"14px",color:"rgba(200,165,70,0.28)",fontSize:10,fontStyle:"italic"}}>
          Selecciona una misión para ver la pregunta de hoy
        </div>
      )}
    </div>

    {/* ═══════════════════════════════════════════════════════════════
        SECCIÓN FILÓSOFOS — Jung · Maquiavelo · Nietzsche
        Ritual antes de decisiones · Mapa Interno · Navegación · Motor
        ═══════════════════════════════════════════════════════════════ */}
    <div style={{marginTop:34,paddingTop:24,borderTop:"1px solid rgba(200,165,70,0.16)"}}>

      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{fontSize:7.5,letterSpacing:2.5,color:"rgba(200,165,70,0.40)",marginBottom:5}}>RITUAL ANTES DE DECISIONES</div>
        <div style={{fontSize:14,letterSpacing:5,color:"#e8d5a3"}}>LOS TRES FILÓSOFOS</div>
        <div style={{fontSize:9,letterSpacing:2,color:"rgba(200,165,70,0.32)",marginTop:4,fontStyle:"italic"}}>Jung · Maquiavelo · Nietzsche</div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           CREDO — APERTURA · Invocación ritual
           ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        position:"relative",margin:"0 auto 36px",padding:"44px 28px",maxWidth:680,
        background:"radial-gradient(ellipse at center, rgba(20,12,32,0.92) 0%, rgba(6,3,13,0.96) 100%)",
        borderTop:"1px solid rgba(212,175,55,0.28)",
        borderBottom:"1px solid rgba(212,175,55,0.28)",
        textAlign:"center",overflow:"hidden",
      }}>
        {/* Marca de agua: símbolo geométrico inspirado en AC */}
        <svg viewBox="-100 -100 200 200" style={{
          position:"absolute",top:"50%",left:"50%",
          transform:"translate(-50%, -50%)",
          width:300,height:300,opacity:0.07,pointerEvents:"none",
        }}>
          {/* Triángulo principal invertido (vértice abajo) */}
          <path d="M -42 -50 L 42 -50 L 0 35 Z" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinejoin="round"/>
          {/* Curvas laterales tipo alas */}
          <path d="M -42 -50 Q -68 -25 -72 15 Q -55 35 -42 50" fill="none" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M 42 -50 Q 68 -25 72 15 Q 55 35 42 50" fill="none" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round"/>
          {/* Línea central vertical */}
          <line x1="0" y1="-50" x2="0" y2="35" stroke="#d4af37" strokeWidth="1.5"/>
          {/* Punto central */}
          <circle cx="0" cy="-8" r="4.5" fill="#d4af37"/>
        </svg>

        {/* Eyebrow */}
        <div style={{position:"relative",fontSize:9,letterSpacing:3.5,color:"#d4af37",fontStyle:"italic",marginBottom:34}}>
          EL CREDO
        </div>

        {/* CITA 1 — proclamación */}
        <div style={{
          position:"relative",fontFamily:F,color:"#e8d5a3",
          fontSize:21,letterSpacing:"0.18em",lineHeight:1.7,marginBottom:30,
          whiteSpace:"pre-line",
        }}>{"NADA ES VERDAD.\nTODO ESTÁ PERMITIDO."}</div>

        <div style={{
          position:"relative",fontFamily:F,fontStyle:"italic",
          color:"rgba(232,213,163,0.82)",
          fontSize:14,letterSpacing:"0.08em",lineHeight:1.85,marginBottom:42,
          whiteSpace:"pre-line",
        }}>{"Actuamos en las sombras\npara servir a la luz."}</div>

        {/* CITA 2 — desarrollo */}
        <div style={{
          position:"relative",fontFamily:F,
          color:"rgba(232,213,163,0.74)",
          fontSize:12.5,letterSpacing:"0.06em",lineHeight:1.95,marginBottom:20,
          whiteSpace:"pre-line",
        }}>{"Decir que nada es verdad\nes comprender que los cimientos\nde la sociedad son frágiles,\nque debemos ser los pastores\nde nuestra propia civilización.\n\nDecir que todo está permitido\nes entender que somos\nlos arquitectos de nuestras acciones\ny debemos vivir con sus consecuencias,\nsean gloriosas o trágicas."}</div>

        {/* Atribución */}
        <div style={{position:"relative",fontSize:10,fontStyle:"italic",color:"rgba(212,175,55,0.58)",letterSpacing:1.5,marginTop:22}}>
          — Ezio Auditore
        </div>

        {/* Separador decorativo */}
        <div style={{position:"relative",marginTop:26,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <span style={{height:1,width:48,background:"rgba(212,175,55,0.35)"}}/>
          <span style={{fontSize:9,color:"rgba(212,175,55,0.55)",letterSpacing:2}}>· · ·</span>
          <span style={{height:1,width:48,background:"rgba(212,175,55,0.35)"}}/>
        </div>
      </div>

      {/* ─── PIEZA 1: LAS 3 PREGUNTAS-RITUAL ─── */}
      <div className="filo-ritual" style={{marginBottom:32}}>
        {[
          {k:"jung",sym:"🌑",name:"JUNG",q:"¿Qué parte de mí estoy negando?",color:"#9c6dd8"},
          {k:"maq",sym:"♟",name:"MAQUIAVELO",q:"¿Qué movimiento es inteligente aquí? No en mi fantasía.",color:"#4a90d9"},
          {k:"niet",sym:"⚡",name:"NIETZSCHE",q:"¿Lo voy a hacer aunque me tiemble la voz?",color:"#e8794a"},
        ].map(p=>(
          <div key={p.k} style={{
            background:`linear-gradient(180deg, ${p.color}10 0%, rgba(0,0,0,0.35) 100%)`,
            border:`1px solid ${p.color}48`,borderRadius:7,padding:"24px 20px",
            display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",
          }}>
            <div style={{fontSize:34,marginBottom:8,lineHeight:1}}>{p.sym}</div>
            <div style={{fontSize:10,letterSpacing:2.8,color:p.color,marginBottom:20}}>{p.name}</div>
            <div className="filo-ritual-q" style={{fontFamily:F,fontStyle:"italic",color:"#e8d5a3",lineHeight:1.45}}>
              "{p.q}"
            </div>
          </div>
        ))}
      </div>

      {/* ─── PIEZA 2: BARCO PIRATA SVG ─── */}
      <div style={{marginTop:14,marginBottom:8}}>
        <svg viewBox="0 0 800 500" style={{width:"100%",maxWidth:780,height:"auto",display:"block",margin:"0 auto"}}>
          {/* Estrellas de fondo */}
          {Array.from({length:26},(_,i)=>{
            const x=(Math.sin(i*97.3)*0.5+0.5)*780+10;
            const y=(Math.cos(i*137.5)*0.5+0.5)*420+30;
            const r=0.4+(i%4)*0.35;
            const op=0.18+(i%5)*0.10;
            return <circle key={`s${i}`} cx={x} cy={y} r={r} fill={`rgba(200,165,70,${op})`}/>;
          })}

          {/* Luna creciente arriba izquierda */}
          <circle cx="95" cy="78" r="22" fill="rgba(232,213,163,0.18)"/>
          <circle cx="106" cy="76" r="20" fill="#06030d"/>

          {/* Olas debajo del barco */}
          <path d="M 30 410 Q 130 398 230 410 T 430 410 T 630 410 T 830 410" stroke="rgba(255,255,255,0.30)" strokeWidth="1.2" fill="none"/>
          <path d="M 30 430 Q 130 418 230 430 T 430 430 T 630 430 T 830 430" stroke="rgba(255,255,255,0.20)" strokeWidth="1" fill="none"/>
          <path d="M 30 450 Q 130 438 230 450 T 430 450 T 630 450 T 830 450" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" fill="none"/>

          {/* CASCO (Nietzsche - naranja) */}
          <path d="M 170 290 L 660 290 Q 712 290 695 320 L 660 388 Q 432 412 200 388 L 155 360 Q 145 322 170 290 Z"
                fill="rgba(232,121,74,0.10)" stroke="#e8794a" strokeWidth="1.4"/>

          {/* Línea decorativa horizontal del casco */}
          <line x1="160" y1="338" x2="690" y2="338" stroke="rgba(232,121,74,0.55)" strokeWidth="0.8"/>

          {/* Portillas-cañón */}
          {[230,310,390,470,550,620].map(x=>(
            <circle key={`p${x}`} cx={x} cy="358" r="5" fill="#06030d" stroke="#e8794a" strokeWidth="1"/>
          ))}

          {/* Quilla curva (refuerzo bajo casco) */}
          <path d="M 220 392 Q 432 425 645 392" fill="none" stroke="#e8794a" strokeWidth="1.5" opacity="0.65"/>

          {/* Mástil mayor (centrado) */}
          <line x1="400" y1="290" x2="400" y2="65" stroke="rgba(232,213,163,0.85)" strokeWidth="2.5"/>
          {/* Mástil trinquete (adelantado) */}
          <line x1="280" y1="290" x2="280" y2="120" stroke="rgba(232,213,163,0.75)" strokeWidth="2"/>

          {/* Vergas (barras horizontales de velas) */}
          <line x1="335" y1="105" x2="465" y2="105" stroke="rgba(232,213,163,0.70)" strokeWidth="1.5"/>
          <line x1="222" y1="148" x2="338" y2="148" stroke="rgba(232,213,163,0.60)" strokeWidth="1.3"/>

          {/* VELA MAYOR (Maquiavelo - azul) */}
          <path d="M 335 105 L 465 105 Q 478 175 472 252 L 332 252 Q 325 175 335 105 Z"
                fill="rgba(74,144,217,0.10)" stroke="#4a90d9" strokeWidth="1.2"/>
          {/* VELA TRINQUETE */}
          <path d="M 222 148 L 338 148 Q 344 200 335 248 L 220 248 Q 215 200 222 148 Z"
                fill="rgba(74,144,217,0.08)" stroke="#4a90d9" strokeWidth="1"/>

          {/* Líneas internas de las velas (textura) */}
          <line x1="402" y1="108" x2="402" y2="252" stroke="rgba(74,144,217,0.32)" strokeWidth="0.7"/>
          <line x1="280" y1="150" x2="278" y2="248" stroke="rgba(74,144,217,0.32)" strokeWidth="0.7"/>

          {/* BANDERA PIRATA — Jolly Roger reconocible */}
          {/* Asta extendida arriba del mástil */}
          <line x1="400" y1="65" x2="400" y2="15" stroke="rgba(232,213,163,0.75)" strokeWidth="1.8"/>
          <circle cx="400" cy="13" r="2.5" fill="rgba(232,213,163,0.85)"/>
          {/* Bandera negra ondulante (más grande, 90×56) */}
          <path d="M 402 18 L 492 16 Q 500 25 495 34 Q 502 44 496 54 Q 504 64 498 72 L 402 70 Z"
                fill="#0a0a0a" stroke="rgba(232,213,163,0.60)" strokeWidth="1"/>
          {/* Calavera grande centrada en la bandera */}
          {/* Cráneo */}
          <ellipse cx="448" cy="36" rx="13" ry="11" fill="rgba(245,235,210,0.92)"/>
          {/* Mandíbula */}
          <path d="M 442 44 L 444 50 L 448 47 L 452 50 L 454 44 Z" fill="rgba(245,235,210,0.92)"/>
          {/* Cuencas oculares (negras, hundidas) */}
          <ellipse cx="443" cy="34" rx="2.8" ry="3.2" fill="#0a0a0a"/>
          <ellipse cx="453" cy="34" rx="2.8" ry="3.2" fill="#0a0a0a"/>
          {/* Nariz triangular */}
          <path d="M 448 38 L 446 41 L 450 41 Z" fill="#0a0a0a"/>
          {/* Dientes (3 líneas verticales en la mandíbula) */}
          <line x1="446" y1="46" x2="446" y2="49" stroke="#0a0a0a" strokeWidth="0.6"/>
          <line x1="448" y1="46" x2="448" y2="49.5" stroke="#0a0a0a" strokeWidth="0.6"/>
          <line x1="450" y1="46" x2="450" y2="49" stroke="#0a0a0a" strokeWidth="0.6"/>
          {/* Huesos cruzados detrás (X) — más grandes y visibles */}
          {/* Hueso diagonal NW→SE */}
          <line x1="430" y1="56" x2="466" y2="68" stroke="rgba(245,235,210,0.85)" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="430" cy="56" r="2.2" fill="rgba(245,235,210,0.85)"/>
          <circle cx="466" cy="68" r="2.2" fill="rgba(245,235,210,0.85)"/>
          {/* Hueso diagonal NE→SW */}
          <line x1="466" y1="56" x2="430" y2="68" stroke="rgba(245,235,210,0.85)" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="466" cy="56" r="2.2" fill="rgba(245,235,210,0.85)"/>
          <circle cx="430" cy="68" r="2.2" fill="rgba(245,235,210,0.85)"/>

          {/* TIMÓN en popa — más grande y reconocible */}
          {/* Soporte del timón al casco */}
          <line x1="180" y1="285" x2="180" y2="295" stroke="rgba(232,213,163,0.65)" strokeWidth="1.5"/>
          <line x1="170" y1="290" x2="190" y2="290" stroke="rgba(232,213,163,0.55)" strokeWidth="1"/>
          {/* Aro exterior grueso */}
          <circle cx="180" cy="255" r="22" fill="none" stroke="rgba(232,213,163,0.80)" strokeWidth="2"/>
          {/* Aro interior fino */}
          <circle cx="180" cy="255" r="16" fill="none" stroke="rgba(232,213,163,0.60)" strokeWidth="0.8"/>
          {/* 8 rayos del timón */}
          {[0,45,90,135,180,225,270,315].map(angle=>{
            const a=angle*Math.PI/180;
            const x1=180+Math.cos(a)*4;
            const y1=255+Math.sin(a)*4;
            const x2=180+Math.cos(a)*22;
            const y2=255+Math.sin(a)*22;
            return <line key={`t${angle}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(232,213,163,0.75)" strokeWidth="1.5" strokeLinecap="round"/>;
          })}
          {/* 8 mangos que sobresalen del aro */}
          {[0,45,90,135,180,225,270,315].map(angle=>{
            const a=angle*Math.PI/180;
            const x1=180+Math.cos(a)*22;
            const y1=255+Math.sin(a)*22;
            const x2=180+Math.cos(a)*28;
            const y2=255+Math.sin(a)*28;
            return <line key={`tm${angle}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(232,213,163,0.75)" strokeWidth="1.8" strokeLinecap="round"/>;
          })}
          {/* Centro del timón */}
          <circle cx="180" cy="255" r="4" fill="rgba(232,213,163,0.85)"/>
          <circle cx="180" cy="255" r="1.5" fill="#1a1018"/>

          {/* PERGAMINO en cubierta (Jung - púrpura) */}
          <rect x="510" y="270" width="90" height="22" fill="rgba(156,109,216,0.22)" stroke="#9c6dd8" strokeWidth="1.1" rx="1.5"/>
          <ellipse cx="510" cy="281" rx="4" ry="12" fill="rgba(156,109,216,0.35)" stroke="#9c6dd8" strokeWidth="0.9"/>
          <ellipse cx="600" cy="281" rx="4" ry="12" fill="rgba(156,109,216,0.35)" stroke="#9c6dd8" strokeWidth="0.9"/>
          <path d="M 520 278 Q 540 274 555 278 T 590 278" stroke="rgba(232,213,163,0.55)" strokeWidth="0.6" fill="none"/>
          <path d="M 520 285 Q 540 281 555 285 T 590 285" stroke="rgba(232,213,163,0.55)" strokeWidth="0.6" fill="none"/>
          <line x1="565" y1="280" x2="569" y2="284" stroke="#e8794a" strokeWidth="0.9"/>
          <line x1="569" y1="280" x2="565" y2="284" stroke="#e8794a" strokeWidth="0.9"/>

          {/* ETIQUETA JUNG → pergamino */}
          <line x1="180" y1="52" x2="510" y2="278" stroke="rgba(156,109,216,0.40)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <circle cx="510" cy="278" r="3" fill="#9c6dd8"/>
          <text x="38" y="32" fontFamily={F} fontSize="12" fill="#9c6dd8" letterSpacing="2">JUNG</text>
          <line x1="78" y1="40" x2="175" y2="40" stroke="rgba(156,109,216,0.55)" strokeWidth="0.8"/>
          <text x="38" y="56" fontFamily={F} fontSize="9" fill="rgba(156,109,216,0.78)" letterSpacing="1.2">EL MAPA INTERNO</text>

          {/* ETIQUETA MAQUIAVELO → vela mayor */}
          <line x1="610" y1="52" x2="430" y2="172" stroke="rgba(74,144,217,0.40)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <circle cx="430" cy="172" r="3" fill="#4a90d9"/>
          <text x="538" y="32" fontFamily={F} fontSize="12" fill="#4a90d9" letterSpacing="2">MAQUIAVELO</text>
          <line x1="622" y1="40" x2="745" y2="40" stroke="rgba(74,144,217,0.55)" strokeWidth="0.8"/>
          <text x="538" y="56" fontFamily={F} fontSize="9" fill="rgba(74,144,217,0.78)" letterSpacing="1.2">LA NAVEGACIÓN EXTERNA</text>

          {/* ETIQUETA NIETZSCHE → casco */}
          <line x1="610" y1="460" x2="500" y2="395" stroke="rgba(232,121,74,0.40)" strokeWidth="0.7" strokeDasharray="3,3"/>
          <circle cx="500" cy="395" r="3" fill="#e8794a"/>
          <text x="538" y="475" fontFamily={F} fontSize="12" fill="#e8794a" letterSpacing="2">NIETZSCHE</text>
          <line x1="622" y1="467" x2="745" y2="467" stroke="rgba(232,121,74,0.55)" strokeWidth="0.8"/>
          <text x="538" y="489" fontFamily={F} fontSize="9" fill="rgba(232,121,74,0.78)" letterSpacing="1.2">EL MOTOR Y CASCO</text>
        </svg>
      </div>

      {/* ─── PIEZA 3: TEXTO EDITORIAL METÁFORA ─── */}
      <div style={{textAlign:"center",margin:"22px auto 44px",maxWidth:560,fontFamily:F,color:"#e8d5a3"}}>
        <div style={{fontSize:20,fontStyle:"italic",letterSpacing:1,marginBottom:14}}>"Tu vida es un barco."</div>
        <div style={{fontSize:13,fontStyle:"italic",color:"rgba(232,213,163,0.80)",marginBottom:24,letterSpacing:0.5}}>Sin uno de los tres, no llegas.</div>
        <div style={{display:"flex",flexDirection:"column",gap:14,fontSize:11.5,lineHeight:1.7,color:"rgba(232,213,163,0.72)",fontStyle:"italic"}}>
          <div><span style={{color:"#9c6dd8",fontStyle:"normal",letterSpacing:1}}>Sin Jung</span> — navegas perfecto a un destino equivocado.</div>
          <div><span style={{color:"#4a90d9",fontStyle:"normal",letterSpacing:1}}>Sin Maquiavelo</span> — sabes a dónde vas pero no sabes cómo llegar.</div>
          <div><span style={{color:"#e8794a",fontStyle:"normal",letterSpacing:1}}>Sin Nietzsche</span> — sabes a dónde y cómo, pero no aguantas la travesía.</div>
        </div>
      </div>

      {/* ─── PIEZA 4: 3 CARDS EXPANDIBLES ─── */}
      <div className="filo-cards" style={{marginBottom:30}}>
        {[
          {k:"jung",sym:"🌑",name:"JUNG",role:"EL MAPA INTERNO",axis:"EL POR QUÉ — LA PSIQUE",
           q:"¿Qué parte de mí estoy negando?",color:"#9c6dd8",
           intro:"Conoces las motivaciones reales, incluso las que prefieres no ver.",
           conceptos:[
             ["Sombra","lo que niegas te somete. No la integras = te opera sin permiso."],
             ["Sombra Dorada","lo que admiras intensamente en otros y no reclamas como tuyo."],
             ["Arquetipos","las máscaras que usas. Persona, Héroe, Niño, Saboteador, Juez."],
             ["Individuación","dejar de vivir el guión heredado y volverte tú."],
             ["Proyección","lo que más te irrita en otros suele ser lo tuyo no resuelto."],
             ["Self","el centro de totalidad, más allá del Ego. El Testigo que observa."],
           ],
           cuando:"Antes de reacciones emocionales fuertes. Si una crítica te duele como ataque, Jung muestra la herida. Si idealizas a alguien, Jung muestra la cualidad tuya que no reclamas.",
           para:"La envidia hacia quien ya está donde tú quieres llegar = Sombra Dorada diciéndote quién ya eres. El miedo a no ser suficiente = el programa del Ego. Tu Sombra te impulsa o te sabotea — depende de si la conoces o la niegas.",
           momento:[
             {titulo:"Cuando algo te genera reacción emocional fuerte:",pasos:[
               "¿Qué de esto me toca? No qué está pasando — qué de esto me hiere específicamente.",
               "¿La intensidad de mi reacción corresponde al estímulo? Si es desproporcionada, es Sombra hablando.",
               "¿Qué herida vieja está siendo activada hoy?",
             ]},
             {titulo:"Cuando envidias a alguien:",pasos:[
               "La envidia es información. ¿Qué tiene esa persona que tú quieres reclamar?",
               "Eso que envidias = Sombra Dorada = algo tuyo no integrado todavía.",
               "La envidia bien usada es brújula, no veneno.",
             ]},
             {titulo:"Cuando te criticas duro a ti mismo:",pasos:[
               "¿Quién está hablando ahora? ¿Yo, o el Juez que viene de mi historia?",
               "Si el Juez es alguien específico de tu pasado, nómbralo.",
               "El Self no se critica. Observa. El Juez critica.",
             ]},
             {titulo:"Antes de decisiones importantes:",pasos:[
               "¿Esto lo quiero yo, o lo quiere alguien dentro de mí (Ego, niño herido, Persona social)?",
               "Si me imagino haciendo esto y siento contracción en el pecho, hay Sombra que revisar.",
               "Si siento expansión, es el Self.",
             ]},
           ]},
          {k:"maq",sym:"♟",name:"MAQUIAVELO",role:"LA NAVEGACIÓN EXTERNA",axis:"EL QUÉ — EL MUNDO",
           q:"¿Qué movimiento es inteligente aquí? No en mi fantasía.",color:"#4a90d9",
           intro:"Lees el viento, las corrientes, las costas. La realidad como es, no como debería ser.",
           conceptos:[
             ["Virtù vs Fortuna","tu capacidad y carácter vs el azar y el contexto. Trabajas la Virtù para que la Fortuna te encuentre listo."],
             ["León y Zorro","firmeza para sostener tu posición, astucia para leer la trampa. Ninguno solo basta."],
             ["Temido vs amado","si hay que elegir, mejor temido — pero nunca odiado. El odio te derriba; el respeto sostiene."],
             ["Timing","esperar 2 segundos antes de responder. Observar quién decide en la sala antes de hablar."],
             ["Lectura del contexto","el movimiento brillante en el momento equivocado es fracaso. La precisión es del contexto, no del plan."],
             ["Percepción","los demás viven tu impacto, no tu intención. Lo que proyectas pesa más que lo que sentías."],
             ["Fines y medios","si los fines son nobles y claros, los medios se ajustan. No es justificar — es no confundir código moral con efectividad."],
           ],
           cuando:"En interacción, negociación, dinámicas de poder en cualquier grupo, decisiones donde otros tienen influencia. Cualquier momento donde hay otros y tu lectura del juego cambia el resultado.",
           para:"En una negociación importante cuando decides qué decir y a quién. Cuando algo se juega y tienes que elegir qué versión de ti mostrar. Cuando hay otros leyendo lo que haces y la lectura cambia el resultado. La estrategia no es manipulación — es precisión sobre dónde estás parado.",
           momento:[
             {titulo:"Antes de una negociación importante:",pasos:[
               "¿Quién decide realmente? No el que está en la sala — quién tiene la pluma.",
               "¿Qué quieren ellos? Más que lo que quieres tú.",
               "¿Cuál es la moneda de cambio aquí? No siempre es dinero.",
               "¿En qué momento les conviene a ellos decir sí?",
             ]},
             {titulo:"En una conversación tensa:",pasos:[
               "Cuenta 2 segundos antes de responder.",
               "La pregunta antes que la afirmación.",
               "Si tienes que ser temido, mejor temido. Si puedes ser respetado sin perder, mejor respetado.",
               "No defiendas. No expliques. Reposiciona.",
             ]},
             {titulo:"Cuando alguien te ataca o critica:",pasos:[
               "¿Es información o es ruido?",
               "Si es información, gracias y siguiente.",
               "Si es ruido, silencio. El silencio incomoda más que la defensa.",
             ]},
             {titulo:"Antes de cualquier movimiento importante:",pasos:[
               "¿Qué piezas del tablero estoy ignorando?",
               "¿Quién gana si yo gano? ¿Quién pierde?",
               "¿Hay un movimiento más inteligente que el evidente?",
             ]},
           ]},
          {k:"niet",sym:"⚡",name:"NIETZSCHE",role:"EL MOTOR Y CASCO",axis:"EL CÓMO — LA VOLUNTAD",
           q:"¿Lo voy a hacer aunque me tiemble la voz?",color:"#e8794a",
           intro:"La fuerza para avanzar cuando todo se opone. El casco que aguanta la tormenta.",
           conceptos:[
             ["Voluntad de poder","no dominar a otros: dominio sobre sí mismo. Fuerza creadora dirigida."],
             ["Übermensch / Superhombre","el que crea sus propios valores en lugar de heredarlos. No espera permiso."],
             ["Último hombre","su opuesto: el que evita riesgo, vive cómodo, no aspira. El que se conforma con lo conocido aunque sienta que no es suyo."],
             ["Amor Fati","amar el destino. Usar obstáculos como entrenamiento, no como queja."],
             ["Eterno retorno","vivir como si fueras a repetir esta vida infinitas veces. ¿La quieres así?"],
             ["Moral amos/esclavos","valores activos creadores vs valores reactivos resentidos. ¿Construyes o reaccionas?"],
             ["Transvaloración","cuestionar qué te dijeron que era 'bueno' y 'malo', redefinirlo desde ti."],
             ["Muerte de Dios","sin referentes externos absolutos, o creas tus propios valores o caes en nihilismo."],
           ],
           cuando:"Cuando la motivación muere. Cuando te tiembla la voz. Cuando todos te dicen que no. Cuando los valores heredados ya no te sirven y necesitas crear los tuyos.",
           para:"Cuando no quieres cumplir un compromiso contigo mismo. Cuando un proyecto largo no muestra resultados todavía. Antes de un salto importante sin red de seguridad. Cuando alguien te dice 'eso no se hace así.' El Último Hombre se quedaría cómodo en lo conocido. El Übermensch / Superhombre crea sus propios valores para moverse a donde resuena.",
           momento:[
             {titulo:"Cuando no quieres hacer algo que dijiste que ibas a hacer:",pasos:[
               "Pregunta del Eterno Retorno: \"¿Quiero que este momento — el de rendirme ahora — se repita infinitas veces?\"",
               "Si la respuesta es no, levántate. Sin discutirlo.",
             ]},
             {titulo:"Cuando algo sale mal:",pasos:[
               "Amor Fati no es \"me alegro que pasó\". Es: \"¿Qué tiene esto que yo necesitaba para algo más adelante?\"",
               "El obstáculo es entrenamiento. Pregunta concreta: ¿qué músculo me está exigiendo este obstáculo?",
             ]},
             {titulo:"Cuando el grupo te dice \"eso no se hace así\":",pasos:[
               "¿De dónde viene esa regla? ¿Quién la creó? ¿Para quién sirve?",
               "Si la regla sirve al Último Hombre, no es mi regla.",
               "Mis valores los creo yo. Eso es Transvaloración.",
             ]},
             {titulo:"Cuando te tiembla la voz:",pasos:[
               "La voz tiembla porque importa. La voz no tiembla por cosas pequeñas.",
               "Si tiembla = es importante = avanza.",
             ]},
             {titulo:"Cuando todos te dicen que no:",pasos:[
               "¿Quién me lo está diciendo? ¿Son Übermensch o Último Hombre?",
               "Los que ya están donde tú quieres llegar dicen una cosa. Los demás dicen otra. Escucha al primero.",
             ]},
           ]},
        ].map(p=>{
          const isOpen=expandedPhilo===p.k;
          return (
            <div key={p.k} style={{
              background:"rgba(10,6,22,0.92)",
              border:`1px solid ${p.color}${isOpen?"55":"28"}`,
              borderRadius:6,overflow:"hidden",transition:"border .25s",
            }}>
              <button onClick={()=>setExpandedPhilo(isOpen?null:p.k)} style={{
                width:"100%",padding:"16px 14px",cursor:"pointer",textAlign:"left",
                background:isOpen?`${p.color}10`:"transparent",
                border:"none",fontFamily:F,color:"#e8d5a3",transition:"background .25s",
              }}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{fontSize:22,lineHeight:1,flexShrink:0,marginTop:1}}>{p.sym}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,letterSpacing:2,color:p.color,marginBottom:2}}>{p.name}</div>
                    <div style={{fontSize:8.5,letterSpacing:1.2,color:`${p.color}aa`,marginBottom:8}}>{p.role}</div>
                    <div style={{fontSize:10.5,fontStyle:"italic",color:"rgba(232,213,163,0.80)",lineHeight:1.5}}>
                      "{p.q}"
                    </div>
                  </div>
                  <div style={{fontSize:14,color:`${p.color}aa`,flexShrink:0,marginTop:1}}>{isOpen?"−":"+"}</div>
                </div>
              </button>
              {isOpen&&(
                <div style={{padding:"4px 16px 18px",borderTop:`1px solid ${p.color}22`}}>

                  <div style={{marginTop:14,marginBottom:14}}>
                    <div style={{fontSize:8,letterSpacing:1.5,color:p.color,marginBottom:5,opacity:0.85}}>{p.axis}</div>
                    <div style={{fontSize:10.5,color:"#d4c48a",lineHeight:1.6}}>{p.intro}</div>
                  </div>

                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:8,letterSpacing:1.5,color:"rgba(200,165,70,0.50)",marginBottom:7}}>CONCEPTOS CLAVE</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {p.conceptos.map(([c,d],i)=>(
                        <div key={i} style={{fontSize:9.5,lineHeight:1.55,color:"#c8b88a",paddingLeft:9,borderLeft:`1.5px solid ${p.color}48`}}>
                          <span style={{color:p.color,fontWeight:"500"}}>{c}</span>
                          <span style={{color:"rgba(200,165,70,0.40)",margin:"0 5px"}}>·</span>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:8,letterSpacing:1.5,color:"rgba(200,165,70,0.50)",marginBottom:5}}>CUÁNDO USARLO</div>
                    <div style={{fontSize:9.5,color:"#c8b88a",lineHeight:1.6}}>{p.cuando}</div>
                  </div>

                  <div style={{padding:"10px 12px",background:`${p.color}10`,borderLeft:`2px solid ${p.color}`,borderRadius:"0 3px 3px 0"}}>
                    <div style={{fontSize:8,letterSpacing:1.5,color:p.color,marginBottom:5,opacity:0.85}}>→ PARA TI</div>
                    <div style={{fontSize:10,color:"#e8d5a3",lineHeight:1.65,fontStyle:"italic"}}>{p.para}</div>
                  </div>

                  {/* ── EN EL MOMENTO — escenarios prácticos ── */}
                  <div style={{marginTop:18,paddingTop:14,borderTop:`1px solid ${p.color}22`}}>
                    <div style={{fontSize:8,letterSpacing:2,color:p.color,marginBottom:11,opacity:0.85}}>EN EL MOMENTO</div>
                    <div style={{display:"flex",flexDirection:"column",gap:12}}>
                      {p.momento.map((esc,i)=>(
                        <div key={i}>
                          <div style={{fontSize:10,fontStyle:"italic",color:p.color,lineHeight:1.4,marginBottom:6,letterSpacing:0.3}}>
                            {esc.titulo}
                          </div>
                          <ol style={{margin:0,padding:"0 0 0 18px",display:"flex",flexDirection:"column",gap:4}}>
                            {esc.pasos.map((paso,j)=>(
                              <li key={j} style={{fontSize:9.5,color:"#c8b88a",lineHeight:1.55}}>
                                {paso}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── PIEZA 5: DIAGRAMA DE UNIFICACIÓN ─── */}
      <div style={{textAlign:"center",margin:"32px auto 0",padding:"22px 0",borderTop:"1px solid rgba(200,165,70,0.10)"}}>
        <div style={{fontSize:7.5,letterSpacing:2.5,color:"rgba(200,165,70,0.42)",marginBottom:12}}>UNIFICACIÓN</div>
        <svg viewBox="0 0 400 400" style={{width:"100%",maxWidth:340,height:"auto",display:"block",margin:"0 auto"}}>
          {/* Triángulo guía */}
          <path d="M 200 60 L 60 320 L 340 320 Z" fill="none" stroke="rgba(232,213,163,0.20)" strokeWidth="1.2" strokeDasharray="2,4"/>

          {/* Ejes hacia el centro */}
          <line x1="200" y1="60" x2="200" y2="233" stroke="rgba(156,109,216,0.45)" strokeWidth="1.2"/>
          <line x1="60" y1="320" x2="200" y2="233" stroke="rgba(74,144,217,0.45)" strokeWidth="1.2"/>
          <line x1="340" y1="320" x2="200" y2="233" stroke="rgba(232,121,74,0.45)" strokeWidth="1.2"/>

          {/* Aura central dorada */}
          <circle cx="200" cy="233" r="38" fill="rgba(232,200,74,0.06)"/>
          <circle cx="200" cy="233" r="24" fill="rgba(232,200,74,0.10)"/>
          <circle cx="200" cy="233" r="12" fill="rgba(232,200,74,0.30)"/>
          <circle cx="200" cy="233" r="5" fill="#e8c84a"/>

          {/* Vértice Jung (arriba) */}
          <circle cx="200" cy="60" r="22" fill="rgba(156,109,216,0.18)" stroke="#9c6dd8" strokeWidth="1.2"/>
          <text x="200" y="66" textAnchor="middle" fontSize="14" fontFamily={F}>🌑</text>
          <text x="200" y="32" textAnchor="middle" fontSize="11" fill="#9c6dd8" fontFamily={F} letterSpacing="2">JUNG</text>
          <text x="200" y="46" textAnchor="middle" fontSize="8.5" fill="rgba(156,109,216,0.70)" fontFamily={F} fontStyle="italic">¿Por qué?</text>

          {/* Vértice Maquiavelo (abajo izq) */}
          <circle cx="60" cy="320" r="22" fill="rgba(74,144,217,0.18)" stroke="#4a90d9" strokeWidth="1.2"/>
          <text x="60" y="326" textAnchor="middle" fontSize="14" fontFamily={F}>♟</text>
          <text x="60" y="362" textAnchor="middle" fontSize="11" fill="#4a90d9" fontFamily={F} letterSpacing="2">MAQUIAVELO</text>
          <text x="60" y="378" textAnchor="middle" fontSize="8.5" fill="rgba(74,144,217,0.70)" fontFamily={F} fontStyle="italic">¿Qué?</text>

          {/* Vértice Nietzsche (abajo der) */}
          <circle cx="340" cy="320" r="22" fill="rgba(232,121,74,0.18)" stroke="#e8794a" strokeWidth="1.2"/>
          <text x="340" y="326" textAnchor="middle" fontSize="14" fontFamily={F}>⚡</text>
          <text x="340" y="362" textAnchor="middle" fontSize="11" fill="#e8794a" fontFamily={F} letterSpacing="2">NIETZSCHE</text>
          <text x="340" y="378" textAnchor="middle" fontSize="8.5" fill="rgba(232,121,74,0.70)" fontFamily={F} fontStyle="italic">¿Cómo?</text>

          {/* Etiqueta centro */}
          <text x="200" y="268" textAnchor="middle" fontSize="9" fill="#e8c84a" fontFamily={F} letterSpacing="1.5">SELF</text>
          <text x="200" y="282" textAnchor="middle" fontSize="7.5" fill="rgba(232,200,74,0.65)" fontFamily={F} letterSpacing="1">ACCIÓN COHERENTE</text>
        </svg>
        <div style={{maxWidth:500,margin:"16px auto 0",fontSize:10.5,fontStyle:"italic",color:"rgba(232,213,163,0.62)",lineHeight:1.7,fontFamily:F}}>
          El dominio total ocurre cuando los tres ejes apuntan igual.<br/>
          <span style={{color:"#2e9e6b",fontStyle:"normal",letterSpacing:0.5}}>La Lattice responde. La realidad se mueve.</span>
        </div>
      </div>

      {/* ─── PIEZA 6: 9 PILARES PRÁCTICOS ─── */}
      <div style={{marginTop:30,paddingTop:22,borderTop:"1px solid rgba(200,165,70,0.10)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:7.5,letterSpacing:2.5,color:"rgba(200,165,70,0.42)"}}>PRÁCTICA SEMANAL</div>
          <div style={{fontSize:10.5,color:"rgba(200,165,70,0.50)",fontStyle:"italic",marginTop:5}}>9 pilares · 3 por filósofo · check al final de la semana</div>
        </div>

        <div className="filo-pillars">
          {[
            {philo:"jung",color:"#9c6dd8",name:"JUNG",sub:"Mundo Interno",pillars:[
              ["j1","Integrar la sombra","¿Qué te irritó esta semana de alguien? Eso que te irrita probablemente lo cargas tú."],
              ["j2","Conocer los arquetipos","¿Qué máscara usaste hoy en el trabajo, en una conversación con alguien cercano, en familia? ¿La elegiste o te eligió?"],
              ["j3","Individuarse","¿Qué decisión tomaste esta semana que era tuya, no del guión que heredaste?"],
            ]},
            {philo:"maq",color:"#4a90d9",name:"MAQUIAVELO",sub:"Mov. Externo",pillars:[
              ["m1","Dominar el timing","¿Esperaste 2 segundos antes de responder esta semana, al menos 3 veces?"],
              ["m2","Ser León y Zorro","¿Cuándo fuiste firme + astuto esta semana, no solo uno de los dos?"],
              ["m3","Controlar la percepción","¿Qué versión de ti mostraste a quién importa? ¿Fue intencional?"],
            ]},
            {philo:"niet",color:"#e8794a",name:"NIETZSCHE",sub:"Ejecución",pillars:[
              ["n1","Amor Fati","¿Qué obstáculo de esta semana usaste como entrenamiento en lugar de queja?"],
              ["n2","Forjar la voluntad","¿Hiciste algo aunque te temblara la voz, al menos una vez esta semana?"],
              ["n3","Crear valores propios","¿Qué 'deber ser' heredado cuestionaste activamente esta semana?"],
            ]},
          ].map(col=>(
            <div key={col.philo} style={{
              background:"rgba(10,6,22,0.85)",border:`1px solid ${col.color}28`,borderRadius:5,padding:"14px 14px",
            }}>
              <div style={{marginBottom:12,paddingBottom:9,borderBottom:`1px solid ${col.color}22`}}>
                <div style={{fontSize:10.5,letterSpacing:2,color:col.color}}>{col.name}</div>
                <div style={{fontSize:8.5,color:`${col.color}99`,marginTop:2,fontStyle:"italic"}}>{col.sub}</div>
              </div>
              {col.pillars.map(([k,name,tip])=>{
                const isChecked=!!pillarsChecked[k];
                const isOpen=pillarOpen===k;
                return (
                  <div key={k} style={{marginBottom:9}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:9,cursor:"pointer"}}
                         onClick={()=>setPillarOpen(p=>p===k?null:k)}>
                      <button onClick={(e)=>{e.stopPropagation();setPillarsChecked(prev=>({...prev,[k]:!prev[k]}));}} style={{
                        width:16,height:16,flexShrink:0,marginTop:1,padding:0,cursor:"pointer",
                        background:isChecked?col.color:"transparent",
                        border:`1.3px solid ${isChecked?col.color:col.color+"60"}`,
                        borderRadius:3,color:"#06030d",fontSize:10,fontWeight:"bold",lineHeight:1,
                        display:"flex",alignItems:"center",justifyContent:"center",
                      }}>{isChecked?"✓":""}</button>
                      <div style={{flex:1,fontSize:9.5,color:isChecked?col.color:"#d4c48a",lineHeight:1.4,textDecoration:isChecked?"line-through":"none",opacity:isChecked?0.75:1}}>
                        {name}
                      </div>
                    </div>
                    {isOpen&&(
                      <div style={{marginTop:6,marginLeft:25,padding:"7px 10px",background:`${col.color}10`,borderLeft:`2px solid ${col.color}55`,fontSize:9,color:"rgba(232,213,163,0.75)",lineHeight:1.55,fontStyle:"italic",borderRadius:"0 3px 3px 0"}}>
                        {tip}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:14,fontSize:8,color:"rgba(200,165,70,0.32)",fontStyle:"italic"}}>
          Click en el pilar para ver la pregunta · Click en el cuadro para marcar
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           CREDO — CIERRE · Advertencia última
           ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        position:"relative",margin:"40px auto 8px",padding:"46px 28px 38px",maxWidth:680,
        background:"radial-gradient(ellipse at center, rgba(20,12,32,0.92) 0%, rgba(6,3,13,0.96) 100%)",
        borderTop:"1px solid rgba(212,175,55,0.28)",
        borderBottom:"1px solid rgba(212,175,55,0.28)",
        textAlign:"center",overflow:"hidden",
      }}>
        {/* Marca de agua: símbolo geométrico inspirado en AC */}
        <svg viewBox="-100 -100 200 200" style={{
          position:"absolute",top:"45%",left:"50%",
          transform:"translate(-50%, -50%)",
          width:300,height:300,opacity:0.07,pointerEvents:"none",
        }}>
          <path d="M -42 -50 L 42 -50 L 0 35 Z" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M -42 -50 Q -68 -25 -72 15 Q -55 35 -42 50" fill="none" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M 42 -50 Q 68 -25 72 15 Q 55 35 42 50" fill="none" stroke="#d4af37" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="0" y1="-50" x2="0" y2="35" stroke="#d4af37" strokeWidth="1.5"/>
          <circle cx="0" cy="-8" r="4.5" fill="#d4af37"/>
        </svg>

        {/* Eyebrow */}
        <div style={{position:"relative",fontSize:9,letterSpacing:3.5,color:"#d4af37",fontStyle:"italic",marginBottom:34}}>
          EL CREDO — CIERRE
        </div>

        {/* CITA 3 — proclamación de libertad */}
        <div style={{
          position:"relative",fontFamily:F,color:"#e8d5a3",
          fontSize:18,letterSpacing:"0.16em",lineHeight:1.7,marginBottom:30,
          whiteSpace:"pre-line",
        }}>{"SOMOS LIBRES DE SEGUIR\nNUESTRO PROPIO CAMINO."}</div>

        <div style={{
          position:"relative",fontFamily:F,
          color:"rgba(232,213,163,0.78)",
          fontSize:13,letterSpacing:"0.07em",lineHeight:1.95,marginBottom:18,
          whiteSpace:"pre-line",
        }}>{"No hay libro ni maestro\nque te dé las respuestas.\n\nElige tu propio camino.\nNo me sigas a mí\nni a nadie más."}</div>

        {/* Atribución */}
        <div style={{position:"relative",fontSize:10,fontStyle:"italic",color:"rgba(212,175,55,0.58)",letterSpacing:1.5,marginTop:18,marginBottom:34}}>
          — Ezio Auditore
        </div>

        {/* Separador decorativo */}
        <div style={{position:"relative",marginBottom:40,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <span style={{height:1,width:48,background:"rgba(212,175,55,0.35)"}}/>
          <span style={{fontSize:9,color:"rgba(212,175,55,0.55)",letterSpacing:2}}>· · ·</span>
          <span style={{height:1,width:48,background:"rgba(212,175,55,0.35)"}}/>
        </div>

        {/* CITA 4 — la advertencia última, íntima */}
        <div style={{
          position:"relative",fontFamily:F,fontStyle:"italic",
          color:"rgba(232,213,163,0.92)",
          fontSize:16,letterSpacing:"0.02em",lineHeight:2.1,marginBottom:8,
          whiteSpace:"pre-line",
        }}>{"\"Cuando era joven,\ntenía Libertad — pero no la veía.\ntenía Tiempo — pero no lo conocía.\ntenía Amor — pero no lo sentía.\""}</div>

        {/* Línea de cierre — VE. CONOCE. SIENTE. */}
        <div style={{
          position:"relative",marginTop:38,marginBottom:6,
          fontFamily:F,fontStyle:"italic",
          color:"#d4af37",
          fontSize:14,letterSpacing:"0.30em",
        }}>VE. CONOCE. SIENTE.</div>

        {/* Logo AC sutil al final — más visible que la marca de agua (firma) */}
        <div style={{position:"relative",marginTop:36,display:"flex",justifyContent:"center"}}>
          <svg viewBox="-100 -100 200 200" style={{width:70,height:70,opacity:0.30}}>
            <path d="M -42 -50 L 42 -50 L 0 35 Z" fill="none" stroke="#d4af37" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M -42 -50 Q -68 -25 -72 15 Q -55 35 -42 50" fill="none" stroke="#d4af37" strokeWidth="2.6" strokeLinecap="round"/>
            <path d="M 42 -50 Q 68 -25 72 15 Q 55 35 42 50" fill="none" stroke="#d4af37" strokeWidth="2.6" strokeLinecap="round"/>
            <line x1="0" y1="-50" x2="0" y2="35" stroke="#d4af37" strokeWidth="1.8"/>
            <circle cx="0" cy="-8" r="5" fill="#d4af37"/>
          </svg>
        </div>
      </div>

    </div>

    <div style={{textAlign:"center",marginTop:10,fontSize:7,color:"rgba(200,165,70,0.18)",letterSpacing:1.5}}>
      Dr. Luis Andaur Vignolo · Jung · Dispenza · Grinberg · Spiral Dynamics · Hawkins · PNL
    </div>
    </>)}
    {/* ═════════ END TAB: MAPA ═════════ */}

    {/* ═══════════════════════════════════════════════════════════════
        TAB: DIAGNÓSTICO — Sistema 7 Zonas
        ═══════════════════════════════════════════════════════════════ */}
    {activeTab==="diag" && (<>

      <div style={{textAlign:"center",margin:"8px auto 28px",maxWidth:680}}>
        <div style={{fontSize:14,letterSpacing:5,color:"#d4af37"}}>DIAGNÓSTICO</div>
        <div style={{fontSize:8,letterSpacing:2,color:"rgba(212,175,55,0.45)",marginTop:5}}>SISTEMA 7 ZONAS · HOE-MATH</div>
        <div style={{fontSize:11,fontStyle:"italic",color:"rgba(232,213,163,0.70)",marginTop:14,lineHeight:1.6,padding:"0 16px"}}>
          Cuando algo no avanza, recorre las 7 zonas.<br/>
          Encontrarás dónde está el bloqueo.
        </div>
        <div style={{margin:"18px auto 0",height:1,width:80,background:"rgba(212,175,55,0.35)"}}/>
      </div>

      {[
        {n:1,name:"IDENTIFY YOUR DESIRES",color:"#c04848",pregunta:"¿Qué quiero realmente?",
         bloques:[
           {label:"WHAT DO I WANT?",txt:"Money, possessions, relationships, roles, meaning, belonging, experiences, feelings, achievement, power..."},
           {label:"WHAT DO I NEED in order to get what I want?",txt:"Materials, conditions, favors, abilities, access, people, cooperation, time, skills, practice, knowledge, environment, agreements..."},
         ],tags:["LIFESTORMING"]},
        {n:2,name:"KNOW YOUR ENVIRONMENT",color:"#4a90d9",pregunta:"¿Dónde estoy parado realmente?",
         bloques:[
           {label:"SOCIETY",txt:"How do things WORK? What SYSTEMS am I in? How can I INTERACT with them? What have others done that got the RESULTS I want?"},
           {label:"CULTURE",txt:"What do people around me BELIEVE? What do they LIKE and DISLIKE? How do they PERCEIVE behaviors, actions, appearances, and morals?"},
           {label:"NAVIGATION",txt:"WHERE can I get what I want? HOW would I get what I want? WHY would other people want to give it to me / let me have it? WHERE ELSE can I go?"},
           {label:"ELEMENTS",txt:"People, groups, organizations, laws, trends, customs, economy, industries, resources..."},
         ],tags:[]},
        {n:3,name:"ADJUST YOUR MENTALITY",color:"#e8c84a",pregunta:"¿Mi mente sirve a mis deseos o los sabotea?",
         intro:"Most of the work of self-maximizing is done by using your mind to work on your mind.",
         pasos:["Evaluate your life (situation)","Observe your thoughts","Change how/what you think"],
         bloques:[
           {label:"EGO / IDENTITY",q:"WHO am I? WHAT KIND of person am I? WHAT ROLES do I play? WHERE am I FROM?",txt:"Memories, stories, history, origin, belonging, feelings, preferences, types, tendencies, shadow..."},
           {label:"BELIEFS",q:"HOW does life work? WHAT is RIGHT and WRONG? WHAT SHOULD we do? WHAT do things MEAN?",txt:"Theories, models, philosophy, explanations, morals, values, codes, traditions, customs, procedures..."},
           {label:"KNOWLEDGE",q:"WHAT do I KNOW? HOW do I know it's TRUE? Does it WORK? Is it ENOUGH? Am I SURE?",txt:"Information, facts, data, skills, abilities, education, training, maps, processes, rules, principles..."},
         ],tags:["THOUGHT REPLACEMENT","ASSOCIATION TRIANGLE","RESEARCH"]},
        {n:4,name:"TAILOR YOUR APPEARANCE",color:"#2e9e6b",pregunta:"¿Cómo me ven los demás cuando me ven?",
         bloques:[
           {label:"QUESTIONS",txt:"WHAT do I LOOK and SOUND like to others?\nHOW do people THINK and FEEL about me?\nHOW does this affect how they REACT to me?\nWHO do people THINK I AM when they SEE me?"},
           {label:"ELEMENTS",txt:"Fitness, fashion, style, grooming, hygiene, habits, mannerisms, choices, surroundings, symbols..."},
         ],tags:["ZONES"]},
        {n:5,name:"CHOOSE YOUR BEHAVIORS",color:"#3a8c8c",pregunta:"¿Qué acciones estoy eligiendo realmente?",
         bloques:[
           {label:"QUESTIONS",txt:"WHICH ACTIONS am I choosing to take?\nWHAT POWER do I have to MAKE CHANGES?\nWHAT are ALL of my possible OPTIONS?\nWhat is LIKELY to happen when I act?"},
           {label:"ELEMENTS",txt:"Choices, lifestyle, communication, personality, habits, cooperation, reactions, expressions, strategies..."},
         ],tags:["ZONES"]},
        {n:6,name:"ASSESS YOUR SITUATION",color:"#9c6dd8",pregunta:"¿Qué me están diciendo los resultados?",
         bloques:[
           {label:"QUESTIONS",txt:"HOW is my environment REACTING to my choices?\nWHAT are the RESULTS of what I attempted to do?\nWHO or WHERE are those results coming from? WHY?\nWHAT is my POSITION in the systems around me?\nHOW SUCCESSFUL were my choices and behaviors?\nDo I ACCEPT or REJECT the results?"},
           {label:"ELEMENTS",txt:"Success/failure, job, career, opportunity, income, wealth, schedule, habits, hobbies, relationships, family, friends, communities, encounters, living situation, responsibilities, trajectory, reputation, social status..."},
         ],tags:[]},
        {n:7,name:"FEEDBACK",color:"#5e3a8c",pregunta:"¿Qué sé ahora que no sabía antes?",
         bloques:[
           {label:"",txt:"WHAT do I KNOW NOW that I did not know before I got results?"},
         ],tags:[]},
      ].map(z=>(
        <div key={z.n} style={{
          background:"rgba(10,6,22,0.88)",
          borderLeft:`5px solid ${z.color}`,
          borderRadius:"0 6px 6px 0",
          padding:"22px 22px 22px 24px",
          marginBottom:18,
        }}>
          <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:8,flexWrap:"wrap"}}>
            <div style={{fontSize:36,fontWeight:300,color:z.color,lineHeight:1,fontFamily:F}}>{z.n}</div>
            <div style={{fontSize:13,letterSpacing:2.5,color:"#e8d5a3"}}>{z.name}</div>
          </div>
          <div style={{fontSize:12,fontStyle:"italic",color:z.color,marginBottom:18,letterSpacing:0.3,opacity:0.92}}>
            "{z.pregunta}"
          </div>

          {z.intro && (
            <div style={{fontSize:10.5,color:"#d4c48a",lineHeight:1.6,marginBottom:12,fontStyle:"italic",padding:"10px 14px",background:`${z.color}10`,borderLeft:`2px solid ${z.color}55`,borderRadius:"0 3px 3px 0"}}>
              {z.intro}
            </div>
          )}
          {z.pasos && (
            <ol style={{margin:"0 0 16px",padding:"0 0 0 22px",display:"flex",flexDirection:"column",gap:4}}>
              {z.pasos.map((p,i)=>(
                <li key={i} style={{fontSize:10,color:"#c8b88a",lineHeight:1.6}}>{p}</li>
              ))}
            </ol>
          )}

          {z.bloques.map((b,i)=>(
            <div key={i} style={{marginBottom:14}}>
              {b.label && (
                <div style={{fontSize:8.5,letterSpacing:1.8,color:z.color,marginBottom:6,fontWeight:600}}>{b.label}</div>
              )}
              {b.q && (
                <div style={{fontSize:10.5,color:"#e8d5a3",lineHeight:1.55,marginBottom:5,fontStyle:"italic"}}>{b.q}</div>
              )}
              <div style={{fontSize:10,color:"#c8b88a",lineHeight:1.65,whiteSpace:"pre-line"}}>{b.txt}</div>
            </div>
          ))}

          {z.tags.length>0 && (
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:14,paddingTop:12,borderTop:`1px solid ${z.color}22`}}>
              {z.tags.map(tag=>(
                <span key={tag} style={{
                  fontSize:8,letterSpacing:1.5,padding:"3px 9px",
                  border:`1px solid ${z.color}55`,borderRadius:3,
                  color:z.color,background:`${z.color}10`,fontFamily:F,
                }}>[{tag}]</span>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{textAlign:"center",margin:"28px auto 12px",maxWidth:560,fontSize:11,fontStyle:"italic",color:"rgba(232,213,163,0.65)",lineHeight:1.75,fontFamily:F}}>
        El ciclo es continuo.<br/>
        Identificas → Conoces → Ajustas → Apareces → Actúas → Evalúas → Aprendes<br/>
        <span style={{color:"#d4af37",letterSpacing:1}}>→ Vuelves a Identificar.</span>
      </div>

    </>)}
    {/* ═════════ END TAB: DIAGNÓSTICO ═════════ */}

    {/* ═══════════════════════════════════════════════════════════════
        TAB: NIVELES — Spiral Dynamics + Developmental + AQAL
        ═══════════════════════════════════════════════════════════════ */}
    {activeTab==="niveles" && (<>

      <div style={{textAlign:"center",margin:"8px auto 26px",maxWidth:680}}>
        <div style={{fontSize:14,letterSpacing:5,color:"#d4af37"}}>NIVELES</div>
        <div style={{fontSize:11,fontStyle:"italic",color:"rgba(232,213,163,0.70)",marginTop:14,lineHeight:1.6,padding:"0 16px"}}>
          Mapa del desarrollo de consciencia.<br/>
          Ubícate aquí cuando necesites perspectiva.
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:18,marginTop:16,flexWrap:"wrap",fontSize:8,letterSpacing:1.5,color:"rgba(212,175,55,0.55)"}}>
          <span>Spiral Dynamics</span>
          <span>·</span>
          <span>Loevinger / Cook-Greuter</span>
          <span>·</span>
          <span>AQAL · Ken Wilber</span>
        </div>
        <div style={{margin:"18px auto 0",height:1,width:80,background:"rgba(212,175,55,0.35)"}}/>
      </div>

      {[
        {n:9,name:"COMPLETE",color:"#c850c8",sd:"Unitive",sdTier:"3rd Tier",dev:"Ironist — Unitive",
         stable:"<.4%",total:"<0.01%",
         social:"Not yet formed (2023)",
         focus:"Observe, understand, protect, honor, and allow all beings and phenomena.",
         mentality:"Observation without perspective.",
         goal:"Transform and develop processes in self and world.",
         methods:"Identify pathology or insufficiency and provide the missing pieces if possible.",
         pathologies:"—",
         devDesc:"Intersystemic evolution rules over deep psychological processes. Focus on the process of interaction causing transformation. Identifies as witness of awareness of various conscious processes. Non-exclusively aware of multiple parts of ego (identifications at various levels of awareness). Capable of conscious action or non-action towards an intended result without attachment to actual outcome. Capable of compassion for the process of development itself. 'Aperspectival' / 6th-person perspective creates perception of potential selves-as-not-self, or how the self would be different with a different history or a different perception of history.",
         inside:`In an unpredictable world, everything we do is only a gesture or a wish, especially over long stretches of time. Sometimes we're good at what we do, and our wishes come true — or so we think. For now. Sometimes not so much. Sometimes, we don't even know. There is not always such a thing as 'is' or 'is not', 'will' or 'will not'. There is only 'seems to me...' or not. Or both. Or neither. The only certain thing is the watcher in us watching and the wisher in us wishing. We are not what we do or what we make, we are the watchers of the doing and of the becoming. I am not the main character, I am just the spotlight. What is revealed is what I illuminate. If we want a better world and a better life, we have to learn where and how to shine the light.`},
        {n:8,name:"SANCTIFY",color:"#4ac8c8",sd:"Holistic — Turquoise",sdTier:"2nd Tier",dev:"Magician — Construct-Aware",
         stable:"<1%",total:"<0.1%",
         social:"Collective individualism. Beginning late 1900s.",
         focus:"Draw understanding to be empowered from an ecology of perspectives.",
         mentality:"Trans-rational. Accept experience without need to respond.",
         goal:"Peace in a world without answers.",
         methods:"Observe and allow being, and protect boundaries.",
         pathologies:"Spiritual/soul pathology.",
         devDesc:"Deep psychological processes rule over universal principles. Identifies as the story that the self tells itself about itself using its experiences as words or chapters. Aware of how intentions attempt to manifest themselves through this self-as-history. Able to consciously witness interplay of awarenesses in one self, including thought, emotion, sensation, impulse, memory, desire, etc. Focus on responsibility for own awareness and on transformation of self and of system-as-participation-in-system. Sees multiple histories interacting within and outside of self as elements of globally unfolding reality.",
         inside:`The world is too complex to control. Life is not a game, it's a show. You can't know for sure what will happen before you act, you can only learn and try. You can intend to do anything you want, and you can be as careful as you want, but to some degree, you have to accept what happens and see how you feel about it later. Life is an experiment. We're all figuring things out as we go. We should all have safe places to try new things, share what we learned, and do it again if it was good. All we can do is the best that we know, so we should all know more.`},
        {n:7,name:"HARMONIZE",color:"#e8e04a",sd:"Integral — Yellow",sdTier:"2nd Tier",dev:"Strategist — Autonomous",
         stable:"5%",total:"<1%",
         social:"World-centered social web. Beginning mid-1900s.",
         focus:"Live out the maximum possible expression of yourself.",
         mentality:"Put everything in its right place.",
         goal:"Balance and synergize all things, inside and out.",
         methods:"Awaken capacities in self and others. Include everything as it most benefits everything else.",
         pathologies:"Incomplete self-actualization, existential angst, bad faith.",
         devDesc:"Higher, more universal principles now rule over unique subjective reality. Application of those principles now rules over radical relativism. Aware of how systems are interrelated, interdependent, and synergistic (or clashing). 4th-person perspective expanded through time creates awareness of self as history of experience. Identifies as sum of context-dependent selves integrated into a single, coherent self-history, or as culmination of development.",
         inside:`It would be nice if everyone could do what they wanted, but life isn't that simple. Who I am and what I want changes so often — I can't imagine one set of rules or one version of the truth that works for everyone. People are complex, and life is constantly changing. We can't just let go and hope for the best. We need to base our choices on what we know about ourselves from our past and build a world that's ready for what we're pretty sure is going to happen, even if that means making judgments and imposing restrictions. I might feel bad to say 'no' to people, but sometimes, it's for the best.`},
        {n:6,name:"UNDERSTAND",color:"#6dc870",sd:"Sensitive — Green",sdTier:"1st Tier",dev:"Individualist — Pluralist",
         stable:"15%",total:"3%",
         social:"Social democracies. Beginning 1800s.",
         focus:"Inner peace, expansion of care for others, human rights.",
         mentality:"Radical inclusiveness.",
         goal:"Consensus, communication, mutually beneficial relations.",
         methods:"Include diverse views, listen to the powerless, emphasize group needs, eliminate marginalization.",
         pathologies:"Inauthenticity, lack of discernment, consensus seeking, narcissistic behavior.",
         devDesc:"Radical relativism rules over single-system view. Awareness of multiple valid perspectives creates overlapping, competing systems. Identifies as unique individual with many selves that appear in different contexts. 4th-person perspective causes discovery of unique, personal, subjective reality not observable to others.",
         inside:`Everyone's unique, and we should all be allowed to be who we are. Society's rules often hold people back from what they really want, and we shouldn't all just do our own thing instead. How can one person ever tell someone else what to do? You're not them, so that's not fair. You can't judge someone if you didn't live their life. I don't even have rules for myself! I'm a different person over here than I am over there. Maybe if we all stopped trying to tell each other what to do, we could have world peace.`},
        {n:5,name:"ACHIEVE",color:"#e8a04a",sd:"Achiever — Orange",sdTier:"1st Tier",dev:"Achiever — Conscientious",
         stable:"28%",total:"10%",
         social:"Capitalist democracies, market-driven meritocracies. Beginning 1600s.",
         focus:"Life is a game, play to win.",
         mentality:"Scientific, rational reasoning. Logic, measurement, proof.",
         goal:"Material wealth and pleasures, defense of civilization, improvement and growth.",
         methods:"Set measurable goals and achieve them. Success comes from producing a tangible effect.",
         pathologies:"Identity crisis, consumerism, environmental crisis, work addiction, hyperfixation on goals, denial of spirit.",
         devDesc:"Whole-system effectiveness rules over functional reasoning. Formal operational logic and objective observation. 3rd-person perspective now expanded through linear time. Focus on scientific method, measurable reality, laws, control, results, and goals. Identifies with ideology. 'I chose/discovered my own beliefs'.",
         inside:`When you think about it, what's 'good' and 'bad' is different for different people, and for different groups of people too. What's good for me might not be good for you, and what works in my country might not work in yours. Before we make any big decisions, we should look at the facts so we know how to get the outcome we want. After all, everyone really wants what's best for them and their own, not to be forced into a life of service to your boss or to some 'God'. Life is about knowing how to make good things happen, keeping the benefits, and always improving.`},
        {n:4,name:"BELONG",color:"#4a90d9",sd:"Rules & Roles — Blue",sdTier:"1st Tier",dev:"Diplomat — Conformist",
         stable:"40%",total:"25%",
         social:"Late mythic empires, nation-states, religious orders. 5,000 years old.",
         focus:"Purpose, direction, and ultimate meaning.",
         mentality:"Do what is right to get what is good.",
         goal:"Find or earn the final and ultimate peace. Win the battle of good vs. evil.",
         methods:"Follow the rules. Don't step out of line. Control of self and others through faith and discipline.",
         pathologies:"Over-identification with roles, fundamentalism, fascism, script pathology.",
         devDesc:"Social norms rule over personal needs. Concrete operational logic. Focus on acceptable behavior, being seen favorably. Self-protection sought through approval, by conforming to expectations.",
         inside:`We all have our own lives to deal with, and our own problems. That can make us pretty selfish, and sometimes we don't agree on what's right. If we don't stick to the rules and do what we know is good, life is chaos. It's every man for himself. Life is about knowing what's good and what's bad, what's right and what's wrong, doing the right thing for the common good, and making sure others do the right thing, too.`},
        {n:3,name:"CONTROL",color:"#c04848",sd:"Impulsive — Red",sdTier:"1st Tier",dev:"Opportunist — Self-Protective",
         stable:"92%",total:"70%",
         social:"Mythic, feudal, and exploitative empires. 10,000 years old.",
         focus:"Do what you want, take what you want, and get your way no matter what.",
         mentality:"Climb the ranks of power.",
         goal:"Obtain power and glory. Be worshiped as a hero.",
         methods:"Align yourself with the powers that be when you must. Take by brute force when you can.",
         pathologies:"Anxiety, depression, phobia, guilt, terroristic vengeance.",
         devDesc:"Focus on enduring needs, which now rule over immediate impulses. Impulses can now be suppressed in the interest of a self that lasts longer than this moment. Ego-centric, self-interested, self-protective. Might makes right. Others are seen mainly as a means to an end, not as individuals with their own self-interest.",
         inside:`I live in a world full of different people, each with their own agenda. They all want what they want, and they're looking out for themselves, because they have to. That's what life is — it's about getting your way. Everyone has to work with (or around) the needs and feelings of others — or at least what they think others are feeling — to get what they want, and I need to win that game. I can get what I want by taking or creating advantages for myself, and I better do it because no one will do it for me.`},
        {n:2,name:"CONNECT",color:"#9c6dd8",sd:"Magic/Animistic — Purple",sdTier:"1st Tier",dev:"Impulsive (Pre-Egoic)",
         stable:"99.6%",total:"90%",
         social:"Tribal order. 50,000 years old.",
         focus:"Keep your group safe and happy, and please the Gods.",
         mentality:"Magical thinking.",
         goal:"Safety, security, maintaining functional habits and beneficial practices.",
         methods:"Keep tribal traditions, and petition the Gods for favors through rituals.",
         pathologies:"Borderline, narcissism, delusions of omnipotence, tribal/family dysfunction.",
         devDesc:"Impulses rule reflexes. Focus on avoiding pain and danger, seeking pleasure, safety, and release.",
         inside:`I know that other people and animals also have senses and desires and feelings. I perceive feelings much like my own feelings coming from other sources around me. Sometimes, I make the mistake of experiencing a feeling in myself, but perceiving that it's coming from someone or something else, like a person, an animal, or even a tree or an unseen 'spirit'. I can now respond to the feelings I see in others, and to them I feel. Life is about pleasing others (or the gods) so that they do what we want.`},
        {n:1,name:"SURVIVE",color:"#e8d5a3",sd:"Instinctive — Beige",sdTier:"1st Tier",dev:"Reflexive (Pre-Egoic)",
         stable:"100%",total:"99.9%",
         social:"Small survival bands. 100,000 years ago.",
         focus:"Do what you must in order to survive.",
         mentality:"Impulsive, reactive. Living in the moment.",
         goal:"Acquire physiological necessities. Food, water, shelter, etc.",
         methods:"Acquire what is needed in whatever way is easiest, including scavenging.",
         pathologies:"Primitive developmental psychopathology, autism.",
         devDesc:"Simple, moment-to-moment awareness of own sensations and drives.",
         inside:`I see, feel, smell, and hear through my senses. I feel reactions to these senses, like fear, hunger, curiosity, or sexual arousal. I want to get things that I like for myself, and I want to get away from things that I don't like. I get hungry, tired, warm, or cold, and I feel motivated to get what I need to stop those feelings. Life is about dealing with my needs and feeling good by getting what I want.`},
      ].map(lv=>{
        const isOpen=expandedNivel===lv.n;
        return (
          <div key={lv.n} style={{
            background:"rgba(10,6,22,0.88)",
            border:`1px solid ${lv.color}${isOpen?"66":"30"}`,
            borderRadius:6,marginBottom:12,overflow:"hidden",transition:"border .25s",
          }}>
            <button onClick={()=>setExpandedNivel(isOpen?null:lv.n)} style={{
              width:"100%",padding:"16px 18px",cursor:"pointer",textAlign:"left",
              background:isOpen?`${lv.color}10`:"transparent",
              border:"none",fontFamily:F,color:"#e8d5a3",transition:"background .25s",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{fontSize:34,fontWeight:300,color:lv.color,lineHeight:1,minWidth:32,fontFamily:F}}>{lv.n}</div>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{fontSize:13,letterSpacing:3,color:"#e8d5a3",marginBottom:3}}>{lv.name}</div>
                  <div style={{fontSize:9.5,color:lv.color,letterSpacing:0.5,opacity:0.85}}>
                    {lv.sd} <span style={{color:"rgba(232,213,163,0.40)",margin:"0 6px"}}>·</span> {lv.dev}
                  </div>
                </div>
                <div style={{display:"flex",gap:14,fontSize:9,color:"rgba(232,213,163,0.65)",fontFamily:F}}>
                  <div><span style={{color:"rgba(232,213,163,0.40)"}}>STABLE</span> {lv.stable}</div>
                  <div><span style={{color:"rgba(232,213,163,0.40)"}}>CONSCIOUS</span> {lv.total}</div>
                </div>
                <div style={{fontSize:18,color:`${lv.color}aa`,marginLeft:6}}>{isOpen?"−":"+"}</div>
              </div>
            </button>

            {isOpen && (
              <div style={{padding:"6px 22px 24px",borderTop:`1px solid ${lv.color}22`}}>

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginTop:14,marginBottom:18}}>
                  {[
                    ["SOCIAL STRUCTURE",lv.social],
                    ["FOCUS",lv.focus],
                    ["MENTALITY",lv.mentality],
                    ["GOAL",lv.goal],
                    ["METHODS",lv.methods],
                    ["PATHOLOGIES",lv.pathologies],
                  ].map(([k,v])=>(
                    <div key={k} style={{paddingLeft:10,borderLeft:`1.5px solid ${lv.color}40`}}>
                      <div style={{fontSize:7.5,letterSpacing:1.8,color:lv.color,marginBottom:4,fontWeight:600}}>{k}</div>
                      <div style={{fontSize:10,color:"#c8b88a",lineHeight:1.5}}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{marginBottom:18,padding:"12px 14px",background:`${lv.color}08`,border:`1px solid ${lv.color}22`,borderRadius:4}}>
                  <div style={{fontSize:8,letterSpacing:1.8,color:lv.color,marginBottom:6,opacity:0.85}}>DEVELOPMENTAL LEVEL</div>
                  <div style={{fontSize:10,color:"#c8b88a",lineHeight:1.6}}>{lv.devDesc}</div>
                </div>

                <div style={{padding:"14px 16px",background:"rgba(0,0,0,0.35)",borderLeft:`3px solid ${lv.color}`,borderRadius:"0 4px 4px 0"}}>
                  <div style={{fontSize:8,letterSpacing:1.8,color:lv.color,marginBottom:8,opacity:0.85}}>HOW THIS LEVEL FEELS FROM THE INSIDE</div>
                  <div style={{fontSize:10.5,color:"#e8d5a3",lineHeight:1.75,fontStyle:"italic"}}>{lv.inside}</div>
                </div>

              </div>
            )}
          </div>
        );
      })}

      {/* ── SECCIÓN BONUS AQAL ── */}
      <div style={{marginTop:28,background:"rgba(10,6,22,0.88)",border:"1px solid rgba(212,175,55,0.30)",borderRadius:6,overflow:"hidden"}}>
        <button onClick={()=>setAqalOpen(o=>!o)} style={{
          width:"100%",padding:"18px 20px",cursor:"pointer",textAlign:"left",
          background:aqalOpen?"rgba(212,175,55,0.06)":"transparent",
          border:"none",fontFamily:F,color:"#e8d5a3",transition:"background .25s",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{flex:1}}>
              <div style={{fontSize:8,letterSpacing:2.5,color:"#d4af37",marginBottom:4}}>BONUS</div>
              <div style={{fontSize:13,letterSpacing:3,color:"#e8d5a3"}}>AQAL</div>
              <div style={{fontSize:9.5,color:"rgba(212,175,55,0.65)",marginTop:3,fontStyle:"italic"}}>Ken Wilber · Mapa integral de la realidad</div>
            </div>
            <div style={{fontSize:18,color:"rgba(212,175,55,0.75)"}}>{aqalOpen?"−":"+"}</div>
          </div>
        </button>

        {aqalOpen && (
          <div style={{padding:"4px 22px 24px",borderTop:"1px solid rgba(212,175,55,0.22)"}}>

            <div style={{margin:"16px 0",fontSize:10.5,color:"#c8b88a",lineHeight:1.7,fontStyle:"italic"}}>
              "All-Quadrant, All-Level" — mapa de la realidad como es percibida a través de la consciencia humana. Cinco elementos contienen todas las descripciones posibles y percepciones de cualquier fenómeno que pueda decirse que existe.
            </div>

            {/* 4 CUADRANTES */}
            <div style={{margin:"22px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,fontFamily:F}}>
              {[
                {q:"UPPER LEFT",label:"INTERIOR INDIVIDUAL",ej:"Mind · Pensamientos, emociones, estados de consciencia",color:"#9c6dd8"},
                {q:"UPPER RIGHT",label:"EXTERIOR INDIVIDUAL",ej:"Object · Cuerpo, conductas observables, biología",color:"#4a90d9"},
                {q:"LOWER LEFT",label:"INTERIOR COLECTIVO",ej:"Culture · Significados compartidos, valores, mitos",color:"#e8a04a"},
                {q:"LOWER RIGHT",label:"EXTERIOR COLECTIVO",ej:"System · Estructuras, instituciones, ecosistemas",color:"#2e9e6b"},
              ].map(c=>(
                <div key={c.q} style={{
                  padding:"12px 13px",background:"rgba(0,0,0,0.35)",
                  border:`1px solid ${c.color}40`,borderRadius:4,
                }}>
                  <div style={{fontSize:7.5,letterSpacing:1.5,color:c.color,marginBottom:4,opacity:0.85}}>{c.q}</div>
                  <div style={{fontSize:10.5,letterSpacing:1.5,color:"#e8d5a3",marginBottom:6}}>{c.label}</div>
                  <div style={{fontSize:9,color:"#c8b88a",lineHeight:1.5}}>{c.ej}</div>
                </div>
              ))}
            </div>

            {/* 5 DIMENSIONES */}
            <div style={{marginTop:22,padding:"14px 16px",background:"rgba(212,175,55,0.06)",border:"1px solid rgba(212,175,55,0.25)",borderRadius:4}}>
              <div style={{fontSize:8,letterSpacing:2,color:"#d4af37",marginBottom:10}}>LAS 5 DIMENSIONES DEL MAPA INTEGRAL</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:14,fontSize:10,color:"#c8b88a"}}>
                <span><span style={{color:"#e8d5a3",letterSpacing:1.2}}>ESTADOS</span> · estados temporales (sueño, meditación, embriaguez)</span>
                <span><span style={{color:"#e8d5a3",letterSpacing:1.2}}>LÍNEAS</span> · capacidades de desarrollo (cognitiva, emocional, moral)</span>
                <span><span style={{color:"#e8d5a3",letterSpacing:1.2}}>TIPOS</span> · variaciones de forma (masculino/femenino, eneagrama)</span>
                <span><span style={{color:"#e8d5a3",letterSpacing:1.2}}>NIVELES</span> · estados estabilizados de complejidad</span>
                <span><span style={{color:"#e8d5a3",letterSpacing:1.2}}>CUADRANTES</span> · perspectivas desde las que se ve cualquier fenómeno</span>
              </div>
            </div>

          </div>
        )}
      </div>

    </>)}
    {/* ═════════ END TAB: NIVELES ═════════ */}

    {/* ═══════════════════════════════════════════════════════════════
        TAB: FRECUENCIAS — Escala de Hawkins (Power vs Force)
        ═══════════════════════════════════════════════════════════════ */}
    {activeTab==="freq" && (<>

      <div style={{textAlign:"center",margin:"8px auto 26px",maxWidth:680}}>
        <div style={{fontSize:14,letterSpacing:5,color:"#d4af37"}}>FRECUENCIAS</div>
        <div style={{fontSize:11,fontStyle:"italic",color:"rgba(232,213,163,0.70)",marginTop:14,lineHeight:1.6,padding:"0 16px"}}>
          Escala de Hawkins.<br/>
          La frecuencia desde la que operas determina la realidad que percibes.
        </div>
        <div style={{fontSize:8,letterSpacing:2,color:"rgba(212,175,55,0.55)",marginTop:14}}>DAVID R. HAWKINS · POWER VS FORCE</div>
        <div style={{margin:"18px auto 0",height:1,width:80,background:"rgba(212,175,55,0.35)"}}/>
      </div>

      <div className="hawk-wrap">
        <table className="hawk-table">
          <thead>
            <tr>
              <th>Nivel</th>
              <th>Nombre</th>
              <th>Emoción</th>
              <th>Visión de Dios</th>
              <th>Visión de Vida</th>
              <th>Proceso</th>
            </tr>
          </thead>
          <tbody>
            {[
              {hz:"700-1000",name:"Iluminación",emo:"Inefable",god:"Ser / Self",life:"Es",proc:"Pura Consciencia",color:"#e8c84a",zone:"power"},
              {hz:"600",name:"Paz",emo:"Dicha",god:"Omnisciente",life:"Perfecta",proc:"Iluminación",color:"#d4af37",zone:"power"},
              {hz:"540",name:"Alegría",emo:"Serenidad",god:"Uno",life:"Completa",proc:"Transfiguración",color:"#e8a04a",zone:"power"},
              {hz:"500",name:"Amor",emo:"Reverencia",god:"Amoroso",life:"Benigna",proc:"Revelación",color:"#c870a0",zone:"power"},
              {hz:"400",name:"Razón",emo:"Comprensión",god:"Sabio",life:"Significativa",proc:"Abstracción",color:"#9c6dd8",zone:"power"},
              {hz:"350",name:"Aceptación",emo:"Perdón",god:"Misericordioso",life:"Armoniosa",proc:"Trascendencia",color:"#6dc870",zone:"power"},
              {hz:"310",name:"Buena Voluntad",emo:"Optimismo",god:"Inspirador",life:"Esperanzadora",proc:"Intención",color:"#4ac8c8",zone:"power"},
              {hz:"250",name:"Neutralidad",emo:"Confianza",god:"Habilitador",life:"Satisfactoria",proc:"Liberación",color:"#4a90d9",zone:"power"},
              {hz:"200",name:"Coraje",emo:"Afirmación",god:"Permisivo",life:"Factible",proc:"Empoderamiento",color:"#d4af37",zone:"threshold"},
              {hz:"175",name:"Orgullo",emo:"Desprecio",god:"Indiferente",life:"Exigente",proc:"Inflación",color:"#a89070",zone:"force"},
              {hz:"150",name:"Ira",emo:"Odio",god:"Vengativo",life:"Antagónica",proc:"Agresión",color:"#a07060",zone:"force"},
              {hz:"125",name:"Deseo",emo:"Anhelo",god:"Negador",life:"Decepcionante",proc:"Esclavitud",color:"#8c6858",zone:"force"},
              {hz:"100",name:"Miedo",emo:"Ansiedad",god:"Punitivo",life:"Aterradora",proc:"Retiro",color:"#7a5848",zone:"force"},
              {hz:"75",name:"Pena",emo:"Arrepentimiento",god:"Desdeñoso",life:"Trágica",proc:"Desánimo",color:"#684838",zone:"force"},
              {hz:"50",name:"Apatía",emo:"Desesperación",god:"Condenatorio",life:"Sin esperanza",proc:"Abdicación",color:"#583828",zone:"force"},
              {hz:"30",name:"Culpa",emo:"Reproche",god:"Vengador",life:"Maligna",proc:"Destrucción",color:"#482818",zone:"force"},
              {hz:"20",name:"Vergüenza",emo:"Humillación",god:"Despreciativo",life:"Miserable",proc:"Eliminación",color:"#382010",zone:"force"},
            ].map((r,i)=>(
              <tr key={i} className={r.zone==="threshold"?"threshold":""}>
                <td style={{color:r.color,fontWeight:600,letterSpacing:0.5,whiteSpace:"nowrap"}}>{r.hz}</td>
                <td style={{color:"#e8d5a3",letterSpacing:0.8,minWidth:100}}>{r.name}</td>
                <td>{r.emo}</td>
                <td>{r.god}</td>
                <td>{r.life}</td>
                <td>{r.proc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{margin:"22px auto 12px",maxWidth:540,textAlign:"center",fontSize:11,color:"#e8d5a3",fontFamily:F,lineHeight:1.8}}>
        <div style={{marginBottom:6}}>
          <span style={{color:"#d4af37",letterSpacing:1,fontStyle:"italic"}}>Operar arriba de 200 = Poder.</span>
        </div>
        <div style={{marginBottom:18}}>
          <span style={{color:"rgba(168,144,112,0.85)",letterSpacing:1,fontStyle:"italic"}}>Operar abajo de 200 = Fuerza.</span>
        </div>
        <div style={{fontSize:10,fontStyle:"italic",color:"rgba(232,213,163,0.55)",paddingTop:14,borderTop:"1px solid rgba(212,175,55,0.18)"}}>
          La gran mayoría de la humanidad opera abajo de 200.
        </div>
      </div>

      <div style={{margin:"28px auto 12px",maxWidth:620,padding:"14px 18px",background:"rgba(10,6,22,0.65)",border:"1px solid rgba(212,175,55,0.15)",borderRadius:5,fontSize:9.5,color:"rgba(232,213,163,0.65)",lineHeight:1.7,fontStyle:"italic"}}>
        <span style={{color:"#d4af37",letterSpacing:1.5,fontStyle:"normal"}}>NOTA</span> · Esta escala es la versión canónica documentada por David R. Hawkins en <em>Power vs Force</em> (1995). Cada nivel calibra el campo energético desde el que operas. No es jerarquía moral — es mapa de a qué realidad tienes acceso desde dónde estás parado en este momento.
      </div>

      {/* ── Botón hoja completa ── */}
      <div style={{display:"flex",justifyContent:"center",margin:"48px auto 24px"}}>
        <a
          href="https://docs.google.com/spreadsheets/d/1ua_qmzr6h1cBCZ2MJxUsFLR9Odl9uzVcxpDpoqwTOdE/edit?gid=0#gid=0"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:"inline-block",
            padding:"14px 28px",
            background:"#d4af37",
            color:"#1a1018",
            fontFamily:F,
            fontSize:14,
            letterSpacing:"0.1em",
            fontWeight:600,
            textDecoration:"none",
            borderRadius:8,
            boxShadow:"0 2px 12px rgba(212,175,55,0.25)",
            transition:"opacity .25s, transform .15s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="translateY(-1px)";}}
          onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}
        >
          ABRIR HOJA COMPLETA →
        </a>
      </div>

    </>)}
    {/* ═════════ END TAB: FRECUENCIAS ═════════ */}

  </div>
  </div>
  );
}
