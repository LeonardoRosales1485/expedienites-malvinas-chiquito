// Mock data — SIDI · Sistema Integral de Documentación e Información
// Municipalidad de Malvinas Argentinas

window.AREAS = [
  { id: "mesa",   nombre: "Mesa de Entrada Virtual",          abr: "ME" },
  { id: "tec",    nombre: "Área Técnica",                     abr: "AT" },
  { id: "ppto",   nombre: "Dirección de Presupuesto",         abr: "DP" },
  { id: "cont",   nombre: "Contaduría Municipal",             abr: "CM" },
  { id: "hac",    nombre: "Sec. Economía y Hacienda",         abr: "EH" },
  { id: "trib",   nombre: "Subsec. Ingresos Tributarios",     abr: "IT" },
  { id: "leg",    nombre: "Dir. Asuntos Legales",             abr: "AL" },
  { id: "dict",   nombre: "Dictámenes",                        abr: "DI" },
  { id: "gob",    nombre: "Dir. General de Gobierno",         abr: "DG" },
  { id: "tes",    nombre: "Tesorería",                         abr: "TE" },
  { id: "int",    nombre: "Intendencia",                       abr: "IN" },
  { id: "viv",    nombre: "Dirección de Viviendas",           abr: "DV" },
  { id: "apr",    nombre: "Dirección de Apremios",            abr: "DA" },
  { id: "obras",  nombre: "Sec. Obras Públicas",              abr: "OP" },
  { id: "salud",  nombre: "Sec. de Salud",                     abr: "SA" },
  { id: "hcd",    nombre: "Honorable Concejo Deliberante",     abr: "HCD" },
];

// MODALIDADES — el corazón de la arquitectura flexible
window.MODALIDADES = {
  libre: {
    id: "libre",
    label: "Libre",
    color: "#5B6678",
    bg:    "#EEF1F4",
    descr: "Gestor documental abierto. El operador adjunta archivos, define destinatarios y avanza libremente.",
  },
  orientativa: {
    id: "orientativa",
    label: "Orientativa",
    color: "#2A6FDB",
    bg:    "#DEE9F9",
    descr: "El sistema sugiere el próximo paso normativo y alerta ante desvíos, pero no bloquea la decisión del operador.",
  },
  restrictiva: {
    id: "restrictiva",
    label: "Restrictiva",
    color: "#1E7A3D",
    bg:    "#DCEFE2",
    descr: "Flujo cerrado e inexpugnable. Datos obligatorios en puntos fijos y destino automatizado.",
  },
};

window.TIPOS = [
  { id: "hab",  rubro: "Habilitaciones",      nombre: "Habilitación comercial",           color: "#1E7A3D", modalidad: "restrictiva" },
  { id: "comp", rubro: "Compras",             nombre: "Compra menor / contratación",      color: "#2A6FDB", modalidad: "orientativa" },
  { id: "subs", rubro: "Subsidios",           nombre: "Subsidio / reconocimiento",        color: "#9A5BC9", modalidad: "orientativa" },
  { id: "viv",  rubro: "Vivienda",            nombre: "Regularización dominial",          color: "#C97A1F", modalidad: "orientativa" },
  { id: "apr",  rubro: "Apremios",            nombre: "Apremio / cobro judicial",         color: "#B73838", modalidad: "restrictiva" },
  { id: "conv", rubro: "Convenios",           nombre: "Convenio institucional",           color: "#5B6678", modalidad: "orientativa" },
  { id: "obra", rubro: "Obras",               nombre: "Permiso de obra",                  color: "#0F2E4C", modalidad: "orientativa" },
  { id: "gen",  rubro: "Circuito 53",         nombre: "General Genérico (sin categoría)", color: "#5B6678", modalidad: "libre" },
  { id: "hcd",  rubro: "HCD",                 nombre: "Ordenanza / Comunicación HCD",     color: "#2E8B57", modalidad: "libre" },
];

// CATÁLOGO COMPLETO de trámites — se muestra en el wizard de alta con buscador + filtros.
// Cada entrada tiene su propia modalidad (algunos del mismo rubro difieren) y mapea a un "base"
// de window.TIPOS para mantener compatibilidad con el resto del sistema (documentos, listado, etc.).
window.TIPOS_CATALOGO = [
  // Compras y contrataciones
  { id:"comp-actos",       nombre:"Actos preparatorios a la solicitud de pedido", rubro:"Compras y contrataciones", modalidad:"orientativa", base:"comp" },
  { id:"comp-orden",       nombre:"Generación de una orden de compra",            rubro:"Compras y contrataciones", modalidad:"restrictiva", base:"comp" },
  { id:"comp-directa",     nombre:"Compra directa excepcional",                   rubro:"Compras y contrataciones", modalidad:"orientativa", base:"comp" },
  { id:"comp-concurso",    nombre:"Concurso de precios",                          rubro:"Compras y contrataciones", modalidad:"orientativa", base:"comp" },
  { id:"comp-lic-priv",    nombre:"Licitación privada",                           rubro:"Compras y contrataciones", modalidad:"restrictiva", base:"comp" },
  { id:"comp-lic-pub",     nombre:"Licitación pública",                           rubro:"Compras y contrataciones", modalidad:"restrictiva", base:"comp" },
  { id:"comp-convalida",   nombre:"Convalidación de convenio firmado",            rubro:"Compras y contrataciones", modalidad:"orientativa", base:"comp" },

  // Subsidios
  { id:"subs-promunif",    nombre:"Subsidios PROMUNIF",                           rubro:"Subsidios", modalidad:"orientativa", base:"subs" },
  { id:"subs-escolares",   nombre:"Subsidios escolares",                          rubro:"Subsidios", modalidad:"orientativa", base:"subs" },
  { id:"subs-propios",     nombre:"Subsidios con fondos propios",                 rubro:"Subsidios", modalidad:"orientativa", base:"subs" },

  // Convenios urbanísticos
  { id:"conv-gestion",     nombre:"Gestión de convenio urbanístico",              rubro:"Convenios urbanísticos", modalidad:"orientativa", base:"conv" },
  { id:"conv-urbanistico", nombre:"Convenio urbanístico",                          rubro:"Convenios urbanísticos", modalidad:"restrictiva", base:"conv" },

  // Habilitaciones y comercio
  { id:"hab-comercio",     nombre:"Habilitación de comercio",                     rubro:"Habilitaciones y comercio", modalidad:"restrictiva", base:"hab" },
  { id:"hab-defensa",      nombre:"Defensa al consumidor",                         rubro:"Habilitaciones y comercio", modalidad:"orientativa", base:"hab" },
  { id:"hab-caducidad",    nombre:"Caducidad del trámite de habilitación",       rubro:"Habilitaciones y comercio", modalidad:"restrictiva", base:"hab" },

  // Tránsito y seguridad vial
  { id:"vial-estrellas",   nombre:"Instalación de estrellas amarillas",          rubro:"Tránsito y seguridad vial", modalidad:"libre",        base:"obra" },
  { id:"vial-reductores",  nombre:"Instalación de reductores de velocidad",      rubro:"Tránsito y seguridad vial", modalidad:"orientativa", base:"obra" },
  { id:"vial-remocion",    nombre:"Remoción de retardadores no autorizados",     rubro:"Tránsito y seguridad vial", modalidad:"restrictiva", base:"obra" },

  // Espacio público
  { id:"esp-adoquines",    nombre:"Venta de adoquines premoldeados",             rubro:"Espacio público", modalidad:"orientativa", base:"obra" },
  { id:"esp-contenedores", nombre:"Contenedores en la vía pública",              rubro:"Espacio público", modalidad:"libre",        base:"obra" },
  { id:"esp-chatarra",     nombre:"Chatarra en la vía pública",                  rubro:"Espacio público", modalidad:"libre",        base:"gen"  },

  // Asistencia social
  { id:"asis-victima",     nombre:"Asistencia a la víctima",                     rubro:"Asistencia social", modalidad:"libre",        base:"subs" },
  { id:"asis-reconoc",     nombre:"Reconocimiento de servicios",                 rubro:"Asistencia social", modalidad:"orientativa", base:"subs" },
  { id:"asis-cesion",      nombre:"Cesión de derechos sobre vivienda municipal adjudicada", rubro:"Asistencia social", modalidad:"orientativa", base:"viv" },
  { id:"asis-somos",       nombre:"Somos Barrio / Mejores Casas",                rubro:"Asistencia social", modalidad:"orientativa", base:"subs" },

  // Telecomunicaciones
  { id:"tel-factib",       nombre:"Telecomunicaciones — factibilidad",          rubro:"Telecomunicaciones", modalidad:"orientativa", base:"obra" },
  { id:"tel-ambiental",    nombre:"Telecomunicaciones — aptitud ambiental",     rubro:"Telecomunicaciones", modalidad:"orientativa", base:"obra" },
  { id:"tel-autoriz",      nombre:"Telecomunicaciones — autorización",          rubro:"Telecomunicaciones", modalidad:"restrictiva", base:"obra" },

  // Vehículos en depósito
  { id:"veh-remision",     nombre:"Remisión de vehículo al depósito",           rubro:"Vehículos en depósito", modalidad:"restrictiva", base:"gen" },
  { id:"veh-entrega",      nombre:"Entrega de vehículo",                         rubro:"Vehículos en depósito", modalidad:"restrictiva", base:"gen" },
  { id:"veh-abandono",     nombre:"Declaración de abandono y destino",          rubro:"Vehículos en depósito", modalidad:"restrictiva", base:"gen" },
  { id:"veh-tardio",       nombre:"Reclamo tardío del titular",                 rubro:"Vehículos en depósito", modalidad:"orientativa", base:"gen" },
  { id:"veh-voluntario",   nombre:"Abandono voluntario de un vehículo",         rubro:"Vehículos en depósito", modalidad:"libre",        base:"gen" },

  // Reclamos
  { id:"rec-dano",         nombre:"Reclamo por daño por actuación municipal",   rubro:"Reclamos", modalidad:"orientativa", base:"gen" },
];

window.ESTADOS = {
  borrador:       { label: "Borrador — en carga",     tono: "neutral" },
  presentado:     { label: "Presentado",              tono: "info"    },
  enMesaVirtual:  { label: "En Mesa Virtual",         tono: "info"    },
  caratulado:     { label: "Caratulado",              tono: "info"    },
  enAnalisis:     { label: "En análisis técnico",     tono: "info"    },
  intervencion:   { label: "En intervención",         tono: "info"    },
  pendDoc:        { label: "Pendiente de doc.",       tono: "warn"    },
  pendPpto:       { label: "Pendiente Presupuesto",   tono: "warn"    },
  pendCont:       { label: "Pendiente Contaduría",    tono: "warn"    },
  pendHac:        { label: "Pendiente Hacienda",      tono: "warn"    },
  pendLeg:        { label: "Pendiente Dictamen Legal",tono: "warn"    },
  listoFirmar:    { label: "Listo para firmar",       tono: "ok"      },
  pendFirma:      { label: "Pendiente de firma",      tono: "warn"    },
  observado:      { label: "Observado",               tono: "warn"    },
  firmado:        { label: "Firmado",                 tono: "ok"      },
  registrado:     { label: "Registrado",              tono: "ok"      },
  notificado:     { label: "Notificado",              tono: "ok"      },
  enEjecucion:    { label: "En ejecución",            tono: "info"    },
  resuelto:       { label: "Resuelto",                tono: "ok"      },
  cerrado:        { label: "Cerrado",                 tono: "ok"      },
  archivado:      { label: "Archivado",               tono: "neutral" },
  rechazado:      { label: "Rechazado",               tono: "err"     },
  caducado:       { label: "Caducado",                tono: "err"     },
};

window.USUARIOS = [
  { id: "u1",  nombre: "María Sosa",        cargo: "Jefa Mesa de Entrada Virtual",  area: "mesa", inic: "MS" },
  { id: "u2",  nombre: "Diego Pérez",       cargo: "Inspector Habilitaciones",      area: "tec",  inic: "DP" },
  { id: "u3",  nombre: "Lucía Romero",      cargo: "Analista Presupuesto",          area: "ppto", inic: "LR" },
  { id: "u4",  nombre: "Roberto Acuña",     cargo: "Contador Municipal",            area: "cont", inic: "RA" },
  { id: "u5",  nombre: "Silvina Quiroga",   cargo: "Sec. Economía y Hacienda",      area: "hac",  inic: "SQ" },
  { id: "u6",  nombre: "Pablo Iglesias",    cargo: "Dictaminante Legal",            area: "leg",  inic: "PI" },
  { id: "u7",  nombre: "Andrea Vega",       cargo: "Dir. Gral. de Gobierno",        area: "gob",  inic: "AV" },
  { id: "u8",  nombre: "Hernán Vidal",      cargo: "Intendente",                    area: "int",  inic: "HV" },
  { id: "u9",  nombre: "Carla Méndez",      cargo: "Agente Mesa Virtual",            area: "mesa", inic: "CM" },
  { id: "u10", nombre: "Julieta Castro",    cargo: "Analista Área Técnica",         area: "tec",  inic: "JC" },
];

// Helper for relative dates
const d = (offset) => {
  const x = new Date(2026, 4, 27);
  x.setDate(x.getDate() + offset);
  return x.toISOString().slice(0,10);
};

// Roles — quien puede marcar "Listo para firmar"
window.SESION = {
  usuario: "u10",
  nombre: "Julieta Castro",
  cargo: "Analista — Área Técnica",
  esJefeSector: true,  // Si fuera false, los CTAs de "Listo para firmar" estarían deshabilitados
};

// Nuevo formato: E-4132-9.XXX.XXX-YYYY  (E = Electrónico · 4132 = código municipal · rango 9M = inequívocamente digital)
window.EXPEDIENTES = [
  // ───── EXPEDIENTE RECIÉN INICIADO (destino del wizard de alta) ─────
  {
    nro: "E-4132-9.000.612-2026",
    titulo: "Expediente sin caratular — En carga inicial",
    tipo: "hab",
    modalidad: "restrictiva",
    iniciador: "Julieta Castro (sesión actual)",
    iniciadorTipo: "Interno",
    origenes: ["Área Técnica"],
    fechaInicio: d(0),
    plazoLimite: d(30),
    diasTranscurridos: 0,
    estado: "borrador",
    areaActual: "tec",
    prioridad: "baja",
    docsRequeridos: 5,
    docsCargados: 0,
    objeto: "",
    intervinientes: ["tec"],
    pasoActual: 0,
    documentos: [],
    historial: [
      { fecha: d(0), hora: "14:32", area: "tec", usuario: "u10", accion: "Borrador creado", detalle: "Se inicia un nuevo expediente desde el wizard de alta. Se asigna número provisorio. Aún no se cargó documentación." },
    ],
  },
  {
    nro: "E-4132-9.000.184-2026",
    titulo: "Habilitación comercial — Panadería \"La Espiga\"",
    tipo: "hab",
    modalidad: "restrictiva",
    iniciador: "Comerciante · Juan Cárdenas",
    iniciadorTipo: "Externo",
    origenes: ["Vecino / Comerciante"],
    fechaInicio: d(-12),
    plazoLimite: d(8),
    diasTranscurridos: 12,
    estado: "enAnalisis",
    areaActual: "tec",
    prioridad: "alta",
    docsRequeridos: 5,
    docsCargados: 4,
    objeto: "Solicitud de habilitación comercial para local gastronómico ubicado en Av. Pte. Perón 1242, Grand Bourg. Rubro: panadería con elaboración propia.",
    intervinientes: ["mesa", "tec", "trib", "leg", "gob"],
    pasoActual: 2,
    documentos: [
      { id:"d1", nombre:"Formulario F-101 Solicitud habilitación.pdf", tipo:"Formulario",  area:"mesa", fecha:d(-12), usuario:"u9", firmado:true,  obligatorio:true, pasoCircuito:1 },
      { id:"d2", nombre:"DNI titular.pdf",                              tipo:"Identidad",   area:"mesa", fecha:d(-12), usuario:"u9", firmado:false, obligatorio:true, pasoCircuito:1 },
      { id:"d3", nombre:"Contrato de alquiler.pdf",                     tipo:"Respaldo",    area:"mesa", fecha:d(-12), usuario:"u9", firmado:false, obligatorio:true, pasoCircuito:1 },
      { id:"d4", nombre:"Plano de local — esc 1:100.pdf",               tipo:"Plano",       area:"tec",  fecha:d(-9),  usuario:"u2", firmado:false, obligatorio:true, pasoCircuito:2 },
      { id:"d5", nombre:"Informe técnico inspección N° 412.pdf",        tipo:"Informe",     area:"tec",  fecha:d(-4),  usuario:"u2", firmado:true,  obligatorio:false, pasoCircuito:2 },
      { id:"d6", nombre:"Libre deuda tributaria — En trámite",          tipo:"Certificado", area:"trib", fecha:null,    usuario:null, firmado:false, obligatorio:true, pendiente:true, pasoCircuito:3 },
    ],
    historial: [
      { fecha:d(-12), hora:"09:14", area:"mesa", usuario:"u9", accion:"Caratulación",        detalle:"Se asigna número E-4132-9.000.184-2026. Solicitante: Juan Cárdenas. Tipo: Habilitación comercial (modalidad restrictiva)." },
      { fecha:d(-12), hora:"09:18", area:"mesa", usuario:"u9", accion:"Derivación automática",detalle:"Modalidad restrictiva: el sistema deriva automáticamente al Área Técnica según el circuito HAB-01." },
      { fecha:d(-11), hora:"11:02", area:"tec",  usuario:"u2", accion:"Recepción",           detalle:"Expediente recibido por el área técnica." },
      { fecha:d(-9),  hora:"15:40", area:"tec",  usuario:"u2", accion:"Solicitud documental",detalle:"Se solicita plano firmado de local. Estado: Pendiente de documentación." },
      { fecha:d(-7),  hora:"10:21", area:"tec",  usuario:"u2", accion:"Documento incorporado",detalle:"Plano recibido. Estado restablecido a En análisis técnico." },
      { fecha:d(-4),  hora:"16:53", area:"tec",  usuario:"u2", accion:"Inspección realizada",detalle:"Informe técnico N° 412 emitido y firmado. Sin observaciones sustantivas." },
    ],
  },
  {
    nro: "E-4132-9.000.219-2026",
    titulo: "Compra menor — Insumos sanitarios CDR Maggio",
    tipo: "comp",
    modalidad: "orientativa",
    iniciador: "Centro Diabetes Dr. A. D. Maggio",
    iniciadorTipo: "Interno",
    origenes: ["Salud", "Compras"],
    fechaInicio: d(-21),
    plazoLimite: d(-2),
    diasTranscurridos: 21,
    estado: "pendFirma",
    areaActual: "int",
    prioridad: "alta",
    vencido: true,
    importadoDe: "MEAL",
    objeto: "Adquisición de insumos médicos descartables para el Centro de Diabetes y Enfermedades Metabólicas. Monto estimado: $ 1.842.000.",
    intervinientes: ["tec","mesa","ppto","cont","hac","dict","gob","int","tes"],
    pasoActual: 7,
    documentos: [],
    historial: [
      { fecha:d(-21), hora:"08:42", area:"tec",  usuario:"u10", accion:"Solicitud iniciada",          detalle:"Se inicia el expediente a pedido del Centro de Diabetes y Enfermedades Metabólicas Dr. A. D. Maggio. Se identifica la necesidad de adquirir insumos médicos descartables para reposición de stock crítico. Importado desde MEAL con N° E-2026-3814-MEAL." },
      { fecha:d(-20), hora:"14:15", area:"mesa", usuario:"u9",  accion:"Caratulación",                detalle:"Mesa de Entrada Virtual valida la documentación inicial y caratula formalmente. Se asigna número definitivo E-4132-9.000.219-2026. Modalidad orientativa según circuito COMP-01 (Compra menor). Derivación al área técnica del CDR." },
      { fecha:d(-18), hora:"10:31", area:"tec",  usuario:"u10", accion:"Informe técnico",              detalle:"Se confecciona informe técnico de necesidad. Detalle de insumos solicitados: 1.200 lancetas para glucometría, 800 tiras reactivas, 500 jeringas descartables 1 ml y kits de control. Monto estimado $ 1.842.000.- IVA incluido. Tres presupuestos adjuntos." },
      { fecha:d(-15), hora:"11:42", area:"ppto", usuario:"u3",  accion:"Factibilidad presupuestaria", detalle:"Se verifica disponibilidad presupuestaria en la partida 5.1.4.0 (Bienes de consumo — Productos farmacéuticos y medicinales). Saldo suficiente: $ 14.230.500.- Procede." },
      { fecha:d(-12), hora:"16:08", area:"cont", usuario:"u4",  accion:"Imputación contable",          detalle:"Se imputa preventivamente el gasto a la partida 5.1.4.0 jurisdicción 1.1.1.16 (Sec. de Salud). Numeración interna contable CM-2026-1842. Sin observaciones." },
      { fecha:d(-9),  hora:"09:31", area:"hac",  usuario:"u5",  accion:"Conformidad económica",        detalle:"Sec. Economía y Hacienda presta conformidad al gasto comprometido. Monto verificado contra cronograma trimestral de pagos. Procede a Dictamen Legal." },
      { fecha:d(-7),  hora:"15:48", area:"dict", usuario:"u6",  accion:"Dictamen Legal Nº 087/26",     detalle:"Dictamen favorable. Se cumplen los recaudos del Reglamento de Contrataciones Municipal. Procede el dictado del acto administrativo de adjudicación directa por urgencia sanitaria, ordenanza 4129/22 art. 12." },
      { fecha:d(-4),  hora:"11:00", area:"gob",  usuario:"u7",  accion:"Confección del acto administrativo", detalle:"Dirección General de Gobierno confecciona el proyecto de Decreto adjudicando la contratación a Insumed S.A. por la suma de $ 1.842.000. Eleva para firma del Sr. Intendente." },
    ],
    hojaFirmas: {
      numero: "HF-4132-9.000.219-2026",
      estado: "abierta",
      abiertaPor: "u10",
      abiertaEn: d(-8),
      hash: "8c2f1a…d47e",
      firmasRequeridas: [
        { area:"tec",  cargo:"Jefe Área Técnica",              orden:1 },
        { area:"ppto", cargo:"Director de Presupuesto",         orden:2 },
        { area:"cont", cargo:"Contador Municipal",              orden:3 },
        { area:"hac",  cargo:"Sec. Economía y Hacienda",        orden:4 },
        { area:"dict", cargo:"Dictaminante Legal",              orden:5 },
        { area:"gob",  cargo:"Dir. Gral. de Gobierno",          orden:6 },
        { area:"int",  cargo:"Intendente Municipal",            orden:7 },
      ],
      firmas: [
        { area:"tec",  usuario:"u10", cargo:"Jefa Área Técnica",         fecha:d(-8), hora:"10:14", hash:"a1c4f2…e89d", comentario:"Conformidad técnica con el pedido del CDR Maggio." },
        { area:"ppto", usuario:"u3",  cargo:"Analista Presupuesto",      fecha:d(-7), hora:"15:42", hash:"7b9e3c…1f48", comentario:"Factibilidad presupuestaria verificada." },
        { area:"cont", usuario:"u4",  cargo:"Contador Municipal",        fecha:d(-5), hora:"11:08", hash:"3d8a45…b2c7", comentario:"Imputado a partida 5.1.4 — Bienes de consumo." },
        { area:"hac",  usuario:"u5",  cargo:"Sec. Economía y Hacienda",  fecha:d(-4), hora:"09:31", hash:"f5e1d8…2a93", comentario:"Conforme." },
        { area:"dict", usuario:"u6",  cargo:"Dictaminante Legal",        fecha:d(-2), hora:"16:50", hash:"c9b072…45ef", comentario:"Sin observaciones. Procede el dictado del acto administrativo." },
      ],
    },
  },
  {
    nro: "E-4132-9.000.301-2026",
    titulo: "Reconocimiento de servicios — Cooperativa Las Tunas",
    tipo: "subs",
    modalidad: "orientativa",
    iniciador: "Sec. de Desarrollo Social",
    iniciadorTipo: "Interno",
    origenes: ["Desarrollo Social"],
    fechaInicio: d(-18),
    plazoLimite: d(12),
    diasTranscurridos: 18,
    estado: "intervencion",
    areaActual: "leg",
    prioridad: "media",
    desvio: { tipo:"forzado", de:"hac", a:"leg", esperado:"dict", motivo:"Histórico — Hacienda envía Reconocimientos a Legales en lugar de Dictámenes" },
    objeto: "Reconocimiento de tareas de mantenimiento y limpieza del Centro de Jubilados realizadas por la Cooperativa Las Tunas durante el primer trimestre 2026.",
    intervinientes: ["tec","mesa","ppto","cont","hac","leg","gob","tes"],
    pasoActual: 5,
    documentos: [],
    historial: [],
  },
  {
    nro: "E-4132-9.000.342-2026",
    titulo: "Regularización dominial — Manzana 14 Lote 7 Tortuguitas",
    tipo: "viv",
    modalidad: "orientativa",
    iniciador: "Familia González",
    iniciadorTipo: "Externo",
    origenes: ["Vecino / Familia"],
    fechaInicio: d(-34),
    plazoLimite: d(60),
    diasTranscurridos: 34,
    estado: "intervencion",
    areaActual: "viv",
    prioridad: "media",
    objeto: "Trámite de regularización dominial sobre inmueble de la Mz. 14 Lote 7 del barrio Tortuguitas, según ordenanza 4129/22.",
    intervinientes: ["mesa","viv","trib","dict","gob","int"],
    pasoActual: 3,
    documentos: [],
    historial: [],
  },
  {
    nro: "E-4132-9.000.367-2026",
    titulo: "Apremio fiscal — Padrón TGI 88.412",
    tipo: "apr",
    modalidad: "restrictiva",
    iniciador: "Subsec. Ingresos Tributarios",
    iniciadorTipo: "Interno",
    origenes: ["Ingresos Tributarios"],
    fechaInicio: d(-7),
    plazoLimite: d(23),
    diasTranscurridos: 7,
    estado: "caratulado",
    areaActual: "apr",
    prioridad: "baja",
    objeto: "Inicio de cobro judicial por deuda de Tasa por Servicios Generales acumulada 2022-2025 sobre padrón 88.412.",
    intervinientes: ["trib","mesa","apr","dict","gob","int"],
    pasoActual: 1,
    documentos: [],
    historial: [],
  },
  {
    nro: "E-4132-9.000.388-2026",
    titulo: "Convenio — Universidad Nac. Gral. Sarmiento (prácticas)",
    tipo: "conv",
    modalidad: "orientativa",
    iniciador: "Sec. de Educación",
    iniciadorTipo: "Interno",
    origenes: ["Educación"],
    fechaInicio: d(-26),
    plazoLimite: d(4),
    diasTranscurridos: 26,
    estado: "pendHac",
    areaActual: "hac",
    prioridad: "media",
    objeto: "Convenio marco de prácticas profesionales supervisadas entre la Municipalidad y la UNGS, sin erogación municipal.",
    intervinientes: ["tec","mesa","hac","dict","gob","int"],
    pasoActual: 4,
    documentos: [],
    historial: [],
  },
  {
    nro: "E-4132-9.000.401-2026",
    titulo: "Permiso de obra — Ampliación vivienda unifamiliar",
    tipo: "obra",
    modalidad: "orientativa",
    iniciador: "Vecino · L. Fernández",
    iniciadorTipo: "Externo",
    origenes: ["Vecino", "Obras Públicas"],
    fechaInicio: d(-3),
    plazoLimite: d(27),
    diasTranscurridos: 3,
    estado: "enMesaVirtual",
    areaActual: "mesa",
    prioridad: "baja",
    objeto: "Solicitud de permiso para ampliación de 38 m² en vivienda unifamiliar de Villa de Mayo.",
    intervinientes: ["mesa","tec","trib","gob"],
    pasoActual: 0,
    documentos: [],
    historial: [],
  },
  {
    nro: "E-4132-9.000.412-2026",
    titulo: "Contratación directa — Servicio de fumigación urbana",
    tipo: "comp",
    modalidad: "orientativa",
    iniciador: "Sec. de Ambiente",
    iniciadorTipo: "Interno",
    origenes: ["Ambiente", "Salud"],
    fechaInicio: d(-15),
    plazoLimite: d(15),
    diasTranscurridos: 15,
    estado: "pendCont",
    areaActual: "cont",
    prioridad: "alta",
    importadoDe: "RAFAM",
    objeto: "Contratación directa por urgencia sanitaria para fumigación contra mosquito Aedes en zonas críticas.",
    intervinientes: ["tec","mesa","ppto","cont","hac","dict","gob","tes"],
    pasoActual: 4,
    documentos: [],
    historial: [],
  },
  {
    nro: "E-4132-9.000.435-2026",
    titulo: "Habilitación comercial — Ferretería \"El Tornillo\"",
    tipo: "hab",
    modalidad: "restrictiva",
    iniciador: "Comerciante · R. Suárez",
    iniciadorTipo: "Externo",
    origenes: ["Vecino / Comerciante"],
    fechaInicio: d(-9),
    plazoLimite: d(21),
    diasTranscurridos: 9,
    estado: "observado",
    areaActual: "mesa",
    prioridad: "media",
    objeto: "Solicitud de habilitación de ferretería. Observada por falta de plano firmado por matriculado.",
    intervinientes: ["mesa","tec","trib"],
    pasoActual: 1,
    documentos: [],
    historial: [],
  },
  {
    nro: "E-4132-9.000.478-2026",
    titulo: "Adjudicación de vivienda — Plan Procrear Pablo Nogués",
    tipo: "viv",
    modalidad: "orientativa",
    iniciador: "Familia Romero",
    iniciadorTipo: "Externo",
    origenes: ["Vecino / Familia", "Viviendas"],
    fechaInicio: d(-45),
    plazoLimite: d(15),
    diasTranscurridos: 45,
    estado: "firmado",
    areaActual: "gob",
    prioridad: "media",
    objeto: "Adjudicación de unidad habitacional N° 27, plan Procrear, barrio Pablo Nogués.",
    intervinientes: ["mesa","viv","trib","dict","gob","int"],
    pasoActual: 8,
    documentos: [],
    historial: [
      { fecha:d(-45), hora:"09:18", area:"mesa", usuario:"u9",  accion:"Solicitud presentada",          detalle:"Familia Romero (5 integrantes, encabezado por Cristina Romero DNI 28.114.502) presenta solicitud de adjudicación de unidad habitacional plan Procrear barrio Pablo Nogués. Acompañan documentación familiar, ingresos y constancia de inscripción al RUPHA." },
      { fecha:d(-44), hora:"10:42", area:"mesa", usuario:"u9",  accion:"Caratulación",                  detalle:"Mesa de Entrada Virtual asigna número E-4132-9.000.478-2026 al expediente. Tipo: Regularización dominial. Modalidad orientativa. Se deriva a Dirección de Viviendas." },
      { fecha:d(-42), hora:"15:20", area:"viv",  usuario:"u7",  accion:"Verificación documental",       detalle:"Dirección de Viviendas verifica que la familia cumple con los requisitos de la ordenanza 4129/22: composición familiar, ingresos por debajo del tope, inscripción vigente en RUPHA hace más de 24 meses, sin propiedades a nombre del grupo familiar." },
      { fecha:d(-30), hora:"14:22", area:"viv",  usuario:"u7",  accion:"Conformidad Dir. Viviendas",    detalle:"Dirección de Viviendas presta conformidad y propone la adjudicación de la unidad habitacional N° 27 del barrio Pablo Nogués. Se eleva a Subsec. Ingresos Tributarios para verificación de deudas." },
      { fecha:d(-25), hora:"10:08", area:"trib", usuario:"u4",  accion:"Libre deuda emitido",            detalle:"Subsec. Ingresos Tributarios emite libre deuda municipal sobre la unidad habitacional N° 27. Sin observaciones tributarias. Procede." },
      { fecha:d(-15), hora:"16:42", area:"dict", usuario:"u6",  accion:"Dictamen Legal Nº 142/26",       detalle:"Dictamen jurídico favorable. Se cumplen la totalidad de los recaudos formales y de fondo de la ordenanza 4129/22 para proceder a la adjudicación. Procede al dictado del acto administrativo correspondiente." },
      { fecha:d(-8),  hora:"12:15", area:"gob",  usuario:"u7",  accion:"Decreto Nº 287/26 confeccionado",detalle:"Dirección General de Gobierno confecciona Decreto Nº 287/26 adjudicando la unidad habitacional N° 27 del barrio Pablo Nogués a la familia Romero. Se eleva para firma del Intendente." },
      { fecha:d(-2),  hora:"11:00", area:"int",  usuario:"u8",  accion:"Firma del Intendente",            detalle:"El Sr. Intendente Hernán Vidal firma el Decreto Nº 287/26 adjudicando la unidad habitacional a la familia Romero. Se procede a notificar a la familia adjudicataria y al Registro de Bienes Municipales." },
    ],
    hojaFirmas: {
      numero: "HF-4132-9.000.478-2026",
      estado: "cerrada",
      abiertaPor: "u7",
      abiertaEn: d(-30),
      cerradaEn: d(-2),
      hash: "5a7c91…f3b2",
      firmasRequeridas: [
        { area:"viv",  cargo:"Director de Viviendas",           orden:1 },
        { area:"trib", cargo:"Subsec. Ingresos Tributarios",    orden:2 },
        { area:"dict", cargo:"Dictaminante Legal",              orden:3 },
        { area:"gob",  cargo:"Dir. Gral. de Gobierno",          orden:4 },
        { area:"int",  cargo:"Intendente Municipal",            orden:5 },
      ],
      firmas: [
        { area:"viv",  usuario:"u7", cargo:"Director de Viviendas",         fecha:d(-30), hora:"14:22", hash:"e21a47…8c1f", comentario:"Verificado cumplimiento de requisitos de adjudicación según ordenanza." },
        { area:"trib", usuario:"u4", cargo:"Subsec. Ingresos Tributarios",  fecha:d(-25), hora:"10:08", hash:"b4d639…2e7a", comentario:"Libre deuda emitido." },
        { area:"dict", usuario:"u6", cargo:"Dictaminante Legal",            fecha:d(-15), hora:"16:42", hash:"f7c802…91d5", comentario:"Dictamen favorable Nº 142/26." },
        { area:"gob",  usuario:"u7", cargo:"Dir. Gral. de Gobierno",        fecha:d(-8),  hora:"12:15", hash:"a3f981…45e0", comentario:"Acto administrativo confeccionado y elevado." },
        { area:"int",  usuario:"u8", cargo:"Intendente Municipal",          fecha:d(-2),  hora:"11:00", hash:"5a7c91…f3b2", comentario:"Firmado y registrado. Procédase a notificar al adjudicatario." },
      ],
    },
  },
  {
    nro: "E-4132-9.000.489-2026",
    titulo: "Obra pública — Repavimentación calle Posadas",
    tipo: "obra",
    modalidad: "orientativa",
    iniciador: "Sec. Obras Públicas",
    iniciadorTipo: "Interno",
    origenes: ["Obras Públicas"],
    fechaInicio: d(-58),
    plazoLimite: d(-3),
    diasTranscurridos: 58,
    estado: "enEjecucion",
    areaActual: "obras",
    prioridad: "alta",
    objeto: "Repavimentación de 4 cuadras sobre calle Posadas, entre Belgrano y San Martín, Grand Bourg.",
    intervinientes: ["tec","mesa","ppto","cont","hac","dict","gob","int","tes"],
    pasoActual: 9,
    subExpedientes: [
      { nro:"E-4132-9.000.489.1-2026", titulo:"Certificado de avance N°1 · empresa Vialur S.A.",  interno:true },
      { nro:"E-4132-9.000.489.2-2026", titulo:"Cómputo y presupuesto adicional ítem 3.4",         interno:true },
    ],
    documentos: [],
    historial: [
      { fecha:d(-58), hora:"08:30", area:"obras",usuario:"u7",  accion:"Solicitud Sec. Obras Públicas", detalle:"Secretaría de Obras Públicas inicia el expediente para la repavimentación de 4 cuadras de calle Posadas (entre Belgrano y San Martín) en Grand Bourg. Plazo de obra estimado: 90 días. Monto estimado: $ 28.450.000." },
      { fecha:d(-55), hora:"11:14", area:"tec",  usuario:"u10", accion:"Pliego técnico revisado",        detalle:"Área Técnica revisa el pliego de bases y condiciones particulares. Especificaciones técnicas para mezcla asfáltica en caliente IRAM 113.045. Cómputo y presupuesto preliminar. Cronograma físico-financiero. Sin observaciones." },
      { fecha:d(-50), hora:"09:30", area:"obras",usuario:"u7",  accion:"Conformidad Sec. Obras",         detalle:"Sec. Obras Públicas presta conformidad al pliego y eleva a Presupuesto para verificación de fondos." },
      { fecha:d(-42), hora:"14:08", area:"ppto", usuario:"u3",  accion:"Factibilidad presupuestaria",   detalle:"Dirección de Presupuesto verifica disponibilidad en la partida 6.2.1.3 (Obras menores de pavimentación). Saldo: $ 142.300.000. Se compromete preventivamente el monto solicitado." },
      { fecha:d(-38), hora:"10:21", area:"cont", usuario:"u4",  accion:"Imputación contable",            detalle:"Contaduría Municipal imputa el gasto a la partida 6.2.1.3 jurisdicción 1.1.1.20 (Sec. Obras Públicas). Numeración interna CM-2026-2848. Registro contable efectuado." },
      { fecha:d(-35), hora:"16:15", area:"hac",  usuario:"u5",  accion:"Conformidad económica",           detalle:"Secretaría de Economía y Hacienda presta conformidad económica al gasto. Procede al Dictamen Legal." },
      { fecha:d(-30), hora:"15:40", area:"dict", usuario:"u6",  accion:"Dictamen Legal Nº 089/26",        detalle:"Dictamen jurídico favorable. Procede el llamado a licitación pública según ordenanza 4032/19 y Decreto Reglamentario 1845/19. Procédase a la confección del acto administrativo." },
      { fecha:d(-22), hora:"11:33", area:"gob",  usuario:"u7",  accion:"Decreto Nº 412/26 confeccionado",detalle:"Dirección General de Gobierno confecciona Decreto Nº 412/26 autorizando el llamado a licitación pública para la repavimentación de calle Posadas. Eleva para firma del Intendente." },
      { fecha:d(-12), hora:"09:45", area:"int",  usuario:"u8",  accion:"Firma del Intendente",             detalle:"El Sr. Intendente Hernán Vidal firma el Decreto Nº 412/26. Se autoriza el llamado a licitación y la afectación presupuestaria correspondiente. Pasa a etapa de ejecución." },
      { fecha:d(-5),  hora:"10:00", area:"obras",usuario:"u7",  accion:"Inicio de obra",                  detalle:"Adjudicada la obra a la empresa Vialur S.A. tras proceso licitatorio (no anexado a este expediente). Se firma el acta de inicio de obra. Inspector de obra designado: Diego Pérez." },
    ],
    hojaFirmas: {
      numero: "HF-4132-9.000.489-2026",
      estado: "cerrada",
      abiertaPor: "u2",
      abiertaEn: d(-50),
      cerradaEn: d(-12),
      hash: "9d2bf1…84a7",
      firmasRequeridas: [
        { area:"tec",  cargo:"Jefe Área Técnica",              orden:1 },
        { area:"obras",cargo:"Sec. Obras Públicas",            orden:2 },
        { area:"ppto", cargo:"Director de Presupuesto",        orden:3 },
        { area:"cont", cargo:"Contador Municipal",             orden:4 },
        { area:"hac",  cargo:"Sec. Economía y Hacienda",       orden:5 },
        { area:"dict", cargo:"Dictaminante Legal",             orden:6 },
        { area:"gob",  cargo:"Dir. Gral. de Gobierno",         orden:7 },
        { area:"int",  cargo:"Intendente Municipal",           orden:8 },
      ],
      firmas: [
        { area:"tec",   usuario:"u10", cargo:"Jefa Área Técnica",         fecha:d(-50), hora:"09:30", hash:"21fcae…8e02", comentario:"Pliego técnico revisado." },
        { area:"obras", usuario:"u7",  cargo:"Sec. Obras Públicas",       fecha:d(-46), hora:"11:55", hash:"73a89c…f612", comentario:"Conforme." },
        { area:"ppto",  usuario:"u3",  cargo:"Analista Presupuesto",      fecha:d(-42), hora:"14:08", hash:"b1d472…29ab", comentario:"Imputación efectuada." },
        { area:"cont",  usuario:"u4",  cargo:"Contador Municipal",        fecha:d(-38), hora:"10:21", hash:"6e5f9d…4c7e", comentario:"Registrado contablemente." },
        { area:"hac",   usuario:"u5",  cargo:"Sec. Economía y Hacienda",  fecha:d(-35), hora:"16:15", hash:"a8b234…107f", comentario:"Aprobado el monto." },
        { area:"dict",  usuario:"u6",  cargo:"Dictaminante Legal",        fecha:d(-30), hora:"15:40", hash:"f37e12…6b81", comentario:"Dictamen Nº 089/26 favorable." },
        { area:"gob",   usuario:"u7",  cargo:"Dir. Gral. de Gobierno",    fecha:d(-22), hora:"11:33", hash:"c8e740…35d9", comentario:"Decreto Nº 412/26 confeccionado." },
        { area:"int",   usuario:"u8",  cargo:"Intendente Municipal",      fecha:d(-12), hora:"09:45", hash:"9d2bf1…84a7", comentario:"Firmado y autorizado el inicio de obra." },
      ],
    },
  },
  {
    nro: "E-4132-9.000.502-2026",
    titulo: "Baja de comercio — Kiosco \"24 Hs\"",
    tipo: "hab",
    modalidad: "restrictiva",
    iniciador: "Comerciante · A. Pintos",
    iniciadorTipo: "Externo",
    origenes: ["Vecino / Comerciante"],
    fechaInicio: d(-2),
    plazoLimite: d(28),
    diasTranscurridos: 2,
    estado: "caratulado",
    areaActual: "tec",
    prioridad: "baja",
    objeto: "Solicitud de baja de comercio por cese de actividad comercial.",
    intervinientes: ["mesa","tec","trib"],
    pasoActual: 1,
    documentos: [],
    historial: [],
  },
  {
    nro: "E-4132-9.000.518-2026",
    titulo: "Apremio — Padrón Industrial 14.299",
    tipo: "apr",
    modalidad: "restrictiva",
    iniciador: "Subsec. Ingresos Tributarios",
    iniciadorTipo: "Interno",
    origenes: ["Ingresos Tributarios"],
    fechaInicio: d(-31),
    plazoLimite: d(-1),
    diasTranscurridos: 31,
    estado: "pendLeg",
    areaActual: "dict",
    prioridad: "alta",
    vencido: true,
    objeto: "Apremio fiscal por incumplimiento en pago de tasa industrial — padrón 14.299.",
    intervinientes: ["trib","mesa","apr","dict","gob","int"],
    pasoActual: 4,
    documentos: [],
    historial: [],
  },
  // CIRCUITO 53 — caso atípico vecinal
  {
    nro: "E-4132-9.000.547-2026",
    titulo: "Denuncia vecinal — Mordedura de perro en plaza pública",
    tipo: "gen",
    modalidad: "libre",
    iniciador: "Vecino · M. Acosta",
    iniciadorTipo: "Externo",
    origenes: ["Vecino"],
    fechaInicio: d(-1),
    plazoLimite: d(29),
    diasTranscurridos: 1,
    estado: "enAnalisis",
    areaActual: "mesa",
    prioridad: "media",
    circuitoEspecial: "Circuito General 53",
    objeto: "Denuncia por mordedura de perro suelto en Plaza San Martín. Solicita intervención de Zoonosis y reclamo de daños.",
    intervinientes: ["mesa","salud","leg"],
    pasoActual: 1,
    documentos: [],
    historial: [],
  },
  // HCD — Concejo Deliberante (autónomo, color verde)
  {
    nro: "HCD-4132-O.000.089-2026",
    titulo: "Ordenanza — Adhesión al programa provincial \"Barrios Limpios\"",
    tipo: "hcd",
    modalidad: "libre",
    iniciador: "Bloque Concejales",
    iniciadorTipo: "HCD",
    origenes: ["HCD"],
    fechaInicio: d(-14),
    plazoLimite: d(46),
    diasTranscurridos: 14,
    estado: "intervencion",
    areaActual: "hcd",
    prioridad: "media",
    autonomo: true,
    objeto: "Proyecto de ordenanza para adhesión municipal al programa provincial de gestión de residuos sólidos urbanos \"Barrios Limpios\".",
    intervinientes: ["hcd"],
    pasoActual: 2,
    documentos: [],
    historial: [],
  },
  // BORRADOR EN CARGA COLABORATIVA — ilustra el guardado de progreso multi-área
  {
    nro: "E-4132-9.000.541-2026",
    titulo: "Subsidio extraordinario — Club Atlético Defensores Tortuguitas",
    tipo: "subs",
    modalidad: "orientativa",
    iniciador: "Sec. de Educación y Deporte",
    iniciadorTipo: "Interno",
    origenes: ["Educación", "Desarrollo Social"],
    fechaInicio: d(-4),
    plazoLimite: d(26),
    diasTranscurridos: 4,
    estado: "borrador",
    areaActual: "tec",
    prioridad: "media",
    docsRequeridos: 6,
    docsCargados: 3,
    objeto: "Subsidio no reintegrable para refacción de vestuarios y mejora del sistema eléctrico del Club Atlético Defensores Tortuguitas. Monto estimado: $ 1.250.000.",
    intervinientes: ["tec","mesa","ppto","cont","hac","dict","gob","tes"],
    pasoActual: 0,
    documentos: [
      { id:"d1", nombre:"Nota de solicitud — Sec. Educación.pdf",       tipo:"Nota",       area:"tec",  fecha:d(-4), usuario:"u10", firmado:true,  obligatorio:true, pasoCircuito:1 },
      { id:"d2", nombre:"Personería jurídica del Club.pdf",              tipo:"Personería", area:"tec",  fecha:d(-3), usuario:"u10", firmado:false, obligatorio:true, pasoCircuito:1 },
      { id:"d3", nombre:"Presupuesto de obra — 3 cotizaciones.pdf",      tipo:"Presupuesto",area:"tec",  fecha:d(-2), usuario:"u2",  firmado:false, obligatorio:true, pasoCircuito:2 },
      { id:"d4", nombre:"Plan de ejecución y cronograma",                tipo:"Plan",       area:"tec",  fecha:null,  usuario:null,  firmado:false, obligatorio:true, pendiente:true },
      { id:"d5", nombre:"Factibilidad presupuestaria",                   tipo:"Informe",    area:"ppto", fecha:null,  usuario:null,  firmado:false, obligatorio:true, pendiente:true },
      { id:"d6", nombre:"Acta de aprobación del directorio del club",    tipo:"Acta",       area:"tec",  fecha:null,  usuario:null,  firmado:false, obligatorio:true, pendiente:true },
    ],
    historial: [
      { fecha:d(-4), hora:"10:22", area:"tec",  usuario:"u10", accion:"Borrador creado",        detalle:"Se inicia el expediente en estado Borrador desde la Sec. de Educación y Deporte. Se carga la nota de solicitud." },
      { fecha:d(-3), hora:"15:08", area:"tec",  usuario:"u10", accion:"Documento incorporado", detalle:"Personería jurídica del Club adjuntada al borrador." },
      { fecha:d(-2), hora:"11:34", area:"tec",  usuario:"u2",  accion:"Documento incorporado", detalle:"Tres presupuestos de obra adjuntados al borrador." },
    ],
  },
];

// Bandeja del usuario actual (u10, Área Técnica)
window.BANDEJA = [
  { nro:"E-4132-9.000.184-2026", accion:"Continuar análisis técnico",     vence:8,  prioridad:"alta"  },
  { nro:"E-4132-9.000.489-2026", accion:"Informe de avance de obra",      vence:-3, prioridad:"alta"  },
  { nro:"E-4132-9.000.502-2026", accion:"Verificar cese de actividad",    vence:28, prioridad:"baja"  },
  { nro:"E-4132-9.000.412-2026", accion:"Especificaciones técnicas",      vence:15, prioridad:"alta"  },
  { nro:"E-4132-9.000.435-2026", accion:"Revisar subsanación recibida",   vence:21, prioridad:"media" },
];

// MESA DE ENTRADA VIRTUAL — borradores pendientes de caratulación
window.MESA_VIRTUAL = [
  {
    id: "mv1",
    referencia: "Borrador #1284",
    titulo: "Solicitud de suministro — Toners para Sec. General",
    origen: "Sec. General · Compras",
    enviadoPor: "u3",
    fecha: d(0),
    docs: 3,
    tipoSugerido: "comp",
    importadoDe: "MEAL",
  },
  {
    id: "mv2",
    referencia: "Borrador #1285",
    titulo: "Reclamo vecinal — Bache profundo en Av. Belgrano 4400",
    origen: "Portal externo · Vecino",
    enviadoPor: null,
    fecha: d(0),
    docs: 2,
    tipoSugerido: "gen",
    obsMesa: "Sin tipo predefinido — sugerencia: encauzar por Circuito General 53",
  },
  {
    id: "mv3",
    referencia: "Borrador #1286",
    titulo: "Permiso de obra — Construcción galpón industrial",
    origen: "Vecino · Empresa Metalmecánica del Sur SRL",
    enviadoPor: null,
    fecha: d(-1),
    docs: 7,
    tipoSugerido: "obra",
  },
  {
    id: "mv4",
    referencia: "Borrador #1287",
    titulo: "Nota interna — Pedido de adquisición de equipamiento informático",
    origen: "Dir. Informática",
    enviadoPor: "u4",
    fecha: d(-1),
    docs: 4,
    tipoSugerido: "comp",
    importadoDe: "RAFAM",
  },
];

// Notificaciones / alertas
window.ALERTAS = [
  { tipo:"vencido", texto:"2 expedientes vencidos en tu bandeja",         link:"#bandeja" },
  { tipo:"firma",   texto:"1 acto pendiente de tu firma (Compra CDR)",    link:"#detalle" },
  { tipo:"obs",     texto:"Subsanación recibida en E-4132-9.000.435",     link:"#detalle" },
];

// KPIs del dashboard
window.KPIS = [
  { label:"Expedientes activos",       valor:142, delta:"+8 este mes",     tono:"neutral" },
  { label:"Pendientes de mi área",     valor:23,  delta:"5 vencidos",      tono:"warn"    },
  { label:"Resueltos este mes",        valor:47,  delta:"+12% vs. abril",  tono:"ok"      },
  { label:"Tiempo medio de circuito",  valor:"18d", delta:"-2d vs. abril", tono:"ok"      },
];

// Distribución por estado (para reportes)
window.DIST_ESTADO = [
  { estado:"En análisis técnico",   n:34 },
  { estado:"En intervención",       n:28 },
  { estado:"Pendiente de doc.",     n:19 },
  { estado:"Pendiente Presupuesto", n:12 },
  { estado:"Pendiente Contaduría",  n:11 },
  { estado:"Pendiente Hacienda",    n:9  },
  { estado:"Pendiente Dict. Legal", n:14 },
  { estado:"Pendiente de firma",    n:7  },
  { estado:"Observado",             n:8  },
];

// Circuitos configurados (motor de workflow)
window.CIRCUITOS = [
  { id: "HAB-01",  nombre: "Habilitación comercial",      pasos: 7,  plazo: "30d", v: "2.3", modalidad: "restrictiva", activo: true },
  { id: "COMP-01", nombre: "Compra menor / contratación", pasos: 10, plazo: "45d", v: "1.8", modalidad: "orientativa", activo: true },
  { id: "SUBS-01", nombre: "Subsidio / reconocimiento",   pasos: 9,  plazo: "30d", v: "2.1", modalidad: "orientativa", activo: true },
  { id: "VIV-01",  nombre: "Regularización dominial",     pasos: 8,  plazo: "60d", v: "1.4", modalidad: "orientativa", activo: true },
  { id: "APR-01",  nombre: "Apremio / cobro judicial",    pasos: 9,  plazo: "30d", v: "1.2", modalidad: "restrictiva", activo: true },
  { id: "CONV-01", nombre: "Convenio institucional",      pasos: 7,  plazo: "30d", v: "1.0", modalidad: "orientativa", activo: false },
  { id: "OBRA-01", nombre: "Permiso de obra",             pasos: 6,  plazo: "30d", v: "2.0", modalidad: "orientativa", activo: true },
  { id: "GEN-53",  nombre: "Circuito General Genérico",   pasos: 0,  plazo: "—",   v: "1.0", modalidad: "libre",        activo: true, especial: true,
    descripcion: "Para casuísticas imprevistas en Mesa de Entrada (denuncias vecinales atípicas, casos sin categoría predefinida)." },
  { id: "HCD-FREE",nombre: "Entorno HCD — Ordenanzas",    pasos: 0,  plazo: "—",   v: "1.0", modalidad: "libre",        activo: true, especial: true,
    descripcion: "Entorno libre para el Honorable Concejo Deliberante. Mesa de entrada propia, nomenclatura autónoma." },
];

// Circuito de ejemplo — Compra menor (orientativa)
window.CIRCUITO_COMPRA = [
  { paso:1, area:"tec",  accion:"Solicitud e informe técnico",          plazo:"3d", estado:"firmado"    },
  { paso:2, area:"mesa", accion:"Caratulación",                          plazo:"1d", estado:"firmado"    },
  { paso:3, area:"ppto", accion:"Factibilidad presupuestaria",           plazo:"3d", estado:"firmado"    },
  { paso:4, area:"cont", accion:"Imputación contable",                   plazo:"3d", estado:"enAnalisis" },
  { paso:5, area:"hac",  accion:"Conformidad económica",                 plazo:"2d", estado:"pendiente"  },
  { paso:6, area:"dict", accion:"Dictamen",                              plazo:"3d", estado:"pendiente"  },
  { paso:7, area:"gob",  accion:"Confección de acto administrativo",     plazo:"2d", estado:"pendiente"  },
  { paso:8, area:"int",  accion:"Firma del Intendente",                  plazo:"1d", estado:"pendiente"  },
  { paso:9, area:"cont", accion:"Orden de pago",                         plazo:"2d", estado:"pendiente"  },
  { paso:10,area:"tes",  accion:"Pago y archivo",                        plazo:"3d", estado:"pendiente"  },
];

// PLANTILLAS — repositorio por área. categoria: "acto" (textarea editable) | "formulario" (campos estructurados)
window.PLANTILLAS = [
  // ───── ACTOS (escritos editables tipo Word) ─────
  {
    id:"p1", nombre:"Nota de Compras estándar", categoria:"acto",
    area:"obras", tipo:"Nota", version:"v3.1", updated:d(-12), uso:142,
    contenido: `MUNICIPALIDAD DE MALVINAS ARGENTINAS
Secretaría de Obras Públicas y Planificación Urbana

NOTA N° {{NUMERO_NOTA}}
Malvinas Argentinas, {{FECHA}}

Al Sr./Sra. {{DESTINATARIO}}
S / D

   Me dirijo a Ud. en el marco del Expediente N° {{NUMERO_EXPEDIENTE}}, a los efectos de poner en su conocimiento lo siguiente:

{{CUERPO}}

   Sin otro particular, saludo a Ud. atentamente.



                                                          ___________________________
                                                          {{FIRMANTE}}
                                                          {{CARGO_FIRMANTE}}`
  },
  {
    id:"p3", nombre:"Disposición Interna", categoria:"acto",
    area:"gob", tipo:"Disposición", version:"v1.4", updated:d(-8), uso:67,
    contenido: `DISPOSICIÓN N° {{NUMERO_DISPOSICION}}
Malvinas Argentinas, {{FECHA}}

VISTO el Expediente N° {{NUMERO_EXPEDIENTE}}, mediante el cual {{VISTO}};

CONSIDERANDO:

   Que {{CONSIDERANDO_1}};
   Que {{CONSIDERANDO_2}};
   Que es competencia de esta Dirección dictar la presente;

Por ello,

EL DIRECTOR GENERAL DE GOBIERNO
DISPONE:

ARTÍCULO 1°.- {{ARTICULO_1}}.
ARTÍCULO 2°.- Notifíquese, regístrese y archívese.



                                                          ___________________________
                                                          {{FIRMANTE}}`
  },
  {
    id:"p4", nombre:"Dictamen Legal — formato estándar", categoria:"acto",
    area:"dict", tipo:"Dictamen", version:"v2.7", updated:d(-3), uso:218,
    contenido: `DICTAMEN N° {{NUMERO_DICTAMEN}}
Malvinas Argentinas, {{FECHA}}

Expediente: {{NUMERO_EXPEDIENTE}}
Asunto: {{ASUNTO}}

I.- ANTECEDENTES
{{ANTECEDENTES}}

II.- ANÁLISIS LEGAL
{{ANALISIS}}

III.- CONCLUSIÓN
{{CONCLUSION}}

Es cuanto cabe dictaminar.



                                                          ___________________________
                                                          {{FIRMANTE}}
                                                          Dictaminante Legal`
  },
  {
    id:"p5", nombre:"Informe Técnico — Habilitaciones", categoria:"acto",
    area:"tec", tipo:"Informe", version:"v1.2", updated:d(-22), uso:95,
    contenido: `INFORME TÉCNICO N° {{NUMERO_INFORME}}
Expediente N° {{NUMERO_EXPEDIENTE}}
Fecha de inspección: {{FECHA_INSPECCION}}

1. IDENTIFICACIÓN DEL TRÁMITE
Solicitante: {{SOLICITANTE}}
Domicilio del local: {{DOMICILIO_LOCAL}}
Rubro solicitado: {{RUBRO}}

2. DESCRIPCIÓN DE LA INSPECCIÓN
{{DESCRIPCION}}

3. OBSERVACIONES
{{OBSERVACIONES}}

4. CONCLUSIÓN
[ ] El local CUMPLE con los requisitos técnicos
[ ] El local NO CUMPLE — corresponde subsanar

Firma del inspector: ___________________________`
  },
  {
    id:"p6", nombre:"Decreto — Reconocimiento de Servicios", categoria:"acto",
    area:"gob", tipo:"Decreto", version:"v4.0", updated:d(-6), uso:34,
    contenido: `DECRETO N° {{NUMERO_DECRETO}}
Malvinas Argentinas, {{FECHA}}

VISTO el Expediente N° {{NUMERO_EXPEDIENTE}} y;

CONSIDERANDO:

   Que {{CONSIDERANDO}};
   Que corresponde reconocer los servicios prestados por {{BENEFICIARIO}};

Por ello,

EL INTENDENTE MUNICIPAL
DECRETA:

ARTÍCULO 1°.- Reconócese a {{BENEFICIARIO}} la suma de $ {{MONTO}} en concepto de {{CONCEPTO}}.

ARTÍCULO 2°.- El gasto que demande el cumplimiento del presente será imputado a {{IMPUTACION}}.

ARTÍCULO 3°.- Comuníquese, regístrese, dése al Boletín Oficial Municipal y archívese.`
  },
  {
    id:"p7", nombre:"Resolución — Subsidio extraordinario", categoria:"acto",
    area:"gob", tipo:"Resolución", version:"v2.2", updated:d(-18), uso:21,
    contenido: `RESOLUCIÓN N° {{NUMERO_RESOLUCION}}
Malvinas Argentinas, {{FECHA}}

VISTO {{VISTO}}, y

CONSIDERANDO:

{{CONSIDERANDO}}

Por ello,

EL SECRETARIO DE ECONOMÍA Y HACIENDA
RESUELVE:

ARTÍCULO 1°.- {{ARTICULO_1}}.
ARTÍCULO 2°.- Notifíquese y archívese.`
  },
  {
    id:"p8", nombre:"Convenio marco — Plantilla base", categoria:"acto",
    area:"dict", tipo:"Convenio", version:"v1.0", updated:d(-45), uso:12,
    contenido: `CONVENIO MARCO DE COLABORACIÓN

Entre la MUNICIPALIDAD DE MALVINAS ARGENTINAS, representada en este acto por {{REPRESENTANTE_MUNICIPAL}}, con domicilio en {{DOMICILIO_MUNICIPAL}}, en adelante "LA MUNICIPALIDAD", y {{CONTRAPARTE}}, representado por {{REPRESENTANTE_CONTRAPARTE}}, con domicilio en {{DOMICILIO_CONTRAPARTE}}, en adelante "LA CONTRAPARTE", acuerdan celebrar el presente CONVENIO MARCO DE COLABORACIÓN, sujeto a las siguientes cláusulas:

PRIMERA — OBJETO
{{OBJETO}}

SEGUNDA — OBLIGACIONES
{{OBLIGACIONES}}

TERCERA — VIGENCIA
El presente convenio tendrá vigencia de {{VIGENCIA}} a partir de su firma.

CUARTA — JURISDICCIÓN
Las partes se someten a la jurisdicción de los Tribunales Ordinarios del Departamento Judicial de San Martín.

En prueba de conformidad se firman dos ejemplares de un mismo tenor a {{FECHA}}.`
  },
  {
    id:"p10", nombre:"Acta de inspección — Obras", categoria:"acto",
    area:"obras", tipo:"Acta", version:"v3.0", updated:d(-2), uso:73,
    contenido: `ACTA DE INSPECCIÓN N° {{NUMERO_ACTA}}

En el partido de Malvinas Argentinas, a los {{DIA}} días del mes de {{MES}} de {{ANIO}}, siendo las {{HORA}} hs, el/la inspector/a {{INSPECTOR}} se constituyó en {{DOMICILIO}} a los fines de inspeccionar la obra correspondiente al expediente N° {{NUMERO_EXPEDIENTE}}.

DESCRIPCIÓN DE LO OBSERVADO:
{{DESCRIPCION}}

ESTADO DE AVANCE:
{{AVANCE}}

OBSERVACIONES:
{{OBSERVACIONES}}

Firma del inspector: ___________________________
Firma del responsable de obra: ___________________________`
  },

  // ───── FORMULARIOS (campos estructurados) ─────
  {
    id:"f1", nombre:"F-101 — Solicitud de Habilitación Comercial", categoria:"formulario",
    area:"mesa", tipo:"Solicitud", version:"v2.4", updated:d(-7), uso:312,
    campos: [
      { id:"c1", label:"Razón social / Nombre del titular", tipo:"text",   requerido:true  },
      { id:"c2", label:"CUIT / CUIL",                        tipo:"text",   requerido:true  },
      { id:"c3", label:"Domicilio real",                     tipo:"text",   requerido:true  },
      { id:"c4", label:"Email de contacto",                  tipo:"email",  requerido:true  },
      { id:"c5", label:"Teléfono",                            tipo:"text",   requerido:false },
      { id:"c6", label:"Domicilio del local",                tipo:"text",   requerido:true  },
      { id:"c7", label:"Rubro principal",                    tipo:"select", requerido:true, opciones:["Gastronómico","Comercial - Productos","Comercial - Servicios","Industrial","Profesional"] },
      { id:"c8", label:"Superficie del local (m²)",          tipo:"number", requerido:true  },
      { id:"c9", label:"¿Cuenta con habilitación previa?",   tipo:"radio",  requerido:true, opciones:["Sí","No"] },
      { id:"c10",label:"Fecha estimada de apertura",          tipo:"date",   requerido:false },
      { id:"c11",label:"Observaciones",                      tipo:"textarea",requerido:false },
    ],
  },
  {
    id:"f2", nombre:"F-203 — Solicitud de Subsidio", categoria:"formulario",
    area:"gob", tipo:"Solicitud", version:"v1.3", updated:d(-15), uso:88,
    campos: [
      { id:"c1", label:"Nombre de la entidad solicitante",    tipo:"text",     requerido:true  },
      { id:"c2", label:"CUIT de la entidad",                  tipo:"text",     requerido:true  },
      { id:"c3", label:"Tipo de entidad",                      tipo:"select",   requerido:true, opciones:["Asociación civil","Cooperativa","Club","Centro de jubilados","Fundación","Otro"] },
      { id:"c4", label:"Representante legal",                 tipo:"text",     requerido:true  },
      { id:"c5", label:"Monto solicitado ($)",                tipo:"number",   requerido:true  },
      { id:"c6", label:"Destino del subsidio",                tipo:"textarea", requerido:true  },
      { id:"c7", label:"¿Recibió subsidios municipales antes?",tipo:"radio",   requerido:true, opciones:["Sí","No"] },
      { id:"c8", label:"Plazo de ejecución (meses)",          tipo:"number",   requerido:true  },
    ],
  },
  {
    id:"f3", nombre:"F-040 — Cédula de Notificación", categoria:"formulario",
    area:"mesa", tipo:"Notificación", version:"v1.1", updated:d(-90), uso:412,
    campos: [
      { id:"c1", label:"Número de expediente",                tipo:"text",     requerido:true  },
      { id:"c2", label:"Notificado a (nombre completo)",      tipo:"text",     requerido:true  },
      { id:"c3", label:"DNI",                                  tipo:"text",     requerido:true  },
      { id:"c4", label:"Domicilio de notificación",           tipo:"text",     requerido:true  },
      { id:"c5", label:"Motivo de la notificación",           tipo:"textarea", requerido:true  },
      { id:"c6", label:"Fecha límite de respuesta",            tipo:"date",     requerido:false },
      { id:"c7", label:"Modalidad",                           tipo:"radio",    requerido:true, opciones:["Personal","Cédula","Correo certificado","Email"] },
    ],
  },
  {
    id:"f4", nombre:"F-512 — Solicitud de Suministro (Compras)", categoria:"formulario",
    area:"obras", tipo:"Solicitud", version:"v2.0", updated:d(-30), uso:89,
    campos: [
      { id:"c1", label:"Área solicitante",                    tipo:"select",   requerido:true, opciones:["Salud","Obras Públicas","Educación","Desarrollo Social","Ambiente","Otra"] },
      { id:"c2", label:"Responsable del pedido",              tipo:"text",     requerido:true  },
      { id:"c3", label:"Descripción del bien o servicio",     tipo:"textarea", requerido:true  },
      { id:"c4", label:"Cantidad",                             tipo:"number",   requerido:true  },
      { id:"c5", label:"Unidad de medida",                    tipo:"text",     requerido:false },
      { id:"c6", label:"Monto estimado ($)",                  tipo:"number",   requerido:true  },
      { id:"c7", label:"Carácter del pedido",                 tipo:"radio",    requerido:true, opciones:["Urgente","Normal","Programado"] },
      { id:"c8", label:"Justificación del pedido",            tipo:"textarea", requerido:true  },
    ],
  },
  {
    id:"f5", nombre:"F-077 — Declaración Jurada de Domicilio", categoria:"formulario",
    area:"mesa", tipo:"DDJJ", version:"v1.0", updated:d(-60), uso:156,
    campos: [
      { id:"c1", label:"Nombre y apellido",                   tipo:"text",     requerido:true  },
      { id:"c2", label:"DNI",                                  tipo:"text",     requerido:true  },
      { id:"c3", label:"Domicilio declarado",                 tipo:"text",     requerido:true  },
      { id:"c4", label:"Localidad",                            tipo:"select",   requerido:true, opciones:["Grand Bourg","Tortuguitas","Pablo Nogués","Los Polvorines","Villa de Mayo","Adolfo Sourdeaux","Tierras Altas","Ingeniero Pablo Nogués"] },
      { id:"c5", label:"Antigüedad en el domicilio (años)",   tipo:"number",   requerido:false },
      { id:"c6", label:"Acepto que la información declarada es veraz", tipo:"checkbox", requerido:true },
    ],
  },
];
