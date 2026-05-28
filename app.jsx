// Main app — router + shell
const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [route, setRoute]   = useStateApp("dashboard");
  const [expNro, setExpNro] = useStateApp(window.EXPEDIENTES[0].nro);
  const [modal, setModal]   = useStateApp(null);

  const go = (r, payload) => {
    if (r === "detalle" && payload) setExpNro(payload);
    setRoute(r);
    requestAnimationFrame(() => {
      const m = document.querySelector(".main");
      if (m) m.scrollTop = 0;
    });
  };

  const crumbs = (() => {
    const map = {
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

  return (
    <div className="app">
      <div className="brand">
        <Escudo size={32}/>
        <div className="name">
          <span style={{ display: "block", fontSize: 9.5, opacity: .7, letterSpacing: ".08em" }}>MALVINAS ARGENTINAS</span>
          <strong style={{ fontSize: 15, letterSpacing: ".06em" }}>SIDI</strong>
          <span style={{ opacity: .7, fontSize: 10 }}>Sistema de Expediente Digital</span>
        </div>
      </div>

      <Topbar crumbs={crumbs} onAlerta={(a) => {
        if (!a || !a.link) return;
        const map = {
          "#bandeja": ["bandeja", null],
          "#detalle": ["detalle", "E-4132-9.000.219-2026"],
        };
        const t = map[a.link];
        if (t) go(t[0], t[1]);
      }} />

      <Sidebar route={route} setRoute={(r) => go(r)} counts={{ bandeja: 5, mesa: window.MESA_VIRTUAL.length }} />

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

      <SidiTweaks/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
