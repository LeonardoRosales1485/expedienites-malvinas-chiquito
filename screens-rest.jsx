// Alta, Auditoría, Reportes, Circuitos, Mesa Virtual, Plantillas + Modals

// =========== ALTA — WIZARD ===========
function ScreenAlta({ go }) {
  const [paso, setPaso] = useState(1);
  const defaultCat = (window.TIPOS_CATALOGO || []).find(t => t.id === "hab-comercio") || (window.TIPOS_CATALOGO || [])[0];
  const [form, setForm] = useState({
    tipoCatId: defaultCat ? defaultCat.id : "",
    tipo: defaultCat ? defaultCat.base : "hab",
    modalidad: defaultCat ? defaultCat.modalidad : "restrictiva",
    solicitanteTipo: "Externo",
    origenes: ["Vecino / Comerciante"],
    solicitanteNombre: "",
    cuit: "",
    email: "",
    telefono: "",
    domicilio: "",
    objeto: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleOrigen = (o) => setForm(f => ({
    ...f,
    origenes: f.origenes.includes(o) ? f.origenes.filter(x => x !== o) : [...f.origenes, o],
  }));
  const selectTipoCat = (cat) => setForm(f => ({
    ...f,
    tipoCatId: cat.id,
    tipo: cat.base,
    modalidad: cat.modalidad,
  }));

  const pasos = [
    { n: 1, label: "Tipo y origen" },
    { n: 2, label: "Solicitante" },
    { n: 3, label: "Documentación" },
    { n: 4, label: "Confirmación" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Nuevo expediente</h1>
          <div className="sub">Al confirmar, la presentación se envía a la <b>Mesa de Entrada Virtual</b> para validación y caratulación oficial</div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => go("listado")}>Cancelar</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="stepper">
            {pasos.map((p, i) => (
              <React.Fragment key={p.n}>
                <div className={"step " + (paso === p.n ? "active" : paso > p.n ? "done" : "")}>
                  <div className="n">{paso > p.n ? <IconCheck size={13}/> : p.n}</div>
                  <span>{p.label}</span>
                </div>
                {i < pasos.length - 1 && <div className={"bar " + (paso > p.n ? "done" : "")}/>}
              </React.Fragment>
            ))}
          </div>

          {paso === 1 && <PasoTipo form={form} set={set} toggleOrigen={toggleOrigen} selectTipoCat={selectTipoCat} />}
          {paso === 2 && <PasoSolicitante form={form} set={set} />}
          {paso === 3 && <PasoDocumentacion form={form} set={set} />}
          {paso === 4 && <PasoConfirmacion form={form} go={go} />}

          <div className="divider" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button className="btn" onClick={() => paso > 1 ? setPaso(paso - 1) : go("listado")}>
              <IconChevL size={14}/> {paso === 1 ? "Cancelar" : "Anterior"}
            </button>
            {paso < 4 ? (
              <button className="btn btn-primary" onClick={() => setPaso(paso + 1)}>
                Continuar <IconChevR size={14}/>
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => go("listado")}>
                  Guardar y salir
                </button>
                <button className="btn btn-celeste" onClick={() => {
                  const t = window.getTipo(form.tipo);
                  const cat = window.getTipoCat && window.getTipoCat(form.tipoCatId);
                  const draft = window.getExp("E-4132-9.000.612-2026");
                  // Docs requeridos por tipo (alineado con PasoDocumentacion)
                  const reqByTipo = { hab:5, comp:4, subs:4, viv:4, apr:3, conv:3, obra:3, gen:0, hcd:2 };
                  if (draft) {
                    draft.tipo = form.tipo;
                    draft.modalidad = form.modalidad || t.modalidad;
                    draft.objeto = form.objeto || draft.objeto;
                    if (form.objeto) {
                      draft.titulo = form.objeto.length > 70 ? form.objeto.slice(0, 70) + "…" : form.objeto;
                    } else {
                      draft.titulo = `Expediente sin caratular — ${cat ? cat.nombre : t.nombre}`;
                    }
                    if (form.solicitanteNombre) draft.iniciador = form.solicitanteNombre;
                    draft.iniciadorTipo = form.solicitanteTipo;
                    if (form.origenes && form.origenes.length) draft.origenes = [...form.origenes];
                    draft.docsRequeridos = reqByTipo[form.tipo] ?? 5;
                    draft.docsCargados = 0;
                    // Para libre/Circuito 53, no hay intervinientes fijos
                    if ((form.modalidad || t.modalidad) === "libre") {
                      draft.intervinientes = ["tec"];
                      draft.circuitoEspecial = form.tipo === "gen" ? "Circuito General 53" : undefined;
                    } else {
                      draft.intervinientes = ["mesa", "tec"];
                      draft.circuitoEspecial = undefined;
                    }
                  }
                  go("detalle", "E-4132-9.000.612-2026");
                }}>
                  <IconCheck size={14}/> Guardar borrador y continuar cargando
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
window.ScreenAlta = ScreenAlta;

function PasoTipo({ form, set, toggleOrigen, selectTipoCat }) {
  const isFunc = window.isFuncionario ? window.isFuncionario() : false;
  const catalogo = window.TIPOS_CATALOGO || [];
  const rubros = React.useMemo(() => {
    const seen = [];
    catalogo.forEach(c => { if (!seen.includes(c.rubro)) seen.push(c.rubro); });
    return seen;
  }, []);
  const [query, setQuery] = useState("");
  const [rubroFiltro, setRubroFiltro] = useState(isFunc ? "Habilitaciones y comercio" : "todos");
  const [modFiltro, setModFiltro] = useState("todas");

  const sel = window.getTipoCat ? window.getTipoCat(form.tipoCatId) : null;

  const norm = (s) => (s || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const q = norm(query.trim());

  const filtrados = catalogo.filter(c => {
    if (rubroFiltro !== "todos" && c.rubro !== rubroFiltro) return false;
    if (modFiltro !== "todas"   && c.modalidad !== modFiltro) return false;
    if (q && !norm(c.nombre).includes(q) && !norm(c.rubro).includes(q)) return false;
    return true;
  });

  // Agrupar por rubro para mostrar
  const agrupados = React.useMemo(() => {
    const map = new Map();
    filtrados.forEach(c => {
      if (!map.has(c.rubro)) map.set(c.rubro, []);
      map.get(c.rubro).push(c);
    });
    return [...map.entries()];
  }, [filtrados]);

  // Conteo por rubro (respetando modFiltro y query, pero no rubroFiltro)
  const conteoRubro = React.useMemo(() => {
    const m = { todos: 0 };
    rubros.forEach(r => m[r] = 0);
    catalogo.forEach(c => {
      if (modFiltro !== "todas" && c.modalidad !== modFiltro) return;
      if (q && !norm(c.nombre).includes(q) && !norm(c.rubro).includes(q)) return;
      m[c.rubro] = (m[c.rubro] || 0) + 1;
      m.todos++;
    });
    return m;
  }, [modFiltro, q, rubros]);

  const todosOrigenes = [
    "Vecino / Comerciante",
    "Salud", "Obras Públicas", "Educación", "Desarrollo Social",
    "Ambiente", "Producción", "Ingresos Tributarios", "Viviendas",
    "Compras", "Sec. General", "Otra repartición"
  ];

  const modOpts = [
    { id: "todas",        label: "Todas",        color: "var(--text-2)" },
    { id: "libre",        label: "Libre",        color: window.MODALIDADES.libre.color },
    { id: "orientativa",  label: "Orientativa",  color: window.MODALIDADES.orientativa.color },
    { id: "restrictiva",  label: "Restrictiva",  color: window.MODALIDADES.restrictiva.color },
  ];

  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Tipo de trámite</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        Buscá por nombre o filtrá por rubro y modalidad. Cada tipo activa un circuito configurado, con su propia modalidad de control, documentación obligatoria y plazos.
      </p>

      {/* Buscador + filtros de modalidad */}
      <div className="tipo-buscador">
        <div className="tipo-search">
          <span className="ic"><IconSearch size={14}/></span>
          <input
            type="text"
            placeholder="Buscar trámite por nombre o rubro…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="clear" onClick={() => setQuery("")} title="Limpiar"><IconX size={11}/></button>
          )}
        </div>
        <div className="tipo-modfilt">
          {modOpts.map(o => (
            <button
              key={o.id}
              type="button"
              className={"mod-filt " + (modFiltro === o.id ? "active" : "")}
              style={modFiltro === o.id && o.id !== "todas" ? { borderColor: o.color, background: o.color + "14", color: o.color } : undefined}
              onClick={() => setModFiltro(o.id)}
            >
              {o.id !== "todas" && <span className="mod-filt-dot" style={{ background: o.color }}/>}
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chips de rubro */}
      <div className="rubro-chips">
        <button
          type="button"
          className={"rubro-chip " + (rubroFiltro === "todos" ? "active" : "")}
          onClick={() => setRubroFiltro("todos")}
        >
          Todos los rubros <span className="n">{conteoRubro.todos}</span>
        </button>
        {rubros.map(r => {
          const n = conteoRubro[r] || 0;
          if (n === 0 && rubroFiltro !== r) return null;
          return (
            <button
              key={r}
              type="button"
              className={"rubro-chip " + (rubroFiltro === r ? "active" : "")}
              onClick={() => setRubroFiltro(r)}
              disabled={n === 0 && rubroFiltro !== r}
            >
              {r} <span className="n">{n}</span>
            </button>
          );
        })}
      </div>

      {/* Selección actual destacada */}
      {sel && (
        <div className="tipo-actual">
          <span className="lbl">Seleccionado</span>
          <span className="nombre">{sel.nombre}</span>
          <span className="sep">·</span>
          <span className="rub">{sel.rubro}</span>
          <ModalidadChip mod={sel.modalidad}/>
        </div>
      )}

      {/* Lista de trámites agrupados */}
      <div className="tipo-lista">
        {agrupados.length === 0 && (
          <div className="empty" style={{ padding: "32px 14px", textAlign: "center", color: "var(--text-3)" }}>
            No se encontraron trámites con esos filtros.
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-sm" onClick={() => { setQuery(""); setModFiltro("todas"); setRubroFiltro("todos"); }}>
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
        {agrupados.map(([rubro, items]) => (
          <div key={rubro} className="tipo-grupo">
            <div className="tipo-grupo-head">
              <span>{rubro}</span>
              <span className="cnt">{items.length}</span>
            </div>
            <div className="tipo-grupo-items">
              {items.map(c => {
                const isSel = form.tipoCatId === c.id;
                return (
                  <label
                    key={c.id}
                    className={"tipo-row" + (isSel ? " selected" : "")}
                    onClick={() => selectTipoCat(c)}
                  >
                    <span className={"tipo-radio" + (isSel ? " on" : "")}>
                      {isSel && <IconCheck size={11}/>}
                    </span>
                    <span className="tipo-nombre">
                      {highlightMatch(c.nombre, q)}
                    </span>
                    <ModalidadChip mod={c.modalidad}/>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {sel && sel.modalidad === "libre" && (
        <div style={{ marginTop: 14, padding: 12, background: "#FEFCE8", border: "1px solid #FDE68A", borderRadius: 6, fontSize: 12.5, color: "#854D0E" }}>
          <b>Modalidad libre.</b> No tiene pasos obligatorios — el operador define dinámicamente los destinos y la documentación según el caso.
        </div>
      )}

      <div className="divider"/>

      <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>Origen del trámite</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0, marginBottom: 12 }}>
        Un mismo tipo de trámite puede ser impulsado por distintas secretarías o por la presentación espontánea de un vecino. Marcá <b>todos los orígenes</b> que correspondan.
      </p>

      <div className="origen-grid">
        {todosOrigenes.map(o => (
          <label key={o} className={form.origenes.includes(o) ? "checked" : ""}>
            <input type="checkbox" checked={form.origenes.includes(o)} onChange={() => toggleOrigen(o)} />
            {o}
          </label>
        ))}
      </div>

      <div style={{ marginTop: 14, padding: 12, background: "var(--celeste-50)", borderRadius: 6, fontSize: 12.5, color: "var(--text-2)", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ color: "var(--celeste)" }}><IconBuilding size={14}/></span>
        <div>
          Al guardar, el trámite se enviará automáticamente a la <b style={{ color: "var(--text)" }}>Mesa de Entrada Virtual</b>.
          El operador de Mesa validará la documentación y emitirá la caratulación electrónica oficial con un solo botón.
        </div>
      </div>
    </div>
  );
}

// Resalta coincidencias de la búsqueda
function highlightMatch(texto, q) {
  if (!q) return texto;
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const tN = norm(texto);
  const i = tN.indexOf(q);
  if (i < 0) return texto;
  return <>
    {texto.slice(0, i)}
    <mark style={{ background: "var(--celeste-50)", color: "var(--navy)", padding: 0, fontWeight: 600 }}>{texto.slice(i, i + q.length)}</mark>
    {texto.slice(i + q.length)}
  </>;
}

function PasoSolicitante({ form, set }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Datos del solicitante</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        Cargá la información del iniciador del trámite.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginTop: 16 }}>
        <div className="field">
          <label>Razón social / Nombre completo <span className="req">*</span></label>
          <input type="text" placeholder="Ej. Juan Cárdenas" value={form.solicitanteNombre} onChange={e => set("solicitanteNombre", e.target.value)} />
        </div>
        <div className="field">
          <label>CUIT / DNI <span className="req">*</span></label>
          <input type="text" placeholder="20-XXXXXXXX-X" value={form.cuit} onChange={e => set("cuit", e.target.value)}/>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label>Email <span className="req">*</span></label>
          <input type="email" placeholder="solicitante@ejemplo.com" value={form.email} onChange={e => set("email", e.target.value)}/>
        </div>
        <div className="field">
          <label>Teléfono</label>
          <input type="text" placeholder="+54 11 ..." value={form.telefono} onChange={e => set("telefono", e.target.value)}/>
        </div>
      </div>

      <div className="field">
        <label>Domicilio</label>
        <input type="text" placeholder="Calle, número, localidad" value={form.domicilio} onChange={e => set("domicilio", e.target.value)}/>
      </div>

      <div className="field">
        <label>Objeto del trámite <span className="req">*</span></label>
        <textarea placeholder="Describí brevemente el objeto y la pretensión del expediente…" value={form.objeto} onChange={e => set("objeto", e.target.value)}/>
        <div className="hint">El objeto formará parte de la carátula formal del expediente.</div>
      </div>
    </div>
  );
}

function PasoDocumentacion({ form }) {
  const docsRequeridos = {
    hab:  ["Formulario F-101 Solicitud", "DNI titular", "Contrato de alquiler o título", "Plano de local firmado por matriculado", "Libre deuda tributario"],
    comp: ["Solicitud de área originante", "Especificaciones técnicas", "Tres presupuestos", "Factibilidad presupuestaria"],
    subs: ["Solicitud y justificación", "Personería del beneficiario", "Presupuesto / cotización", "Plan de ejecución"],
    viv:  ["Formulario solicitud", "DNI familiar", "Acta de adjudicación", "Croquis y mensura"],
    apr:  ["Liquidación de deuda", "Constancia de notificación previa", "Padrón actualizado"],
    conv: ["Proyecto de convenio", "Personería de la contraparte", "Plan de actividades"],
    obra: ["Formulario inicio obra", "Plano firmado por matriculado", "Aporte profesional"],
    gen:  ["Documentación libre — se adjunta según el caso"],
    hcd:  ["Proyecto de ordenanza", "Fundamentos"],
  }[form.tipo] || [];
  const mod = form.modalidad || window.getTipo(form.tipo).modalidad;

  const initialCargados = mod === "libre" ? [] : [0, 1];
  const [cargados, setCargados] = useState(initialCargados);
  useEffect(() => { setCargados(mod === "libre" ? [] : [0, 1]); }, [form.tipo, mod]);

  // Documentos adicionales agregados desde plantilla
  const [extras, setExtras] = useState([]);
  const [usarPlantilla, setUsarPlantilla] = useState(null); // null | "acto" | "formulario" | "libre"
  const [showMenu, setShowMenu] = useState(false);

  const toggle = (i) => setCargados(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);

  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Documentación</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        {mod === "restrictiva"
          ? <>El circuito en modalidad <b style={{ color: "var(--ok)" }}>restrictiva</b> exige toda la documentación obligatoria antes de avanzar.</>
          : mod === "orientativa"
          ? <>El circuito en modalidad <b style={{ color: "var(--info)" }}>orientativa</b> sugiere la documentación; podés enviar y completar más adelante.</>
          : <>El circuito en modalidad <b>libre</b> permite adjuntar cualquier documento sin requisitos fijos. Cargá los que necesites a medida que avance el trámite.</>}
      </p>

      <div style={{ marginTop: 16 }}>
        {docsRequeridos.map((doc, i) => {
          const cargado = cargados.includes(i);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 6,
              marginBottom: 8, background: cargado ? "var(--ok-bg)" : "var(--surface-2)",
            }}>
              <div style={{ color: cargado ? "var(--ok)" : "var(--text-3)" }}>
                {cargado ? <IconCheck size={18}/> : <IconFile size={18}/>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{doc}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>
                  {cargado
                    ? `Cargado · documento_${i+1}.pdf`
                    : (mod === "libre" ? "Opcional · PDF / JPG · máx 10MB" : "Obligatorio · PDF / JPG · máx 10MB")}
                </div>
              </div>
              {cargado ? (
                <button className="btn btn-sm btn-ghost" onClick={() => toggle(i)}><IconX size={13}/> Quitar</button>
              ) : (
                <button className="btn btn-sm" onClick={() => toggle(i)}><IconUpload size={13}/> Cargar</button>
              )}
            </div>
          );
        })}
        {/* Documentos extras agregados desde plantillas */}
        {extras.map((ex, i) => (
          <div key={ex.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 6,
            marginBottom: 8, background: "var(--ok-bg)",
          }}>
            <div style={{ color: "var(--ok)" }}><IconCheck size={18}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{ex.nombre}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>
                Adicional · desde plantilla {ex.categoria === "acto" ? "de Acto" : "de Formulario"} · {window.getArea(ex.area).nombre}
              </div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => setExtras(es => es.filter(e => e.id !== ex.id))}><IconX size={13}/> Quitar</button>
          </div>
        ))}
      </div>

      {/* Add menu */}
      <div style={{ position: "relative", marginTop: 6 }}>
        <button
          className="btn"
          style={{ width: "100%", justifyContent: "center", borderStyle: "dashed" }}
          onClick={() => setShowMenu(s => !s)}
        >
          <IconPlus size={14}/> Agregar otra documentación (no solicitada inicialmente)
          <IconChevD size={12}/>
        </button>
        {showMenu && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setShowMenu(false)}/>
            <div style={{
              position: "absolute", left: 0, right: 0, top: "calc(100% + 4px)",
              background: "#fff", border: "1px solid var(--border)", borderRadius: 6,
              boxShadow: "var(--shadow-lg)", zIndex: 51, padding: 4,
            }}>
              {[
                { ic: <IconUpload size={14}/>,  lbl: "Subir archivo desde mi equipo",      sub: "PDF, JPG, DOCX… máx 20MB",      act: () => { setShowMenu(false); } },
                { ic: <IconFile size={14}/>,    lbl: "Usar plantilla de Acto",             sub: "Decretos, notas, dictámenes…",  act: () => { setShowMenu(false); setUsarPlantilla("acto"); } },
                { ic: <IconList size={14}/>,    lbl: "Usar plantilla de Formulario",       sub: "Solicitudes, DDJJ, cédulas…",   act: () => { setShowMenu(false); setUsarPlantilla("formulario"); } },
                { ic: <IconFile size={14}/>,    lbl: "Usar plantilla libre",               sub: "Escribir desde cero o usar una plantilla como base", act: () => { setShowMenu(false); setUsarPlantilla("libre"); } },
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

      {usarPlantilla && (
        <ModalUsarPlantilla
          categoria={usarPlantilla}
          onClose={() => setUsarPlantilla(null)}
          onUse={(plantilla, extra) => {
            setExtras(es => [...es, {
              id: "x" + Date.now(),
              nombre: plantilla.nombre + ".pdf",
              categoria: plantilla.categoria,
              area: plantilla.area,
              pasoCircuito: extra?.pasoCircuito || null,
            }]);
          }}
        />
      )}
    </div>
  );
}

function PasoConfirmacion({ form }) {
  const t = window.getTipo(form.tipo);
  const cat = window.getTipoCat ? window.getTipoCat(form.tipoCatId) : null;
  const modId = form.modalidad || t.modalidad;
  const mod = window.MODALIDADES[modId];
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Revisá y guardá el borrador</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        El expediente quedará en estado <b>Borrador</b>. Podés seguir cargando documentación y
        otras áreas pueden intervenir agregando formularios, actas o informes. Cuando esté toda
        la documentación cargada, el <b>Jefe del sector</b> lo marcará como <b>Listo para firmar</b>.
      </p>

      <div style={{ background: "var(--celeste-50)", border: "1px solid var(--celeste-soft)", borderRadius: 6, padding: 14, marginTop: 12, marginBottom: 12, fontSize: 12.5, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 18 }}>
          {[
            { n: 1, l: "Borrador",          act: true,  ic: <IconFile size={12}/> },
            { n: 2, l: "Carga colaborativa", act: false, ic: <IconUsers size={12}/> },
            { n: 3, l: "Listo para firmar",  act: false, ic: <IconCheck size={12}/> },
            { n: 4, l: "Firmado y derivado", act: false, ic: <IconSign size={12}/> },
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: s.act ? 1 : .5 }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, background: s.act ? "var(--celeste)" : "#fff", color: s.act ? "#fff" : "var(--text-3)", display: "grid", placeItems: "center", border: "1.5px solid " + (s.act ? "var(--celeste)" : "var(--border-strong)") }}>{s.ic}</span>
                <span style={{ fontSize: 12, fontWeight: s.act ? 600 : 400, color: s.act ? "var(--navy)" : "var(--text-2)" }}>{s.l}</span>
              </div>
              {i < arr.length - 1 && <span style={{ color: "var(--text-3)" }}>›</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="summary">
        <div className="row"><div className="k">Tipo de trámite</div><div className="v">{cat ? cat.nombre : t.nombre} <span style={{ color: "var(--text-2)", fontWeight: 400, fontSize: 12 }}>· {cat ? cat.rubro : t.rubro}</span></div></div>
        <div className="row"><div className="k">Modalidad del circuito</div><div className="v"><ModalidadChip mod={modId}/> <span style={{ marginLeft: 6, color: "var(--text-2)", fontWeight: 400, fontSize: 12 }}>{mod.descr}</span></div></div>
        <div className="row"><div className="k">Orígenes marcados</div><div className="v">{form.origenes.join(" · ") || "—"}</div></div>
        <div className="row"><div className="k">Solicitante</div><div className="v">{form.solicitanteNombre || "—"} · CUIT/DNI {form.cuit || "—"}</div></div>
        <div className="row"><div className="k">Objeto</div><div className="v">{form.objeto || "—"}</div></div>
        <div className="row"><div className="k">Número provisorio</div><div className="v" style={{ fontFamily: "var(--font-mono)" }}>E-4132-9.000.541-2026 <span style={{ color: "var(--text-2)", fontWeight: 400, fontSize: 11.5 }}>(definitivo al caratular en Mesa Virtual)</span></div></div>
      </div>

      <div style={{ marginTop: 14, padding: 12, background: "var(--warn-bg)", border: "1px solid rgba(201,122,31,.25)", borderRadius: 6, fontSize: 12.5, color: "var(--text-2)", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ color: "var(--warn)" }}><IconAlert size={14}/></span>
        <div>
          <b>Importante:</b> al guardar, el expediente no se envía automáticamente. Podés seguir editando, derivar a otras áreas para que intervengan, y volver cuando quieras. La caratulación formal ocurre cuando el Jefe del sector apruebe el avance.
        </div>
      </div>
    </div>
  );
}

// =========== MESA DE ENTRADA VIRTUAL ===========
function ScreenMesaVirtual({ go, openModal }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mesa de Entrada Virtual</h1>
          <div className="sub">Borradores enviados por áreas internas y el portal externo, pendientes de validación y caratulación</div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => openModal("importar")}><IconDownload size={14}/> Importar desde MEAL / RAFAM</button>
          <button className="btn btn-primary"><IconCheck size={14}/> Caratular seleccionados</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        {[
          { lbl: "Borradores en cola",   val: window.MESA_VIRTUAL.length, sub: "esperando validación" },
          { lbl: "Caratulados hoy",      val: 18, sub: "+3 vs. ayer", tono: "ok" },
          { lbl: "Observados",           val: 2,  sub: "documentación incompleta", tono: "warn" },
          { lbl: "Tiempo medio en cola", val: "4h", sub: "meta: < 24h", tono: "ok" },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}</div>
            <div className={"delta " + (k.tono || "")}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Cola de validación</h3>
          <div className="filters" style={{ marginLeft: 10 }}>
            <span className="fchip active">Todos</span>
            <span className="fchip">Internos</span>
            <span className="fchip">Portal externo</span>
            <span className="fchip">Importados</span>
          </div>
          <span className="meta">{window.MESA_VIRTUAL.length} pendientes</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 26 }}><input type="checkbox"/></th>
              <th style={{ width: 130 }}>Referencia</th>
              <th>Asunto</th>
              <th style={{ width: 180 }}>Origen</th>
              <th style={{ width: 110 }}>Tipo sugerido</th>
              <th style={{ width: 80 }}>Docs</th>
              <th style={{ width: 200 }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {window.MESA_VIRTUAL.map(b => (
              <tr key={b.id} style={{ cursor: "default" }}>
                <td><input type="checkbox"/></td>
                <td>
                  <div className="nro" style={{ fontWeight: 500, color: "var(--text)" }}>{b.referencia}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{b.fecha}</div>
                </td>
                <td>
                  <div className="titulo">{b.titulo}</div>
                  {b.obsMesa && <div style={{ fontSize: 11.5, color: "var(--warn)", marginTop: 3 }}>⚠ {b.obsMesa}</div>}
                  {b.importadoDe && <div style={{ marginTop: 4 }}><span className="imp-badge">↓ Importado desde {b.importadoDe}</span></div>}
                </td>
                <td style={{ fontSize: 12.5 }}>{b.origen}</td>
                <td><TipoChip tipo={b.tipoSugerido}/></td>
                <td style={{ fontSize: 12.5 }}>{b.docs} adjuntos</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-sm btn-primary"><IconCheck size={12}/> Caratular</button>
                    <button className="btn btn-sm">Revisar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", background: "var(--celeste-50)", fontSize: 12.5, color: "var(--text-2)", display: "flex", gap: 8, alignItems: "center" }}>
          <IconShield size={14}/>
          Al presionar <b style={{ color: "var(--text)" }}>Caratular</b>, el sistema asigna número oficial <span className="nro" style={{ background: "#fff", padding: "1px 5px", borderRadius: 3 }}>E-4132-9.000.XXX-2026</span>, registra el ingreso y deriva automáticamente al área responsable según el circuito.
        </div>
      </div>
    </>
  );
}
window.ScreenMesaVirtual = ScreenMesaVirtual;

// =========== TRAZABILIDAD ===========
function ScreenAuditoria() {
  const eventos = [
    { fecha: "2026-05-27", hora: "11:42", exp: "E-4132-9.000.184", area: "tec",  user: "u2", accion: "Informe técnico firmado",         severo: "info" },
    { fecha: "2026-05-27", hora: "10:18", exp: "E-4132-9.000.388", area: "leg",  user: "u6", accion: "Dictamen legal emitido",          severo: "info" },
    { fecha: "2026-05-27", hora: "09:55", exp: "E-4132-9.000.489", area: "obras",user: "u2", accion: "DESVÍO DE PLAZO detectado",       severo: "warn", desvio: "+5d sobre plazo" },
    { fecha: "2026-05-27", hora: "09:14", exp: "E-4132-9.000.502", area: "mesa", user: "u9", accion: "Caratulación desde Mesa Virtual", severo: "info" },
    { fecha: "2026-05-26", hora: "16:43", exp: "E-4132-9.000.219", area: "int",  user: "u8", accion: "Pendiente de firma — Intendente", severo: "warn" },
    { fecha: "2026-05-26", hora: "15:11", exp: "E-4132-9.000.301", area: "hac",  user: "u5", accion: "PASE FORZADO a Legales (esperado: Dictámenes)", severo: "warn", desvio: "Operador justificó: histórico de Reconocimientos" },
    { fecha: "2026-05-26", hora: "11:30", exp: "E-4132-9.000.301", area: "hac",  user: "u5", accion: "Conformidad económica",           severo: "info" },
    { fecha: "2026-05-26", hora: "10:08", exp: "E-4132-9.000.478", area: "gob",  user: "u7", accion: "Decreto registrado",              severo: "info" },
    { fecha: "2026-05-26", hora: "09:22", exp: "E-4132-9.000.342", area: "viv",  user: "u2", accion: "Análisis técnico/social iniciado",severo: "info" },
    { fecha: "2026-05-25", hora: "17:54", exp: "E-4132-9.000.412", area: "cont", user: "u4", accion: "Imputación contable",             severo: "info" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Trazabilidad y auditoría</h1>
          <div className="sub">Historial completo · desvíos · pases forzados · no conformidades</div>
        </div>
        <div className="actions">
          <button className="btn"><IconDownload size={15}/> Exportar auditoría</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        {[
          { lbl: "Movimientos hoy",        val: "47",  sub: "en 18 áreas" },
          { lbl: "Desvíos de plazo",        val: "7",   sub: "esta semana", tono: "warn" },
          { lbl: "Pases forzados",          val: "12",  sub: "circuitos orientativos", tono: "warn" },
          { lbl: "Cumplimiento general",    val: "94%", sub: "sobre 142 activos", tono: "ok" },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}</div>
            <div className={"delta " + (k.tono || "")}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Registro de movimientos</h3>
          <div className="filters" style={{ marginLeft: 12 }}>
            <span className="fchip active">Todos</span>
            <span className="fchip">Desvíos</span>
            <span className="fchip">Pases forzados</span>
            <span className="fchip">Por área</span>
            <span className="fchip">Por usuario</span>
          </div>
          <span className="meta">10 de 1.247 movimientos</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 150 }}>Fecha / hora</th>
              <th style={{ width: 200 }}>Expediente</th>
              <th>Acción</th>
              <th style={{ width: 200 }}>Área / usuario</th>
              <th style={{ width: 160 }}>Severidad</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((e, i) => (
              <tr key={i} style={{ cursor: "default" }}>
                <td>
                  <div className="nro">{e.fecha}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{e.hora} hs</div>
                </td>
                <td className="nro">{e.exp}</td>
                <td>
                  <div className="titulo">{e.accion}</div>
                  {e.desvio && <div className="descr" style={{ color: "var(--warn)" }}>⚠ {e.desvio}</div>}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar uid={e.user}/>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{window.getUser(e.user).nombre}</div>
                      <div style={{ fontSize: 11, color: "var(--text-2)" }}>{window.getArea(e.area).nombre}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={"chip " + (e.severo === "err" ? "err" : e.severo === "warn" ? "warn" : "neutral")}>
                    <span className="chip-dot"/>
                    {e.severo === "err" ? "No conformidad" : e.severo === "warn" ? "Desvío" : "Informativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
window.ScreenAuditoria = ScreenAuditoria;

// =========== REPORTES ===========
function ScreenReportes() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reportes y estadísticas</h1>
          <div className="sub">Indicadores de gestión · mayo 2026</div>
        </div>
        <div className="actions">
          <select style={{ padding: "7px 12px", border: "1px solid var(--border-strong)", borderRadius: 6 }}>
            <option>Último mes</option>
            <option>Último trimestre</option>
            <option>Año en curso</option>
          </select>
          <button className="btn"><IconDownload size={15}/> Exportar reporte</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        {[
          { lbl: "Iniciados", val: "68", delta: "+12 vs. abril" },
          { lbl: "Resueltos", val: "47", delta: "+22% efectividad", tono: "ok" },
          { lbl: "Tiempo medio total", val: "18d", delta: "Meta: 21d", tono: "ok" },
          { lbl: "Tasa de observación", val: "11%", delta: "-3pp vs. abril", tono: "ok" },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}</div>
            <div className={"delta " + (k.tono || "")}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div className="card-head">
            <h3>Distribución de expedientes por estado</h3>
            <span className="meta">142 activos</span>
          </div>
          <div className="card-body">
            {window.DIST_ESTADO.map((d, i) => {
              const max = Math.max(...window.DIST_ESTADO.map(x => x.n));
              return (
                <div className="bar-row" key={i}>
                  <div className="lbl">{d.estado}</div>
                  <div className="track"><div className="fill" style={{ width: (d.n / max * 100) + "%" }}/></div>
                  <div className="num">{d.n}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Cumplimiento de plazos</h3></div>
          <div className="card-body" style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "center" }}>
            <div className="donut" style={{ background: "conic-gradient(var(--verde) 0% 78%, var(--warn) 78% 92%, var(--err) 92% 100%)" }}>
              <div className="center">
                <div className="v">94%</div>
                <div className="l">cumplimiento</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ width: 10, height: 10, background: "var(--verde)", borderRadius: 2 }}/> En plazo (78%)</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ width: 10, height: 10, background: "var(--warn)", borderRadius: 2 }}/> A vencer 3d (14%)</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ width: 10, height: 10, background: "var(--err)", borderRadius: 2 }}/> Vencidos (8%)</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-head"><h3>Productividad por área</h3></div>
          <table className="tbl">
            <thead><tr><th>Área</th><th style={{width:90}}>Resueltos</th><th style={{width:90}}>T. medio</th><th style={{width:110}}>Pases forzados</th></tr></thead>
            <tbody>
              {[
                ["Mesa de Entrada Virtual", 47, "1d", 0, "ok"],
                ["Área Técnica",            34, "5d", 2, "warn"],
                ["Contaduría",              28, "3d", 1, "ok"],
                ["Asuntos Legales",         19, "6d", 3, "warn"],
                ["Hacienda",                16, "4d", 4, "warn"],
                ["Gobierno",                22, "2d", 1, "ok"],
              ].map((r, i) => (
                <tr key={i} style={{ cursor: "default" }}>
                  <td style={{ fontWeight: 500 }}>{r[0]}</td>
                  <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td><span className={"chip " + r[4]}>{r[3]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head"><h3>Tiempo medio por tipo de trámite</h3></div>
          <div className="card-body">
            {window.TIPOS.slice(0, 7).map((t, i) => {
              const tiempos = [12, 22, 28, 35, 18, 24, 15];
              return (
                <div className="bar-row" key={t.id}>
                  <div className="lbl">{t.rubro}</div>
                  <div className="track"><div className="fill" style={{ width: (tiempos[i] / 40 * 100) + "%", background: t.color }} /></div>
                  <div className="num">{tiempos[i]}d</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
window.ScreenReportes = ScreenReportes;

// =========== CIRCUITOS (editor trimodal) ===========
function ScreenCircuitos({ go }) {
  const [selected, setSelected] = useState(window.CIRCUITOS[0].id);
  const c = window.CIRCUITOS.find(x => x.id === selected);
  const [mod, setMod] = useState(c.modalidad);

  useEffect(() => { setMod(c.modalidad); }, [selected]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Circuitos y motor de workflow</h1>
          <div className="sub">El administrador define la rigidez de cada circuito. Decreto 2239/21.</div>
        </div>
        <div className="actions">
          <button className="btn"><IconDownload size={14}/> Importar circuito</button>
          <button className="btn btn-primary" onClick={() => go("circuitoNuevo")}><IconPlus size={15}/> Nuevo circuito</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
        <div className="card">
          <div className="card-head">
            <h3>Circuitos configurados</h3>
            <span className="meta">{window.CIRCUITOS.length}</span>
          </div>
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {window.CIRCUITOS.map(ci => (
              <div key={ci.id}
                className={"circuit-card " + (selected === ci.id ? "selected" : "")}
                onClick={() => setSelected(ci.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{ci.id} · v{ci.v}</div>
                    <div style={{ fontWeight: 500, fontSize: 13.5, marginTop: 3 }}>{ci.nombre}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 4 }}>
                      {ci.especial ? "Circuito especial" : `${ci.pasos} pasos · plazo ${ci.plazo}`}
                    </div>
                  </div>
                  <ModalidadChip mod={ci.modalidad}/>
                </div>
                {ci.activo
                  ? <div style={{ marginTop: 8, fontSize: 11, color: "var(--ok)" }}><IconCheck size={11}/> Activo</div>
                  : <div style={{ marginTop: 8, fontSize: 11, color: "var(--warn)" }}>Borrador</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="card">
          <div className="card-head">
            <h3>{c.nombre}</h3>
            <span className="nro" style={{ fontSize: 11 }}>{c.id} · v{c.v}</span>
            <span className="meta">Última edición: hace 6 días por Andrea Vega</span>
          </div>
          <div className="card-body">
            {c.descripcion && (
              <div style={{ background: "var(--celeste-50)", padding: 12, borderRadius: 6, fontSize: 12.5, color: "var(--text-2)", marginBottom: 16 }}>
                {c.descripcion}
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>
              Modalidad de control
            </div>
            <div className="mod-seg">
              {Object.values(window.MODALIDADES).map(m => (
                <div key={m.id} className={"opt " + m.id + (mod === m.id ? " active" : "")} onClick={() => setMod(m.id)}>
                  <div className="nm">
                    <span style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid " + m.color, background: mod === m.id ? m.color : "transparent" }}/>
                    {m.label}
                  </div>
                  <div className="dc">{m.descr}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12.5 }}>
              <b>Comportamiento con la modalidad {window.MODALIDADES[mod].label}:</b>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, color: "var(--text-2)", lineHeight: 1.7 }}>
                {mod === "libre" && (<>
                  <li>El operador puede adjuntar archivos libremente.</li>
                  <li>Los destinatarios se definen dinámicamente, sin ruta predefinida.</li>
                  <li>No se exige documentación mínima.</li>
                </>)}
                {mod === "orientativa" && (<>
                  <li>El sistema sugiere el próximo paso según la ruta normativa.</li>
                  <li>Si se intenta un desvío, se muestra alerta <b>"¿Está seguro de cambiar el destino?"</b> con opción de <b>Forzar Pase</b>.</li>
                  <li>Cada excepción queda registrada en la trazabilidad.</li>
                </>)}
                {mod === "restrictiva" && (<>
                  <li>El flujo es cerrado e inexpugnable.</li>
                  <li>Datos obligatorios en puntos fijos: si faltan, no avanza.</li>
                  <li>Destino siguiente automatizado por el sistema.</li>
                  <li>Recomendado sólo para trámites simples y estandarizados.</li>
                </>)}
              </ul>
            </div>

            <div className="divider"/>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>
              Pasos del circuito ({c.pasos || "definidos dinámicamente"})
            </div>
            {c.pasos > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(c.id === "COMP-01" ? window.CIRCUITO_COMPRA : window.CIRCUITO_COMPRA.slice(0, c.pasos)).slice(0, c.pasos).map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 4, background: "#fff" }}>
                    <span style={{ width: 22, height: 22, borderRadius: 11, background: "var(--celeste-50)", color: "var(--celeste)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600 }}>{p.paso}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{p.accion}</span>
                    <span className="chip neutral" style={{ fontSize: 10.5 }}>{window.getArea(p.area).abr}</span>
                    <span style={{ fontSize: 11.5, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{p.plazo}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 16, background: "#FEFCE8", border: "1px dashed #FDE68A", borderRadius: 6, fontSize: 12.5, color: "#854D0E", textAlign: "center" }}>
                {c.especial && c.id === "GEN-53" && "Circuito sin pasos predefinidos. El operador define el flujo dinámicamente caso por caso."}
                {c.especial && c.id === "HCD-FREE" && "Entorno libre del HCD. Vinculación por pase directo con el Departamento Ejecutivo."}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn">Cancelar cambios</button>
              <button className="btn btn-primary" style={{ marginLeft: "auto" }}><IconCheck size={14}/> Guardar configuración</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
window.ScreenCircuitos = ScreenCircuitos;

// =========== CIRCUITO NUEVO (wizard) ===========
function ScreenCircuitoNuevo({ go }) {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState({
    id: "",
    nombre: "",
    rubro: "Habilitaciones",
    descripcion: "",
    plazoTotal: "30",
    modalidad: "orientativa",
    pasos: [
      { id: 1, area: "mesa", accion: "Caratulación",                 plazo: "1" },
      { id: 2, area: "tec",  accion: "Análisis técnico",              plazo: "5" },
      { id: 3, area: "gob",  accion: "Confección de acto administrativo", plazo: "3" },
    ],
    docsObligatorios: ["Formulario de solicitud", "Documentación respaldatoria"],
    permitirSubsanacion: true,
    notificarSolicitante: true,
    activarAlGuardar: false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addPaso = () => setForm(f => ({
    ...f,
    pasos: [...f.pasos, { id: Date.now(), area: "leg", accion: "", plazo: "3" }],
  }));
  const removePaso = (id) => setForm(f => ({ ...f, pasos: f.pasos.filter(p => p.id !== id) }));
  const updatePaso = (id, key, val) => setForm(f => ({
    ...f, pasos: f.pasos.map(p => p.id === id ? { ...p, [key]: val } : p),
  }));
  const movePaso = (id, dir) => setForm(f => {
    const idx = f.pasos.findIndex(p => p.id === id);
    if (idx < 0) return f;
    const ni = idx + dir;
    if (ni < 0 || ni >= f.pasos.length) return f;
    const arr = [...f.pasos];
    [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
    return { ...f, pasos: arr };
  });

  const addDoc = () => set("docsObligatorios", [...form.docsObligatorios, ""]);
  const updateDoc = (i, v) => set("docsObligatorios", form.docsObligatorios.map((d, j) => j === i ? v : d));
  const removeDoc = (i) => set("docsObligatorios", form.docsObligatorios.filter((_, j) => j !== i));

  const pasos = [
    { n: 1, label: "Datos básicos" },
    { n: 2, label: "Modalidad" },
    { n: 3, label: "Pasos del circuito" },
    { n: 4, label: "Documentación y reglas" },
    { n: 5, label: "Revisión" },
  ];

  // Auto-suggest ID based on rubro
  useEffect(() => {
    if (!form.id) {
      const prefijos = { "Habilitaciones": "HAB", "Compras": "COMP", "Subsidios": "SUBS", "Vivienda": "VIV", "Apremios": "APR", "Convenios": "CONV", "Obras": "OBRA", "Otro": "GEN" };
      const next = String(window.CIRCUITOS.filter(c => c.id.startsWith(prefijos[form.rubro] || "GEN")).length + 1).padStart(2, "0");
      set("id", `${prefijos[form.rubro] || "GEN"}-${next}`);
    }
  }, [form.rubro]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Nuevo circuito</h1>
          <div className="sub">Definí el flujo administrativo, su modalidad de control y reglas de documentación</div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => go("circuitos")}>Cancelar</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {/* Stepper */}
          <div className="stepper">
            {pasos.map((p, i) => (
              <React.Fragment key={p.n}>
                <div className={"step " + (paso === p.n ? "active" : paso > p.n ? "done" : "")}>
                  <div className="n">{paso > p.n ? <IconCheck size={13}/> : p.n}</div>
                  <span>{p.label}</span>
                </div>
                {i < pasos.length - 1 && <div className={"bar " + (paso > p.n ? "done" : "")}/>}
              </React.Fragment>
            ))}
          </div>

          {paso === 1 && <PasoCircuitoDatos form={form} set={set} />}
          {paso === 2 && <PasoCircuitoModalidad form={form} set={set} />}
          {paso === 3 && <PasoCircuitoPasos
            form={form} set={set}
            addPaso={addPaso} removePaso={removePaso} updatePaso={updatePaso} movePaso={movePaso}
          />}
          {paso === 4 && <PasoCircuitoDocs
            form={form} set={set}
            addDoc={addDoc} updateDoc={updateDoc} removeDoc={removeDoc}
          />}
          {paso === 5 && <PasoCircuitoRevision form={form} />}

          <div className="divider"/>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn" onClick={() => paso > 1 ? setPaso(paso - 1) : go("circuitos")}>
              <IconChevL size={14}/> {paso === 1 ? "Cancelar" : "Anterior"}
            </button>
            {paso < 5 ? (
              <button className="btn btn-primary" onClick={() => setPaso(paso + 1)}>
                Continuar <IconChevR size={14}/>
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => go("circuitos")}>Guardar como borrador</button>
                <button className="btn btn-celeste" onClick={() => go("circuitos")}>
                  <IconCheck size={14}/> Guardar y publicar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
window.ScreenCircuitoNuevo = ScreenCircuitoNuevo;

function PasoCircuitoDatos({ form, set }) {
  const rubros = ["Habilitaciones", "Compras", "Subsidios", "Vivienda", "Apremios", "Convenios", "Obras", "Otro"];
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Datos básicos del circuito</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        Identificación, rubro y plazo total estimado.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginTop: 16 }}>
        <div className="field">
          <label>Código del circuito <span className="req">*</span></label>
          <input type="text" placeholder="Ej. HAB-02" value={form.id} onChange={e => set("id", e.target.value.toUpperCase())}/>
          <div className="hint">Se genera automáticamente según el rubro. Podés editarlo.</div>
        </div>
        <div className="field">
          <label>Nombre del circuito <span className="req">*</span></label>
          <input type="text" placeholder="Ej. Habilitación de comercio gastronómico" value={form.nombre} onChange={e => set("nombre", e.target.value)}/>
        </div>
      </div>

      <div className="field">
        <label>Rubro / familia de trámites <span className="req">*</span></label>
        <select value={form.rubro} onChange={e => set("rubro", e.target.value)}>
          {rubros.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Descripción</label>
        <textarea placeholder="Para qué sirve este circuito, qué casos cubre, normativa aplicable…" value={form.descripcion} onChange={e => set("descripcion", e.target.value)}/>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14, alignItems: "center" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Plazo total estimado <span className="req">*</span></label>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="number" min="1" max="365" value={form.plazoTotal} onChange={e => set("plazoTotal", e.target.value)} style={{ width: 80 }}/>
            <span style={{ color: "var(--text-2)" }}>días corridos</span>
          </div>
        </div>
        <div className="hint" style={{ paddingTop: 18, color: "var(--text-3)", fontSize: 11.5 }}>
          El sistema calculará vencimientos por paso y alertará desvíos en la trazabilidad.
        </div>
      </div>
    </div>
  );
}

function PasoCircuitoModalidad({ form, set }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Modalidad de control</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        Definí qué tan rígido será el flujo. Podés cambiarlo después desde el editor.
      </p>

      <div className="mod-seg" style={{ marginTop: 16 }}>
        {Object.values(window.MODALIDADES).map(m => (
          <div key={m.id} className={"opt " + m.id + (form.modalidad === m.id ? " active" : "")} onClick={() => set("modalidad", m.id)}>
            <div className="nm">
              <span style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid " + m.color, background: form.modalidad === m.id ? m.color : "transparent" }}/>
              {m.label}
            </div>
            <div className="dc">{m.descr}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: 14, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12.5 }}>
        <b>Comportamiento esperado con modalidad {window.MODALIDADES[form.modalidad].label}:</b>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "var(--text-2)", lineHeight: 1.7 }}>
          {form.modalidad === "libre" && (<>
            <li>El operador puede saltarse pasos, agregar áreas y adjuntar documentos sin restricciones.</li>
            <li>Pensado para casuísticas atípicas, denuncias sueltas o trámites del HCD.</li>
            <li>No se exige documentación obligatoria.</li>
          </>)}
          {form.modalidad === "orientativa" && (<>
            <li>El sistema sugiere el próximo paso y alerta si el operador se desvía.</li>
            <li>Aparece la ventana <b>"Ojo: este pase se desvía del circuito"</b> con opción de <b>Forzar Pase</b>.</li>
            <li>Cada excepción queda registrada en la trazabilidad.</li>
            <li>Recomendado para la mayoría de los trámites administrativos.</li>
          </>)}
          {form.modalidad === "restrictiva" && (<>
            <li>El flujo es cerrado: solo se avanza si todos los datos obligatorios están cargados.</li>
            <li>El destino siguiente se decide automáticamente.</li>
            <li>Pensado para trámites simples y estandarizados (ej. habilitaciones, apremios).</li>
          </>)}
        </ul>
      </div>

      {form.modalidad === "libre" && (
        <div style={{ marginTop: 14, padding: 12, background: "#FEFCE8", border: "1px solid #FDE68A", borderRadius: 6, fontSize: 12.5, color: "#854D0E" }}>
          <b>Atención:</b> en modalidad libre, los pasos del próximo paso son orientativos.
          Podés saltearlos por completo en el paso 3 si querés un circuito 100% dinámico.
        </div>
      )}
    </div>
  );
}

function PasoCircuitoPasos({ form, set, addPaso, removePaso, updatePaso, movePaso }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Pasos del circuito</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        Definí la secuencia de áreas que deben intervenir y el plazo estimado de cada paso.
        {form.modalidad === "libre" && " En modalidad libre estos pasos son solo sugerencias."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        {form.pasos.length === 0 && (
          <div className="empty" style={{ padding: 30, border: "1px dashed var(--border-strong)", borderRadius: 6 }}>
            Sin pasos definidos. {form.modalidad === "libre" ? "Está bien, el flujo será dinámico." : "Agregá al menos un paso para continuar."}
          </div>
        )}
        {form.pasos.map((p, i) => (
          <div key={p.id} style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 200px 110px 90px",
            gap: 10, alignItems: "center",
            padding: "10px 12px", background: "#fff",
            border: "1px solid var(--border)", borderRadius: 6,
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 14,
              background: "var(--celeste-50)", color: "var(--celeste)",
              display: "grid", placeItems: "center", fontWeight: 600, fontSize: 12,
            }}>{i + 1}</span>
            <input
              type="text"
              value={p.accion}
              placeholder="Ej. Análisis técnico, Dictamen legal, Firma del Intendente…"
              onChange={e => updatePaso(p.id, "accion", e.target.value)}
              style={{ padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, font: "inherit", fontSize: 13 }}
            />
            <select
              value={p.area}
              onChange={e => updatePaso(p.id, "area", e.target.value)}
              style={{ padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, font: "inherit", fontSize: 12.5 }}
            >
              {window.AREAS.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <input
                type="number" min="1" max="60"
                value={p.plazo}
                onChange={e => updatePaso(p.id, "plazo", e.target.value)}
                style={{ width: 50, padding: "6px 6px", border: "1px solid var(--border-strong)", borderRadius: 4, font: "inherit", fontSize: 13 }}
              />
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>días</span>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => movePaso(p.id, -1)} disabled={i === 0} title="Subir"><IconChevL size={13} sw={2}/></button>
              <button className="btn btn-sm btn-ghost" onClick={() => movePaso(p.id, 1)} disabled={i === form.pasos.length - 1} title="Bajar"><IconChevR size={13} sw={2}/></button>
              <button className="btn btn-sm btn-ghost btn-danger" onClick={() => removePaso(p.id)} title="Quitar"><IconX size={13}/></button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn" style={{ marginTop: 10, width: "100%", justifyContent: "center", borderStyle: "dashed" }} onClick={addPaso}>
        <IconPlus size={14}/> Agregar paso
      </button>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--celeste-50)", borderRadius: 6, fontSize: 12.5 }}>
        <span style={{ color: "var(--text-2)" }}>Suma de plazos por paso:</span>
        <b>{form.pasos.reduce((s, p) => s + (parseInt(p.plazo) || 0), 0)} días</b>
        <span style={{ color: "var(--text-3)" }}>· Plazo total declarado: {form.plazoTotal} días</span>
      </div>
    </div>
  );
}

function PasoCircuitoDocs({ form, set, addDoc, updateDoc, removeDoc }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Documentación obligatoria y reglas</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        {form.modalidad === "libre"
          ? "En modalidad libre la documentación es opcional. Podés definirla como referencia o dejar el listado vacío."
          : form.modalidad === "orientativa"
          ? "En orientativa, el sistema sugerirá esta documentación pero no bloqueará si falta."
          : "En restrictiva, el sistema NO permitirá avanzar sin esta documentación obligatoria."}
      </p>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {form.docsObligatorios.map((doc, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "#fff" }}>
            <div style={{ color: "var(--celeste)" }}><IconFile size={16}/></div>
            <input
              type="text"
              value={doc}
              placeholder="Ej. Plano firmado por matriculado, DNI del titular, Personería jurídica…"
              onChange={e => updateDoc(i, e.target.value)}
              style={{ flex: 1, padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, font: "inherit", fontSize: 13 }}
            />
            <button className="btn btn-sm btn-ghost btn-danger" onClick={() => removeDoc(i)}><IconX size={13}/></button>
          </div>
        ))}
        <button className="btn" style={{ width: "100%", justifyContent: "center", borderStyle: "dashed" }} onClick={addDoc}>
          <IconPlus size={14}/> Agregar documento
        </button>
      </div>

      <div className="divider"/>

      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>
        Reglas adicionales
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 12, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={form.permitirSubsanacion} onChange={e => set("permitirSubsanacion", e.target.checked)} style={{ marginTop: 2 }}/>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Permitir subsanación / devolución al solicitante</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>Si el área detecta documentación faltante, devuelve al iniciador para completar.</div>
          </div>
        </label>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 12, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={form.notificarSolicitante} onChange={e => set("notificarSolicitante", e.target.checked)} style={{ marginTop: 2 }}/>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Notificar al solicitante en cada cambio de estado</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>Email automático al vecino/empresa con el avance del trámite.</div>
          </div>
        </label>
      </div>
    </div>
  );
}

function PasoCircuitoRevision({ form }) {
  const mod = window.MODALIDADES[form.modalidad];
  const sumaPasos = form.pasos.reduce((s, p) => s + (parseInt(p.plazo) || 0), 0);
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Revisión final</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 0 }}>
        Revisá la configuración del circuito. Al publicar quedará disponible para iniciar nuevos expedientes.
      </p>

      <div className="summary" style={{ marginTop: 16, marginBottom: 14 }}>
        <div className="row"><div className="k">Código</div><div className="v" style={{ fontFamily: "var(--font-mono)" }}>{form.id || "—"}</div></div>
        <div className="row"><div className="k">Nombre</div><div className="v">{form.nombre || "—"}</div></div>
        <div className="row"><div className="k">Rubro</div><div className="v">{form.rubro}</div></div>
        <div className="row"><div className="k">Modalidad</div><div className="v"><ModalidadChip mod={form.modalidad}/> <span style={{ marginLeft: 6, color: "var(--text-2)", fontWeight: 400, fontSize: 12 }}>{mod.descr}</span></div></div>
        <div className="row"><div className="k">Plazo total</div><div className="v">{form.plazoTotal} días <span style={{ color: "var(--text-2)", fontWeight: 400, fontSize: 12 }}>(suma de pasos: {sumaPasos}d)</span></div></div>
        <div className="row"><div className="k">Pasos definidos</div><div className="v">{form.pasos.length}</div></div>
        <div className="row"><div className="k">Documentos obligatorios</div><div className="v">{form.docsObligatorios.length}</div></div>
        <div className="row"><div className="k">Subsanación habilitada</div><div className="v">{form.permitirSubsanacion ? "Sí" : "No"}</div></div>
        <div className="row"><div className="k">Notifica al solicitante</div><div className="v">{form.notificarSolicitante ? "Sí" : "No"}</div></div>
      </div>

      {form.pasos.length > 0 && (
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>Secuencia de pasos</div>
          {form.pasos.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 13 }}>
              <span style={{ width: 22, height: 22, borderRadius: 11, background: "var(--celeste-50)", color: "var(--celeste)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600 }}>{i + 1}</span>
              <span style={{ flex: 1 }}>{p.accion || <em style={{ color: "var(--text-3)" }}>sin acción definida</em>}</span>
              <span className="chip neutral" style={{ fontSize: 10.5 }}>{window.getArea(p.area).abr}</span>
              <span style={{ fontSize: 11.5, color: "var(--text-2)", fontVariantNumeric: "tabular-nums", minWidth: 30, textAlign: "right" }}>{p.plazo}d</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, padding: 12, background: "var(--celeste-50)", borderRadius: 6, fontSize: 12.5, color: "var(--text-2)", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ color: "var(--celeste)" }}><IconShield size={14}/></span>
        <div>
          Al publicar, el circuito queda disponible para que las áreas inicien expedientes con él. Podés editar la configuración después desde la pantalla de Circuitos.
        </div>
      </div>
    </div>
  );
}

// =========== PLANTILLAS ===========
function ScreenPlantillas() {
  const [cat, setCat] = useState("todas");   // todas | acto | formulario
  const [areaFilter, setAreaFilter] = useState("todas");
  const [editing, setEditing] = useState(null); // plantilla object or "new-acto" / "new-formulario"

  let filtradas = window.PLANTILLAS;
  if (cat !== "todas")      filtradas = filtradas.filter(p => p.categoria === cat);
  if (areaFilter !== "todas") filtradas = filtradas.filter(p => p.area === areaFilter);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Plantillas</h1>
          <div className="sub">Cada secretaría administra sus plantillas de Actos (textos editables) y Formularios (campos estructurados). Otras áreas pueden usarlas.</div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setEditing({ create: "formulario" })}><IconPlus size={14}/> Nuevo formulario</button>
          <button className="btn btn-primary" onClick={() => setEditing({ create: "acto" })}><IconPlus size={15}/> Nuevo acto</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        {[
          { lbl: "Plantillas activas",     val: window.PLANTILLAS.length },
          { lbl: "Actos",                  val: window.PLANTILLAS.filter(p => p.categoria === "acto").length },
          { lbl: "Formularios",            val: window.PLANTILLAS.filter(p => p.categoria === "formulario").length },
          { lbl: "Usos este mes",          val: "1.273", tono: "ok" },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="lbl">{k.lbl}</div>
            <div className="val">{k.val}</div>
            <div className={"delta " + (k.tono || "")}>{k.sub || " "}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        <div className={"tab " + (cat === "todas" ? "active" : "")} onClick={() => setCat("todas")}>Todas <span className="chip neutral" style={{ marginLeft: 6, padding: "1px 7px", fontSize: 10.5 }}>{window.PLANTILLAS.length}</span></div>
        <div className={"tab " + (cat === "acto" ? "active" : "")} onClick={() => setCat("acto")}>Actos <span className="chip neutral" style={{ marginLeft: 6, padding: "1px 7px", fontSize: 10.5 }}>{window.PLANTILLAS.filter(p => p.categoria === "acto").length}</span></div>
        <div className={"tab " + (cat === "formulario" ? "active" : "")} onClick={() => setCat("formulario")}>Formularios <span className="chip neutral" style={{ marginLeft: 6, padding: "1px 7px", fontSize: 10.5 }}>{window.PLANTILLAS.filter(p => p.categoria === "formulario").length}</span></div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>{cat === "todas" ? "Todas las plantillas" : cat === "acto" ? "Plantillas de Actos" : "Plantillas de Formularios"}</h3>
          <div className="filters" style={{ marginLeft: 12 }}>
            <span className={"fchip " + (areaFilter === "todas" ? "active" : "")} onClick={() => setAreaFilter("todas")}>Todas las áreas</span>
            {["gob", "dict", "obras", "tec", "mesa"].map(a => (
              <span key={a} className={"fchip " + (areaFilter === a ? "active" : "")} onClick={() => setAreaFilter(a)}>{window.getArea(a).abr} — {window.getArea(a).nombre}</span>
            ))}
          </div>
          <span className="meta">{filtradas.length} plantillas</span>
        </div>

        {cat === "acto" || cat === "formulario" ? (
          // Grid view para tipos específicos
          <div style={{ padding: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {filtradas.map(p => (
              <div key={p.id}
                className="circuit-card"
                onClick={() => setEditing(p)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: p.categoria === "acto" ? "var(--celeste-50)" : "var(--ok-bg)", color: p.categoria === "acto" ? "var(--celeste)" : "var(--ok)", display: "grid", placeItems: "center" }}>
                    {p.categoria === "acto" ? <IconFile size={18}/> : <IconList size={18}/>}
                  </div>
                  <span className="chip neutral" style={{ fontSize: 10 }}>{p.tipo}</span>
                </div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{p.nombre}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 4 }}>
                  {window.getArea(p.area).nombre}
                </div>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-3)" }}>
                  <span>v{p.version} · {p.uso} usos</span>
                  <span>{p.updated}</span>
                </div>
              </div>
            ))}
            {filtradas.length === 0 && (
              <div className="empty" style={{ gridColumn: "1 / -1", padding: 40 }}>Sin plantillas en esta categoría.</div>
            )}
          </div>
        ) : (
          // Table view for "todas"
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 30 }}></th>
                <th>Nombre</th>
                <th style={{ width: 120 }}>Categoría</th>
                <th style={{ width: 130 }}>Tipo</th>
                <th style={{ width: 200 }}>Área propietaria</th>
                <th style={{ width: 90 }}>Versión</th>
                <th style={{ width: 80 }}>Usos</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(p => (
                <tr key={p.id} onClick={() => setEditing(p)}>
                  <td><div style={{ color: p.categoria === "acto" ? "var(--celeste)" : "var(--ok)" }}>{p.categoria === "acto" ? <IconFile size={18}/> : <IconList size={18}/>}</div></td>
                  <td>
                    <div className="titulo">{p.nombre}</div>
                    <div className="descr">Disponible para todas las áreas con permiso de lectura</div>
                  </td>
                  <td>
                    <span className={"chip " + (p.categoria === "acto" ? "info" : "ok")}>
                      {p.categoria === "acto" ? "Acto" : "Formulario"}
                    </span>
                  </td>
                  <td><span className="chip neutral">{p.tipo}</span></td>
                  <td style={{ fontSize: 12.5 }}>{window.getArea(p.area).nombre}</td>
                  <td className="nro">v{p.version}</td>
                  <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{p.uso}</td>
                  <td><button className="btn btn-sm">Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && <PlantillaEditor plantilla={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
window.ScreenPlantillas = ScreenPlantillas;

// =========== PLANTILLA EDITOR (Acto or Formulario) ===========
function PlantillaEditor({ plantilla, onClose }) {
  const isNew = !!plantilla.create;
  const cat = isNew ? plantilla.create : plantilla.categoria;
  const [form, setForm] = useState({
    nombre: plantilla.nombre || "",
    area: plantilla.area || "tec",
    tipo: plantilla.tipo || (cat === "acto" ? "Nota" : "Formulario"),
    contenido: plantilla.contenido || "",
    campos: plantilla.campos ? [...plantilla.campos] : [
      { id: 1, label: "Campo de ejemplo", tipo: "text", requerido: true },
    ],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Field operations
  const addCampo = () => setForm(f => ({
    ...f,
    campos: [...f.campos, { id: Date.now(), label: "", tipo: "text", requerido: false }],
  }));
  const removeCampo = (id) => setForm(f => ({ ...f, campos: f.campos.filter(c => c.id !== id) }));
  const updateCampo = (id, key, val) => setForm(f => ({
    ...f, campos: f.campos.map(c => c.id === id ? { ...c, [key]: val } : c),
  }));
  const moveCampo = (id, dir) => setForm(f => {
    const idx = f.campos.findIndex(c => c.id === id);
    if (idx < 0) return f;
    const ni = idx + dir;
    if (ni < 0 || ni >= f.campos.length) return f;
    const arr = [...f.campos];
    [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
    return { ...f, campos: arr };
  });

  // Inserción rápida de placeholders en el textarea
  const tareaRef = React.useRef(null);
  const insertPlaceholder = (token) => {
    const ta = tareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = form.contenido.slice(0, start);
    const after = form.contenido.slice(end);
    const ins = `{{${token}}}`;
    set("contenido", before + ins + after);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + ins.length;
    });
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()} style={{ width: 1100, maxWidth: "94vw", height: "90vh", maxHeight: "90vh" }}>
        <div className="modal-head">
          <span className={"chip " + (cat === "acto" ? "info" : "ok")} style={{ marginRight: 10 }}>
            {cat === "acto" ? <IconFile size={11}/> : <IconList size={11}/>}
            {cat === "acto" ? "Acto" : "Formulario"}
          </span>
          <h3>{isNew ? `Nueva plantilla de ${cat === "acto" ? "Acto" : "Formulario"}` : "Editar plantilla"}</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: 0, display: "grid", gridTemplateColumns: cat === "acto" ? "1fr 280px" : "1fr", overflow: "hidden", flex: 1 }}>
          {/* MAIN PANE */}
          <div style={{ padding: "18px 22px", overflowY: "auto", borderRight: cat === "acto" ? "1px solid var(--border)" : "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Nombre de la plantilla <span className="req">*</span></label>
                <input type="text" value={form.nombre} placeholder={cat === "acto" ? "Ej. Decreto de Adjudicación" : "Ej. F-101 Solicitud de Habilitación"} onChange={e => set("nombre", e.target.value)}/>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Área propietaria <span className="req">*</span></label>
                <select value={form.area} onChange={e => set("area", e.target.value)}>
                  {window.AREAS.filter(a => a.id !== "hcd").map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Tipo documental</label>
                <select value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                  {cat === "acto"
                    ? ["Nota","Decreto","Resolución","Disposición","Acta","Informe","Dictamen","Convenio"].map(x => <option key={x}>{x}</option>)
                    : ["Solicitud","Formulario","DDJJ","Notificación","Encuesta"].map(x => <option key={x}>{x}</option>)
                  }
                </select>
              </div>
            </div>

            <div style={{ background: "var(--celeste-50)", padding: 10, borderRadius: 6, fontSize: 11.5, color: "var(--text-2)", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "var(--celeste)" }}><IconAlert size={13}/></span>
              <div>
                Propietaria: <b>{window.getArea(form.area).nombre}</b>. Las demás áreas también pueden usar esta plantilla pero solo el área propietaria puede editarla.
              </div>
            </div>

            {cat === "acto" ? (
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Contenido de la plantilla (estilo Word)</label>
                {/* Toolbar simil Word */}
                <div style={{ display: "flex", gap: 4, padding: "6px 10px", border: "1px solid var(--border-strong)", borderBottom: 0, borderRadius: "4px 4px 0 0", background: "var(--surface-2)", flexWrap: "wrap" }}>
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
                  <select style={{ padding: "2px 8px", border: "1px solid var(--border)", borderRadius: 3, fontSize: 11.5 }}>
                    <option>Arial 11</option><option>Times 12</option><option>Calibri 11</option>
                  </select>
                </div>
                <textarea
                  ref={tareaRef}
                  value={form.contenido}
                  onChange={e => set("contenido", e.target.value)}
                  placeholder="Escribí aquí el cuerpo de la plantilla. Usá {{PLACEHOLDER}} para los campos que se completan al usarla."
                  style={{ width: "100%", minHeight: 380, fontFamily: "'Times New Roman', Georgia, serif", fontSize: 13.5, lineHeight: 1.6, padding: "14px 18px", border: "1px solid var(--border-strong)", borderTop: 0, borderRadius: "0 0 4px 4px", resize: "vertical" }}
                />
                <div className="hint">Los <span className="nro" style={{ background: "#FDF1D6", color: "#8C5800", padding: "1px 4px", borderRadius: 2 }}>{`{{placeholders}}`}</span> serán reemplazados por datos al usar la plantilla.</div>
              </div>
            ) : (
              // FORMULARIO field editor
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>Campos del formulario ({form.campos.length})</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {form.campos.map((c, i) => (
                    <div key={c.id} style={{ display: "grid", gridTemplateColumns: "30px 1fr 140px 90px 100px", gap: 8, alignItems: "center", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "#fff" }}>
                      <span style={{ width: 22, height: 22, borderRadius: 11, background: "var(--celeste-50)", color: "var(--celeste)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600 }}>{i + 1}</span>
                      <input
                        type="text"
                        value={c.label}
                        placeholder="Etiqueta del campo"
                        onChange={e => updateCampo(c.id, "label", e.target.value)}
                        style={{ padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, font: "inherit", fontSize: 13 }}
                      />
                      <select value={c.tipo} onChange={e => updateCampo(c.id, "tipo", e.target.value)} style={{ padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, font: "inherit", fontSize: 12.5 }}>
                        <option value="text">Texto corto</option>
                        <option value="textarea">Texto largo</option>
                        <option value="number">Número</option>
                        <option value="date">Fecha</option>
                        <option value="email">Email</option>
                        <option value="select">Lista desplegable</option>
                        <option value="radio">Opción única</option>
                        <option value="checkbox">Sí / No</option>
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-2)" }}>
                        <input type="checkbox" checked={c.requerido} onChange={e => updateCampo(c.id, "requerido", e.target.checked)} />
                        Requerido
                      </label>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button className="btn btn-sm btn-ghost" disabled={i === 0} onClick={() => moveCampo(c.id, -1)}><IconChevL size={13} sw={2}/></button>
                        <button className="btn btn-sm btn-ghost" disabled={i === form.campos.length - 1} onClick={() => moveCampo(c.id, 1)}><IconChevR size={13} sw={2}/></button>
                        <button className="btn btn-sm btn-ghost btn-danger" onClick={() => removeCampo(c.id)}><IconX size={13}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn" style={{ marginTop: 10, width: "100%", justifyContent: "center", borderStyle: "dashed" }} onClick={addCampo}>
                  <IconPlus size={14}/> Agregar campo
                </button>

                <div style={{ marginTop: 18, padding: 14, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>Vista previa del formulario</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {form.campos.map(c => (
                      <div key={c.id}>
                        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 4, display: "block" }}>
                          {c.label || <em style={{ color: "var(--text-3)" }}>sin etiqueta</em>}
                          {c.requerido && <span className="req"> *</span>}
                        </label>
                        <CampoPreview campo={c}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR placeholders (solo para actos) */}
          {cat === "acto" && (
            <div style={{ padding: 14, overflowY: "auto", background: "var(--surface-2)" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 10 }}>Placeholders disponibles</div>
              <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 10 }}>Hacé clic para insertar en el cuerpo:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { g: "Expediente", items: ["NUMERO_EXPEDIENTE", "FECHA", "ASUNTO", "VISTO"] },
                  { g: "Personas",   items: ["SOLICITANTE", "FIRMANTE", "CARGO_FIRMANTE", "DESTINATARIO"] },
                  { g: "Datos",      items: ["NUMERO_DECRETO", "NUMERO_NOTA", "NUMERO_DICTAMEN", "MONTO"] },
                  { g: "Cuerpo",     items: ["CONSIDERANDO", "ARTICULO_1", "OBJETO", "OBSERVACIONES"] },
                ].map(grp => (
                  <div key={grp.g} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{grp.g}</div>
                    {grp.items.map(t => (
                      <div key={t}
                        onClick={() => insertPlaceholder(t)}
                        className="nro"
                        style={{ padding: "4px 8px", background: "#fff", border: "1px solid var(--border)", borderRadius: 4, fontSize: 11, marginBottom: 3, cursor: "pointer", color: "#8C5800" }}
                      >
                        {`{{${t}}}`}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {!isNew && <button className="btn btn-danger" style={{ marginRight: "auto" }}><IconX size={13}/> Eliminar</button>}
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onClose}><IconCheck size={14}/> {isNew ? "Crear plantilla" : "Guardar cambios"}</button>
        </div>
      </div>
    </div>
  );
}
window.PlantillaEditor = PlantillaEditor;

// Field preview component (read-only)
function CampoPreview({ campo }) {
  const common = { disabled: true, style: { width: "100%", padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 4, font: "inherit", fontSize: 13, background: "#fff" } };
  switch (campo.tipo) {
    case "textarea":  return <textarea {...common} placeholder="Texto largo…" style={{ ...common.style, minHeight: 60 }}/>;
    case "number":    return <input type="number" {...common} placeholder="0"/>;
    case "date":      return <input type="date" {...common}/>;
    case "email":     return <input type="email" {...common} placeholder="ejemplo@correo.com"/>;
    case "select":    return <select {...common}><option>Seleccionar…</option>{(campo.opciones || ["Opción 1","Opción 2"]).map(o => <option key={o}>{o}</option>)}</select>;
    case "radio":     return <div style={{ display: "flex", gap: 12, fontSize: 12.5, color: "var(--text-2)" }}>{(campo.opciones || ["Sí","No"]).map(o => <label key={o} style={{ display: "flex", gap: 4, alignItems: "center" }}><input type="radio" disabled/>{o}</label>)}</div>;
    case "checkbox":  return <label style={{ display: "flex", gap: 6, fontSize: 12.5, color: "var(--text-2)" }}><input type="checkbox" disabled/>Marcar para confirmar</label>;
    default:          return <input type="text" {...common} placeholder="Texto…"/>;
  }
}
window.CampoPreview = CampoPreview;

// =========== MODAL: USAR PLANTILLA (selección + completado) ===========
function ModalUsarPlantilla({ categoria, onClose, onUse }) {
  const [step, setStep] = useState("pick"); // pick | fill
  const [areaFilter, setAreaFilter] = useState("todas");
  const [plantilla, setPlantilla] = useState(null);
  const [values, setValues] = useState({});
  const [pasoCircuito, setPasoCircuito] = useState(null);

  const plantillas = window.PLANTILLAS.filter(p => {
    if (categoria && p.categoria !== categoria) return false;
    if (areaFilter !== "todas" && p.area !== areaFilter) return false;
    return true;
  });

  const handlePick = (p) => {
    setPlantilla(p);
    setStep("fill");
  };

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()} style={{ width: 880, maxWidth: "94vw", maxHeight: "90vh" }}>
        <div className="modal-head">
          <h3>{step === "pick" ? `Usar plantilla${categoria ? " de " + (categoria === "acto" ? "Acto" : "Formulario") : ""}` : "Completar plantilla"}</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: step === "pick" ? "16px 22px" : "20px 22px" }}>
          {step === "pick" && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <span className="fchip" style={{ cursor: "default", background: "var(--celeste-50)", borderColor: "var(--celeste-soft)", color: "var(--navy)" }}>Filtrar por área:</span>
                <span className={"fchip " + (areaFilter === "todas" ? "active" : "")} onClick={() => setAreaFilter("todas")}>Todas</span>
                {["gob", "dict", "obras", "tec", "mesa"].map(a => (
                  <span key={a} className={"fchip " + (areaFilter === a ? "active" : "")} onClick={() => setAreaFilter(a)}>{window.getArea(a).abr}</span>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, maxHeight: 460, overflowY: "auto" }}>
                {plantillas.map(p => (
                  <div key={p.id} className="circuit-card" onClick={() => handlePick(p)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 6, background: p.categoria === "acto" ? "var(--celeste-50)" : "var(--ok-bg)", color: p.categoria === "acto" ? "var(--celeste)" : "var(--ok)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        {p.categoria === "acto" ? <IconFile size={16}/> : <IconList size={16}/>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{p.nombre}</div>
                        <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>{window.getArea(p.area).nombre} · v{p.version}</div>
                      </div>
                      <span className="chip neutral" style={{ fontSize: 10, padding: "1px 6px" }}>{p.tipo}</span>
                    </div>
                  </div>
                ))}
                {plantillas.length === 0 && (
                  <div className="empty" style={{ gridColumn: "1 / -1" }}>No hay plantillas disponibles.</div>
                )}
              </div>
            </>
          )}

          {step === "fill" && plantilla && (
            <UsarPlantillaFill plantilla={plantilla} values={values} setValues={setValues} pasoCircuito={pasoCircuito} setPasoCircuito={setPasoCircuito} pasos={[{paso:1,accion:"Solicitud e informe técnico"},{paso:2,accion:"Caratulación"},{paso:3,accion:"Factibilidad presupuestaria"},{paso:4,accion:"Imputación contable"},{paso:5,accion:"Conformidad económica"},{paso:6,accion:"Dictamen"},{paso:7,accion:"Confección de acto administrativo"},{paso:8,accion:"Firma del Intendente"},{paso:9,accion:"Orden de pago"},{paso:10,accion:"Pago y archivo"}]} />
          )}
        </div>

        <div className="modal-foot">
          {step === "pick" && <button className="btn" onClick={onClose}>Cancelar</button>}
          {step === "fill" && (
            <>
              <button className="btn" onClick={() => setStep("pick")}><IconChevL size={13}/> Cambiar plantilla</button>
              <div style={{ flex: 1 }}/>
              <button className="btn" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { onUse && onUse(plantilla, { ...values, pasoCircuito }); onClose(); }}>
                <IconCheck size={14}/> Adjuntar al expediente
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
window.ModalUsarPlantilla = ModalUsarPlantilla;

function UsarPlantillaFill({ plantilla, values, setValues, pasoCircuito, setPasoCircuito, pasos }) {
  if (plantilla.categoria === "acto") {
    // Extraer placeholders del contenido y mostrarlos como campos a completar
    const matches = (plantilla.contenido || "").match(/\{\{([A-Z_]+)\}\}/g) || [];
    const tokens = [...new Set(matches.map(m => m.replace(/[{}]/g, "")))];

    return (
      <div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
          <span className="chip info"><IconFile size={11}/> Acto</span>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{plantilla.nombre}</span>
          <span style={{ color: "var(--text-2)", fontSize: 12 }}>· {window.getArea(plantilla.area).nombre}</span>
        </div>

        <div style={{ marginBottom: 14, padding: "10px 14px", background: "var(--celeste-50)", borderRadius: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: "var(--navy)", display: "block", marginBottom: 4 }}>Paso del circuito relacionado</label>
          <select value={pasoCircuito || ""} onChange={e => setPasoCircuito(e.target.value ? parseInt(e.target.value) : null)}
            style={{ width: "100%", padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, fontSize: 12.5, font: "inherit" }}>
            <option value="">Sin paso asignado</option>
            {pasos.map(p => (
              <option key={p.paso} value={p.paso}>Paso {p.paso} — {p.accion}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Completá los datos</div>
            {tokens.length === 0 ? (
              <div className="empty" style={{ padding: 20 }}>Esta plantilla no tiene placeholders.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto", paddingRight: 6 }}>
                {tokens.map(tk => (
                  <div key={tk}>
                    <label style={{ fontSize: 11.5, fontWeight: 500, color: "var(--text-2)", display: "block", marginBottom: 3 }}>{tk.replace(/_/g, " ")}</label>
                    {tk.includes("CUERPO") || tk.includes("CONSIDERANDO") || tk.includes("DESCRIPCION") || tk.includes("OBSERVACION") || tk.includes("ANALISIS") || tk.includes("ANTECEDENTES") || tk.includes("CONCLUSION") || tk.includes("OBJETO") || tk.includes("OBLIGACIONES") ? (
                      <textarea
                        value={values[tk] || ""}
                        onChange={e => setValues({ ...values, [tk]: e.target.value })}
                        style={{ width: "100%", minHeight: 56, padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, fontSize: 13, font: "inherit", resize: "vertical" }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[tk] || ""}
                        onChange={e => setValues({ ...values, [tk]: e.target.value })}
                        style={{ width: "100%", padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, fontSize: 13, font: "inherit" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>Vista previa</div>
            <div style={{
              padding: "14px 18px",
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 4,
              fontFamily: "'Times New Roman', Georgia, serif",
              fontSize: 12,
              lineHeight: 1.6,
              maxHeight: 380,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}>
              {(plantilla.contenido || "").replace(/\{\{([A-Z_]+)\}\}/g, (m, tk) => values[tk] || m)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FORMULARIO
  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
        <span className="chip ok"><IconList size={11}/> Formulario</span>
        <span style={{ fontWeight: 500, fontSize: 14 }}>{plantilla.nombre}</span>
        <span style={{ color: "var(--text-2)", fontSize: 12 }}>· {window.getArea(plantilla.area).nombre}</span>
      </div>

      <div style={{ marginBottom: 14, padding: "10px 14px", background: "var(--celeste-50)", borderRadius: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--navy)", display: "block", marginBottom: 4 }}>Paso del circuito relacionado</label>
        <select value={pasoCircuito || ""} onChange={e => setPasoCircuito(e.target.value ? parseInt(e.target.value) : null)}
          style={{ width: "100%", padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 4, fontSize: 12.5, font: "inherit" }}>
          <option value="">Sin paso asignado</option>
          {pasos.map(p => (
            <option key={p.paso} value={p.paso}>Paso {p.paso} — {p.accion}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 440, overflowY: "auto", padding: "4px 6px 4px 0" }}>
        {(plantilla.campos || []).map(c => (
          <div key={c.id} className="field" style={{ marginBottom: 0 }}>
            <label>{c.label}{c.requerido && <span className="req"> *</span>}</label>
            <CampoInput campo={c} value={values[c.id]} onChange={v => setValues({ ...values, [c.id]: v })}/>
          </div>
        ))}
      </div>
    </div>
  );
}
window.UsarPlantillaFill = UsarPlantillaFill;

function CampoInput({ campo, value, onChange }) {
  const common = {
    value: value || "",
    onChange: (e) => onChange(e.target.value),
  };
  switch (campo.tipo) {
    case "textarea":  return <textarea {...common}/>;
    case "number":    return <input type="number" {...common}/>;
    case "date":      return <input type="date" {...common}/>;
    case "email":     return <input type="email" {...common}/>;
    case "select":    return (
      <select {...common}>
        <option value="">Seleccionar…</option>
        {(campo.opciones || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    case "radio":     return (
      <div style={{ display: "flex", gap: 14, padding: "6px 0", fontSize: 13 }}>
        {(campo.opciones || []).map(o => (
          <label key={o} style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
            <input type="radio" name={"r-" + campo.id} checked={value === o} onChange={() => onChange(o)}/> {o}
          </label>
        ))}
      </div>
    );
    case "checkbox":  return (
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, padding: "6px 0", cursor: "pointer" }}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}/> Acepto / confirmo
      </label>
    );
    default:          return <input type="text" {...common}/>;
  }
}
window.CampoInput = CampoInput;

// =========== MODAL: DERIVAR (con alerta de pase forzado en modalidad orientativa) ===========
function ModalDerivar({ exp, onClose }) {
  const [destino, setDestino] = useState("trib"); // área sugerida por el circuito
  const [showAlerta, setShowAlerta] = useState(false);
  const [paseForzado, setPaseForzado] = useState(false);
  const [motivo, setMotivo] = useState("");

  const areaSugerida = "trib";  // según el circuito de habilitación

  const handleConfirmar = () => {
    if (exp.modalidad === "orientativa" && destino !== areaSugerida) {
      setShowAlerta(true);
    } else if (exp.modalidad === "restrictiva" && destino !== areaSugerida) {
      // no permitido
    } else {
      // derivación normal
      onClose();
    }
  };

  return (
    <>
      <div className="modal-veil" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <h3>Derivar expediente</h3>
            <button className="x" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14 }}>
              <NumExp nro={exp.nro}/> · {exp.titulo}
            </div>

            <div style={{ background: "var(--celeste-50)", padding: 12, borderRadius: 6, fontSize: 12.5, marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <ModalidadChip mod={exp.modalidad}/>
              <span style={{ color: "var(--text-2)" }}>
                {exp.modalidad === "libre"        && "Podés derivar a cualquier área sin restricciones."}
                {exp.modalidad === "orientativa"  && "El sistema sugiere un destino. Podés desviarte justificando el motivo."}
                {exp.modalidad === "restrictiva"  && "El destino siguiente está predefinido por el circuito y no puede modificarse."}
              </span>
            </div>

            <div className="field">
              <label>Área destino <span className="req">*</span></label>
              <select value={destino} onChange={e => setDestino(e.target.value)} disabled={exp.modalidad === "restrictiva"}>
                <option value="trib">Subsec. Ingresos Tributarios — <em>sugerido</em></option>
                <option value="dict">Dictámenes</option>
                <option value="leg">Dir. Asuntos Legales</option>
                <option value="hac">Sec. Economía y Hacienda</option>
                <option value="cont">Contaduría Municipal</option>
                <option value="gob">Dir. General de Gobierno</option>
                <option value="obras">Sec. Obras Públicas</option>
              </select>
              {exp.modalidad === "orientativa" && destino !== areaSugerida && (
                <div className="hint" style={{ color: "var(--warn)", marginTop: 6 }}>
                  ⚠ Vas a desviarte del circuito sugerido. El sistema pedirá confirmación.
                </div>
              )}
            </div>

            <div className="field">
              <label>Comentario para el área receptora</label>
              <textarea placeholder="Indicá brevemente el motivo de la derivación y lo que se espera del área receptora…"/>
            </div>

            <div className="field">
              <label>Prioridad</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["baja","media","alta"].map(p => (
                  <label key={p} style={{ padding: "6px 14px", border: "1px solid var(--border-strong)", borderRadius: 4, cursor: "pointer", fontSize: 12, textTransform: "capitalize" }}>
                    <input type="radio" name="prio" defaultChecked={p === "media"} style={{ marginRight: 6 }}/>
                    {p}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleConfirmar}>
              {exp.modalidad === "orientativa" && destino !== areaSugerida ? "Continuar" : "Derivar"} <IconArrowR size={13}/>
            </button>
          </div>
        </div>
      </div>

      {showAlerta && (
        <ModalForzarPase
          areaEsperada="dict"
          areaElegida={destino}
          motivo={motivo}
          setMotivo={setMotivo}
          paseForzado={paseForzado}
          setPaseForzado={setPaseForzado}
          onCancel={() => { setShowAlerta(false); setDestino(areaSugerida); }}
          onCambiar={() => { setShowAlerta(false); setDestino(areaSugerida); }}
          onForzar={() => { setShowAlerta(false); onClose(); }}
        />
      )}
    </>
  );
}
window.ModalDerivar = ModalDerivar;

// La estrella del show: alerta de pase forzado en modalidad orientativa
function ModalForzarPase({ areaEsperada, areaElegida, motivo, setMotivo, onCancel, onCambiar, onForzar }) {
  return (
    <div className="modal-veil">
      <div className="modal alert-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-body">
          <div className="alert-icon"><IconAlert size={28}/></div>
          <h2>Ojo — este pase se desvía del circuito</h2>
          <div style={{ textAlign: "center", color: "var(--text-2)", fontSize: 13, marginBottom: 4 }}>
            Según el circuito configurado en modalidad <b>orientativa</b>, este trámite debería derivarse al área de <b style={{ color: "var(--ok)" }}>{window.getArea(areaEsperada).nombre}</b>. ¿Estás seguro de cambiar el destino?
          </div>

          <div className="ruta-cmp">
            <div className="col">
              <div className="lbl">Ruta sugerida</div>
              <span className="area-pill esperado"><IconCheck size={12}/> {window.getArea(areaEsperada).nombre}</span>
            </div>
            <div className="arrow"><IconArrowR size={20}/></div>
            <div className="col">
              <div className="lbl">Tu elección</div>
              <span className="area-pill elegido"><IconAlert size={12}/> {window.getArea(areaElegida).nombre}</span>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label>Motivo del pase forzado <span className="req">*</span></label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Explicá por qué corresponde derivar al área elegida en lugar del destino sugerido. El motivo quedará registrado en la trazabilidad."
              style={{ minHeight: 70 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 0 0", fontSize: 11.5, color: "var(--text-2)" }}>
            <IconShield size={13}/>
            Esta excepción quedará registrada como <b>pase forzado</b> en la auditoría del expediente.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onCancel}>Cancelar</button>
          <button className="btn" onClick={onCambiar}><IconChevL size={13}/> Cambiar destino</button>
          <button className="btn" style={{ background: "var(--warn)", borderColor: "var(--warn)", color: "#fff" }} onClick={onForzar} disabled={!motivo.trim()}>
            <IconAlert size={13}/> Forzar pase
          </button>
        </div>
      </div>
    </div>
  );
}
window.ModalForzarPase = ModalForzarPase;

// =========== MODAL: IMPORTAR DESDE MEAL/RAFAM ===========
function ModalImportar({ onClose }) {
  const [step, setStep] = useState(1);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Importar documento desde sistema externo</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 14 }}>
                Los sistemas legados emiten PDFs cerrados que no podés transcribir manualmente. Importálos directamente acá.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { id: "meal",  nombre: "MEAL",        desc: "Mesa de Entrada y Liquidaciones" },
                  { id: "rafam", nombre: "RAFAM",       desc: "Recursos administrativos financieros" },
                  { id: "sigam", nombre: "SIGAM",       desc: "Sistema integrado gestión administrativa" },
                  { id: "otro",  nombre: "Otro sistema",desc: "Cargar PDF genérico" },
                ].map(s => (
                  <label key={s.id} style={{ border: "1px solid var(--border-strong)", borderRadius: 6, padding: 12, cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
                    <input type="radio" name="sys" defaultChecked={s.id === "meal"}/>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.nombre}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>{s.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ border: "2px dashed var(--border-strong)", borderRadius: 6, padding: 24, textAlign: "center", background: "var(--surface-2)" }}>
                <div style={{ color: "var(--text-3)", marginBottom: 6 }}><IconUpload size={32}/></div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Arrastrá el PDF acá o hacé clic para seleccionar</div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 4 }}>PDF cerrado emitido por el sistema externo · máx 20MB</div>
              </div>
              <div style={{ background: "var(--celeste-50)", padding: 12, borderRadius: 6, fontSize: 12.5, color: "var(--text-2)", marginTop: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "var(--celeste)" }}><IconShield size={14}/></span>
                El sistema extraerá automáticamente la metadata del PDF (número, fecha, monto) y la asociará al expediente.
              </div>
            </>
          )}
          {step === 2 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 70, height: 70, margin: "0 auto 14px", borderRadius: 35, background: "var(--ok-bg)", color: "var(--ok)", display: "grid", placeItems: "center" }}>
                <IconCheck size={36} sw={2.2}/>
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>Documento importado</h2>
              <div style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 18 }}>
                <b>MEAL-2026-04287.pdf</b> incorporado al expediente.<br/>Marcado como "importado desde MEAL".
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          {step === 1 && (
            <>
              <button className="btn" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setStep(2)}><IconDownload size={13}/> Importar</button>
            </>
          )}
          {step === 2 && <button className="btn btn-primary" onClick={onClose}>Cerrar</button>}
        </div>
      </div>
    </div>
  );
}
window.ModalImportar = ModalImportar;

// =========== MODAL: MARCAR COMO LISTO PARA FIRMAR (rol Jefe de sector) ===========
function ModalListoFirmar({ exp, onClose }) {
  const [paso, setPaso] = useState(1);
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{paso === 1 ? "Marcar expediente como Listo para firmar" : "Expediente listo para firmar"}</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {paso === 1 && (
            <>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14 }}>
                <NumExp nro={exp?.nro}/> · {exp?.titulo}
              </div>

              <div style={{ background: "var(--ok-bg)", border: "1px solid rgba(30,122,61,.2)", borderRadius: 6, padding: 12, fontSize: 12.5, marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "var(--ok)" }}><IconCheck size={16}/></span>
                <div>
                  <b style={{ color: "var(--ok)" }}>Toda la documentación obligatoria está cargada.</b><br/>
                  <span style={{ color: "var(--text-2)" }}>
                    {exp?.docsCargados} de {exp?.docsRequeridos} documentos · revisado por {exp?.intervinientes.length} áreas intervinientes.
                  </span>
                </div>
              </div>

              <div className="field">
                <label>Tu rol</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface-2)" }}>
                  <div className="avatar-sm" style={{ width: 32, height: 32, fontSize: 12 }}>{window.SESION.usuario.slice(1).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{window.SESION.nombre}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>{window.SESION.cargo}</div>
                  </div>
                  <span className="chip ok"><IconShield size={11}/> Jefe de sector</span>
                </div>
              </div>

              <div className="field">
                <label>Comentario de aprobación</label>
                <textarea defaultValue="Revisada y conforme la documentación. Se da OK final desde la jefatura del sector. El expediente queda listo para el circuito de firma."/>
              </div>

              <div style={{ background: "var(--celeste-50)", padding: 12, borderRadius: 6, fontSize: 12.5, color: "var(--text-2)" }}>
                <b style={{ color: "var(--text)" }}>¿Qué pasa al marcarlo?</b>
                <ul style={{ margin: "6px 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                  <li>El estado cambia a <b>Listo para firmar</b>.</li>
                  <li>Se cierra la carga colaborativa de documentación obligatoria.</li>
                  <li>El expediente queda disponible para el circuito de firma según el flujo del trámite.</li>
                  <li>La acción queda registrada en la trazabilidad con tu firma de jefatura.</li>
                </ul>
              </div>
            </>
          )}

          {paso === 2 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 70, height: 70, margin: "0 auto 14px", borderRadius: 35, background: "var(--ok-bg)", color: "var(--ok)", display: "grid", placeItems: "center" }}>
                <IconCheck size={36} sw={2.2}/>
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>Expediente listo para firmar</h2>
              <div style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 18 }}>
                <NumExp nro={exp?.nro}/> pasó al estado <b>Listo para firmar</b>.<br/>
                Se notificó a las áreas firmantes del circuito.
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          {paso === 1 && (
            <>
              <button className="btn" onClick={onClose}>Cancelar</button>
              <button className="btn btn-celeste" onClick={() => setPaso(2)}>
                <IconCheck size={14}/> Confirmar OK del jefe
              </button>
            </>
          )}
          {paso === 2 && (
            <button className="btn btn-primary" onClick={onClose}>Cerrar</button>
          )}
        </div>
      </div>
    </div>
  );
}
window.ModalListoFirmar = ModalListoFirmar;

// =========== MODAL: FIRMA (versión simplificada) ===========
function ModalFirmar({ onClose }) {
  const [paso, setPaso] = useState(1);
  const [signed, setSigned] = useState(false);

  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{paso === 1 ? "Intervenir expediente" : paso === 2 ? "Firma digital" : "Firma registrada"}</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {paso === 1 && (
            <div>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
                Vas a intervenir en el expediente <b style={{ color: "var(--text)" }}>E-4132-9.000.184-2026</b> — Habilitación comercial Panadería "La Espiga".
              </div>

              <div className="field">
                <label>Acción <span className="req">*</span></label>
                <select defaultValue="aprobar">
                  <option value="aprobar">Aprobar técnicamente y derivar a Tributarios</option>
                  <option value="observar">Observar (devolver al solicitante)</option>
                  <option value="rechazar">Rechazar fundadamente</option>
                </select>
              </div>

              <div className="field">
                <label>Comentario / fundamento</label>
                <textarea defaultValue="Inspección realizada el 23/05/2026. El local cumple con los requisitos técnicos de habilitación. Sin observaciones sustantivas. Se deriva a Subsec. de Ingresos Tributarios para verificación de deudas." />
              </div>

              <div className="field" style={{ background: "var(--celeste-50)", padding: 12, borderRadius: 6, marginBottom: 0 }}>
                <label style={{ marginBottom: 6 }}>Próximo paso del circuito</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span className="avatar-sm">IT</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>Subsec. Ingresos Tributarios</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>Plazo: 3 días corridos · Verificación de libre deuda</div>
                  </div>
                  <ModalidadChip mod="restrictiva"/>
                </div>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div>
              <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
                Firmá digitalmente para registrar tu intervención. La firma queda asociada al expediente y al usuario autenticado.
              </div>

              <div className="field">
                <label>Firmante</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 12, border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface-2)" }}>
                  <div className="avatar-sm" style={{ width: 36, height: 36, fontSize: 13 }}>JC</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Julieta Castro</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>Analista — Área Técnica · DNI 32.145.678</div>
                  </div>
                  <span className="chip ok" style={{ marginLeft: "auto" }}><IconShield size={11}/> Autenticada</span>
                </div>
              </div>

              <div className="field">
                <label>Trazo de firma</label>
                <div className={"sig-pad " + (signed ? "signed" : "")} onClick={() => setSigned(true)}>
                  {signed ? (
                    <>
                      <div className="signature">Julieta Castro</div>
                      <button className="btn btn-sm btn-ghost" style={{ position: "absolute", top: 6, right: 6 }} onClick={(e) => { e.stopPropagation(); setSigned(false); }}>Limpiar</button>
                    </>
                  ) : "Hacé clic para firmar"}
                </div>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 70, height: 70, margin: "0 auto 14px", borderRadius: 35, background: "var(--ok-bg)", color: "var(--ok)", display: "grid", placeItems: "center" }}>
                <IconCheck size={36} sw={2.2}/>
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>Firma registrada con éxito</h2>
              <div style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 18 }}>
                El expediente fue derivado a Subsec. Ingresos Tributarios.<br/>
                Se notificó al solicitante por email.
              </div>
              <div style={{ background: "var(--celeste-50)", padding: 14, borderRadius: 6, fontSize: 12.5, textAlign: "left", border: "1px dashed var(--celeste-soft)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "var(--navy)", fontWeight: 600 }}>
                  <IconSign size={13}/> Incorporada a la Hoja de firmas
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ color: "var(--text-2)" }}>Hoja de firmas</span><span className="nro">HF-4132-9.000.184-2026</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ color: "var(--text-2)" }}>Hash de firma</span><span className="nro">a1c4f2…e89d</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ color: "var(--text-2)" }}>Sello de tiempo</span><span className="nro">27/05/2026 14:32:18</span>
                </div>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--celeste-soft)", fontSize: 11.5, color: "var(--text-2)" }}>
                  La Hoja de firmas se actualizó automáticamente y queda visible dentro del tab <b>Documentos</b> como pieza institucional del expediente.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {paso === 1 && (
            <>
              <button className="btn" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setPaso(2)}>Continuar <IconChevR size={13}/></button>
            </>
          )}
          {paso === 2 && (
            <>
              <button className="btn" onClick={() => setPaso(1)}><IconChevL size={13}/> Volver</button>
              <button className="btn btn-celeste" disabled={!signed} onClick={() => setPaso(3)} style={{ opacity: signed ? 1 : .5 }}>
                <IconSign size={13}/> Firmar y derivar
              </button>
            </>
          )}
          {paso === 3 && <button className="btn btn-primary" onClick={onClose}>Cerrar</button>}
        </div>
      </div>
    </div>
  );
}
window.ModalFirmar = ModalFirmar;

// =========== MODAL: FORZAR PASE (directo desde detalle) ===========
function ModalForzarPaseDirecto({ exp, onClose }) {
  const [motivo, setMotivo] = useState("");
  const [areaDestino, setAreaDestino] = useState("");
  const isRestrictivo = exp && exp.modalidad === "restrictiva";
  const suggested = exp && exp.intervinientes ? exp.intervinientes[Math.min((exp.pasoActual || 0) + 1, exp.intervinientes.length - 1)] : "";
  
  if (isRestrictivo) {
    return (
      <div className="modal-veil" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <h3>Pase forzado no disponible</h3>
            <button className="x" onClick={onClose}>×</button>
          </div>
          <div className="modal-body" style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Modalidad Restrictiva</div>
            <div style={{ fontSize: 13, color: "var(--text-2)" }}>
              Este expediente opera en modalidad <b>restrictiva</b>. El circuito es cerrado e inexpugnable. No es posible forzar el pase.
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-primary" onClick={onClose}>Entendido</button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="modal-veil" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Forzar pase de expediente</h3>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ background: "var(--warn-bg)", border: "1px solid rgba(201,122,31,.3)", borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "var(--warn)" }}><IconAlert size={14}/></span>
            <div>
              <b style={{ color: "var(--warn)" }}>Este pase se desvía del circuito normativo.</b>{" "}
              <span style={{ color: "var(--text-2)" }}>El motivo quedará registrado en la trazabilidad del expediente.</span>
            </div>
          </div>
          
          <div className="field">
            <label>Área destino <span className="req">*</span></label>
            <select value={areaDestino} onChange={e => setAreaDestino(e.target.value)}>
              <option value="">Seleccionar área…</option>
              {(window.AREAS || []).filter(a => a.id !== exp?.areaActual).map(a => (
                <option key={a.id} value={a.id}>{a.nombre} ({a.abr})</option>
              ))}
            </select>
          </div>
          
          <div className="field">
            <label>Motivo del pase forzado <span className="req">*</span></label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Explicá por qué corresponde este pase. El motivo quedará registrado en la auditoría."
              style={{ minHeight: 70 }}
            />
          </div>
          
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, color: "var(--text-2)" }}>
            <IconShield size={13}/>
            Esta excepción quedará registrada como <b>pase forzado</b> en la trazabilidad.
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button 
            className="btn" 
            style={{ background: "var(--warn)", borderColor: "var(--warn)", color: "#fff" }} 
            disabled={!motivo.trim() || !areaDestino}
            onClick={() => {
              alert("Pase forzado registrado a " + window.getArea(areaDestino).nombre + ".\nMotivo: " + motivo);
              onClose();
            }}
          >
            <IconAlert size={13}/> Forzar pase
          </button>
        </div>
      </div>
    </div>
  );
}
window.ModalForzarPaseDirecto = ModalForzarPaseDirecto;
