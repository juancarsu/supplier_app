# 📦 Sistema de Gestión de Pedidos y Proveedores

> **Versión 1.4** - Desarrollado por Juan Carlos Suárez  
> Aplicación web construida con Google Apps Script para la gestión integral de proveedores, empresas y pedidos.
> Licencia: Creative Commons Reconocimiento (CC BY) creativecommons.org
>
>  Puedes usar, copiar, modificar y distribuir este código (sin fines comerciales), siempre que cites a Juan Carlos Suárez como autor original.

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Estructura de Archivos](#-estructura-de-archivos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Guía de Uso](#-guía-de-uso)
- [Estructura de Datos](#-estructura-de-datos)
- [Funcionalidades Avanzadas](#-funcionalidades-avanzadas)
- [Solución de Problemas](#-solución-de-problemas)
- [Mantenimiento](#-mantenimiento)

---

## 🎯 Descripción General

Sistema completo de gestión diseñado para administrar:
- **Proveedores y empresas** con sus datos de contacto
- **Pedidos** con seguimiento de estado y documentación
- **Autorizaciones** de pedidos con impresión en formato A4
- **Exportaciones** a CSV y Google Sheets
- **Búsqueda y filtrado** avanzado con caché para optimizar rendimiento

### Tecnologías Utilizadas
- **Backend**: Google Apps Script (JavaScript)
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Base de datos**: Google Sheets
- **Almacenamiento**: Google Drive
- **Framework CSS**: Diseño custom con variables CSS

---

## ✨ Características Principales

### 🏢 Gestión de Proveedores y Empresas
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Asociación de proveedores con empresas
- ✅ Clasificación por tipos de proveedor
- ✅ Estados: Activo, Antiguo, En proceso
- ✅ Búsqueda en tiempo real
- ✅ Búsqueda de códigos postales con autocompletado de provincia y población

### 📦 Gestión de Pedidos
- ✅ Formulario completo con campos personalizables
- ✅ Campos con hipervínculos (GDC/PINV, SC, OC, Albarán, Factura, Presupuesto)
- ✅ Carga de archivos adjuntos a Google Drive
- ✅ Estados: Servido / No servido, Autorizado / No autorizado
- ✅ Fechas: Pedido, Estimada, Llegada (automática al marcar como servido)
- ✅ Campos relacionales: Comprador, Zona, Edificio, Solicitante, Medio de pedido

### 🔍 Búsqueda y Filtrado
- ✅ Búsqueda global en todos los campos
- ✅ Filtros específicos por: Proveedor, Solicitante, Comprador, Servido, Autorizado
- ✅ Paginación optimizada (20 registros por página)
- ✅ Caché del lado del servidor (5 minutos TTL)
- ✅ Navegación por teclado (↑ ↓ Enter)
- ✅ Atajos: `/` o `Ctrl/Cmd+K` para buscar, `Esc` para limpiar

### 📊 Exportaciones
- ✅ **CSV**: Exportación con codificación UTF-8
- ✅ **Google Sheets**: Crea nueva hoja automáticamente
- ✅ **Alcance configurable**:
  - `Visible`: Solo registros filtrados actualmente visibles
  - `Todo`: Todos los registros filtrados (sin límite de paginación)
- ✅ Incluye columnas de enlaces (URLs) separadas

### 🔐 Autorizaciones
- ✅ Vista de pedidos pendientes de autorización
- ✅ Impresión optimizada en A4 landscape
- ✅ Header repetido en cada página impresa
- ✅ Colores y bordes preserved en impresión
- ✅ Casillas SI/NO para marcar manualmente
- ✅ Espacio para firmas autorizadas
- ✅ Autorización masiva con un clic
- ✅ Scroll en pantalla, paginación automática al imprimir

### ⚙️ Configuración
- ✅ Gestión de datos auxiliares (compradores, medios de pedido, zonas, edificios, solicitantes)
- ✅ Añadir/eliminar registros sin necesidad de acceder directamente a Sheets

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO (Navegador)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Google Apps Script Web App                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Code.gs (Backend)                               │   │
│  │  • Enrutamiento (doGet)                          │   │
│  │  • API REST endpoints                            │   │
│  │  • Lógica de negocio                             │   │
│  │  • Caché y optimización                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  HTML Templates  │  │  CSS & JS        │            │
│  │  • dashboard     │  │  • css.html      │            │
│  │  • suppliers     │  │  • js.html       │            │
│  │  • orders        │  │                  │            │
│  │  • orders_list   │  │                  │            │
│  │  • authorizations│  │                  │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Google Sheets (Base de Datos)               │
│  • Proveedores  • Empresas  • Tipos                     │
│  • Pedidos      • Compradores  • MediosPedido           │
│  • Zonas        • Edificios     • Solicitantes          │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Google Drive (Almacenamiento Archivos)           │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Archivos

```
/
├── Code.gs                      # Backend principal
│   ├── Enrutamiento web
│   ├── CRUD genérico
│   ├── Búsqueda con caché
│   ├── Exportaciones
│   ├── Autorizaciones
│   └── Upload a Drive
│
├── dashboard.html               # Página principal
├── suppliers.html               # Gestión de proveedores/empresas
├── orders.html                  # Formulario de pedido
├── orders_list.html             # Listado y búsqueda de pedidos
├── authorizations.html          # Autorizaciones para imprimir
├── auxiliary_management.html    # Configuración de datos auxiliares
│
├── css.html                     # Estilos globales
├── js.html                      # JavaScript para suppliers
└── launcher.html                # Sidebar launcher (opcional)
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- Cuenta de Google
- Acceso a Google Drive
- Permisos de edición en Google Sheets

### Pasos de Instalación

#### 1. Crear el Google Sheet
```
1. Crear nueva hoja de cálculo en Google Drive
2. Nombrarla como "Gestión de Pedidos" (o nombre deseado)
3. No crear hojas manualmente, el script las creará automáticamente
```

#### 2. Crear el Proyecto Apps Script
```
1. En el Sheet: Extensiones > Apps Script
2. Borrar el código por defecto
3. Crear archivo Code.gs y pegar el código backend
4. Crear archivos HTML para cada template (dashboard, suppliers, etc.)
5. Guardar el proyecto con nombre descriptivo
```

#### 3. Configurar ID de Carpeta Drive
En `Code.gs`, localizar la función `uploadFileToDrive` y cambiar el ID de carpeta:

```javascript
function uploadFileToDrive(data, filename, mimetype) {
  try {
    // CAMBIAR ESTE ID POR TU CARPETA DE DRIVE
    var folder = DriveApp.getFolderById("TU_ID_DE_CARPETA_AQUI");
    // ...
```

Para obtener el ID:
1. Crear carpeta en Drive llamada "Adjuntos Pedidos"
2. Abrir la carpeta
3. Copiar ID de la URL: `drive.google.com/drive/folders/[ESTE_ES_EL_ID]`

#### 4. Configurar URL Manual (Opcional)
Si deseas usar una URL fija, actualiza en `Code.gs`:

```javascript
const MANUAL_WEB_APP_URL = 'TU_URL_AQUI';
```

#### 5. Desplegar la Web App
```
1. En Apps Script: Desplegar > Nueva implementación
2. Tipo: Aplicación web
3. Ejecutar como: Yo (tu email)
4. Quién tiene acceso: Cualquier usuario de [tu organización]
5. Desplegar
6. Copiar URL de la aplicación web
```

#### 6. Probar el Sistema
```
1. Abrir la URL desplegada
2. Autorizar permisos la primera vez
3. Verificar que aparece el dashboard
4. Añadir datos de prueba
```

---

## 📖 Guía de Uso

### Panel Principal (Dashboard)
Punto de acceso principal con tres secciones:
- **Proveedores**: Gestión de contactos y empresas
- **Pedidos**: Listado completo de pedidos
- **Configuración**: Datos auxiliares del sistema

### Gestión de Proveedores

#### Añadir Proveedor
1. Click en "Proveedores" desde dashboard
2. Click en botón flotante `+` (FAB)
3. Rellenar formulario:
   - Nombre y Apellidos (obligatorio)
   - Teléfono (obligatorio)
   - Empresa (seleccionar de lista)
   - Email (opcional)
   - Estado (Activo/Antiguo/En proceso)
   - Notas (opcional)
4. Click en "Guardar"

#### Añadir Empresa
1. Click en "Empresas" en la barra lateral
2. Click en botón flotante `+`
3. Rellenar:
   - Nombre Empresa (con botón de búsqueda Google para CIF)
   - CIF
   - Dirección
   - CP (autocompletará Provincia y Población)
   - Teléfono
   - Email (opcional)
   - Tipo Proveedor (puede añadir nuevo desde aquí)
   - Notas (opcional)
4. Click en "Guardar"

**Funcionalidad especial**: Al introducir CP de 5 dígitos:
- Rellena automáticamente la Provincia
- Busca posibles Poblaciones
- Si hay una sola coincidencia, la rellena
- Si hay múltiples, muestra un selector

#### Ver Proveedores de una Empresa
1. Click en tarjeta de Empresa
2. Se muestra lista de proveedores asociados
3. Click en proveedor para editar

### Gestión de Pedidos

#### Crear Nuevo Pedido
1. Dashboard > Pedidos > Click en botón `+`
2. Rellenar campos:

**Campos Obligatorios:**
- Proveedor
- Descripción
- Fecha del Pedido

**Campos con Hipervínculo:**
- GDC/PINV, SC, OC, Albarán, Factura, Presupuesto
- Cada uno tiene dos campos: Texto + URL
- Al guardar, se crea hipervínculo en Sheets

**Campos Opcionales:**
- Fecha Estimada, Fecha Llegada
- Comprador, Medio Pedido, Zona, Edificio, Solicitante
- Checkboxes: Servido, Autorizado
- Importe (formato: "120,50 €")
- Notas

**Adjuntos:**
- Arrastrar archivos o click en zona
- Soporta: PDF, Word, JPG, PNG
- Se suben automáticamente a Drive
- Se guardan URLs en el pedido

3. Click en "Guardar Pedido"

#### Editar Pedido Existente
1. Desde listado de pedidos, click en cualquier celda
2. Se abre formulario con datos cargados
3. Modificar campos necesarios
4. "Actualizar Pedido"

#### Buscar y Filtrar Pedidos

**Búsqueda Global:**
- Barra superior: busca en TODOS los campos
- Teclear y esperar 500ms (debounce)
- Enter para buscar inmediatamente
- Esc para limpiar búsqueda

**Filtros Específicos:**
- Proveedor (dropdown)
- Solicitante (dropdown)
- Comprador (dropdown)
- Servido (Sí/No)
- Autorizado (Sí/No)

**Paginación:**
- 20 registros por página (optimizado)
- Botones Anterior/Siguiente
- Info: "Mostrando 1-20 de 150"

**Navegación por Teclado:**
- `↑` / `↓`: Navegar entre filas
- `Enter`: Abrir pedido seleccionado
- `/` o `Ctrl+K`: Foco en buscador

**Checkboxes Rápidos:**
- Click en checkbox de Servido: marca y actualiza fecha de llegada
- Click en checkbox de Autorizado: marca solo estado

#### Exportar Pedidos

**Selector de Alcance:**
- **Visible**: Exporta solo los registros mostrados en pantalla con los filtros actuales
- **Todo**: Exporta todos los registros que cumplen los filtros (ignora paginación)

**Exportar a CSV:**
1. Configurar filtros deseados
2. Seleccionar alcance (Visible/Todo)
3. Click en "CSV"
4. Descarga automática con formato UTF-8
5. Nombre: `Pedidos_export_VISIBLE_20251207_1430.csv`

**Columnas en CSV (Visible):**
- Fecha Pedido, Proveedor, Descripción, Solicitante
- GDC_PINV + Enlace_GDC_PINV
- SC + Enlace_SC
- OC + Enlace_OC
- Albarán + Enlace_Albarán
- Factura + Enlace_Factura
- Presupuesto + Enlace_Presupuesto
- Servido, Autorizado, Importe

**Columnas en CSV (Todo):**
- Todas las columnas originales + columnas de enlaces

**Exportar a Google Sheets:**
1. Configurar filtros y alcance
2. Click en "Sheets"
3. Se crea nueva hoja automáticamente
4. Se abre en nueva pestaña
5. Nombre: `Pedidos Export VISIBLE 20251207_1430`

### Autorizaciones de Pedidos

**NOTA**: La autorización de pedidos queda registrada en un archivo de auditoría.

#### Imprimir Formulario de Autorizaciones
1. Dashboard > Listado de Pedidos > Autorizaciones (barra lateral)
2. Se cargan pedidos NO autorizados
3. Vista optimizada para impresión A4 landscape. 
5. Click en "Imprimir". Puedes imprimirlo o guardarlo como PDF. Quizás tengas que ajustar
   la orientación y escala para ajustarlos a tu impresora.

**Características de Impresión:**
- Formato A4 horizontal
- Header repetido en cada página
- Colores preserved (naranja cabecera, zebra)
- Casillas SI/NO para marcar manualmente
- Espacio para firmas
- Fecha automática

**En Pantalla:**
- Scroll vertical del cuerpo de tabla
- Botón "Volver", Imprimir y "Autorizar Pedidos"
- Listado de pedidos pendientes de autorizar con casillas interactivas.

#### Autorizar Masivamente
1. En vista de Autorizaciones
2. Click en "Autorizar Pedidos (N)". N indica el número de pedidos pendientes de autorizar.
3. Confirmar nombre en el modal para firmar.
4. Click en "Sí, Autorizar todos"
5. Todos los pedidos se marcan como "Sí" en campo Autorizado
6. La lista se recarga automáticamente

#### Autorizar Selectivamente
1. En vista de Autorizaciones
2. Seleccionar "Sí" en las casillas de verificación.
3. Click en "Autorizar Pedidos (N)". N indica el número de pedidos pendientes de autorizar.
4. Confirmar nombre en el modal para firmar.
5. Click en "Autorizar seleccionados". El botón indica el importe que se va a autorizar.
6. Todos los pedidos seleccionados se marcan como "Sí" en campo Autorizado
7. La lista se recarga automáticamente

### Configuración de Datos Auxiliares

Permite gestionar listas desplegables del sistema:

1. Dashboard > Configuración
2. Pestañas:
   - Compradores
   - Medios Pedido
   - Zonas
   - Edificios
   - Solicitantes

**Añadir Elemento:**
1. Introducir nombre en campo
2. Click "Añadir"
3. Aparece en lista

**Modificar Elemento:**
1. Click en el nombre que se quiere modificar.
2. Escribir el nuevo nombre o modificar el actual.
3. Aparece en lista
   
**Eliminar Elemento:**
1. Click en botón `×` rojo
2. Confirmar
3. Se elimina (⚠️ **Atención**: si está referenciado en pedidos, puede causar inconsistencias)

---

## 🗄️ Estructura de Datos

### Hojas de Google Sheets

#### `Proveedores`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id_Proveedor | UUID | Identificador único |
| Nombre | Texto | Nombre del proveedor |
| Apellidos | Texto | Apellidos |
| Teléfono | Texto | Número de contacto |
| Empresa | UUID | FK a Empresas |
| Email | Email | Correo electrónico |
| Estado | Texto | Activo/Antiguo/En proceso |
| Notas | Texto largo | Observaciones |

#### `Empresas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id_Empresa | UUID | Identificador único |
| Nombre Empresa | Texto | Razón social |
| CIF | Texto | NIF/CIF |
| Dirección | Texto | Dirección física |
| CP | Texto | Código postal (5 dígitos) |
| Población | Texto | Ciudad |
| Provincia | Texto | Provincia |
| Teléfono | Texto | Teléfono empresa |
| Email | Email | Email corporativo |
| Tipo Proveedor | UUID | FK a Tipos |
| Notas | Texto largo | Observaciones |

#### `Tipos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id_Tipo | UUID | Identificador único |
| Tipo de Proveedor | Texto | Nombre del tipo |

#### `Pedidos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Id_Pedido | UUID | Identificador único |
| Proveedor | Texto | Nombre empresa proveedora |
| Descripción | Texto | Descripción del pedido |
| Fecha Pedido | Fecha | Fecha de realización |
| Fecha Estimada | Fecha | Fecha estimada de entrega |
| Fecha Llegada | Fecha | Fecha real de recepción |
| Comprador | Texto | Responsable de compra |
| Servido | Texto | Sí/No |
| GDC_PINV | Fórmula/Texto | HYPERLINK o texto simple |
| Autorizado | Texto | Sí/No |
| Medio Pedido | Texto | Canal de pedido |
| Zona | Texto | Zona geográfica |
| Edificio | Texto | Edificio destino |
| Solicitante | Texto | Persona solicitante |
| SC | Fórmula/Texto | Solicitud de Compra |
| OC | Fórmula/Texto | Orden de Compra |
| Albarán | Fórmula/Texto | Número de albarán |
| Factura | Fórmula/Texto | Número de factura |
| Presupuesto | Fórmula/Texto | Documento presupuesto |
| Notas | Texto largo | Observaciones |
| Importe | Texto | Cantidad sin IVA |
| Adjuntos | JSON | Array de objetos {name, url, id} |

#### Tablas Auxiliares
Todas con estructura simple: `Id_[Tabla]` + `Nombre [Entidad]`
- `Compradores`
- `MediosPedido`
- `Zonas`
- `Edificios`
- `Solicitantes`

---

## 🔧 Funcionalidades Avanzadas

### Sistema de Caché
- **Ubicación**: CacheService.getScriptCache()
- **TTL**: 5 minutos (300 segundos)
- **Clave**: `orders:{page}:{pageSize}:{JSON_filters}`
- **Beneficio**: Reduce lecturas a Sheets en búsquedas repetidas

### Gestión de Enlaces
Los campos GDC_PINV, SC, OC, Albarán, Factura y Presupuesto:
1. Aceptan texto + URL
2. Se guardan como fórmulas HYPERLINK en Sheets
3. Se extraen automáticamente en búsquedas
4. Se exportan en columnas separadas (texto + enlace)

### Optimización de Lecturas
- **Búsqueda paginada**: Solo lee los hipervínculos de la página actual (20 registros)
- **Exportación**: Lee todos los hipervínculos de una vez para el conjunto filtrado
- **Lectura incremental**: Usa getRangeList para leer celdas no contiguas eficientemente

### Upload de Archivos
1. Cliente convierte archivo a Base64
2. Envía a servidor con nombre y mimetype
3. Servidor decodifica y crea blob
4. Sube a carpeta específica de Drive
5. Configura permisos: "Cualquiera con enlace"
6. Devuelve URL pública
7. Cliente guarda URL + metadata en campo JSON

---

## 🐛 Solución de Problemas

### La aplicación no carga
**Síntoma**: Pantalla blanca o error 404
**Soluciones**:
1. Verificar que la implementación está activa
2. Comprobar URL en Code.gs (`MANUAL_WEB_APP_URL`)
3. Redesplegar: Desplegar > Nueva implementación
4. Limpiar caché del navegador

### No aparecen datos en Suppliers
**Síntoma**: Lista vacía o error en consola
**Soluciones**:
1. Abrir consola del navegador (F12)
2. Verificar errores en llamada `getAllData()`
3. Comprobar que existen hojas: Proveedores, Empresas, Tipos
4. Verificar que las hojas tienen headers en fila 1
5. Probar crear un registro manualmente en Sheets

### Búsqueda de pedidos muy lenta
**Síntoma**: Más de 3 segundos para mostrar resultados
**Soluciones**:
1. Verificar cantidad de registros (>1000 puede ser lento)
2. Limpiar caché: En Apps Script, ejecutar función vacía para resetear
3. Reducir cantidad de filtros simultáneos
4. Considerar archivar pedidos antiguos

### Error al subir archivos
**Síntoma**: "Error al subir: [mensaje]"
**Soluciones**:
1. Verificar ID de carpeta en `uploadFileToDrive()`
2. Comprobar permisos de escritura en Drive
3. Verificar tamaño de archivo (<10MB recomendado)
4. Comprobar tipo de archivo permitido

### Exportación CSV con caracteres raros
**Síntoma**: Acentos mal mostrados en Excel
**Soluciones**:
1. Abrir CSV con "Importar Datos" en Excel (no doble click)
2. Seleccionar codificación UTF-8
3. Alternativamente, usar exportación a Google Sheets

### Impresión de autorizaciones sin colores
**Síntoma**: Sale todo en blanco y negro
**Soluciones**:
1. En diálogo de impresión: Activar "Gráficos de fondo"
2. Chrome: Más opciones > Gráficos de fondo ✓
3. Firefox: Configuración de página > Imprimir colores de fondo ✓

---

## 🛠️ Mantenimiento

### Limpieza Periódica

#### Caché del Servidor
```javascript
// Ejecutar en Apps Script Editor
function clearCache() {
  CacheService.getScriptCache().removeAll(['orders']);
  Logger.log('Caché limpiada');
}
```

#### Archivos Huérfanos en Drive
Revisar carpeta de adjuntos periódicamente y eliminar archivos no referenciados.

### Backup de Datos
1. Ir a Google Sheets
2. Archivo > Descargar > Microsoft Excel (.xlsx)
3. Guardar copia local mensualmente

### Actualización del Sistema

#### Actualizar Code.gs
1. Apps Script Editor > Code.gs
2. Copiar código actualizado
3. Guardar (Ctrl+S)
4. Probar en modo borrador primero

#### Actualizar HTML
1. Localizar archivo HTML a actualizar
2. Reemplazar contenido
3. Guardar
4. Refrescar app en navegador (Ctrl+F5 para limpiar caché)

### Monitoreo

#### Logs del Sistema
```javascript
// Ver logs en Apps Script
function viewLogs() {
  Logger.log('Checking logs...');
}
```
Luego: Ver > Registros

#### Ejecuciones
Apps Script > Ejecutor > Ver ejecuciones recientes
- Revisar errores
- Identificar funciones lentas
- Detectar patrones de uso

### Escalabilidad

**Límites de Google Apps Script:**
- 6 minutos por ejecución
- 30 segundos para respuestas HTTP
- 20,000 destinatarios de email por día

**Recomendaciones:**
- Mantener <2,000 pedidos activos
- Archivar pedidos antiguos anualmente
- Considerar migración a Cloud si >5,000 pedidos

---

## 📞 Soporte

### Recursos Adicionales
- [Documentación Google Apps Script](https://developers.google.com/apps-script)
- [API de Google Sheets](https://developers.google.com/sheets/api)
- [Drive API](https://developers.google.com/drive)

### Registro de Cambios

**v1.4 - Diciembre 2025**
- ✅ Lanzamiento inicial
- ✅ CRUD Proveedores/Empresas
- ✅ Gestión completa de Pedidos
- ✅ Búsqueda con caché
- ✅ Exportaciones CSV/Sheets
- ✅ Sistema de Autorizaciones
- ✅ Configuración datos auxiliares

---

## 📄 Licencia

Desarrollado para uso interno. Todos los derechos reservados.

**Autor**: Juan Carlos Suárez  
**Versión**: 1.0  
**Fecha**: Diciembre 2025

---

## 🙏 Agradecimientos

Sistema desarrollado con dedicación para optimizar la gestión de proveedores y pedidos, mejorando la eficiencia operativa y la trazabilidad documental.

---

**¿Preguntas o sugerencias?** Contacta con el administrador del sistema.
