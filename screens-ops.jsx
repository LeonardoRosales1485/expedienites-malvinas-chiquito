// Operational screens: Dashboard, Bandeja, Listado

// ============ DASHBOARD ============
function ScreenDashboard({ go }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Buen día, Julieta</h1>
          <div className="sub">Resumen operativo · martes 27 de mayo de 2026</div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => go("alta")}><IconPlus size={15}/> Nuevo expediente</button>
        </div>
      </div>

      {/* Arquitectura trimodal */}
      <div className="card banner-arch" style={{ marginBottom: 14, background: "linear-gradient(90deg, var(--celeste-50) 0%, var(--surface) 60%)" }}>
        <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Arquitectura del sistema</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>Motor de workflow trimodal configurable</div>
            <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 4, maxWidth: 600 }}>
              Cada circuito puede operar en una de tres modalidades. El administrador decide qué nivel de rigidez aplica a cada trámite.
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
            {["libre", "orientativa", "restrictiva"].map(m => (
              <div key={m} style={{ textAlign: "center" }}>
                <ModalidadChip mod={m}/>
                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 6 }}>
                  {m === "libre" ? "32 circuitos" : m === "orientativa" ? "4 circuitos" : "2 circuitos"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
        {window.KPIS.map((k, i) => (
          <div key={i} className="kpi">
            <div className="lbl">{k.label}</div>
            <div className="val">{k.valor}</div>
            <div className={"delta " + k.tono}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        {/* Bandeja preview */}
        <div className="card">
          <div className="card-head">
            <h3>Mi bandeja de tareas</h3>
            <span className="chip warn"><span className="chip-dot"/>2 vencidos</span>
            <span className="meta">5 pendientes</span>
            <button className="btn btn-sm btn-ghost" onClick={() => go("bandeja")}>Ver todos <IconChevR size={13}/></button>
          </div>
          <table className="tbl">
            <thead><tr><th style={{width: 140}}>Expediente</th><th>Acción requerida</th><th style={{width: 110}}>Vence</th></tr></thead>
            <tbody>
              {window.BANDEJA.slice(0, 5).map(b => {
                const e = window.getExp(b.nro);
                return (
                  <tr key={b.nro} onClick={() => go("detalle", b.nro)}>
                    <td><NumExp nro={b.nro}/></td>
                    <td>
                      <div className="titulo">{b.accion}</div>
                      <div className="descr">{e?.titulo}</div>
                    </td>
                    <td><VenceChip dias={b.vence} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Alertas + atajos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-head"><h3>Alertas</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {[
                { ic: <IconAlert size={16}/>, color: "var(--err)",  txt: "2 expedientes vencidos en tu bandeja",        sub: "E-4132-9.000.489 · E-4132-9.000.518" },
                { ic: <IconSign size={16}/>, color: "var(--warn)", txt: "1 acto pendiente de firma de Intendencia",     sub: "E-4132-9.000.219 — Compra menor CDR" },
                { ic: <IconCheck size={16}/>,color: "var(--ok)",   txt: "4 borradores en Mesa de Entrada Virtual",       sub: "Esperando caratulación oficial" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: i < 2 ? "1px solid var(--border)" : "none", alignItems: "flex-start" }}>
                  <div style={{ color: a.color, marginTop: 2 }}>{a.ic}</div>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <div style={{ fontWeight: 500 }}>{a.txt}</div>
                    <div style={{ color: "var(--text-2)", fontSize: 11.5, marginTop: 2 }}>{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Distribución por tipo</h3></div>
            <div className="card-body">
              {window.TIPOS.slice(0, 5).map((t, i) => {
                const vals = [38, 27, 19, 14, 11];
                return (
                  <div className="bar-row" key={t.id}>
                    <div className="lbl">{t.rubro}</div>
                    <div className="track"><div className="fill" style={{ width: (vals[i] * 2) + "%", background: t.color }} /></div>
                    <div className="num">{vals[i]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head">
          <h3>Actividad reciente del municipio</h3>
          <span className="meta">Últimas 24 hs · 18 movimientos</span>
        </div>
        <div className="card-body">
          <div className="timeline">
            {[
              { who: "u9", txt: <>Caratuló <b>E-4132-9.000.502</b> — Baja de comercio "24 Hs"</>,    ago: "Hace 35 min", area: "mesa" },
              { who: "u4", txt: <>Imputó orden de pago en <b>E-4132-9.000.489</b> — Repavimentación calle Posadas</>, ago: "Hace 2 hs", area: "cont" },
              { who: "u6", txt: <>Emitió dictamen legal favorable en <b>E-4132-9.000.388</b> — Convenio UNGS</>, ago: "Hace 3 hs", area: "leg" },
              { who: "u2", txt: <>Cargó informe técnico de inspección en <b>E-4132-9.000.184</b> — Habilitación Panadería</>, ago: "Hace 5 hs", area: "tec" },
              { who: "u7", txt: <>Generó proyecto de decreto para <b>E-4132-9.000.478</b> — Adjudicación Procrear</>, ago: "Hace 7 hs", area: "gob" },
            ].map((ev, i) => (
              <div className="ev" key={i}>
                <div className="when">{ev.ago}</div>
                <div className="what">{ev.txt}</div>
                <div className="by"><Avatar uid={ev.who}/> <span>{window.getUser(ev.who).nombre} · {window.getArea(ev.area).nombre}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
window.ScreenDashboard = ScreenDashboard;

// ============ BANDEJA ============
function ScreenBandeja({ go }) {
  const [tab, setTab] = useState("pend");
  const tabs = [
    { id: "pend",  label: "Pendientes",       n: 5 },
    { id: "venc",  label: "Vencidos",          n: 2 },
    { id: "obs",   label: "Observados",        n: 1 },
    { id: "firma", label: "Pendientes de firma", n: 0 },
    { id: "todos", label: "Todos",             n: 12 },
  ];
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mi bandeja de tareas</h1>
          <div className="sub">Expedientes que requieren tu intervención en el Área Técnica</div>
        </div>
        <div className="actions">
          <button className="btn"><IconUsers size={15}/> Reasignar</button>
          <button className="btn"><IconDownload size={15}/> Exportar</button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <div key={t.id} className={"tab " + (tab === t.id ? "active" : "")} onClick={() => setTab(t.id)}>
            {t.label} {t.n > 0 && <span className="chip neutral" style={{ marginLeft: 6, padding: "1px 7px", fontSize: 10.5 }}>{t.n}</span>}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="filters">
            <span className="fchip active">Todas las prioridades</span>
            <span className="fchip">Alta</span>
            <span className="fchip">Media</span>
            <span className="fchip">Baja</span>
            <span style={{ width: 14 }}/>
            <select defaultValue="recent">
              <option value="recent">Más recientes primero</option>
              <option value="vence">Por vencimiento</option>
              <option value="prio">Por prioridad</option>
            </select>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 26 }}><input type="checkbox" /></th>
              <th style={{ width: 200 }}>Expediente</th>
              <th>Tarea / objeto</th>
              <th style={{ width: 130 }}>Tipo</th>
              <th style={{ width: 170 }}>Estado</th>
              <th style={{ width: 110 }}>Vence</th>
              <th style={{ width: 90 }}>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {window.BANDEJA.map(b => {
              const e = window.getExp(b.nro);
              return (
                <tr key={b.nro} onClick={() => go("detalle", b.nro)}>
                  <td onClick={(ev) => ev.stopPropagation()}><input type="checkbox" /></td>
                  <td><NumExp nro={b.nro}/></td>
                  <td>
                    <div className="titulo">{b.accion}</div>
                    <div className="descr">{e?.titulo}</div>
                  </td>
                  <td>{e && <TipoChip tipo={e.tipo} />}</td>
                  <td>{e && <EstadoChip estado={e.estado} />}</td>
                  <td><VenceChip dias={b.vence} /></td>
                  <td>
                    <span className={"chip " + (b.prioridad === "alta" ? "err" : b.prioridad === "media" ? "warn" : "neutral")}>
                      <span className="chip-dot"/>{b.prioridad}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
window.ScreenBandeja = ScreenBandeja;

// ============ LISTADO ============
function ScreenListado({ go }) {
  const [filtroTipo, setFiltroTipo]   = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const filtrados = window.EXPEDIENTES.filter(e => {
    if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
    if (filtroEstado === "vencidos" && !e.vencido) return false;
    if (busqueda && !(e.titulo + e.nro + e.objeto).toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Expedientes</h1>
          <div className="sub">{window.EXPEDIENTES.length} expedientes registrados en el municipio</div>
        </div>
        <div className="actions">
          <button className="btn"><IconDownload size={15}/> Exportar</button>
          <button className="btn btn-primary" onClick={() => go("alta")}><IconPlus size={15}/> Nuevo expediente</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-body" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 360 }}>
            <span style={{ position: "absolute", left: 10, top: 9, color: "var(--text-3)" }}><IconSearch size={15}/></span>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por número, solicitante u objeto…"
              style={{ width: "100%", padding: "8px 12px 8px 34px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface-2)" }}
            />
          </div>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--border-strong)", borderRadius: 6 }}>
            <option value="todos">Todos los tipos</option>
            {window.TIPOS.map(t => <option key={t.id} value={t.id}>{t.rubro}</option>)}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--border-strong)", borderRadius: 6 }}>
            <option value="todos">Cualquier estado</option>
            <option value="vencidos">Solo vencidos</option>
          </select>
          <button className="btn btn-sm">Más filtros</button>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-2)" }}>
            Mostrando <b>{filtrados.length}</b> de {window.EXPEDIENTES.length}
          </div>
        </div>
      </div>

      <div className="card has-table tbl-expedientes">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 190 }}>Número</th>
              <th>Carátula</th>
              <th style={{ width: 110 }}>Tipo</th>
              <th style={{ width: 100 }}>Modalidad</th>
              <th style={{ width: 130 }}>Iniciador</th>
              <th style={{ width: 140 }}>Estado</th>
              <th style={{ width: 90 }}>Plazo</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(e => {
              const venceDias = Math.ceil((new Date(e.plazoLimite) - new Date("2026-05-27")) / 86400000);
              return (
                <tr key={e.nro} onClick={() => go("detalle", e.nro)} className={e.autonomo ? "hcd-stripe" : ""}>
                  <td>
                    <NumExp nro={e.nro}/>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span>{e.fechaInicio}</span>
                      {e.autonomo && <span className="hcd-badge">HCD</span>}
                      {e.importadoDe && <span className="imp-badge">↓ {e.importadoDe}</span>}
                      {e.circuitoEspecial && <span className="chip neutral" style={{ fontSize: 9.5, padding: "1px 6px" }}>C53</span>}
                    </div>
                  </td>
                  <td>
                    <div className="titulo" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{e.titulo}</div>
                    <div className="descr" style={{
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280
                    }}>{e.objeto}</div>
                  </td>
                  <td><TipoChip tipo={e.tipo} /></td>
                  <td><ModalidadChip mod={e.modalidad} /></td>
                  <td>
                    <div style={{ fontSize: 12.5 }}>{e.iniciador}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{e.iniciadorTipo}</div>
                  </td>
                  <td><EstadoChip estado={e.estado} /></td>
                  <td><VenceChip dias={venceDias} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
window.ScreenListado = ScreenListado;
