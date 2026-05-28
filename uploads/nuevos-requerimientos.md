1. INTRODUCCIÓN Y ENFOQUE FILOSÓFICO
El debate principal de la reunión giró en torno a la rigidez versus la flexibilidad del software. Mientras que las directivas iniciales (indicadas por Sabrina) apuntaban a un control estricto paso a paso basado en manuales normativos, la realidad operativa expuesta por los usuarios (expresado por Paulina y Sofía durante la reunión) demostró que un sistema totalmente restrictivo bloquearía la administración pública.

Decisión Arquitectónica Central: El SIDI podría adoptar un enfoque híbrido o trimodal ajustable por configuración. No se forzará una única lógica; en su lugar, se entregará una plataforma parametrizable donde el administrador decidirá qué nivel de rigidez aplicar a cada trámite en particular.


2. REQUERIMIENTOS FUNCIONALES Y CAMBIOS AL SISTEMA
A. Parametrización Trimodal de Circuitos (Módulo de Configuración)
El core del sistema podría permitir que cada circuito de trámite se configure bajo tres lógicas distintas de control de flujo:

Modalidad Libre: Actúa como un gestor documental abierto (estilo GDE). El operador puede adjuntar los archivos que desee, definir destinatarios dinámicamente y avanzar según el "camino feliz" que la situación requiera.

Modalidad Orientativa: El sistema conoce la ruta ideal del trámite y asiste al usuario sugiriendo el próximo paso normativo, pero no bloquea la acción si este decide tomar un desvío.

Modalidad Restrictiva: Flujo cerrado e inexpugnable. El sistema exige datos obligatorios en puntos fijos y automatiza el destino final de manera estricta. Solo se aplicará a circuitos muy simples y estandarizados que no admitan margen de error (ejemplo: Habilitaciones Comerciales).


B. Interfaz de Excepciones y Alertas (UI/UX)
Para los circuitos configurados como Orientativos, el sistema debe interceptar los pases inusuales o erróneos (como el error histórico detectado donde Hacienda envía los "Reconocimientos" a Legales en lugar de derivarlos a Dictámenes):

Alerta en Pantalla: Al intentar un pase fuera de ruta, se desplegará una ventana emergente: “Ojo: según el circuito, este trámite corresponde al área de [Dictámenes]. ¿Está seguro de cambiar el destino?”.

Controles Activos: Se deben incluir los botones explícitos de "Forzar Pase" o "Cambiar Destino". Al accionarlos, el sistema registrará la excepción y permitirá "romper la estructura" sin trabar el expediente.

C. Inicio de Trámite y Virtualización de Mesa de Entrada
Para respetar los reglamentos y la jerarquía municipal sin burocratizar el proceso físico:

Carga de Origen Múltiple: El formulario de inicio debe permitir "tildar" múltiples fuentes u orígenes, ya que un mismo tipo de trámite puede ser impulsado por distintas Secretarías (Salud, Obras, etc.) o por la presentación espontánea de un vecino.

Flujo Automatizado a Mesa de Entrada: Cualquier área (ej. Compras) puede iniciar la carga digital de notas y solicitudes de suministro. Al guardar, el sistema enviará automáticamente el flujo a la bandeja de Mesa de Entrada Virtual. El operador de dicha área solo tendrá que presionar un botón para validar la documentación y emitir de manera oficial la caratulación electrónica.


D. Reglas de Nomenclatura y Numeración del Expediente Digital
Debido a la coexistencia temporal de expedientes físicos y digitales, se requiere una diferenciación visual e intuitiva inmediata para evitar confusiones en los pases o consultas telefónicas:

Inmutabilidad de la Clave Municipal: Se debe respetar el código base municipal (4132) y el formato del año de reinicio.

Identificación por Prefijo de Letra: Incorporar la letra "E" (Electrónico) al inicio del formato del identificador (ej: E-4132-...). Se prefiere al principio para evitar colisiones con los números de "alcance" de expedientes físicos que suelen ir al final.

Identificación por Rango Numérico (Bloque de Millones): La numeración de los expedientes digitales no iniciará en 1, sino que se le asignará un prefijo numérico alto e inequívoco (rango de los 9 millones, 2 millones o 3 millones). Como el municipio genera menos de 100.000 trámites al año, cualquier mención a un "Expediente 9.000.450" le indicará instantáneamente a todo el personal que se trata de un flujo 100% digital, por ejemplo.

E. Gestión Documental y Repositorio de Plantillas por Área
Gestión de Plantillas: El sistema debe proveer un módulo donde cada Secretaría pueda dar de alta y editar sus propias plantillas de escritos y actos administrativos (ej. "Nota de Compras", "Disposición Interna"). Estas plantillas deben estar disponibles para adjuntarse de forma ágil según el estado del trámite. Esto debe ser al estilo Word.

Integración con Sistemas Externos: El SIDI debe incluir un mecanismo de importación flexible (carga de archivos/PDF cerrados). Esto se debe a que documentos clave (como las solicitudes de contrataciones directas) son emitidos de manera automática por software cerrados preexistentes (como el sistema MEAL o RAFAM) y los usuarios no deben verse obligados a tipear o transcribir esos datos nuevamente.

3. EXCEPCIONES DE NEGOCIO CONTEMPLADAS (CASOS CRÍTICOS)
Autonomía del Honorable Concejo Deliberante (HCD): El HCD es un organismo independiente con Mesa de Entrada propia, expedientes tradicionalmente diferenciados (color verde) y nomenclatura autónoma. El Ejecutivo Municipal solo centraliza sus partidas presupuestarias y sueldos. Cambio en SIDI: En el hipotético caso de tener que incluir el HCD, se debe implementar un entorno libre dentro del HCD para la carga de sus Ordenanzas, complementado con un módulo/interfaz de vinculación y pases directos para permitir el intercambio fluido de expedientes digitales entre el Departamento Ejecutivo y el Concejo Deliberante, o bien el SIDI adaptarse al HCD (que técnicamente, lo haría al ofrecer el modo libre).

Sub-expedientes de Seguimiento Interno (Caso Obras Públicas): Áreas como la Secretaría de Obras Públicas tramitan licitaciones generales (que interactúan con todo el municipio), pero de manera interna abren expedientes específicos de obra para el control de certificados de avance y cuestiones técnicas de empresas. Estos expedientes mueren dentro de la Secretaría y no son de interés general (no son “erga omnes”). Cambio en SIDI: El sistema debe permitir la creación de trámites internos o "sub-circuitos de resguardo" que no obliguen al expediente a salir del área de origen.

Casuísticas Imprevistas en Mesa de Entrada (Circuito General 53): Para evitar que denuncias atípicas de vecinos (ej. la mordedura de un perro o quejas barriales puntuales) queden bloqueadas por falta de un circuito predefinido, se creará un "Circuito General Genérico" (ejemplo: Circuito 53) completamente libre de restricciones, utilizable para encausar cualquier expediente huérfano de categoría.

4. CAMBIOS METODOLÓGICOS EN EL DESARROLLO
Cancelación del Relevamiento Presencial Área por Área: Se descarta de manera definitiva la idea de que el equipo técnico visite presencialmente cada dirección municipal para auditar sus procesos diarios. Se concluye que es un esfuerzo ineficiente debido a la infinita cantidad de excepciones cotidianas imposibles de mapear. Se debe presentar un MVP en cada área y tomar notas de la reunión para sumar potenciales excepciones por área, pero no su metodología de trabajo.

Estrategia de Entrega: Para optimizar los tiempos y evitar debates interminables ("discusiones bizantinas"), los desarrolladores programarán la demo basándose en los circuitos macro y publicados oficiales del municipio. La responsabilidad de ajustar los niveles de rigidez (libre, orientativo o restrictivo) será delegada directamente en los funcionarios y administradores a través del panel de control de SIDI una vez el sistema esté desplegado.

5. CONCLUSIÓN Y PRÓXIMOS PASOS PARA LA DEMO
El equipo de desarrollo presentará en la próxima reunión un esqueleto funcional enfocado en esta arquitectura flexible y trimodal. Paralelamente, Paulina interactuará previamente con Sabrina para alinear las expectativas sobre los beneficios del flujo libre/orientativo y "ablandar" su postura restrictiva original antes de la validación del prototipo conjunto.