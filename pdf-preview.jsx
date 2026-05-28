// =========== VISTA PREVIA DE PDF ===========
// Modal full-screen — muestra el armado del expediente como saldría impreso/exportado:
//   Página 1: CARÁTULA institucional
//   Páginas 2..N-1: Cada documento, con su "stub" tipo PDF
//   Página N: HOJA DE FIRMAS (sólo si el expediente la tiene)

function ModalPDFPreview({ exp, onClose }) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(0.7); // factor visual sobre A4
  const mainRef = useRef(null);

  // Armar la lista de páginas
  const pages = useMemo(() => {
    const arr = [{ kind: "caratula", label: "Carátula", thumb: "C" }];
    // Una página por cada movimiento del historial (en orden cronológico — más antiguo primero)
    (exp.historial || []).forEach((h, i) => {
      arr.push({ kind: "actuacion", label: `${i + 1}. ${h.accion}`, mov: h, idx: i, thumb: "A" });
    });
    (exp.documentos || []).forEach((d, i) => {
      arr.push({ kind: "doc", label: d.nombre, doc: d, idx: i, thumb: "D" });
    });
    if (exp.hojaFirmas) {
      arr.push({ kind: "hoja", label: "Hoja de firmas", thumb: "F" });
    }
    return arr;
  }, [exp]);

  const total = pages.length;
  const cur = pages[page - 1] || pages[0];

  const goTo = (n) => {
    const next = Math.max(1, Math.min(total, n));
    setPage(next);
    requestAnimationFrame(() => {
      const m = mainRef.current;
      if (m) m.scrollTop = 0;
    });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); goTo(page + 1); }
      if (e.key === "ArrowLeft"  || e.key === "PageUp")   { e.preventDefault(); goTo(page - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, total]);

  return (
    <div className="pdf-veil" onClick={onClose}>
      <div className="pdf-shell" onClick={e => e.stopPropagation()}>
        {/* TOOLBAR */}
        <div className="pdf-toolbar">
          <div className="pdf-tool-left">
            <div className="pdf-doc-name">
              <IconFile size={14}/>
              <span>Vista previa · {exp.nro}</span>
              <span className="ext">.pdf</span>
            </div>
          </div>
          <div className="pdf-tool-center">
            <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => goTo(page - 1)}><IconChevL size={13}/></button>
            <div className="pdf-page-input">
              <input
                type="number"
                min={1}
                max={total}
                value={page}
                onChange={e => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) goTo(v); }}
              />
              <span>de {total}</span>
            </div>
            <button className="btn btn-sm btn-ghost" disabled={page >= total} onClick={() => goTo(page + 1)}><IconChevR size={13}/></button>
            <span className="pdf-tool-sep"/>
            <button className="btn btn-sm btn-ghost" onClick={() => setZoom(z => Math.max(0.45, +(z - 0.1).toFixed(2)))} title="Reducir zoom">−</button>
            <span className="pdf-zoom-lbl">{Math.round(zoom * 100)}%</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setZoom(z => Math.min(1.4, +(z + 0.1).toFixed(2)))} title="Aumentar zoom">+</button>
          </div>
          <div className="pdf-tool-right">
            <button className="btn btn-sm"><IconDownload size={13}/> Descargar PDF</button>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><IconX size={14}/> Cerrar</button>
          </div>
        </div>

        {/* LAYOUT: thumbs + main */}
        <div className="pdf-layout">
          {/* Thumbnails */}
          <aside className="pdf-thumbs">
            {pages.map((p, i) => (
              <button
                key={i}
                className={"pdf-thumb " + (page === i + 1 ? "active" : "")}
                onClick={() => goTo(i + 1)}
                title={p.label}
              >
                <div className="pdf-thumb-page">
                  <PreviewPage kind={p.kind} exp={exp} doc={p.doc} docIndex={p.idx} mov={p.mov} movIndex={p.idx} pageNum={i + 1} total={total} thumb={true}/>
                </div>
                <div className="pdf-thumb-meta">
                  <span className="n">{i + 1}</span>
                  <span className="l">{shortLabel(p.label)}</span>
                </div>
              </button>
            ))}
          </aside>

          {/* Main page viewer */}
          <main className="pdf-main" ref={mainRef}>
            <div className="pdf-stage" style={{ "--pdf-zoom": zoom }}>
              <div className="pdf-page-wrap">
                <PreviewPage kind={cur.kind} exp={exp} doc={cur.doc} docIndex={cur.idx} mov={cur.mov} movIndex={cur.idx} pageNum={page} total={total}/>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
window.ModalPDFPreview = ModalPDFPreview;

function shortLabel(s) {
  if (!s) return "";
  if (s.length > 24) return s.slice(0, 22) + "…";
  return s;
}

// ─── COMPONENTE: una página del PDF ───
function PreviewPage({ kind, exp, doc, docIndex, mov, movIndex, pageNum, total, thumb }) {
  if (kind === "caratula")  return <PageCaratula   exp={exp} pageNum={pageNum} total={total} thumb={thumb}/>;
  if (kind === "actuacion") return <PageActuacion  exp={exp} mov={mov} movIndex={movIndex} pageNum={pageNum} total={total} thumb={thumb}/>;
  if (kind === "doc")       return <PageDocumento  exp={exp} doc={doc} docIndex={docIndex} pageNum={pageNum} total={total} thumb={thumb}/>;
  if (kind === "hoja")      return <PageHojaFirmas exp={exp} pageNum={pageNum} total={total} thumb={thumb}/>;
  return null;
}

// ─── PÁGINA 1: CARÁTULA ───
function PageCaratula({ exp, pageNum, total, thumb }) {
  const t = window.getTipo(exp.tipo);
  const mod = window.MODALIDADES[exp.modalidad];
  return (
    <div className="pdf-page is-caratula">
      <PdfHeader exp={exp}/>

      <div className="pdf-cara-tag">EXPEDIENTE ADMINISTRATIVO ELECTRÓNICO</div>
      <h1 className="pdf-cara-num">
        <NumExpPdf nro={exp.nro}/>
      </h1>
      <div className="pdf-cara-sub">
        {exp.titulo || "Expediente sin caratular"}
      </div>

      <div className="pdf-cara-grid">
        <div className="pdf-fila">
          <div className="k">Tipo de trámite</div>
          <div className="v">{t.nombre || "—"}</div>
        </div>
        <div className="pdf-fila">
          <div className="k">Rubro</div>
          <div className="v">{t.rubro || "—"}</div>
        </div>
        <div className="pdf-fila">
          <div className="k">Modalidad del circuito</div>
          <div className="v">{mod ? mod.label : "—"} · <span className="muted">{mod ? mod.descr : ""}</span></div>
        </div>
        <div className="pdf-fila">
          <div className="k">Iniciador / Solicitante</div>
          <div className="v">{exp.iniciador || "—"} <span className="muted">({exp.iniciadorTipo || "—"})</span></div>
        </div>
        <div className="pdf-fila">
          <div className="k">Origen del trámite</div>
          <div className="v">{(exp.origenes || []).join(" · ") || "—"}</div>
        </div>
        <div className="pdf-fila">
          <div className="k">Fecha de inicio</div>
          <div className="v">{exp.fechaInicio || "—"}</div>
        </div>
        <div className="pdf-fila">
          <div className="k">Plazo límite</div>
          <div className="v">{exp.plazoLimite || "—"} <span className="muted">({exp.diasTranscurridos} días transcurridos)</span></div>
        </div>
        <div className="pdf-fila">
          <div className="k">Estado actual</div>
          <div className="v">{window.getEstado(exp.estado).label}</div>
        </div>
        <div className="pdf-fila">
          <div className="k">Área responsable</div>
          <div className="v">{window.getArea(exp.areaActual).nombre || "—"}</div>
        </div>
        {exp.circuitoEspecial && (
          <div className="pdf-fila">
            <div className="k">Circuito especial</div>
            <div className="v">{exp.circuitoEspecial}</div>
          </div>
        )}
        {exp.importadoDe && (
          <div className="pdf-fila">
            <div className="k">Sistema de origen</div>
            <div className="v">Importado de {exp.importadoDe}</div>
          </div>
        )}
      </div>

      <div className="pdf-cara-objeto">
        <div className="lbl">Objeto del trámite</div>
        <div className="cuerpo">{exp.objeto || <i className="muted">— sin descripción cargada —</i>}</div>
      </div>

      <div className="pdf-cara-areas">
        <div className="lbl">Áreas intervinientes</div>
        <div className="lista">
          {(exp.intervinientes || []).map((aid, i) => (
            <span key={aid + i} className="area-chip">
              <span className="abr">{window.getArea(aid).abr}</span>
              <span>{window.getArea(aid).nombre}</span>
            </span>
          ))}
        </div>
      </div>

      {/* QR mock + firma de generación */}
      <div className="pdf-cara-foot">
        <div className="qr" aria-hidden="true">
          <div className="qr-grid">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} className={"qr-dot " + (((i * 7 + (exp.nro || "").length) % 3) ? "on" : "")}/>
            ))}
          </div>
        </div>
        <div className="leyenda">
          <div className="ley-titulo">Documento generado electrónicamente</div>
          <div className="ley-cuerpo">
            Este documento es una representación impresa del expediente electrónico identificado en el encabezado.
            Su autenticidad puede verificarse escaneando el código QR o ingresando el número en el portal
            <b> sidi.malvinasargentinas.gob.ar/verificar</b>.
          </div>
          <div className="ley-meta">
            Generado el 27/05/2026 14:32 hs · Hash documento: 7a4c8e…d1f3 · Versión 1
          </div>
        </div>
      </div>

      <PdfFooter pageNum={pageNum} total={total} exp={exp}/>
    </div>
  );
}

// ─── PÁGINA: ACTUACIÓN (un movimiento del historial) ───
function PageActuacion({ exp, mov, movIndex, pageNum, total, thumb }) {
  if (!mov) return null;
  const user = window.getUser(mov.usuario) || {};
  const area = window.getArea(mov.area) || {};
  // Hash mock determinístico (no real)
  const hash = (mov.accion + mov.fecha + mov.hora).split("").reduce((a, c) => ((a * 31) + c.charCodeAt(0)) & 0xffffff, 7).toString(16).padStart(6, "0").slice(0, 6);
  // ¿Esta actuación se corresponde con una firma en la hoja?
  const firmaCorrespondiente = (exp.hojaFirmas?.firmas || []).find(f => f.area === mov.area && f.fecha === mov.fecha);

  return (
    <div className="pdf-page is-actuacion">
      <PdfHeader exp={exp}/>

      <div className="pdf-act-tag">
        ACTUACIÓN N° {String(movIndex + 1).padStart(3, "0")} · FOJA {movIndex + 2}
      </div>
      <h1 className="pdf-act-titulo">{mov.accion}</h1>

      <div className="pdf-act-meta">
        <div className="pdf-act-meta-col">
          <div className="k">Área interviniente</div>
          <div className="v">{area.nombre || "—"}</div>
        </div>
        <div className="pdf-act-meta-col">
          <div className="k">Agente</div>
          <div className="v">{user.nombre || "—"}<div className="muted">{user.cargo || ""}</div></div>
        </div>
        <div className="pdf-act-meta-col">
          <div className="k">Fecha</div>
          <div className="v mono">{mov.fecha}</div>
        </div>
        <div className="pdf-act-meta-col">
          <div className="k">Hora</div>
          <div className="v mono">{mov.hora} hs</div>
        </div>
      </div>

      {/* Cuerpo de la actuación */}
      <div className="pdf-act-cuerpo">
        <div className="pdf-act-vista">VISTA Y CONSIDERANDO:</div>
        <p className="pdf-act-texto">{mov.detalle}</p>

        <div className="pdf-act-texto-extra">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ln" style={{ width: (62 + ((i * 17 + movIndex * 9) % 36)) + "%" }}/>
          ))}
        </div>

        <div className="pdf-act-pasa">
          PASA: {nextAreaInCircuito(exp, mov.area) || "Continúa según circuito"}
        </div>
      </div>

      {/* Bloque de firma — sólo si hay correspondencia con la Hoja de firmas */}
      {firmaCorrespondiente ? (
        <div className="pdf-act-firma">
          <div className="trazo">
            <div className="signature">{user.nombre}</div>
            <div className="ln"/>
            <div className="cargo">{firmaCorrespondiente.cargo || user.cargo}<br/>{area.nombre}</div>
          </div>
          <div className="hash">
            <div><b>Firmado digitalmente</b></div>
            <div>Hash: {firmaCorrespondiente.hash}</div>
            <div>Sello de tiempo: {mov.fecha} {mov.hora}:00</div>
            <div className="incorp">↳ Incorporada a la Hoja de firmas</div>
          </div>
        </div>
      ) : (
        <div className="pdf-act-firma simple">
          <div className="trazo">
            <div className="ln-blanca"/>
            <div className="cargo">{user.nombre || ""}<br/>{area.nombre}</div>
          </div>
          <div className="hash">
            <div><b>Registrado electrónicamente</b></div>
            <div>Hash: {hash}…{hash}</div>
            <div>Sello de tiempo: {mov.fecha} {mov.hora}:00</div>
          </div>
        </div>
      )}

      <PdfFooter pageNum={pageNum} total={total} exp={exp}/>
    </div>
  );
}

// Calcular el área siguiente del circuito a partir del área actual
function nextAreaInCircuito(exp, currentArea) {
  const intervinientes = exp.intervinientes || [];
  const i = intervinientes.indexOf(currentArea);
  if (i < 0 || i >= intervinientes.length - 1) return null;
  const nextArea = intervinientes[i + 1];
  return window.getArea(nextArea).nombre || nextArea;
}


function PageDocumento({ exp, doc, docIndex, pageNum, total, thumb }) {
  if (!doc) return null;
  return (
    <div className="pdf-page is-doc">
      <PdfHeader exp={exp}/>

      <div className="pdf-doc-tag">DOCUMENTO {docIndex + 1} · {doc.tipo.toUpperCase()}</div>
      <h2 className="pdf-doc-titulo">{doc.nombre}</h2>

      <div className="pdf-doc-info">
        <div><span className="k">Aportado por</span><span className="v">{window.getArea(doc.area).nombre}</span></div>
        <div><span className="k">Fecha de carga</span><span className="v">{doc.fecha || "Pendiente"}</span></div>
        <div><span className="k">Tipo documental</span><span className="v">{doc.tipo}</span></div>
        <div><span className="k">Estado</span><span className="v">
          {doc.pendiente ? "Pendiente"
           : doc.firmado ? "Firmado digitalmente"
           : "Cargado"}
        </span></div>
        <div><span className="k">Carácter</span><span className="v">{doc.obligatorio ? "Obligatorio" : "Adicional"}</span></div>
      </div>

      {/* "Contenido" simulado del documento */}
      <div className="pdf-doc-cuerpo">
        {doc.pendiente ? (
          <div className="pdf-doc-pendiente">
            <IconAlert size={20}/>
            <div>
              <div className="t">Documento pendiente de incorporación</div>
              <div className="s">El área responsable aún no ha aportado este documento. La pieza queda reservada en el expediente y se incorporará al cerrar la solicitud.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="pdf-doc-lineas">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="ln" style={{ width: (60 + ((i * 13) % 38)) + "%" }}/>
              ))}
            </div>
            <div className="pdf-doc-bloque">
              <div className="bloq-label">Contenido completo del documento en el archivo adjunto</div>
              <div className="bloq-meta">{doc.nombre} · {doc.tipo}</div>
            </div>
          </>
        )}
      </div>

      {/* Pie de página del doc — firma si está firmado */}
      {doc.firmado && (
        <div className="pdf-doc-firma">
          <div className="trazo">
            <div className="signature">{window.getUser(doc.usuario).nombre || "—"}</div>
            <div className="ln"/>
            <div className="cargo">
              {window.getUser(doc.usuario).cargo}<br/>
              {window.getArea(doc.area).nombre}
            </div>
          </div>
          <div className="hash">
            <div><b>Firmado digitalmente</b></div>
            <div>Hash: a1c4f2…e89d</div>
            <div>Sello de tiempo: {doc.fecha} 14:32:18</div>
          </div>
        </div>
      )}

      <PdfFooter pageNum={pageNum} total={total} exp={exp}/>
    </div>
  );
}

// ─── PÁGINA FINAL: HOJA DE FIRMAS ───
function PageHojaFirmas({ exp, pageNum, total, thumb }) {
  const hoja = exp.hojaFirmas;
  if (!hoja) return null;

  return (
    <div className="pdf-page is-hoja">
      <PdfHeader exp={exp}/>

      <div className="pdf-hoja-cabecera">
        <div className="left">
          <div className="tag">PIEZA INSTITUCIONAL</div>
          <h1 className="titulo">Hoja de firmas</h1>
          <div className="sub">
            <span className="nro">{hoja.numero}</span>
          </div>
        </div>
        <div className="right">
          <div className={"badge " + (hoja.estado === "cerrada" ? "ok" : "info")}>
            {hoja.estado === "cerrada" ? "CERRADA" : "EN RECOLECCIÓN"}
          </div>
          <div className="fechas">
            <div><span>Iniciada</span><b>{hoja.abiertaEn}</b></div>
            {hoja.cerradaEn && <div><span>Cerrada</span><b>{hoja.cerradaEn}</b></div>}
          </div>
        </div>
      </div>

      <div className="pdf-hoja-intro">
        Los abajo firmantes, en su carácter de responsables de cada área interviniente, suscriben el presente expediente
        dejando constancia de su intervención, conformidad y/o aprobación en los términos del Decreto Municipal 412/26
        sobre tramitación electrónica y firma digital.
      </div>

      <table className="pdf-hoja-tbl">
        <thead>
          <tr>
            <th style={{ width: 36 }}>N°</th>
            <th>Cargo / Repartición</th>
            <th>Firmante</th>
            <th>Firma</th>
            <th style={{ width: 130 }}>Fecha y hora</th>
            <th style={{ width: 110 }}>Hash</th>
          </tr>
        </thead>
        <tbody>
          {(hoja.firmasRequeridas || []).map((req, i) => {
            const f = (hoja.firmas || []).find(x => x.area === req.area);
            return (
              <tr key={req.area + i} className={f ? "firmada" : "pendiente"}>
                <td className="n">{i + 1}</td>
                <td>
                  <div className="cargo">{req.cargo}</div>
                  <div className="area">{window.getArea(req.area).nombre || "—"}</div>
                </td>
                <td>
                  {f
                    ? <span className="firmante">{window.getUser(f.usuario).nombre || "—"}</span>
                    : <span className="muted">— Pendiente —</span>}
                </td>
                <td className="trazo-cell">
                  {f
                    ? <div className="trazo-mini">{window.getUser(f.usuario).nombre}</div>
                    : <div className="trazo-line"/>}
                </td>
                <td className="ts">{f ? <>{f.fecha}<br/><span className="hh">{f.hora} hs</span></> : <span className="muted">—</span>}</td>
                <td className="hash">{f ? f.hash : <span className="muted">—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pdf-hoja-cierre">
        <div className="izq">
          <div className="lbl">Hash de la Hoja de firmas</div>
          <div className="val">{hoja.hash}</div>
          <div className="leyenda">Hash SHA-256 sobre el conjunto de firmas, ordenado por sello de tiempo.</div>
        </div>
        <div className="der">
          <div className="lbl">Verificación pública</div>
          <div className="qr-mini" aria-hidden="true">
            <div className="qr-grid">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className={"qr-dot " + (((i * 11 + (hoja.numero || "").length) % 3) ? "on" : "")}/>
              ))}
            </div>
          </div>
          <div className="leyenda">sidi.malvinasargentinas.gob.ar/verificar</div>
        </div>
      </div>

      <PdfFooter pageNum={pageNum} total={total} exp={exp}/>
    </div>
  );
}

// ─── Header / Footer institucional ───
function PdfHeader({ exp }) {
  return (
    <div className="pdf-header">
      <div className="pdf-h-escudo" aria-hidden="true">
        <Escudo size={32}/>
      </div>
      <div className="pdf-h-titulo">
        <div className="muni">MUNICIPALIDAD DE MALVINAS ARGENTINAS</div>
        <div className="sis">Sistema de Expediente Digital · SIDI</div>
      </div>
      <div className="pdf-h-nro">
        <span className="lbl">Expediente</span>
        <span className="nro">{exp.nro}</span>
      </div>
    </div>
  );
}

function PdfFooter({ pageNum, total, exp }) {
  return (
    <div className="pdf-footer">
      <div>Página {pageNum} de {total}</div>
      <div>{exp.nro}</div>
      <div>Generado el 27/05/2026 · SIDI</div>
    </div>
  );
}

// ─── Versión "PDF" del número de expediente — más grande y monocromática ───
function NumExpPdf({ nro }) {
  if (!nro) return null;
  if (nro.startsWith("HCD-")) {
    return (
      <span style={{ fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ background: "#2E8B57", color: "#fff", padding: "3px 10px", borderRadius: 4, fontWeight: 700, fontSize: 22 }}>HCD</span>
        <span>{nro.slice(4)}</span>
      </span>
    );
  }
  if (nro.startsWith("E-")) {
    return (
      <span style={{ fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{ background: "var(--celeste)", color: "#fff", padding: "3px 12px", borderRadius: 4, fontWeight: 700, fontSize: 22 }}>E</span>
        <span>{nro.slice(2)}</span>
      </span>
    );
  }
  return <span style={{ fontFamily: "var(--font-mono)" }}>{nro}</span>;
}
