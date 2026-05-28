# SIDI · Sistema de Expediente Digital Municipal — Resumen de proyecto

> Prototipo interactivo navegable construido para la **Municipalidad de Malvinas Argentinas**, basado en dos documentos funcionales y los ajustes pedidos durante el chat.

---

## 1. Contexto y decisiones iniciales

- **Cliente:** Municipalidad de Malvinas Argentinas (sitio referencia: `https://www.malvinasargentinas.gob.ar/`).
- **Usuario destino:** personal administrativo / oficinistas internos.
- **Tipo de output:** prototipo **interactivo navegable** en HTML+React (no wireframe, no estático).
- **Dispositivo:** desktop web.
- **Estilo:** **institucional/gubernamental sobrio** — celeste argentino + navy + verde escudo, tipografía Inter, sin emojis, sin gradientes agresivos.
- **Idioma:** todo en español rioplatense.
- **Tono de copy:** profesional pero cercano.
- **Una sola propuesta sólida** (no variantes).

---

## 2. Arquitectura del sistema — concepto central

El sistema se llama **SIDI · Sistema de Expediente Digital** y se basa en un **motor de workflow trimodal** donde cada circuito puede operar en una de tres modalidades configurables por el administrador:

| Modalidad | Color | Comportamiento |
|---|---|---|
| **Libre** | gris | Gestor documental abierto. El operador adjunta archivos, define destinatarios y avanza libremente. Sin documentación obligatoria. |
| **Orientativa** | celeste/azul | El sistema sugiere el próximo paso normativo y alerta ante desvíos, pero NO bloquea. La excepción queda registrada. |
| **Restrictiva** | verde | Flujo cerrado e inexpugnable. Datos obligatorios en puntos fijos. Destino automatizado. No avanza si falta documentación. |

Cada **tipo de trámite** tiene asignada una modalidad por defecto (ej. Habilitaciones → restrictiva, Compras → orientativa, Circuito 53 General → libre).

---

## 3. Numeración de expedientes

Formato nuevo, reemplazando el formato `EX-2026-...`:

- **Generales:** `E-4132-9.XXX.XXX-2026`
  - `E` = electrónico (badge celeste destacado visualmente con componente `<NumExp/>`)
  - `4132` = código municipal
  - Rango de los 9 millones = identificación inequívocamente digital
- **HCD (Concejo Deliberante, autónomo):** `HCD-4132-O.XXX.XXX-2026` con badge verde

---

## 4. Estructura de archivos del proyecto

```
Expediente Digital.html        ← entry point (lo que el usuario abre)
styles.css                     ← sistema de diseño completo
data.js                        ← mock data (expedientes, áreas, modalidades, plantillas, etc.)
shell.jsx                      ← Sidebar, Topbar, escudo, ModalidadChip, NumExp, helpers
screens-ops.jsx                ← Dashboard, Bandeja, Listado
screen-detalle.jsx             ← Detalle expediente + todas sus tabs + banner colaborativo
screens-rest.jsx               ← Alta wizard, Mesa Virtual, Auditoría, Reportes,
                                 Circuitos, Circuito Nuevo wizard, Plantillas, todos los modals
tweaks.jsx                     ← panel de tweaks integrado
tweaks-panel.jsx               ← starter component (TweaksPanel, useTweaks, controles)
app.jsx                        ← router + montaje

SIDI - Expediente Digital Municipal.html  ← bundle standalone offline (1.7 MB)
```

**Stack:** React 18.3.1 + Babel standalone (todo inline JSX, sin build step).
**Sesión simulada:** Julieta Castro · Analista Área Técnica · **rol Jefe de sector** (`window.SESION.esJefeSector = true`).

---

## 5. Pantallas implementadas

### Sidebar — agrupado en 3 secciones

**Operación**
- **Inicio** (dashboard) — KPIs, banner trimodal, bandeja resumida, alertas, actividad reciente
- **Mi bandeja** — tareas asignadas al usuario con filtros por prioridad/estado
- **Mesa de Entrada Virtual** — cola de borradores pendientes de caratulación oficial
- **Expedientes** — listado completo con filtros por tipo/estado/búsqueda
- **Nuevo expediente** — wizard de alta de 4 pasos

**Control**
- **Trazabilidad** — auditoría global con desvíos, pases forzados, no conformidades
- **Reportes** — distribución por estado, cumplimiento de plazos, productividad por área, tiempo medio por tipo

**Configuración**
- **Circuitos y workflow** — listado + editor de modalidad por circuito
- **Plantillas** — repositorio documental por área

### Detalle de expediente

Tabs en orden:
1. **Documentos** — tabla con tipo, área aportante, fecha, estado (firmado/cargado/pendiente)
2. **Circuito** — visualización del flow con pasos completados/actuales/pendientes + sidebar de acciones
3. **Historial** — timeline completo de movimientos
4. **Datos del trámite** — solicitante y metadata
5. **Sub-expedientes** (solo si aplica) — trámites internos del área que no salen
6. **Notificaciones** — internas y externas al solicitante

Encima de los tabs:
- **Banner colaborativo** con barra de progreso de documentación + CTA "Marcar como Listo para firmar" gated por rol Jefe de sector
- Badges: estado, tipo, modalidad, HCD/importado/Circuito 53 cuando corresponde
- Botones de acción: Descargar PDF, Guardar progreso, Derivar, Intervenir/firmar

---

## 6. Flujos clave

### Alta de expediente (wizard 4 pasos)

1. **Tipo y origen** — selección de tipo (cards con modalidad visible) + checkbox multi-origen (Vecino, Salud, Obras, Educación, etc.)
2. **Solicitante** — razón social/nombre, CUIT, contacto, domicilio, objeto
3. **Documentación** — lista adaptada al tipo seleccionado, con simulación de carga real al hacer clic; en modalidad libre no hay docs pre-cargados
4. **Confirmación** — resumen + diagrama del ciclo de vida (Borrador → Carga colaborativa → Listo para firmar → Firmado)

**Botones finales:**
- "Guardar y salir" → vuelve al listado
- "Guardar borrador y continuar cargando" → lleva al detalle del expediente `E-4132-9.000.612-2026` con los datos elegidos inyectados (modalidad, tipo, objeto, solicitante, intervinientes y docsRequeridos correctos para cada caso)

**Importante:** el wizard **NO envía**, **guarda progreso**. Otras áreas pueden intervenir agregando formularios/actas/informes. Solo el **Jefe de sector** puede dar el OK final cuando esté toda la documentación cargada.

### Modal "Forzar pase" (la estrella del demo)

En modalidad **orientativa**, si se intenta derivar a un área distinta a la sugerida por el circuito:
- Aparece alerta *"Ojo — este pase se desvía del circuito"*
- Comparativa visual lado a lado: ruta sugerida ↔ tu elección
- Campo obligatorio de motivo
- 3 acciones: Cancelar / Cambiar destino / **Forzar pase**
- La excepción queda registrada en trazabilidad como "pase forzado"

### Marcar como Listo para firmar (modal)

- Disponible solo si **toda la documentación obligatoria está cargada** Y la sesión tiene rol Jefe de sector
- Confirmación con comentario de aprobación
- Estado cambia a `listoFirmar`, queda registrado con firma de jefatura

### Importar desde sistemas externos (modal)

PDFs cerrados de **MEAL / RAFAM / SIGAM** se importan sin transcribir. Quedan marcados con badge `↓ Importado desde MEAL`.

### Mesa de Entrada Virtual

Cola de borradores con botón **"Caratular"** que asigna número oficial `E-4132-9.000.XXX-2026` y deriva automáticamente al área responsable según el circuito.

### Nuevo circuito (wizard 5 pasos)

1. Datos básicos (código autogenerado por rubro, nombre, descripción, plazo total)
2. **Modalidad** (segmented Libre/Orientativa/Restrictiva con preview detallado del comportamiento)
3. **Pasos del circuito** (agregar/quitar/reordenar, área por dropdown, plazo en días, validación de suma vs. plazo declarado)
4. Documentación obligatoria + reglas (subsanación, notificación automática)
5. Revisión — Guardar como borrador / **Guardar y publicar**

---

## 7. Excepciones modeladas

- **HCD (Concejo Deliberante):** numeración propia con prefijo verde, badge "Aut\u00f3nomo", entorno libre.
- **Circuito 53 General Genérico:** modalidad libre para casuísticas atípicas (ej. denuncia vecinal por mordedura de perro). Sin pasos predefinidos.
- **Sub-expedientes internos:** tab dedicado en obra pública (certificados de avance, cómputos adicionales) que "no son *erga omnes*" y no salen del área de origen.

---

## 8. Panel de Tweaks integrado

Activable desde el toggle de la barra del editor. Tres secciones:

- **Identidad visual:** color de acento (5 opciones), color navy/sidebar (5 opciones), tema sidebar (oscura/clara)
- **Densidad y tipografía:** densidad (compact/comfortable), escala de tipografía (85-115%)
- **Visibilidad:** toggles para columna Modalidad, banner colaborativo, banner trimodal, resaltar pases forzados

Persistido en disco vía bloque `EDITMODE` en `tweaks.jsx`.

---

## 9. Pendientes / próximos pasos sugeridos

Mensaje **m0045** quedó parcialmente abordado — falta implementar:

> Dentro de **Plantillas**: navegación entre "Actos" y "Formularios"
> - **Actos:** textarea gigante tipo Word para crear base editable de actas
> - **Formularios:** campos prefijados configurables (cantidad y tipos variables), debe poder incluirse en el proceso de creación de un expediente
>
> Debe ser accesible desde el tab Documentos del detalle (opción "adjuntar documento" o usar plantilla).
>
> En la creación de expediente también debe poder usarse para agregar documentación no solicitada inicialmente.
>
> Cada plantilla debe indicar repartición propietaria (pero otras reparticiones pueden usarla).

Otros temas que se discutieron y pueden profundizarse:
- Firma digital con sello de tiempo y hash (ya hay modal funcional, falta backend real)
- Verificación de deudas en Tributarios desde el wizard
- Notificaciones automáticas al solicitante por email
- Exportación de auditoría / reportes

---

## 10. Para llevar a otro chat

Para continuar este proyecto:

1. Abrir `Expediente Digital.html` para ver el prototipo funcionando
2. Los archivos `.jsx` están separados por responsabilidad y son editables individualmente
3. Los datos mock están centralizados en `data.js` — cualquier nuevo expediente, tipo, área, plantilla o circuito se agrega ahí
4. El sistema visual está en `styles.css` con CSS variables — fácil de tweakar
5. El standalone `SIDI - Expediente Digital Municipal.html` (1.7 MB) funciona offline sin servidor
6. Asegurarse de seguir las convenciones rioplatenses ("vos", "podés", "tenés") y el tono institucional sobrio
7. La rigurosidad clave: respetar la arquitectura trimodal en cualquier feature nueva
