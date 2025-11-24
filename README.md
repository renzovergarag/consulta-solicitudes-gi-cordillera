# Consulta Solicitudes GI Cordillera

Este es un script de Google Apps Script que conecta a una base de datos MySQL para obtener todas las solicitudes asociadas al centro_id "645" y las carga en una hoja específica de Google Sheets.

## Descripción

El script realiza las siguientes tareas:

-   Conecta a una base de datos MySQL usando JDBC.
-   Ejecuta una consulta para obtener solicitudes filtradas por centro_id.
-   Procesa los resultados en lotes para optimizar rendimiento.
-   Sube los datos a la hoja "BD" de un Google Sheet especificado.

## Prerrequisitos

-   Una cuenta de Google con acceso a Google Apps Script.
-   Una base de datos MySQL accesible (con credenciales válidas).
-   Un Google Sheet con ID específico (proporcionado en el código).
-   Herramienta `clasp` instalada para subir el código desde local a Apps Script (opcional, si editas localmente).

## Configuración

1. **Clona el repositorio**:

    ```bash
    git clone https://github.com/renzovergarag/consulta-solicitudes-gi-cordillera.git
    cd consulta-solicitudes-gi-cordillera
    ```

2. **Configura las propiedades de conexión**:

    - En Google Apps Script, ve a "Proyecto" > "Propiedades del script".
    - Agrega una propiedad llamada `MYSQL_CONNECTION` con un valor JSON como:
        ```json
        {
            "host": "tu-host.mysql.database.azure.com",
            "port": 3306,
            "database": "tu_base_datos",
            "user": "tu_usuario",
            "password": "tu_password"
        }
        ```
    - Asegúrate de que las credenciales sean correctas y la BD sea accesible.

3. **Despliega el script**:

    - Si usas `clasp`, autentícate y vincula el proyecto:
        ```bash
        clasp login
        clasp create --title "Consulta Solicitudes GI Cordillera"
        clasp push
        ```
    - O copia el código manualmente a un nuevo proyecto en script.google.com.

4. **Configura permisos**:
    - El script necesita permisos para acceder a JDBC y Google Sheets. Aprueba los permisos cuando ejecutes por primera vez.

## Uso

1. Abre el script en Google Apps Script (script.google.com).
2. Ejecuta la función `cargarSolicitudesCentro645AlSheet()` desde el editor o crea un trigger/menu.
3. Los datos se cargarán en la hoja "BD" del Google Sheet con ID `1MP72X0UjSSeRrudBX_2eSd50cinVgOfWfGp9vd55N0w`.

## Funciones Principales

-   **`cargarSolicitudesCentro645AlSheet()`**: Función principal que obtiene y carga las solicitudes en lotes.
-   **`conexionBD()`**: Establece la conexión a la base de datos MySQL.
-   **`subirDatosAlSheet(datos)`**: Sube un array de datos a Google Sheets (usada internamente).

## Notas y Limitaciones

-   Optimizado para procesar datos en lotes de 500 filas para evitar timeouts (límite de 6 minutos en Apps Script).
-   Asegúrate de que el Google Sheet tenga permisos de edición para el script.
-   Para volúmenes muy grandes (>50k filas), considera dividir en múltiples ejecuciones o usar triggers programados.
-   Las fechas y números se convierten a strings para compatibilidad con Sheets.

## Contribución

Si encuentras errores o mejoras, abre un issue o pull request en el repositorio.

## Licencia

Este proyecto es de uso interno. Consulta con el propietario para permisos.</content>
<parameter name="filePath">c:\Users\Master\Documents\Proyectos\consulta-solicitudes-gi-cordillera\README.md
