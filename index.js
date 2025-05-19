var jsonData = {
    "nombre": null,
    "paterno": null,
    "materno": null,
    "numCelular": null,
    "fechaNacimiento": "0001-01-01T00:00:00",
    "correo": null,
    "password": null,
    "carreraId": 0,
    "escuelaId": 0
}

function setLocalData() {
    // Primero verificamos si ya hay datos guardados
    const existingData = localStorage.getItem("data");
    if (existingData) {
        jsonData = JSON.parse(existingData);
    }

    // Guardamos los nuevos datos del primer formulario
    jsonData.correo = document.getElementById("txtEmail").value;
    jsonData.password = document.getElementById("txtPassword").value;
    
    // Guardamos en localStorage
    localStorage.setItem("data", JSON.stringify(jsonData));
}

function setDataStudent() {
    // Recuperamos los datos existentes
    const existingData = localStorage.getItem("data");
    if (existingData) {
        jsonData = JSON.parse(existingData);
    }

    // Agregamos los nuevos datos del segundo formulario
    jsonData.nombre = document.getElementById("txtNombre").value;
    jsonData.paterno = document.getElementById("txtPaterno").value;
    jsonData.materno = document.getElementById("txtMaterno").value;
    jsonData.numCelular = document.getElementById("txtCelular").value;
    jsonData.fechaNacimiento = document.getElementById("txtFecha").value;
    jsonData.escuelaId = document.getElementById("escuela").value;
    jsonData.carreraId = document.getElementById("carrera").value;

    // Guardamos el objeto actualizado en localStorage
    localStorage.setItem("data", JSON.stringify(jsonData));
    
    // Mostramos el mensaje personalizado
    document.getElementById("alertMessage").textContent = 
        `¡Hola ${jsonData.nombre}! Tu registro en TEBA Travel se ha completado exitosamente.`;
    document.getElementById("alertModal").classList.add("show");
}

function closeAlert() {
    document.getElementById("alertModal").classList.remove("show");
}


function formatearFecha(input) {
    // Eliminar cualquier caracter que no sea número
    let valor = input.value.replace(/\D/g, '');
    
    // Agregar las diagonales automáticamente
    if (valor.length >= 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    if (valor.length >= 5) {
        valor = valor.substring(0, 5) + '/' + valor.substring(5);
    }
    
    // Limitar a 10 caracteres (dd/mm/aaaa)
    if (valor.length > 10) {
        valor = valor.substring(0, 10);
    }
    
    input.value = valor;
}