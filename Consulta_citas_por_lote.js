/**
 * Función principal que obtiene todas las solicitudes asociadas al centro_id 645
 * desde la base de datos y las carga en la hoja "BD" del Google Sheet especificado.
 * Optimizada para procesar datos en lotes para mejorar rendimiento y evitar colapsos con grandes volúmenes.
 */
function cargarCitasCentro645AlSheet() {
    const centro_id = "645";
    const loteSize = 500; // Número de filas por lote para optimizar memoria y rendimiento
    const conn = conexionBD();
    let offset = 0;
    let hasMoreRows = true;
    let totalFilas = 0;

    try {
        // Limpiar la hoja al inicio
        const sheetId = "1MP72X0UjSSeRrudBX_2eSd50cinVgOfWfGp9vd55N0w";
        const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("BD_Cita");
        sheet.clearContents();

        // Agregar headers una sola vez
        const headers = [
            "id_cita",
            "solicitud_id",
            "rut_usuario",
            "rut_gestor",
            "tipo_prestacion",
            "profesional_id",
            "Prestacion_id",
            "fecha_estimada_atencion",
            "observacion",
            "estado_cita",
            "priorizacion_clinica",
            "priorizacion",
            "centro_id",
            "fecha_creacion",
            "razon_rechazo",
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        let nextRow = 2; // Fila siguiente a headers

        while (hasMoreRows) {
            // Consulta paginada para obtener un lote de filas
            const querySelect = `SELECT 
            cs.id_cita, 
            cs.solicitud_id,
            cs.rut_usuario,
            cs.rut_gestor,
            cs.tipo_prestacion,
            pr.nombre,
            pre.nombre_prestacion,
            cs.fecha_estimada_atencion,
            cs.observacion,
            cs.estado_cita,
            cs.priorizacion_clinica,
            cs.priorizacion,
            cs.centro_id,
            cs.fecha_creacion,
            cs.razon_rechazo
              FROM citas cs
               LEFT JOIN profesionales pr on cs.profesional_id = pr.id_profesional
               LEFT JOIN prestaciones pre on cs.prestacion_id = pre.id_prestacion
                WHERE cs.centro_id = ? ORDER BY cs.id_cita LIMIT ? OFFSET ?`;
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
                    results.getString("id_cita"),
                    results.getString("solicitud_id"),
                    results.getString("rut_usuario"),
                    results.getString("rut_gestor"),
                    results.getString("tipo_prestacion"),
                    results.getString("nombre"),
                    results.getString("nombre_prestacion"),
                    results.getString("fecha_estimada_atencion"),
                    results.getString("observacion"),
                    results.getString("estado_cita"),
                    results.getString("priorizacion_clinica"),
                    results.getFloat("priorizacion"),
                    results.getString("centro_id"),
                    results.getString("fecha_creacion"),
                    results.getString("razon_rechazo"),
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

        console.log(`Citas cargadas exitosamente en el Google Sheet. Total filas: ${totalFilas}`);
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
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("BD_Cita");

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
