param(
  [string]$SourceHtml = "Expediente Digital (standalone-src).html",
  [string]$OutputFile = "Expediente Digital (standalone).html",
  [string]$Title = "SIDI — Sistema de Expediente Digital · Municipio de Malvinas Argentinas"
)

$ErrorActionPreference = "Stop"

# ── Files to bundle (relative to script directory) ──────────────
$assets = @(
  @{ Path = "styles.css";           Mime = "text/css" },
  @{ Path = "data.js";             Mime = "text/javascript" },
  @{ Path = "shell.jsx";           Mime = "text/babel" },
  @{ Path = "screens-ops.jsx";     Mime = "text/babel" },
  @{ Path = "screen-detalle.jsx";  Mime = "text/babel" },
  @{ Path = "screens-rest.jsx";    Mime = "text/babel" },
  @{ Path = "tweaks-panel.jsx";    Mime = "text/babel" },
  @{ Path = "tweaks.jsx";          Mime = "text/babel" },
  @{ Path = "app.jsx";             Mime = "text/babel" }
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── 1. Compress + encode each asset ────────────────────────────
$manifest = @{}
$uuidMap   = @{}   # filename -> uuid

Add-Type -AssemblyName System.IO.Compression

foreach ($a in $assets) {
  $filePath = Join-Path $scriptDir $a.Path
  if (-not (Test-Path $filePath)) {
    Write-Warning "Missing: $($a.Path) — skipping"
    continue
  }

  $bytes = [System.IO.File]::ReadAllBytes($filePath)
  $outStream = [System.IO.MemoryStream]::new()
  $gzip = [System.IO.Compression.GZipStream]::new($outStream, [System.IO.Compression.CompressionMode]::Compress, $false)
  $gzip.Write($bytes, 0, $bytes.Length)
  $gzip.Close()
  $compressed = $outStream.ToArray()
  $outStream.Close()

  $b64 = [Convert]::ToBase64String($compressed)
  $uuid = [guid]::NewGuid().ToString()

  $manifest[$uuid] = @{
    mime       = $a.Mime
    compressed = $true
    data       = $b64
  }
  $uuidMap[$a.Path] = $uuid
  Write-Host "  Bundled $($a.Path) → $uuid ($($compressed.Length) bytes gzipped)"
}

# ── 2. Read source HTML and replace local URLs with UUIDs ──────
$srcPath = Join-Path $scriptDir $SourceHtml
if (-not (Test-Path $srcPath)) {
  Write-Error "Source HTML not found: $SourceHtml"
  exit 1
}

$html = [System.IO.File]::ReadAllText($srcPath, [System.Text.Encoding]::UTF8)

foreach ($kv in $uuidMap.GetEnumerator()) {
  # Replace href="filename" and src="filename" with the UUID
  $html = $html -replace "(href|src)=\"$($kv.Key)\"", "`$1=`"$($kv.Value)`""
}

# ── 3. Stringify HTML as JSON ──────────────────────────────────
$templateJson = ConvertTo-Json $html -AsString -Depth 1 -Compress

# ── 4. Build the standalone file ────────────────────────────────
$manifestJson = ConvertTo-Json $manifest -Depth 3 -Compress

# Bootstrap styles
$bootstrapStyle = @"
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #F4F6F9; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    #__bundler_loading { position: fixed; bottom: 20px; right: 20px; font: 13px/1.4 -apple-system, BlinkMacSystemFont, sans-serif; color: #666; background: #fff; padding: 8px 14px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.12); z-index: 10000; }
    #__bundler_thumbnail { position: fixed; inset: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #F4F6F9; z-index: 9999; }
    #__bundler_thumbnail svg { width: 100%; height: 100%; object-fit: contain; }
"@

# Runtime (from the existing standalone — the self-extracting engine)
$runtime = @'
document.addEventListener('DOMContentLoaded', async function() {
  const loading = document.getElementById('__bundler_loading');
  function setStatus(msg) { if (loading) loading.textContent = msg; }

  window.addEventListener('error', function(e) {
    var p = document.body || document.documentElement;
    var d = document.getElementById('__bundler_err') || p.appendChild(document.createElement('div'));
    d.id = '__bundler_err';
    d.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;font:12px/1.4 ui-monospace,monospace;background:#2a1215;color:#ff8a80;padding:10px 14px;border-radius:8px;border:1px solid #5c2b2e;z-index:99999;white-space:pre-wrap;max-height:40vh;overflow:auto';
    d.textContent = (d.textContent ? d.textContent + String.fromCharCode(10) : '') +
      '[bundle] ' + (e.message || e.type) +
      (e.filename ? ' (' + e.filename.slice(0, 60) + ':' + e.lineno + ')' : '');
  }, true);

  try {
    const manifestEl = document.querySelector('script[type="__bundler/manifest"]');
    const templateEl = document.querySelector('script[type="__bundler/template"]');
    if (!manifestEl || !templateEl) {
      setStatus('Error: missing bundle data');
      console.error('[bundler] Missing script tags');
      return;
    }

    const manifest = JSON.parse(manifestEl.textContent);
    let template = JSON.parse(templateEl.textContent);

    const uuids = Object.keys(manifest);
    setStatus('Unpacking ' + uuids.length + ' assets...');

    const blobUrls = {};
    await Promise.all(uuids.map(async (uuid) => {
      const entry = manifest[uuid];
      try {
        const binaryStr = atob(entry.data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

        let finalBytes = bytes;
        if (entry.compressed) {
          if (typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('gzip');
            const writer = ds.writable.getWriter();
            const reader = ds.readable.getReader();
            writer.write(bytes);
            writer.close();
            const chunks = [];
            let totalLen = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
              totalLen += value.length;
            }
            finalBytes = new Uint8Array(totalLen);
            let offset = 0;
            for (const chunk of chunks) { finalBytes.set(chunk, offset); offset += chunk.length; }
          } else {
            console.warn('DecompressionStream not available, asset ' + uuid + ' may not render');
          }
        }

        blobUrls[uuid] = URL.createObjectURL(new Blob([finalBytes], { type: entry.mime }));
      } catch (err) {
        console.error('Failed to decode asset ' + uuid + ':', err);
        blobUrls[uuid] = URL.createObjectURL(new Blob([], { type: entry.mime }));
      }
    }));

    const extResEl = document.querySelector('script[type="__bundler/ext_resources"]');
    const extResources = extResEl ? JSON.parse(extResEl.textContent) : [];
    const resourceMap = {};
    for (const entry of extResources) {
      if (blobUrls[entry.uuid]) resourceMap[entry.id] = blobUrls[entry.uuid];
    }

    setStatus('Rendering...');
    for (const uuid of uuids) template = template.split(uuid).join(blobUrls[uuid]);

    template = template.replace(/\s+integrity="[^"]*"/gi, '').replace(/\s+crossorigin="[^"]*"/gi, '');

    const resourceScript = '<script>window.__resources = ' +
      JSON.stringify(resourceMap).split('</' + 'script>').join('<\\/' + 'script>') +
      ';</' + 'script>';
    const headOpen = template.match(/<head[^>]*>/i);
    if (headOpen) {
      const i = headOpen.index + headOpen[0].length;
      template = template.slice(0, i) + resourceScript + template.slice(i);
    }

    const doc = new DOMParser().parseFromString(template, 'text/html');
    document.documentElement.replaceWith(doc.documentElement);
    const dead = Array.from(document.scripts);
    for (const old of dead) {
      const s = document.createElement('script');
      for (const a of old.attributes) s.setAttribute(a.name, a.value);
      s.textContent = old.textContent;
      if ((s.type === 'text/babel' || s.type === 'text/jsx') && s.src) {
        const r = await fetch(s.src);
        s.textContent = await r.text();
        s.removeAttribute('src');
      }
      const p = s.src ? new Promise(function(r) { s.onload = s.onerror = r; }) : null;
      old.replaceWith(s);
      if (p) await p;
    }
    if (window.Babel && typeof window.Babel.transformScriptTags === 'function') {
      window.Babel.transformScriptTags();
    }
  } catch (err) {
    setStatus('Error unpacking: ' + err.message);
    console.error('Bundle unpack error:', err);
  }
});
'@

# Thumbnail SVG (extracted from source HTML template)
$thumbnailSvg = @'
<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="800" fill="#0F2E4C"/>
  <circle cx="600" cy="340" r="120" fill="#ffffff"/>
  <circle cx="600" cy="340" r="120" fill="none" stroke="#1E7A3D" stroke-width="10"/>
  <circle cx="600" cy="318" r="40" fill="#5BA3D9"/>
  <path d="M600 358 L545 425 H655 Z" fill="#1E7A3D"/>
  <line x1="535" y1="430" x2="665" y2="430" stroke="#1E7A3D" stroke-width="6" stroke-linecap="round"/>
  <text x="600" y="540" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="76" fill="#ffffff" letter-spacing="6">SIDI</text>
  <text x="600" y="585" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#5BA3D9" letter-spacing="3">SISTEMA DE EXPEDIENTE DIGITAL</text>
  <text x="600" y="615" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.55)" letter-spacing="2">MUNICIPIO DE MALVINAS ARGENTINAS</text>
</svg>
'@

# ── 5. Assemble final HTML ──────────────────────────────────────
$standalone = @"
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>$Title</title>
  <style>$bootstrapStyle</style>
  <noscript>
    <style>#__bundler_loading { display: none; }</style>
    <div style="position:fixed;bottom:12px;left:12px;font:13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;color:#999;background:rgba(255,255,255,0.9);padding:6px 12px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.08);z-index:10000;">
      This page requires JavaScript to display.
    </div>
  </noscript>
</head>
<body>
  <div id="__bundler_thumbnail">$thumbnailSvg</div>
  <div id="__bundler_loading">Unpacking...</div>
  <script>$runtime</script>
  <script type="__bundler/manifest">$manifestJson</script>
  <script type="__bundler/ext_resources">[]</script>
  <script type="__bundler/template">$templateJson</script>
</body>
</html>
"@

$outPath = Join-Path $scriptDir $OutputFile
[System.IO.File]::WriteAllText($outPath, $standalone, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "✅ Standalone generated: $OutputFile"
Write-Host "   Assets bundled: $($manifest.Count)"
