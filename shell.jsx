// Shared icons + small components — Sistema de Expediente Digital

const { useState, useEffect, useMemo, useRef } = React;

// ---- ICON COMPONENTS (small inline SVGs, monoline) ----
function Ic({ d, size = 16, sw = 1.6, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
         strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
const IconHome      = (p) => <Ic d="M3 11l9-8 9 8M5 9.5V21h14V9.5" {...p} />;
const IconInbox     = (p) => <Ic d="M3 13h5l2 3h4l2-3h5M3 13V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" {...p} />;
const IconList      = (p) => <Ic d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" {...p} />;
const IconPlus      = (p) => <Ic d="M12 5v14M5 12h14" {...p} />;
const IconHistory   = (p) => <Ic d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5M12 7v5l3 2" {...p} />;
const IconChart     = (p) => <Ic d="M3 3v18h18M7 14l4-4 4 4 5-7" {...p} />;
const IconCog       = (p) => <Ic d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" {...p} />;
const IconBell      = (p) => <Ic d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" {...p} />;
const IconSearch    = (p) => <Ic d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" {...p} />;
const IconFile      = (p) => <Ic d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" {...p} />;
const IconDownload  = (p) => <Ic d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" {...p} />;
const IconUpload    = (p) => <Ic d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" {...p} />;
const IconSign      = (p) => <Ic d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.6 7.6M11 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" {...p} />;
const IconCheck     = (p) => <Ic d="M20 6L9 17l-5-5" {...p} />;
const IconX         = (p) => <Ic d="M18 6L6 18M6 6l12 12" {...p} />;
const IconAlert     = (p) => <Ic d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" {...p} />;
const IconArrowR    = (p) => <Ic d="M5 12h14M12 5l7 7-7 7" {...p} />;
const IconChevR     = (p) => <Ic d="M9 18l6-6-6-6" {...p} />;
const IconChevL     = (p) => <Ic d="M15 18l-6-6 6-6" {...p} />;
const IconChevD     = (p) => <Ic d="M6 9l6 6 6-6" {...p} />;
const IconClock     = (p) => <Ic d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" {...p} />;
const IconUsers     = (p) => <Ic d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...p} />;
const IconBuilding  = (p) => <Ic d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 13h.01M9 17h.01" {...p} />;
const IconShield    = (p) => <Ic d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p} />;

Object.assign(window, {
  Ic, IconHome, IconInbox, IconList, IconPlus, IconHistory, IconChart, IconCog,
  IconBell, IconSearch, IconFile, IconDownload, IconUpload, IconSign,
  IconCheck, IconX, IconAlert, IconArrowR, IconChevR, IconChevL, IconChevD,
  IconClock, IconUsers, IconBuilding, IconShield,
});

// ---- BRAND / ESCUDO ----
function Escudo({ size = 30 }) {
  return (
    <div className="escudo" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.72} height={size * 0.72}>
        <circle cx="12" cy="9" r="3.5" fill="#5BA3D9" />
        <path d="M12 12.5 L7 18 H17 Z" fill="#1E7A3D" />
        <path d="M5 19 H19" stroke="#1E7A3D" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
window.Escudo = Escudo;

// ---- SIDEBAR ----
function Sidebar({ route, setRoute, counts, onLogout }) {
  const sesion = window.SESION || {};
  const isAdmin = sesion.rol === 'admin';
  
  const allItems = [
    { id: "dashboard", label: "Inicio",                 icon: <IconHome />,    group: "Operación" },
    { id: "bandeja",   label: "Mi bandeja",             icon: <IconInbox />,   group: "Operación", badge: counts.bandeja },
    { id: "mesa",      label: "Mesa de Entrada Virtual",icon: <IconBuilding />,group: "Operación", badge: counts.mesa, adminOnly: true },
    { id: "listado",   label: "Expedientes",            icon: <IconList />,    group: "Operación" },
    { id: "alta",      label: "Nuevo expediente",       icon: <IconPlus />,    group: "Operación" },
    { id: "auditoria", label: "Trazabilidad",           icon: <IconHistory />, group: "Control", adminOnly: true },
    { id: "reportes",  label: "Reportes",               icon: <IconChart />,   group: "Control", adminOnly: true },
    { id: "circuitos", label: "Circuitos y workflow",   icon: <IconCog />,     group: "Configuración", adminOnly: true },
    { id: "plantillas",label: "Plantillas",             icon: <IconFile />,    group: "Configuración", adminOnly: true },
  ];
  
  const items = allItems.filter(it => isAdmin || !it.adminOnly);
  const groups = [...new Set(items.map(i => i.group))];
  
  return (
    <nav className="side">
      {groups.map(g => (
        <div key={g}>
          <div className="group">{g}</div>
          {items.filter(i => i.group === g).map(it => (
            <div key={it.id}
                 className={"item " + (route === it.id ? "active" : "")}
                 onClick={() => setRoute(it.id)}>
              <span className="ic">{it.icon}</span>
              <span>{it.label}</span>
              {it.badge ? <span className="badge">{it.badge}</span> : null}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}
window.Sidebar = Sidebar;

// ---- TOPBAR ----
function Topbar({ crumbs, onAlerta, onLogout }) {
  const [openNotif, setOpenNotif] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const sesion = window.SESION || {};
  const alertas = (window.getAlertas ? window.getAlertas() : window.ALERTAS) || [];
  const searchRef = React.useRef(null);
  
  const searchResults = searchQuery.length >= 2
    ? window.EXPEDIENTES.filter(e =>
        (e.nro + e.titulo + e.objeto + e.iniciador).toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];
  
  React.useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  
  const initials = (sesion.nombre || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  
  return (
    <header className="topbar">
      <div className="breadcrumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? "cur" : ""}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="search" ref={searchRef} style={{ position: "relative" }}>
        <span className="icon"><IconSearch size={15} /></span>
        <input
          placeholder="Buscar por número, solicitante, objeto…"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
        />
        {searchOpen && searchResults.length > 0 && (
          <>
            <div className="search-overlay" onClick={() => setSearchOpen(false)} />
            <div className="search-dropdown">
              <div className="search-dropdown-head">{searchResults.length} resultado{searchResults.length !== 1 && 's'}</div>
              {searchResults.map(e => (
                <button key={e.nro} className="search-result" onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  if (window.__go) window.__go("detalle", e.nro);
                }}>
                  <NumExp nro={e.nro}/>
                  <div style={{ flex: 1, marginLeft: 8, textAlign: "left" }}>
                    <div className="titulo" style={{ fontSize: 12.5 }}>{e.titulo}</div>
                    <div className="descr" style={{ fontSize: 11 }}>{e.iniciador}</div>
                  </div>
                  <ModalidadChip mod={e.modalidad} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="notif-wrap" style={{ position: "relative" }}>
        <button
          className={"btn-ghost btn notif-btn" + (openNotif ? " is-open" : "")}
          onClick={() => setOpenNotif(o => !o)}
          title="Notificaciones"
          aria-expanded={openNotif}
        >
          <span className="bell-wrap">
            <IconBell size={18} />
            {alertas.length > 0 && <span className="bell-dot">{alertas.length}</span>}
          </span>
        </button>
        {openNotif && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 60 }}
              onClick={() => setOpenNotif(false)}
            />
            <div className="notif-panel" role="menu">
              <div className="notif-panel-head">
                <div>
                  <div className="notif-panel-title">Notificaciones</div>
                  <div className="notif-panel-sub">{alertas.length} avisos sin leer</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => setOpenNotif(false)}>
                  <IconX size={12}/>
                </button>
              </div>
              <div className="notif-panel-list">
                {alertas.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 12.5 }}>
                    Sin notificaciones pendientes.
                  </div>
                ) : alertas.map((a, i) => {
                  const ic = a.tipo === "vencido" ? <IconAlert size={14}/>
                           : a.tipo === "firma"   ? <IconSign size={14}/>
                           :                        <IconBell size={14}/>;
                  const tono = a.tipo === "vencido" ? "err" : a.tipo === "firma" ? "warn" : "info";
                  return (
                    <button
                      key={i}
                      className={"notif-item tone-" + tono}
                      onClick={() => { setOpenNotif(false); onAlerta && onAlerta(a); }}
                    >
                      <span className={"notif-ico tone-" + tono}>{ic}</span>
                      <span className="notif-body">
                        <span className="notif-text">{a.texto}</span>
                        <span className="notif-meta">
                          {a.tipo === "vencido" ? "Plazos vencidos" : a.tipo === "firma" ? "Pendiente de firma" : "Aviso"}
                          {" · "}hace {[3, 18, 42][i % 3]} min
                        </span>
                      </span>
                      <span className="notif-chev"><IconChevR size={12}/></span>
                    </button>
                  );
                })}
              </div>
              <div className="notif-panel-foot">
                <button className="btn btn-sm btn-ghost" onClick={() => setOpenNotif(false)}>Marcar todo como leído</button>
                <button className="btn btn-sm" onClick={() => { setOpenNotif(false); onAlerta && onAlerta({ link: "#bandeja" }); }}>
                  Ver mi bandeja <IconChevR size={11}/>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="user" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="avatar">{initials}</div>
        <div>
          <div className="name">{sesion.nombre || "Sin sesión"}</div>
          <div className="role">{sesion.cargo || ""}</div>
        </div>
        {onLogout && (
          <button className="btn btn-sm btn-ghost" onClick={onLogout} title="Cerrar sesión" style={{ marginLeft: 6 }}>
            <IconX size={13}/> Salir
          </button>
        )}
      </div>
    </header>
  );
}
window.Topbar = Topbar;

// ---- HELPERS ----
window.getTipo   = (id) => window.TIPOS.find(t => t.id === id) || {};
window.getTipoCat = (id) => (window.TIPOS_CATALOGO || []).find(t => t.id === id) || null;
window.getArea   = (id) => window.AREAS.find(a => a.id === id) || {};
window.getEstado = (id) => window.ESTADOS[id] || { label: id, tono: "neutral" };
window.getUser   = (id) => window.USUARIOS.find(u => u.id === id) || {};
window.getExp    = (nro) => window.EXPEDIENTES.find(e => e.nro === nro);
window.__go = null; // Will be set by App

function EstadoChip({ estado }) {
  const e = window.getEstado(estado);
  return <span className={"chip " + e.tono}><span className="chip-dot"/>{e.label}</span>;
}
window.EstadoChip = EstadoChip;

function TipoChip({ tipo, small }) {
  const t = window.getTipo(tipo);
  return (
    <span className="chip neutral" style={{ background: t.color + "18", color: t.color, borderColor: t.color + "33", fontSize: small ? 10.5 : 11.5 }}>
      {t.rubro}
    </span>
  );
}
window.TipoChip = TipoChip;

function ModalidadChip({ mod, withIcon = true }) {
  const m = window.MODALIDADES[mod];
  if (!m) return null;
  const ic = mod === "libre"        ? <Ic d="M3 12h18M3 6h18M3 18h18" size={11}/>
           : mod === "orientativa"  ? <Ic d="M12 2L4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-5z" size={11}/>
           :                          <Ic d="M5 11V7a7 7 0 0 1 14 0v4M3 11h18v10H3z" size={11}/>;
  return (
    <span className={"mod-chip " + mod}>
      {withIcon && ic}
      {m.label}
    </span>
  );
}
window.ModalidadChip = ModalidadChip;

// Formato visual del nro de expediente — resalta el prefijo E- digital
function NumExp({ nro }) {
  if (!nro) return null;
  if (nro.startsWith("HCD-")) {
    return <span style={{ fontFamily: "var(--font-mono)", fontSize: "inherit" }}>
      <span style={{ background: "#2E8B57", color: "#fff", padding: "1px 5px", borderRadius: 3, fontWeight: 700, marginRight: 4 }}>HCD</span>
      <span style={{ color: "var(--text-2)" }}>{nro.slice(4)}</span>
    </span>;
  }
  if (nro.startsWith("E-")) {
    return <span style={{ fontFamily: "var(--font-mono)", fontSize: "inherit" }}>
      <span style={{ background: "var(--celeste)", color: "#fff", padding: "1px 5px", borderRadius: 3, fontWeight: 700, marginRight: 4 }}>E</span>
      <span style={{ color: "var(--text-2)" }}>{nro.slice(2)}</span>
    </span>;
  }
  return <span style={{ fontFamily: "var(--font-mono)" }}>{nro}</span>;
}
window.NumExp = NumExp;

function VenceChip({ dias }) {
  if (dias < 0) return <span className="chip err"><span className="chip-dot"/>Vencido {Math.abs(dias)}d</span>;
  if (dias <= 3) return <span className="chip warn"><span className="chip-dot"/>Vence en {dias}d</span>;
  return <span className="chip neutral">En {dias}d</span>;
}
window.VenceChip = VenceChip;

function Avatar({ uid, size = 22 }) {
  const u = window.getUser(uid);
  return <span className="avatar-sm" style={{ width: size, height: size, fontSize: size * 0.42 }}>{u.inic || "?"}</span>;
}
window.Avatar = Avatar;
