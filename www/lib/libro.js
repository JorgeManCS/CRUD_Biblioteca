/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false */
// variables para el jslint

/**
* Creamos el objeto libro y todos sus métodos.
*/
$.libro={};
// Configuración del HOST y URL del servicio
$.libro.HOST = 'http://192.168.0.27:8080';
// $.alumno.URL = '/GA-JPA/webresources/com.iesvdc.acceso.entidades.alumno';
$.libro.URL = '/Biblioteca/webresources/com.jorgemanuel.entidades.libro';


/**
    Esta función hace la llamada REST al servidor y crea la tabla con todos los alumnos.
*/
$.libro.LibroReadREST = function() {
    // con esta función jQuery hacemos la petición GET que hace el findAll()
    $.ajax({
        url: this.HOST+this.URL,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function (json) {
            $('#r_libro').empty();
            $('#r_libro').append('<h3>Listado de Libros</h3>');
            var table = $('<table />').addClass('table table-stripped');

            table.append($('<thead />').append($('<tr />').append('<th>id</th>',
                                                                  '<th>titulo</th>', 
                                                                  '<th>isbn</th>', 
                                                                  '<th>escritor</th>',
                                                                  '<th>editorial</th>')));
            var tbody = $('<tbody />');
            for (var clave in json) {
                tbody.append($('<tr />').append('<td>' + json[clave].id +'</td>',
                                                '<td>' + json[clave].titulo + '</td>',
                                                '<td>' + json[clave].isbn + '</td>', 
                                                '<td>' + json[clave].escritor + '</td>',  
                                                '<td>' + json[clave].editorial + '</td>'));
            }
            table.append(tbody);

            $('#r_libro').append( $('<div />').append(table) );
            $('tr:odd').css('background','#CCCCCC');
        },
        error: function (xhr, status) {
             $.libro.error('Imposible leer libro','Compruebe su conexión e inténtelo de nuevo más tarde');
        }
    });
};

/**
    Esta función carga los datos del formulario y los envía vía POST al servicio REST
*/
$.libro.LibroCreateREST = function(){
    // Leemos los datos del formulario pidiendo a jQuery que nos de el valor de cada input.
    var datos = {
        'titulo' : $("#c_lib_titulo").val(),
        'isbn' : $("#c_lib_isbn").val(),
        'escritor' : $("#c_lib_escritor").val(),
        'editorial' : $("#c_lib_editorial").val()
    };
    
    // comprobamos que en el formulario haya datos...
    if ( datos.titulo.length>2 && datos.isbn.length>2 ) {
        $.ajax({
            url: $.libro.HOST+$.libro.URL,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(datos),
            success: function(result,status,jqXHR ) {
               // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                $.libro.LibroReadREST();
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.libro.error('Error: Libro Create','No ha sido posible crear el libro. Compruebe su conexión.');
            }
        });
        
        // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
        $.afui.clearHistory();
        // cargamos el panel con id r_alumno.
        $.afui.loadContent("#r_libro",false,false,"up");
    }
    
};

/**
    Crea un desplegable, un select, con todos los alumnos del servicio para seleccionar el alumno a eliminar
*/
$.libro.LibroDeleteREST = function(id){
    // si pasamos el ID directamente llamamos al servicio DELETE
    // si no, pintamos el formulario de selección para borrar.
    if ( id !== undefined ) {
        id = $('#d_lib_sel').val();
        $.ajax({
            url: $.libro.HOST+$.libro.URL+'/'+id,
            type: 'DELETE',
            dataType: 'json',
            contentType: "application/json",
            // data: JSON.stringify(datos),
            success: function(result,status,jqXHR ) {
               // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                $.libro.LibroReadREST();
                // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
                $.afui.clearHistory();
                // cargamos el panel con id r_alumno.
                $.afui.loadContent("#r_libro",false,false,"up");
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.libro.error('Error: Libro Delete','No ha sido posible borrar el libro. Compruebe su conexión.');
            }
        });    
    } else{
        $.ajax({
            url: this.HOST+this.URL,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (json) {
                $('#d_libro').empty();
                var formulario = $('<div />');
                formulario.addClass('container');
                var div_select = $('<div />');
                div_select.addClass('form-group');
                var select = $('<select id="d_lib_sel" />');
                select.addClass('form-group');
                for (var clave in json){
                    select.append('<option value="'+json[clave].id+'">'+json[clave].titulo+' ' + json[clave].isbn+' ' + json[clave].escritor+' ' + json[clave].editorial+'</option>');
                }
                formulario.append(select);
                formulario.append('<div class="form-group"></div>').append('<div class="btn btn-danger" onclick="$.libro.LibroDeleteREST(1)"> eliminar! </div>');
                $('#d_libro').append(formulario);
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.libro.error('Error: Libro Delete','No ha sido posible conectar al servidor. Compruebe su conexión.');
            }
        });
    }
    
};

/**
    Función para la gestión de actualizaciones. Hay tres partes: 
    1) Listado 
    2) Formulario para modificación
    3) Envío de datos al servicio REST (PUT)
*/

$.libro.LibroUpdateREST = function(id, envio){
    if ( id === undefined ) {
        $.ajax({
            url: this.HOST+this.URL,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (json) {
                $('#u_libro').empty();
                $('#u_libro').append('<h3>Pulse sobre un libro</h3>');
                var table = $('<table />').addClass('table table-stripped');

                table.append($('<thead />').append($('<tr />').append('<th>id</th>', 
                                                                      '<th>titulo</th>', 
                                                                      '<th>isbn</th>', 
                                                                      '<th>escritor</th>', 
                                                                      '<th>editorial</th>')));
                var tbody = $('<tbody />');
                for (var clave in json) {
                    // le damos a cada fila un ID para luego poder recuperar los datos para el formulario en el siguiente paso
                    tbody.append($('<tr id="fila_'+json[clave].id+'" onclick="$.libro.LibroUpdateREST('+json[clave].id+')"/>').append(
                        '<td>' + json[clave].id + '</td>',
                        '<td>' + json[clave].titulo + '</td>', 
                        '<td>' + json[clave].isbn + '</td>',
                        '<td>' + json[clave].escritor + '</td>',
                        '<td>' + json[clave].editorial + '</td>'));
                }
                table.append(tbody);

                $('#u_libro').append( $('<div />').append(table) );
                $('tr:odd').css('background','#CCCCCC');
            },
            error: function (xhr, status) {
                $.libro.error('Error: Libro Update','Ha sido imposible conectar al servidor.');
            }
        });
    } else if (envio === undefined ){
        var seleccion = "#fila_"+id+" td";
        var lib_id = ($(seleccion))[0];
        var lib_titulo = ($(seleccion))[1];
        var lib_isbn = ($(seleccion))[2];
        var lib_escritor = ($(seleccion))[3];
        var lib_editorial = ($(seleccion))[4];
        
        $("#u_lib_id").val(lib_id.childNodes[0].data);
        $("#u_lib_titulo").val(lib_titulo.childNodes[0].data);
        $("#u_lib_isbn").val(lib_isbn.childNodes[0].data);
        $("#u_lib_escritor").val(lib_escritor.childNodes[0].data);
        $("#u_lib_editorial").val(lib_editorial.childNodes[0].data);
        // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
        $.afui.clearHistory();
        // cargamos el panel con id r_alumno.
        $.afui.loadContent("#uf_libro",false,false,"up");
    } else {
        //HACEMOS LA LLAMADA REST
            var datos = {
                'id' : $("#u_lib_id").val(),
                'titulo' : $("#u_lib_titulo").val(),
                'isbn' : $("#u_lib_isbn").val(),
                'escritor' : $("#u_lib_escritor").val(),
                'editorial' : $("#u_lib_editorial").val(),
            };

            // comprobamos que en el formulario haya datos...
            if ( datos.titulo.length>2 && datos.isbn.length>2 ) {
                $.ajax({
                    url: $.libro.HOST+$.libro.URL+'/'+$("#u_lib_id").val(),
                    type: 'PUT',
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify(datos),
                    success: function(result,status,jqXHR ) {
                       // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                        $.libro.LibroReadREST();
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        $.libro.error('Error: Libro Create','No ha sido posible crear el libro. Compruebe su conexión.');
                    }
                });

                // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
                $.afui.clearHistory();
                // cargamos el panel con id r_alumno.
                $.afui.loadContent("#r_libro",false,false,"up");
            }
    }
};


/**
    Función para la gestión de errores y mensajes al usuario
*/
$.libro.error = function(title, msg){
    $('#err_libro').empty();
    $('#err_libro').append('<h3>'+title+'</h3>');
    $('#err_libro').append('<p>'+msg+'</p>');
    // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
    $.afui.clearHistory();
    // cargamos el panel con id r_alumno.
    $.afui.loadContent("#err_libro",false,false,"up");
};
