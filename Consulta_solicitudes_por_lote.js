/**
 * Función principal que obtiene todas las solicitudes asociadas al centro_id 645
 * desde la base de datos y las carga en la hoja "BD" del Google Sheet especificado.
 * Optimizada para procesar datos en lotes para mejorar rendimiento y evitar colapsos con grandes volúmenes.
 */
function cargarSolicitudesCentro645AlSheet() {
    const centro_id = "645";
    const loteSize = 500; // Número de filas por lote para optimizar memoria y rendimiento
    const conn = conexionBD();
    let offset = 0;
    let hasMoreRows = true;
    let totalFilas = 0;

    try {
        // Limpiar la hoja al inicio
        const sheetId = "1MP72X0UjSSeRrudBX_2eSd50cinVgOfWfGp9vd55N0w";
        const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("BD");
        sheet.clearContents();

        // Agregar headers una sola vez
        const headers = [
            "id_solicitud",
            "fecha_inicio",
            "rut_orientador",
            "rut_usuario",
            "tipo_solicitud_id",
            "motivo_id",
            "ultimo_control",
            "descripcion",
            "disponibilidad_llamada",
            "priorizacion_admin",
            "rut_gestor",
            "accion",
            "razon_rechazo",
            "fecha_validacion",
            "estado_solicitud",
            "centro_id",
            "observacion_rechazo",
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        let nextRow = 2; // Fila siguiente a headers

        while (hasMoreRows) {
            // Consulta paginada para obtener un lote de filas
            const querySelect = `SELECT * FROM solicitudes WHERE centro_id = ? ORDER BY id_solicitud LIMIT ? OFFSET ?`;
            const stmtSelect = conn.prepareStatement(querySelect);
            stmtSelect.setString(1, centro_id);
            stmtSelect.setInt(2, loteSize);
            stmtSelect.setInt(3, offset);

            const results = stmtSelect.executeQuery();

            // Procesar el lote actual
            const loteDatos = [];
            let filasEnLote = 0;
            while (results.next()) {
                const fila = [
                    results.getString("id_solicitud"),
                    results.getString("fecha_inicio"),
                    results.getString("rut_orientador"),
                    results.getString("rut_usuario"),
                    results.getString("tipo_solicitud_id"),
                    results.getString("motivo_id"),
                    results.getString("ultimo_control"),
                    results.getString("descripcion"),
                    results.getString("disponibilidad_llamada"),
                    results.getFloat("priorizacion_admin"),
                    results.getString("rut_gestor"),
                    results.getString("accion"),
                    results.getString("razon_rechazo"),
                    results.getString("fecha_validacion"),
                    results.getString("estado_solicitud"),
                    results.getString("centro_id"),
                    results.getString("observacion_rechazo"),
                ];
                loteDatos.push(fila);
                filasEnLote++;
            }

            // Cerrar recursos del lote
            results.close();
            stmtSelect.close();

            // Si hay filas en el lote, subirlas al Sheet
            if (filasEnLote > 0) {
                sheet.getRange(nextRow, 1, loteDatos.length, headers.length).setValues(loteDatos);
                nextRow += loteDatos.length;
                totalFilas += filasEnLote;
                console.log(`Lote procesado: ${filasEnLote} filas (total acumulado: ${totalFilas})`);
            } else {
                hasMoreRows = false; // No más filas
            }

            offset += loteSize;
        }

        console.log(`Solicitudes cargadas exitosamente en el Google Sheet. Total filas: ${totalFilas}`);
    } catch (err) {
        console.error("Error al cargar solicitudes: " + err.message);
    } finally {
        // Cerrar la conexión
        conn.close();
    }
}

/**
 * Función que recibe un array de datos y los pega en la hoja "BD" del Google Sheet especificado.
 * @param {Array<Array>} datos - Array de arrays con los datos a subir (incluyendo headers).
 */
function subirDatosAlSheet(datos) {
    const sheetId = "1MP72X0UjSSeRrudBX_2eSd50cinVgOfWfGp9vd55N0w";
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("BD");

    // Limpiar el contenido existente y escribir los nuevos datos
    sheet.clearContents();
    if (datos.length > 0) {
        sheet.getRange(1, 1, datos.length, datos[0].length).setValues(datos);
    }
}

function conexionBD() {
    const scriptProps = PropertiesService.getScriptProperties();
    const conexionString = scriptProps.getProperty("MYSQL_CONNECTION");

    if (!conexionString) {
        throw new Error("No existe la propiedad MYSQL_CONNECTION.");
    }

    // Parseamos el JSON para usarlo
    const config = JSON.parse(conexionString);

    // Ahora podemos usar ese config para conectarnos por JDBC (ejemplo):
    const dbUrl = `jdbc:mysql://${config.host}:${config.port}/${config.database}`;
    const user = config.user;
    const password = config.password;

    try {
        const conn = Jdbc.getConnection(dbUrl, user, password);
        console.log("Conexión exitosa a la base de datos");
        return conn;
    } catch (err) {
        console.error("Error al conectar a la base de datos: " + err.message);
    }
}
