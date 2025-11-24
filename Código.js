/**
 * Función principal que obtiene todas las solicitudes asociadas al centro_id 645
 * desde la base de datos y las carga en la hoja "BD" del Google Sheet especificado.
 */
function cargarSolicitudesCentro645AlSheet() {
    const centro_id = "645";
    const conn = conexionBD();

    try {
        // Consulta para obtener todas las solicitudes del centro_id especificado
        const querySelect = `SELECT * FROM solicitudes WHERE centro_id = ?`;
        const stmtSelect = conn.prepareStatement(querySelect);
        stmtSelect.setString(1, centro_id);

        const results = stmtSelect.executeQuery();

        // Procesar los resultados en un array de arrays
        const datos = [];
        // Agregar headers
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
        datos.push(headers);

        // Agregar filas de datos
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
            datos.push(fila);
        }

        // Cerrar recursos
        results.close();
        stmtSelect.close();

        // Subir los datos al Google Sheet
        subirDatosAlSheet(datos);

        console.log("Solicitudes cargadas exitosamente en el Google Sheet.");
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
