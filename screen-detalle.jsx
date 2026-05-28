// Detail screen — Vista de expediente con timeline, documentos, circuito, intervención

function ScreenDetalle({ nro, go, openModal }) {
  const exp = window.getExp(nro) || window.EXPEDIENTES[0];
  const [tab, setTab] = useState("docs");
  const venceDias = Math.ceil((new Date(exp.plazoLimite) - new Date("2026-05-27")) / 86400000);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontSize: 13, color: "var(--text-2)" }}>
        <button className="btn btn-sm btn-ghost" onClick={() => go("listado")}><IconChevL size={14}/> Volver</button>
        <NumExp nro={exp.nro}/>
        <EstadoChip estado={exp.estado} />
        <TipoChip tipo={exp.tipo} />
        <ModalidadChip mod={exp.modalidad} />
        {exp.autonomo && <span className="hcd-badge">HCD · Autónomo</span>}
        {exp.importadoDe && <span className="imp-badge">↓ Importado desde {exp.importadoDe}</span>}
        {exp.circuitoEspecial && <span className="chip neutral">{exp.circuitoEspecial}</span>}
        {exp.vencido && <span className="chip err"><span className="chip-dot"/>Vencido</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, lineHeight: 1.25 }}>{exp.titulo}</h1>
          <div style={{ marginTop: 8, fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 720 }}>{exp.objeto}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start", justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => openModal("pdfPreview")}><IconDownload size={14}/> Vista previa PDF</button>
          <button className="btn" title="Guarda el avance actual. El expediente sigue abierto para que otras áreas intervengan."><IconUpload size={14}/> Guardar progreso</button>
          <button className="btn" onClick={() => openModal("derivar")}><IconUsers size={14}/> Derivar</button>
          <button className="btn btn-primary" onClick={() => openModal("firmar")}><IconSign size={14}/> Intervenir / firmar</button>
          {exp.modalidad !== 'restrictiva' && (
            <button className="btn" style={{ background: "var(--warn)", borderColor: "var(--warn)", color: "#fff" }} onClick={() => openModal("forzarPase")} title="Forzar pase a siguiente área">
              <IconAlert size={14}/> Forzar pase
            </button>
          )}
          {exp.modalidad === 'restrictiva' && (
            <span className="chip" style={{ background: "#fee2e2", color: "#991b1b", borderColor: "#fecaca", fontSize: 11, padding: "4px 10px" }} title="No disponible para modalidad restrictiva">
              🔒 Restringido
            </span>
          )}
        </div>
      </div>

      {/* Banner de estado colaborativo / Listo para firmar */}
      <BannerListoFirmar exp={exp} openModal={openModal} />

      {/* Metadata strip */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 18 }}>
          {[
            { k: "Iniciador",       v: exp.iniciador,                                       sub: exp.iniciadorTipo },
            { k: "Fecha de inicio", v: exp.fechaInicio,                                     sub: "Caratulación" },
            { k: "Plazo límite",    v: exp.plazoLimite,                                     sub: <VenceChip dias={venceDias}/> },
            { k: "Área actual",     v: window.getArea(exp.areaActual).nombre,               sub: window.getArea(exp.areaActual).abr },
            { k: "Responsable",     v: "Diego Pérez",                                       sub: "Analista" },
            { k: "Intervinientes",  v: <div style={{ display: "flex", gap: -4 }}>
                {exp.intervinientes.slice(0, 5).map((aid, i) => (
                  <span key={aid} title={window.getArea(aid).nombre}
                    style={{ marginLeft: i ? -6 : 0, width: 24, height: 24, borderRadius: 12, background: "var(--celeste)", color: "#fff", display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 600, border: "2px solid #fff" }}>
                    {window.getArea(aid).abr}
                  </span>
                ))}
                {exp.intervinientes.length > 5 && (
                  <span style={{ marginLeft: -6, width: 24, height: 24, borderRadius: 12, background: "#EEF1F4", color: "var(--text-2)", display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 600, border: "2px solid #fff" }}>
                    +{exp.intervinientes.length - 5}
                  </span>
                )}
              </div>, sub: `${exp.intervinientes.length} áreas` },
          ].map((c, i) => (
            <div key={i}>
              <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)", marginBottom: 4 }}>{c.k}</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{c.v}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="tabs">
        {[
          { id: "docs",     label: `Documentos · ${exp.documentos.length}` },
          { id: "flujo",    label: "Circuito" },
          { id: "hist",     label: "Historial" },
          { id: "seguimiento", label: "Seguimiento" },
          { id: "datos",    label: "Datos del trámite" },
          ...(exp.subExpedientes?.length ? [{ id: "sub", label: `Sub-expedientes · ${exp.subExpedientes.length}` }] : []),
          { id: "notif",    label: "Notificaciones" },
        ].map(t => (
          <div key={t.id} className={"tab " + (tab === t.id ? "active" : "")} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {tab === "flujo"        && <TabFlujo exp={exp} openModal={openModal} />}
      {tab === "docs"         && <TabDocs exp={exp} openModal={openModal} />}
      {tab === "hist"         && <TabHistorial exp={exp} />}
      {tab === "seguimiento"  && <TabSeguimiento exp={exp} />}
      {tab === "datos"        && <TabDatos exp={exp} />}
      {tab === "sub"          && <TabSub exp={exp} />}
      {tab === "notif"        && <TabNotif exp={exp} />}
    </>
  );
}
window.ScreenDetalle = ScreenDetalle;

// ---------- TAB: CIRCUITO ----------
function TabFlujo({ exp, openModal }) {
  const circuito = exp.tipo === "comp" ? window.CIRCUITO_COMPRA : circuitoSimple(exp);
  const pasoActual = exp.pasoActual || 2;
  const mod = window.MODALIDADES[exp.modalidad];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      <div className="card">
        <div className="card-head">
          <h3>Circuito administrativo</h3>
          <ModalidadChip mod={exp.modalidad}/>
          <span className="meta">Decreto 2239/21</span>
        </div>
        <div style={{ padding: "12px 18px", background: mod.bg, borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12.5 }}>
          <span style={{ color: mod.color, marginTop: 1 }}><IconAlert size={14}/></span>
          <div>
            <b style={{ color: mod.color }}>Modalidad {mod.label}.</b>{" "}
            <span style={{ color: "var(--text-2)" }}>{mod.descr}</span>
          </div>
        </div>
        <div className="card-body" style={{ padding: "20px 22px" }}>
          {exp.desvio && (
            <div style={{ background: "var(--warn-bg)", border: "1px solid rgba(201,122,31,.3)", borderRadius: 6, padding: "10px 12px", marginBottom: 14, fontSize: 12.5, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "var(--warn)" }}><IconAlert size={14}/></span>
              <div>
                <b style={{ color: "var(--warn)" }}>Pase forzado registrado.</b>{" "}
                <span style={{ color: "var(--text-2)" }}>
                  El circuito sugiere derivar a <b>{window.getArea(exp.desvio.esperado).nombre}</b>, pero el operador fuerza el pase a <b>{window.getArea(exp.desvio.a).nombre}</b>. Motivo: {exp.desvio.motivo}.
                </span>
              </div>
            </div>
          )}
          {circuito.map((p, i) => {
            const done = i < pasoActual;
            const curr = i === pasoActual;
            return (
              <div key={i} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: i < circuito.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                  background: done ? "var(--verde)" : curr ? "var(--celeste)" : "#fff",
                  color: done || curr ? "#fff" : "var(--text-3)",
                  border: "1.5px solid " + (done ? "var(--verde)" : curr ? "var(--celeste)" : "var(--border-strong)"),
                  display: "grid", placeItems: "center", fontWeight: 600, fontSize: 12,
                  boxShadow: curr ? "0 0 0 4px var(--celeste-soft)" : "none",
                }}>
                  {done ? <IconCheck size={14}/> : p.paso}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontWeight: 500, fontSize: 13.5 }}>{p.accion}</span>
                    <span style={{ fontSize: 11.5, color: "var(--text-2)" }}>· {window.getArea(p.area).nombre}</span>
                  </div>
                  {curr && <div style={{ fontSize: 12, color: "var(--celeste)", marginTop: 3, fontWeight: 500 }}>
                    ● En curso · ingresó hace 2 días
                  </div>}
                </div>
                <div style={{ textAlign: "right", fontSize: 11.5 }}>
                  <div style={{ color: "var(--text-2)" }}>Plazo: <b style={{ color: "var(--text)" }}>{p.plazo}</b></div>
                  {done && <div style={{ color: "var(--verde)", marginTop: 2 }}><IconCheck size={11}/> Cumplido</div>}
                  {curr && <div style={{ color: "var(--warn)", marginTop: 2 }}><IconClock size={11}/> A vencer</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card">
          <div className="card-head"><h3>Acciones disponibles</h3></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px" }}>
            <button className="btn btn-primary" style={{ justifyContent: "flex-start" }} onClick={() => openModal("firmar")}><IconCheck size={14}/> Aprobar y derivar</button>
            <button className="btn" style={{ justifyContent: "flex-start" }} onClick={() => openModal("derivar")}><IconUsers size={14}/> Derivar a otra área…</button>
            <button className="btn" style={{ justifyContent: "flex-start" }}><IconAlert size={14}/> Observar / devolver</button>
            <button className="btn" style={{ justifyContent: "flex-start" }}><IconFile size={14}/> Cargar informe</button>
            <button className="btn btn-danger" style={{ justifyContent: "flex-start" }}><IconX size={14}/> Rechazar fundadamente</button>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Cumplimiento de plazos</h3></div>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>Días transcurridos</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "var(--navy)" }}>{exp.diasTranscurridos}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>Plazo total</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-2)" }}>30d</div>
              </div>
            </div>
            <div style={{ height: 8, background: "#EEF1F4", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: Math.min(100, (exp.diasTranscurridos / 30) * 100) + "%", background: exp.vencido ? "var(--err)" : "var(--celeste)" }}/>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 6 }}>
              Vence el <b style={{ color: "var(--text)" }}>{exp.plazoLimite}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function circuitoSimple(exp) {
  // Generate circuito from intervinientes
  return exp.intervinientes.map((aid, i) => ({
    paso: i + 1,
    area: aid,
    accion: i === 0 ? "Recepción inicial" :
            i === 1 ? "Análisis técnico" :
            i === exp.intervinientes.length - 1 ? "Cierre y archivo" :
            "Intervención de " + window.getArea(aid).nombre,
    plazo: ["2d", "3d", "3d", "2d", "3d", "2d", "3d", "2d", "3d"][i] || "3d",
    estado: "pendiente",
  }));
}

// ---------- TAB: SEGUIMIENTO ----------
function TabSeguimiento({ exp }) {
  const isFunc = window.isFuncionario ? window.isFuncionario() : false;
  const isRestrictivo = exp.modalidad === "restrictiva";
  const circuito = exp.tipo === "comp" ? window.CIRCUITO_COMPRA : circuitoSimple(exp);
  const pasoActual = exp.pasoActual || 0;
  const myArea = window.SESION?.area || "tec";
  
  // Check if current user's area is responsible for current step
  const currentStep = circuito[pasoActual] || null;
  const canAct = currentStep && currentStep.area === myArea;
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
      <div className="card">
        <div className="card-head">
          <h3>Seguimiento del expediente</h3>
          <ModalidadChip mod={exp.modalidad} />
        </div>
        <div className="card-body">
          {isRestrictivo && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "#991b1b" }}><IconShield size={14}/></span>
              <div>
                <b style={{ color: "#991b1b" }}>Modalidad Restrictiva.</b>{" "}
                <span style={{ color: "var(--text-2)" }}>El circuito es cerrado. Solo podés intervenir si el paso actual le corresponde a tu área.</span>
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Progreso del circuito</div>
            <div style={{ height: 8, background: "#EEF1F4", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: Math.min(100, ((pasoActual + 1) / circuito.length) * 100) + "%", background: "var(--celeste)", borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>Paso {pasoActual + 1} de {circuito.length}</div>
          </div>
          
          <div>
            {circuito.map((p, i) => {
              const done = i < pasoActual;
              const curr = i === pasoActual;
              const isMyArea = p.area === myArea;
              return (
                <div key={i} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: i < circuito.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", opacity: isRestrictivo && !isMyArea && !done ? 0.5 : 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                    background: done ? "var(--verde)" : curr && isMyArea ? "var(--celeste)" : "#fff",
                    color: done || (curr && isMyArea) ? "#fff" : "var(--text-3)",
                    border: "1.5px solid " + (done ? "var(--verde)" : curr ? "var(--celeste)" : "var(--border-strong)"),
                    display: "grid", placeItems: "center", fontWeight: 600, fontSize: 11,
                  }}>
                    {done ? <IconCheck size={12}/> : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{p.accion}</span>
                      <span style={{ fontSize: 11, color: "var(--text-2)" }}>· {window.getArea(p.area).nombre}</span>
                      {isMyArea && curr && <span className="chip info" style={{ fontSize: 10 }}>Tu área</span>}
                    </div>
                    {curr && <div style={{ fontSize: 11.5, color: "var(--celeste)", marginTop: 2, fontWeight: 500 }}>● En curso</div>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-2)" }}>Plazo: {p.plazo}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card">
          <div className="card-head"><h3>Acciones de seguimiento</h3></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px" }}>
            {!isRestrictivo && (
              <>
                <button className="btn btn-primary" style={{ justifyContent: "flex-start" }} disabled={!canAct}>
                  <IconCheck size={14}/> Completar paso actual
                </button>
                <button className="btn" style={{ justifyContent: "flex-start" }} disabled={!canAct}>
                  <IconUsers size={14}/> Derivar
                </button>
                <button className="btn" style={{ justifyContent: "flex-start" }} disabled={!canAct}>
                  <IconAlert size={14}/> Observar / devolver
                </button>
              </>
            )}
            {isRestrictivo && canAct && (
              <>
                <button className="btn btn-primary" style={{ justifyContent: "flex-start" }}>
                  <IconCheck size={14}/> Completar paso
                </button>
                <button className="btn" style={{ justifyContent: "flex-start" }}>
                  <IconAlert size={14}/> Observar
                </button>
              </>
            )}
            {isRestrictivo && !canAct && (
              <div style={{ fontSize: 12.5, color: "var(--text-3)", padding: 12, textAlign: "center" }}>
                El paso actual no corresponde a tu área. No hay acciones disponibles.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Resumen</h3></div>
          <div className="card-body" style={{ fontSize: 12.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--text-2)" }}>Días transcurridos</span>
              <b>{exp.diasTranscurridos}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--text-2)" }}>Área actual</span>
              <b>{window.getArea(exp.areaActual).nombre}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--text-2)" }}>Estado</span>
              <EstadoChip estado={exp.estado} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-2)" }}>Modalidad</span>
              <ModalidadChip mod={exp.modalidad} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- TAB: DOCUMENTOS ----------
function TabDocs({ exp, openModal }) {
  const [showPlantillaMenu, setShowPlantillaMenu] = useState(false);
  const [usarPlantilla, setUsarPlantilla] = useState(null); // null | "acto" | "formulario"
  const [hojaOpen, setHojaOpen] = useState(true);
  const [pasoSeleccionado, setPasoSeleccionado] = useState(null);
  const [usarPlantillaLibre, setUsarPlantillaLibre] = useState(false);

  const hoja = exp.hojaFirmas;

  return (
    <div className="card">
      <div className="card-head">
        <h3>Documentación del expediente</h3>
        <div style={{ position: "relative" }}>
          <button className="btn btn-sm" onClick={() => setShowPlantillaMenu(s => !s)}>
            <IconPlus size={14}/> Agregar documento <IconChevD size={11}/>
          </button>
          {showPlantillaMenu && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setShowPlantillaMenu(false)}/>
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 4px)",
                background: "#fff", border: "1px solid var(--border)", borderRadius: 6,
                boxShadow: "var(--shadow-lg)", zIndex: 51, minWidth: 240, padding: 4,
              }}>
                {[
                  { ic: <IconUpload size={14}/>,                            lbl: "Subir archivo desde mi equipo", sub: "PDF, JPG, DOCX… máx 20MB", act: () => { setShowPlantillaMenu(false); } },
                  { ic: <IconFile size={14}/>,                              lbl: "Usar plantilla de Acto",        sub: "Decretos, notas, dictámenes…", act: () => { setShowPlantillaMenu(false); setUsarPlantilla("acto"); } },
                  { ic: <IconList size={14}/>,                              lbl: "Usar plantilla de Formulario",  sub: "Solicitudes, DDJJ, cédulas…",  act: () => { setShowPlantillaMenu(false); setUsarPlantilla("formulario"); } },
                  { ic: <IconFile size={14}/>,                              lbl: "Usar plantilla libre",          sub: "Escribir desde cero o usar una plantilla como base", act: () => { setShowPlantillaMenu(false); setUsarPlantillaLibre(true); } },
                  { ic: <IconDownload size={14}/>,                          lbl: "Importar desde MEAL / RAFAM",   sub: "PDF cerrado de sistema externo", act: () => { setShowPlantillaMenu(false); openModal && openModal("importar"); } },
                ].map((it, i) => (
                  <div key={i}
                    onClick={it.act}
                    style={{
                      display: "flex", gap: 10, padding: "8px 10px",
                      cursor: "pointer", borderRadius: 4,
                      alignItems: "flex-start",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--celeste-50)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ color: "var(--celeste)", marginTop: 2 }}>{it.ic}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{it.lbl}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>{it.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* HOJA DE FIRMAS — destacada por encima del listado */}
      {hoja && <HojaFirmasCard hoja={hoja} exp={exp} open={hojaOpen} setOpen={setHojaOpen} openModal={openModal}/>}
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 30 }}></th>
            <th>Documento</th>
            <th style={{ width: 130 }}>Tipo</th>
            <th style={{ width: 70 }}>Paso</th>
            <th style={{ width: 140 }}>Área que lo aporta</th>
            <th style={{ width: 110 }}>Fecha</th>
            <th style={{ width: 90 }}>Estado</th>
            <th style={{ width: 80 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {exp.documentos.length === 0 && (
            <tr><td colSpan={8}><div className="empty">Sin documentos cargados. Comenzá agregando uno con el botón <b>Agregar documento</b>.</div></td></tr>
          )}
          {exp.documentos.map(d => (
            <tr key={d.id} onClick={(e) => e.stopPropagation()} style={{ cursor: "default" }}>
              <td><div style={{ color: "var(--celeste)" }}><IconFile size={18}/></div></td>
              <td>
                <div className="titulo">{d.nombre}</div>
                <div className="descr">{d.obligatorio ? "Documento obligatorio" : "Adicional"} · v1</div>
              </td>
              <td><span className="chip neutral">{d.tipo}</span></td>
              <td style={{ fontSize: 12.5 }}>{d.pasoCircuito ? <span className="chip neutral">Paso {d.pasoCircuito}</span> : <span style={{ color: "var(--text-3)" }}>—</span>}</td>
              <td style={{ fontSize: 12.5 }}>{window.getArea(d.area).nombre}</td>
              <td style={{ fontSize: 12.5 }}>{d.fecha || <span style={{ color: "var(--text-3)" }}>—</span>}</td>
              <td>
                {d.pendiente ? <span className="chip warn"><span className="chip-dot"/>Pendiente</span> :
                 d.firmado ? <span className="chip ok"><IconCheck size={11}/> Firmado</span> :
                 <span className="chip info"><span className="chip-dot"/>Cargado</span>}
              </td>
              <td style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-sm btn-ghost"><IconDownload size={13}/></button>
                {!d.firmado && !d.pendiente && <button className="btn btn-sm btn-ghost" onClick={() => openModal("firmar")} title="Firmar"><IconSign size={13}/></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {exp.documentos.some(d => d.pendiente) && (
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "var(--warn-bg)", fontSize: 12.5, color: "var(--warn)", display: "flex", alignItems: "center", gap: 8 }}>
          <IconAlert size={14}/> El expediente quedará observado hasta incorporar toda la documentación obligatoria.
        </div>
      )}

      {usarPlantilla && (
        <ModalUsarPlantilla
          categoria={usarPlantilla}
          onClose={() => setUsarPlantilla(null)}
          onUse={(plantilla, values) => {
            // Mock: agregar al expediente
            const nuevoDoc = {
              id: "d" + Date.now(),
              nombre: plantilla.nombre + ".pdf",
              tipo: plantilla.tipo,
              area: window.SESION.area || "tec",
              fecha: new Date().toISOString().slice(0,10),
              usuario: window.SESION.usuario,
              firmado: false,
              obligatorio: false,
              pasoCircuito: null,
            };
            exp.documentos.push(nuevoDoc);
          }}
        />
      )}
      {usarPlantillaLibre && (
        <ModalPlantillaLibre
          exp={exp}
          onClose={() => setUsarPlantillaLibre(false)}
          onUse={(doc) => {
            exp.documentos.push(doc);
          }}
        />
      )}
    </div>
  );
}

// ---------- TAB: HISTORIAL ----------
function TabHistorial({ exp }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>Trazabilidad completa</h3>
        <span className="meta">{exp.historial.length} movimientos registrados</span>
        <button className="btn btn-sm btn-ghost"><IconDownload size={13}/> Exportar</button>
      </div>
      <div className="card-body" style={{ padding: "20px 22px" }}>
        {exp.historial.length === 0 ? (
          <div className="empty">Sin movimientos registrados</div>
        ) : (
          <div className="timeline">
            {[...exp.historial].reverse().map((h, i) => (
              <div key={i} className={"ev " + (i === 0 ? "curr" : "done")}>
                <div className="when">{h.fecha} · {h.hora} hs</div>
                <div className="what">{h.accion}</div>
                <div className="why">{h.detalle}</div>
                <div className="by">
                  <Avatar uid={h.usuario}/>
                  <span>{window.getUser(h.usuario).nombre} · {window.getArea(h.area).nombre}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- TAB: DATOS ----------
function TabDatos({ exp }) {
  return (
    <div className="card">
      <div className="card-head"><h3>Datos del trámite</h3></div>
      <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)", marginBottom: 12 }}>Solicitante</div>
          {[
            ["Razón social / Nombre", exp.iniciador],
            ["Tipo", exp.iniciadorTipo],
            ["CUIT / DNI", "20-32145678-3"],
            ["Domicilio", "Av. Pte. Perón 1242, Grand Bourg"],
            ["Teléfono", "+54 11 4663-2200"],
            ["Email", "j.cardenas@ejemplo.com.ar"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 10, padding: "6px 0", fontSize: 13 }}>
              <div style={{ color: "var(--text-2)" }}>{k}</div>
              <div style={{ fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-3)", marginBottom: 12 }}>Trámite</div>
          {[
            ["Tipo de expediente", window.getTipo(exp.tipo).nombre],
            ["Rubro", window.getTipo(exp.tipo).rubro],
            ["Circuito asociado", "Circuito-HAB-01 · v2.3"],
            ["Norma aplicable", "Ordenanza 4129/22 · Decreto 2239/21"],
            ["Área de inicio", window.getArea(exp.intervinientes[0]).nombre],
            ["Área de cierre", "Archivo Municipal"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 10, padding: "6px 0", fontSize: 13 }}>
              <div style={{ color: "var(--text-2)" }}>{k}</div>
              <div style={{ fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- BANNER: Listo para firmar (gated por rol Jefe de sector) ----------
function BannerListoFirmar({ exp, openModal }) {
  // Solo se muestra cuando el expediente está en estados de carga (no si ya pasó a firma)
  const enCarga = ["borrador", "presentado", "caratulado", "enAnalisis", "intervencion", "pendDoc", "observado"].includes(exp.estado);
  if (!enCarga || !exp.docsRequeridos) return null;

  const completo = exp.docsCargados >= exp.docsRequeridos;
  const pct = Math.round((exp.docsCargados / exp.docsRequeridos) * 100);
  const esJefe = window.SESION.esJefeSector;

  return (
    <div className="card banner-listo-firmar" style={{ marginBottom: 14, borderColor: completo ? "var(--verde)" : "var(--border)", borderWidth: completo ? 1.5 : 1 }}>
      <div className="card-body" style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Estado del expediente</span>
            <EstadoChip estado={exp.estado}/>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>
              En carga colaborativa por {exp.intervinientes.length} áreas
            </span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 8 }}>
            {completo
              ? <>✔ Toda la documentación obligatoria está cargada. El expediente puede marcarse como <b>Listo para firmar</b>.</>
              : <>El expediente está abierto para que otras áreas agreguen formularios, actas e informes. Se guarda automáticamente.</>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, maxWidth: 380, height: 8, background: "#EEF1F4", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: pct + "%", background: completo ? "var(--verde)" : "var(--celeste)", transition: "width .3s" }}/>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>
              <b style={{ color: "var(--text)" }}>{exp.docsCargados}</b> de {exp.docsRequeridos} documentos obligatorios · {pct}%
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch" }}>
          {!esJefe && (
            <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "right", maxWidth: 180 }}>
              Solo el <b style={{ color: "var(--text-2)" }}>Jefe del sector</b> puede dar el OK final.
            </div>
          )}
          <button
            className="btn btn-celeste"
            disabled={!completo || !esJefe}
            style={{ opacity: (!completo || !esJefe) ? .45 : 1, cursor: (!completo || !esJefe) ? "not-allowed" : "pointer" }}
            title={!esJefe ? "Requiere rol Jefe de sector" : !completo ? "Falta documentación obligatoria" : ""}
            onClick={() => openModal("listoFirmar")}
          >
            <IconCheck size={14}/> Marcar como Listo para firmar
          </button>
          {esJefe && (
            <div style={{ fontSize: 10.5, color: "var(--ok)", textAlign: "right", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
              <IconShield size={11}/> Sesión con rol Jefe de sector
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.BannerListoFirmar = BannerListoFirmar;

// ---------- TAB: SUB-EXPEDIENTES (internos, no salen del área de origen) ----------
function TabSub({ exp }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>Sub-expedientes de seguimiento interno</h3>
        <span className="meta">Trámites internos del área · no salen del área de origen</span>
        <button className="btn btn-sm btn-primary"><IconPlus size={13}/> Nuevo sub-expediente</button>
      </div>
      <div style={{ padding: "10px 18px 18px" }}>
        <div style={{ background: "var(--celeste-50)", padding: 12, borderRadius: 6, fontSize: 12.5, color: "var(--text-2)", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: "var(--celeste)" }}><IconAlert size={14}/></span>
          <div>
            Estos expedientes permiten a la Secretaría llevar el control técnico interno (certificados de avance, cómputos, observaciones a la empresa)
            sin obligar al expediente a salir del área de origen. No son <i>erga omnes</i>.
          </div>
        </div>
        {exp.subExpedientes.map(s => (
          <div key={s.nro} className="sub-exp">
            <div className="ic"><IconFile size={14}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.titulo}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{s.nro}</div>
            </div>
            <span className="chip neutral" style={{ fontSize: 10.5 }}>Interno · sólo área</span>
            <button className="btn btn-sm btn-ghost">Abrir <IconChevR size={11}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
window.TabSub = TabSub;
function TabNotif({ exp }) {
  // Expedientes recién creados / borradores no tienen notificaciones aún
  const isEmpty = exp.estado === "borrador" || (exp.historial || []).length <= 1;
  const notifs = isEmpty ? [] : [
    { fecha: "27/05/2026 11:42", tipo: "interna", para: "Área Técnica", asunto: "Expediente derivado para análisis", estado: "leida" },
    { fecha: "18/05/2026 09:15", tipo: "externa", para: "Juan Cárdenas (solicitante)", asunto: "Acuse de recepción de presentación", estado: "leida" },
    { fecha: "16/05/2026 14:08", tipo: "externa", para: "Juan Cárdenas (solicitante)", asunto: "Solicitud de documentación faltante", estado: "respondida" },
  ];
  return (
    <div className="card">
      <div className="card-head">
        <h3>Notificaciones</h3>
        <button className="btn btn-sm btn-primary">Nueva notificación</button>
      </div>
      {notifs.length === 0 ? (
        <div className="empty" style={{ padding: "40px 20px" }}>
          Aún no se enviaron notificaciones para este expediente.
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 6 }}>Las notificaciones se generan automáticamente al derivar, observar o resolver.</div>
        </div>
      ) : (
        <table className="tbl">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Destinatario</th><th>Asunto</th><th>Estado</th></tr></thead>
          <tbody>
            {notifs.map((n, i) => (
              <tr key={i} style={{ cursor: "default" }}>
                <td className="nro">{n.fecha}</td>
                <td><span className={"chip " + (n.tipo === "externa" ? "info" : "neutral")}>{n.tipo}</span></td>
                <td>{n.para}</td>
                <td>{n.asunto}</td>
                <td>{n.estado === "respondida" ? <span className="chip ok"><IconCheck size={11}/> Respondida</span> : <span className="chip neutral">Leída</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ---------- HOJA DE FIRMAS — destacada arriba del listado de documentos ----------
function HojaFirmasCard({ hoja, exp, open, setOpen, openModal }) {
  const total = (hoja.firmasRequeridas || []).length;
  const hechas = (hoja.firmas || []).length;
  const pct = total ? Math.round((hechas / total) * 100) : 0;
  const cerrada = hoja.estado === "cerrada";
  // Próximas firmas pendientes (en orden)
  const pendientes = (hoja.firmasRequeridas || []).filter(req =>
    !(hoja.firmas || []).some(f => f.area === req.area)
  );
  const ultimaFirma = (hoja.firmas || [])[hoja.firmas.length - 1];

  return (
    <div className={"hoja-firmas " + (cerrada ? "is-cerrada" : "is-abierta")}>
      {/* Cabecera tipo "documento destacado" */}
      <div className="hoja-firmas-head" onClick={() => setOpen(o => !o)}>
        <div className="hf-stamp" aria-hidden="true">
          <IconSign size={26}/>
        </div>
        <div className="hf-meta">
          <div className="hf-titulo-row">
            <span className="hf-tag">DOCUMENTO INSTITUCIONAL</span>
            <span className={"hf-estado " + (cerrada ? "cerrada" : "abierta")}>
              {cerrada
                ? <><IconCheck size={11}/> Cerrada · {hechas} firma{hechas === 1 ? "" : "s"}</>
                : <><span className="hf-pulse"/> En recolección · {hechas} de {total}</>}
            </span>
          </div>
          <div className="hf-titulo">Hoja de firmas</div>
          <div className="hf-sub">
            <span className="nro">{hoja.numero}</span>
            <span className="dot">·</span>
            <span>Iniciada {hoja.abiertaEn}</span>
            {cerrada && <><span className="dot">·</span><span>Cerrada {hoja.cerradaEn}</span></>}
            <span className="dot">·</span>
            <span>Hash {hoja.hash}</span>
          </div>
        </div>
        <div className="hf-actions">
          <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); }}>
            <IconDownload size={13}/> Descargar
          </button>
          {!cerrada && (
            <button className="btn btn-sm btn-celeste" onClick={(e) => { e.stopPropagation(); openModal && openModal("firmar"); }}>
              <IconSign size={13}/> Firmar
            </button>
          )}
          <button className="btn btn-sm btn-ghost" aria-label={open ? "Contraer" : "Expandir"}>
            {open ? <IconChevD size={13}/> : <IconChevR size={13}/>}
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      {!cerrada && (
        <div className="hf-progress-wrap">
          <div className="hf-progress">
            <div className="hf-progress-bar" style={{ width: pct + "%" }}/>
          </div>
          <span className="hf-progress-lbl">{pct}% · faltan {pendientes.length} firma{pendientes.length === 1 ? "" : "s"}</span>
        </div>
      )}

      {/* Detalle expandible */}
      {open && (
        <div className="hf-body">
          <div className="hf-firmas-titulo">
            Firmantes
            <span className="hf-cnt">{hechas} de {total}</span>
          </div>

          <ol className="hf-firmas">
            {(hoja.firmasRequeridas || []).map((req, i) => {
              const f = (hoja.firmas || []).find(x => x.area === req.area);
              const proxima = !f && pendientes[0] && pendientes[0].area === req.area && !cerrada;
              const areaNombre = window.getArea(req.area).nombre || req.area;
              return (
                <li key={req.area + i} className={"hf-firma " + (f ? "firmada" : proxima ? "proxima" : "pendiente")}>
                  <div className="hf-firma-orden">{i + 1}</div>
                  <div className="hf-firma-info">
                    <div className="hf-firma-cargo">{req.cargo}</div>
                    <div className="hf-firma-area">{areaNombre}</div>
                  </div>
                  {f ? (
                    <>
                      <div className="hf-firma-trazo">
                        <div className="signature signature-sm">{window.getUser(f.usuario).nombre || ""}</div>
                        <div className="hf-firma-quien">
                          {window.getUser(f.usuario).nombre} · DNI {window.SESION?.usuario === f.usuario ? "32.145.678" : "—"}
                        </div>
                      </div>
                      <div className="hf-firma-fecha">
                        <div className="ts">{f.fecha} · {f.hora} hs</div>
                        <div className="hh">Hash {f.hash}</div>
                        {f.comentario && <div className="cm" title={f.comentario}>“{f.comentario}”</div>}
                      </div>
                      <div className="hf-firma-chip">
                        <span className="chip ok"><IconCheck size={11}/> Firmada</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="hf-firma-trazo placeholder">
                        <div className="hf-line"/>
                        <div className="hf-firma-quien muted">{proxima ? "Tu próxima intervención" : "Pendiente de firma"}</div>
                      </div>
                      <div className="hf-firma-fecha muted">
                        <div className="ts">—</div>
                      </div>
                      <div className="hf-firma-chip">
                        <span className={"chip " + (proxima ? "warn" : "neutral")}>
                          <span className="chip-dot"/>{proxima ? "Próxima" : "Pendiente"}
                        </span>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Pie informativo */}
          <div className="hf-foot">
            <div className="hf-foot-ic"><IconShield size={14}/></div>
            <div>
              La Hoja de firmas se genera automáticamente al iniciar el circuito de firma. Acumula la rúbrica de cada jefatura
              aprobante con sello de tiempo y hash criptográfico. Al cerrarse, se incorpora como pieza institucional del expediente
              y constituye la pieza probatoria del acto administrativo.
              {ultimaFirma && !cerrada && <> Última firma registrada: <b>{window.getUser(ultimaFirma.usuario).nombre}</b> el {ultimaFirma.fecha} a las {ultimaFirma.hora} hs.</>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ---------- MODAL: PLANTILLA LIBRE ----------
function ModalPlantillaLibre({ exp, onClose, onUse }) {
  const [modo, setModo] = useState(null); // null | "plantilla" | "desde_cero"
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [contenido, setContenido] = useState("");
  const [pasoCircuito, setPasoCircuito] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState(null);

  const pasosCircuito = exp.tipo === "comp" ? window.CIRCUITO_COMPRA : circuitoSimple(exp);
  const plantillasActo = window.PLANTILLAS.filter(p => p.categoria === "acto");

  // Auto-save simulation
  useEffect(() => {
    if (contenido && modo === "desde_cero") {
      setGuardando(true);
      const timer = setTimeout(() => {
        setGuardando(false);
        setUltimoGuardado(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [contenido, modo]);

  const handleUsePlantilla = (p) => {
    setPlantillaSeleccionada(p);
    setContenido(p.contenido || "");
    setModo("desde_cero");
  };

  const handleGuardar = () => {
    const doc = {
      id: "d" + Date.now(),
      nombre: (plantillaSeleccionada ? plantillaSeleccionada.nombre : "Documento libre") + ".pdf",
      tipo: plantillaSeleccionada ? plantillaSeleccionada.tipo : "Documento",
      area: window.SESION.area || "tec",
      fecha: new Date().toISOString().slice(0,10),
      usuario: window.SESION.usuario,
      firmado: false,
      obligatorio: false,
      pasoCircuito: pasoCircuito || null,
    };
    onUse(doc);
    onClose();
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()} style={{ width: 900, maxWidth: "94vw", height: "90vh", maxHeight: "90vh" }}>
        <div className="modal-head">
          <h3>Plantilla libre</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1, minHeight: 0 }}>
          {/* STEP 0: Choose mode */}
          {!modo && (
            <div style={{ padding: "20px 22px" }}>
              <div style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 14 }}>
                Elegí cómo querés crear el documento:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="circuit-card" onClick={() => setModo("plantilla")} style={{ cursor: "pointer", padding: 24, textAlign: "center" }}>
                  <div style={{ color: "var(--celeste)", marginBottom: 10 }}><IconFile size={36}/></div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Elegir plantilla existente</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>Partí de una plantilla de Acto ya formateada (Decretos, Notas, Dictámenes...)</div>
                </div>
                <div className="circuit-card" onClick={() => setModo("desde_cero")} style={{ cursor: "pointer", padding: 24, textAlign: "center" }}>
                  <div style={{ color: "var(--ok)", marginBottom: 10 }}><IconFile size={36}/></div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Escribir desde cero</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>Crear un documento nuevo sin plantilla, escribiendo libremente</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1a: Pick template */}
          {modo === "plantilla" && !plantillaSeleccionada && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "0 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 12px", flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>Seleccioná una plantilla:</div>
                <button className="btn btn-sm" onClick={() => setModo(null)}><IconChevL size={13}/> Volver</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, overflowY: "auto", flex: 1, paddingBottom: 20 }}>
                {plantillasActo.map(p => (
                  <div key={p.id} className="circuit-card" onClick={() => handleUsePlantilla(p)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--celeste-50)", color: "var(--celeste)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <IconFile size={15}/>
                      </div>
                      <span className="chip neutral" style={{ fontSize: 10, padding: "1px 6px" }}>{p.tipo}</span>
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.nombre}</div>
                    <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 3 }}>{window.getArea(p.area).nombre} · v{p.version}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1b: Editor */}
          {modo === "desde_cero" && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 22px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="btn btn-sm" onClick={() => { setModo(plantillaSeleccionada ? "plantilla" : null); if (!plantillaSeleccionada) setPlantillaSeleccionada(null); setContenido(""); }}>
                    <IconChevL size={13}/> {plantillaSeleccionada ? "Cambiar plantilla" : "Volver"}
                  </button>
                  {plantillaSeleccionada && <span className="chip info"><IconFile size={11}/> {plantillaSeleccionada.nombre}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {guardando && (
                    <span style={{ fontSize: 11, color: "var(--warn)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="chip-dot" style={{ background: "var(--warn)" }}/> Guardando...
                    </span>
                  )}
                  {!guardando && ultimoGuardado && (
                    <span style={{ fontSize: 11, color: "var(--ok)", display: "flex", alignItems: "center", gap: 4 }}>
                      <IconCheck size={11}/> Guardado {ultimoGuardado}
                    </span>
                  )}
                </div>
              </div>

              <div className="field" style={{ margin: "0 22px 10px", flexShrink: 0 }}>
                <label>Paso del circuito relacionado</label>
                <select value={pasoCircuito || ""} onChange={e => setPasoCircuito(e.target.value ? parseInt(e.target.value) : null)}>
                  <option value="">Seleccionar paso...</option>
                  {pasosCircuito.map(p => (
                    <option key={p.paso} value={p.paso}>Paso {p.paso} — {p.accion} ({window.getArea(p.area).abr})</option>
                  ))}
                </select>
              </div>

              <div style={{ margin: "0 22px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 4, flexShrink: 0 }}>Contenido del documento</label>
                {/* Toolbar de edición */}
                <div style={{ display: "flex", gap: 4, padding: "5px 10px", border: "1px solid var(--border-strong)", borderBottom: 0, borderRadius: "4px 4px 0 0", background: "var(--surface-2)", flexWrap: "wrap", flexShrink: 0 }}>
                  {[
                    { lbl: "B", style: { fontWeight: 700 } },
                    { lbl: "I", style: { fontStyle: "italic" } },
                    { lbl: "U", style: { textDecoration: "underline" } },
                  ].map(b => (
                    <button key={b.lbl} className="btn btn-sm btn-ghost" style={{ padding: "2px 8px", fontSize: 12, ...b.style }}>{b.lbl}</button>
                  ))}
                  <div style={{ width: 1, background: "var(--border)", margin: "2px 4px" }}/>
                  {["H1", "H2", "•", "1.", "❝"].map((b, i) => (
                    <button key={i} className="btn btn-sm btn-ghost" style={{ padding: "2px 8px", fontSize: 11 }}>{b}</button>
                  ))}
                  <div style={{ width: 1, background: "var(--border)", margin: "2px 4px" }}/>
                  <select style={{ padding: "2px 8px", border: "1px solid var(--border)", borderRadius: 3, fontSize: 11.5, background: "#fff" }}>
                    <option>Times 12</option><option>Arial 11</option><option>Calibri 11</option>
                  </select>
                  <div style={{ width: 1, background: "var(--border)", margin: "2px 4px" }}/>
                  <button className="btn btn-sm btn-ghost" style={{ padding: "2px 6px", fontSize: 11 }} title="Insertar placeholder">{"{ }"}</button>
                </div>
                <textarea
                  value={contenido}
                  onChange={e => setContenido(e.target.value)}
                  placeholder="Escribí el contenido del documento aquí..."
                  style={{ flex: 1, width: "100%", minHeight: 0, fontFamily: "'Times New Roman', Georgia, serif", fontSize: 13.5, lineHeight: 1.6, padding: "14px 18px", border: "1px solid var(--border-strong)", borderTop: 0, borderRadius: "0 0 4px 4px", resize: "none" }}
                />
              </div>
            </div>
          )}
        </div>

        {modo === "desde_cero" && (
          <div className="modal-foot">
            <button className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleGuardar} disabled={!contenido.trim()} style={{ opacity: !contenido.trim() ? .5 : 1 }}>
              <IconCheck size={14}/> Adjuntar al expediente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
window.ModalPlantillaLibre = ModalPlantillaLibre;

window.HojaFirmasCard = HojaFirmasCard;
