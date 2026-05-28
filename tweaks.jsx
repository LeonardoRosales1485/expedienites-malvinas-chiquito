// Tweaks integration for SIDI

const SIDI_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#5BA3D9",
  "navy":   "#0F2E4C",
  "density": "comfortable",
  "fontScale": 100,
  "sidebarTheme": "dark",
  "showModalidadCol": true,
  "showCollaborativeBanner": true,
  "showArchitectureBanner": true,
  "highlightForcedPass": true
}/*EDITMODE-END*/;

function SidiTweaks() {
  const [t, setTweak] = useTweaks(SIDI_TWEAK_DEFAULTS);

  // Apply tweaks live to CSS vars + body classes
  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--celeste", t.accent);
    r.style.setProperty("--celeste-soft", t.accent + "55");
    r.style.setProperty("--celeste-50",   t.accent + "1A");
    r.style.setProperty("--navy",  t.navy);
    r.style.setProperty("--navy-2", t.navy);
    document.body.style.fontSize = (14 * t.fontScale / 100) + "px";
    document.body.classList.toggle("density-compact", t.density === "compact");
    document.body.classList.toggle("sidebar-light",   t.sidebarTheme === "light");
    document.body.classList.toggle("hide-modalidad-col",     !t.showModalidadCol);
    document.body.classList.toggle("hide-collab-banner",     !t.showCollaborativeBanner);
    document.body.classList.toggle("hide-arch-banner",       !t.showArchitectureBanner);
    document.body.classList.toggle("highlight-forced",        t.highlightForcedPass);
  }, [t]);

  return (
    <TweaksPanel title="Tweaks · SIDI">
      <TweakSection label="Identidad visual">
        <TweakColor
          label="Color de acento"
          value={t.accent}
          options={["#5BA3D9", "#2A6FDB", "#1E7A3D", "#9A5BC9", "#C97A1F"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakColor
          label="Navy / sidebar"
          value={t.navy}
          options={["#0F2E4C", "#1A3D63", "#0B1F33", "#1F2D3D", "#243B53"]}
          onChange={(v) => setTweak("navy", v)}
        />
        <TweakRadio
          label="Tema de la sidebar"
          value={t.sidebarTheme}
          options={["dark", "light"]}
          onChange={(v) => setTweak("sidebarTheme", v)}
        />
      </TweakSection>

      <TweakSection label="Densidad y tipografía">
        <TweakRadio
          label="Densidad"
          value={t.density}
          options={["compact", "comfortable"]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakSlider
          label="Escala de tipografía"
          value={t.fontScale}
          min={85} max={115} step={5} unit="%"
          onChange={(v) => setTweak("fontScale", v)}
        />
      </TweakSection>

      <TweakSection label="Visibilidad">
        <TweakToggle
          label="Columna Modalidad"
          value={t.showModalidadCol}
          onChange={(v) => setTweak("showModalidadCol", v)}
        />
        <TweakToggle
          label="Banner colaborativo en detalle"
          value={t.showCollaborativeBanner}
          onChange={(v) => setTweak("showCollaborativeBanner", v)}
        />
        <TweakToggle
          label="Banner trimodal en inicio"
          value={t.showArchitectureBanner}
          onChange={(v) => setTweak("showArchitectureBanner", v)}
        />
        <TweakToggle
          label="Resaltar pases forzados"
          value={t.highlightForcedPass}
          onChange={(v) => setTweak("highlightForcedPass", v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

window.SidiTweaks = SidiTweaks;
