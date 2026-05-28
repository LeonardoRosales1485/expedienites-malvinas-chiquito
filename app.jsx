// Main app — router + shell
const { useState: useStateApp, useEffect: useEffectApp } = React;

// ============ LOGIN SCREEN ============
function LoginScreen({ onLogin }) {
  const users = window.USERS_CONFIG || [
    { id: 'admin', label: 'Administrador', icon: '🔐', email: 'admin@mma.gov.ar', nombre: 'Julieta Castro', cargo: 'Admin — Área Técnica' },
    { id: 'hab', label: 'Funcionario HAB', icon: '📋', email: 'demo.hab@mma.gov.ar', nombre: 'Diego Pérez', cargo: 'Analista — Habilitaciones' },
  ];
  
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <Escudo size={48}/>
          <h1>SIDI</h1>
          <div className="login-subtitle">Sistema de Expediente Digital</div>
          <div className="login-muni">Municipalidad de Malvinas Argentinas</div>
        </div>
        
        <div className="login-divider">Acceso rápido</div>
        
        <div className="login-users">
          {users.map(u => (
            <button key={u.id} className="login-user-btn" onClick={() => onLogin(u)}>
              <span className="login-user-icon">{u.icon}</span>
              <div className="login-user-info">
                <div className="login-user-name">{u.nombre}</div>
                <div className="login-user-role">{u.cargo}</div>
                <div className="login-user-email">{u.email}</div>
              </div>
              <IconChevR size={16}/>
            </button>
          ))}
        </div>
        
        <div className="login-footer">
          Sistema de Expediente Digital · v2.0
        </div>
      </div>
    </div>
  );
}

// ============ APP ============
function App() {
  const [route, setRoute]   = useStateApp("login");
  const [expNro, setExpNro] = useStateApp(window.EXPEDIENTES[0].nro);
  const [modal, setModal]   = useStateApp(null);
  const [sesionLoaded, setSesionLoaded] = useStateApp(false);

  // Load session from localStorage on mount
  useEffectApp(() => {
    const saved = localStorage.getItem('sidi_session');
    if (saved) {
      try {
        window.SESION = JSON.parse(saved);
        setRoute("dashboard");
      } catch(e) {
        window.SESION = null;
      }
    }
    setSesionLoaded(true);
  }, []);

  const handleLogin = (userConfig) => {
    window.SESION = { ...userConfig };
    localStorage.setItem('sidi_session', JSON.stringify(window.SESION));
    setRoute("dashboard");
  };

  const handleLogout = () => {
    window.SESION = null;
    localStorage.removeItem('sidi_session');
    setRoute("login");
  };

  const go = (r, payload) => {
    if (r === "detalle" && payload) setExpNro(payload);
    // Guard: block admin-only routes for funcionario
    const adminRoutes = ["auditoria", "reportes", "circuitos", "circuitoNuevo", "plantillas", "mesa"];
    if (adminRoutes.includes(r) && window.SESION?.rol !== 'admin') {
      r = "dashboard";
    }
    setRoute(r);
    requestAnimationFrame(() => {
      const m = document.querySelector(".main");
      if (m) m.scrollTop = 0;
    });
  };

  // Expose go for search dropdown
  window.__go = go;

  const crumbs = (() => {
    const map = {
      login:      ["Acceso"],
      dashboard:  ["Inicio"],
      bandeja:    ["Operación", "Mi bandeja"],
      mesa:       ["Operación", "Mesa de Entrada Virtual"],
      listado:    ["Operación", "Expedientes"],
      alta:       ["Operación", "Expedientes", "Nuevo expediente"],
      detalle:    ["Operación", "Expedientes", expNro],
      auditoria:  ["Control", "Trazabilidad"],
      reportes:   ["Control", "Reportes"],
      circuitos:      ["Configuración", "Circuitos"],
      circuitoNuevo:  ["Configuración", "Circuitos", "Nuevo circuito"],
      plantillas:     ["Configuración", "Plantillas"],
    };
    return map[route] || ["Inicio"];
  })();

  const currExp = window.getExp(expNro) || window.EXPEDIENTES[0];

  // Show login screen if not logged in
  if (route === "login" || !window.SESION) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <div className="brand">
        <Escudo size={32}/>
        <div className="name">
          <span style={{ display: "block", fontSize: 9.5, opacity: .7, letterSpacing: ".08em" }}>MALVINAS ARGENTINAS</span>
          <strong style={{ fontSize: 15, letterSpacing: ".06em" }}>SIDI</strong>
          <span style={{ opacity: .7, fontSize: 10 }}>Sistema de Expediente Digital</span>
        </div>
        {window.isFuncionario() && (
          <span className="role-badge">Funcionario</span>
        )}
      </div>

      <Topbar crumbs={crumbs} onLogout={handleLogout} onAlerta={(a) => {
        if (!a || !a.link) return;
        const map = {
          "#bandeja": ["bandeja", null],
          "#detalle": ["detalle", "E-4132-9.000.219-2026"],
        };
        const t = map[a.link];
        if (t) go(t[0], t[1]);
      }} />

      <Sidebar route={route} setRoute={(r) => go(r)} counts={{ bandeja: window.getBandeja ? window.getBandeja().length : 5, mesa: window.MESA_VIRTUAL.length }} />

      <main className="main">
        {route === "dashboard"  && <ScreenDashboard   go={go} />}
        {route === "bandeja"    && <ScreenBandeja     go={go} />}
        {route === "mesa"       && <ScreenMesaVirtual go={go} openModal={setModal} />}
        {route === "listado"    && <ScreenListado     go={go} />}
        {route === "alta"       && <ScreenAlta        go={go} />}
        {route === "detalle"    && <ScreenDetalle     nro={expNro} go={go} openModal={setModal} />}
        {route === "auditoria"  && <ScreenAuditoria   />}
        {route === "reportes"   && <ScreenReportes    />}
        {route === "circuitos"     && <ScreenCircuitos     go={go} />}
        {route === "circuitoNuevo" && <ScreenCircuitoNuevo go={go} />}
        {route === "plantillas"    && <ScreenPlantillas  />}
      </main>

      {modal === "firmar"       && <ModalFirmar       onClose={() => setModal(null)} />}
      {modal === "derivar"      && <ModalDerivar      exp={currExp} onClose={() => setModal(null)} />}
      {modal === "importar"     && <ModalImportar     onClose={() => setModal(null)} />}
      {modal === "listoFirmar"  && <ModalListoFirmar  exp={currExp} onClose={() => setModal(null)} />}
      {modal === "pdfPreview"   && <ModalPDFPreview   exp={currExp} onClose={() => setModal(null)} />}
      {modal === "forzarPase"   && <ModalForzarPaseDirecto exp={currExp} onClose={() => setModal(null)} />}

      <SidiTweaks/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
