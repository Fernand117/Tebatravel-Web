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

// Función para cargar datos guardados al iniciar la página
function cargarDatosGuardados() {
    const existingData = localStorage.getItem("data");
    if (existingData) {
        jsonData = JSON.parse(existingData);
        
        // Si estamos en la página de datos personales, rellenamos los campos
        if (window.location.pathname.includes('datos.html')) {
            if (jsonData.nombre) document.getElementById("txtNombre").value = jsonData.nombre;
            if (jsonData.paterno) document.getElementById("txtPaterno").value = jsonData.paterno;
            if (jsonData.materno) document.getElementById("txtMaterno").value = jsonData.materno;
            if (jsonData.numCelular) document.getElementById("txtCelular").value = jsonData.numCelular;
            if (jsonData.fechaNacimiento && jsonData.fechaNacimiento !== "0001-01-01T00:00:00") {
                const fecha = new Date(jsonData.fechaNacimiento);
                document.getElementById("txtFecha").value = 
                    `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
            }
            if (jsonData.escuelaId) document.getElementById("escuela").value = jsonData.escuelaId;
            if (jsonData.carreraId) document.getElementById("carrera").value = jsonData.carreraId;
        }
    }
}

// Llamar a cargarDatosGuardados cuando se carga la página
window.onload = cargarDatosGuardados;

async function setLocalData() {
    // Guardamos los datos del primer formulario
    jsonData.correo = document.getElementById("txtEmail").value;
    jsonData.password = document.getElementById("txtPassword").value;
    
    // Guardamos en localStorage
    localStorage.setItem("data", JSON.stringify(jsonData));
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon ${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}"></i>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 100);

    // Remover después de 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function setDataStudent() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Registrando estudiante...</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);

    // Recuperamos los datos existentes del localStorage
    const existingData = localStorage.getItem("data");
    if (!existingData) {
        showNotification('Error: No se encontraron los datos de registro', 'error');
        loadingDiv.remove();
        return;
    }

    const storedData = JSON.parse(existingData);

    // Convertir la fecha del formato dd/mm/yyyy a yyyy-mm-dd
    const fechaParts = document.getElementById('txtFecha').value.split('/');
    const fecha = new Date(`${fechaParts[2]}-${fechaParts[1]}-${fechaParts[0]}`);

    const alumnoRegistroDTO = {
        nombre: document.getElementById('txtNombre').value,
        paterno: document.getElementById('txtPaterno').value,
        materno: document.getElementById('txtMaterno').value,
        numCelular: document.getElementById('txtCelular').value,
        fechaNacimiento: fecha.toISOString(),
        correo: storedData.correo,
        password: storedData.password,
        carreraId: parseInt(document.getElementById('carrera').value),
        escuelaId: parseInt(document.getElementById('escuela').value)
    };

    // Validaciones
    if (!alumnoRegistroDTO.nombre || !alumnoRegistroDTO.paterno || !alumnoRegistroDTO.materno || 
        !alumnoRegistroDTO.numCelular || !alumnoRegistroDTO.fechaNacimiento || 
        !alumnoRegistroDTO.correo || !alumnoRegistroDTO.password || 
        alumnoRegistroDTO.carreraId === 0 || alumnoRegistroDTO.escuelaId === 0) {
        showNotification('Por favor, completa todos los campos', 'error');
        loadingDiv.remove();
        return;
    }

    // Actualizamos el localStorage con todos los datos
    localStorage.setItem('data', JSON.stringify(alumnoRegistroDTO));

    // Verificar si el correo ya existe
    fetch('https://tebatravelapi.utcv.edu.mx/api/Alumno/verificar-correo/' + alumnoRegistroDTO.correo)
        .then(response => response.json())
        .then(data => {
            if (data) {
                throw new Error('El correo electrónico ya está registrado');
            }
            
            // Si el correo no existe, proceder con el registro
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://tebatravelapi.utcv.edu.mx/api/Alumno', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.withCredentials = true;

            xhr.onload = function() {
                if (xhr.status === 200) {
                    // Limpiar localStorage después de un registro exitoso
                    localStorage.removeItem('data');
                    
                    // Limpiar el formulario
                    document.getElementById('txtNombre').value = '';
                    document.getElementById('txtPaterno').value = '';
                    document.getElementById('txtMaterno').value = '';
                    document.getElementById('txtCelular').value = '';
                    document.getElementById('txtFecha').value = '';
                    document.getElementById('carrera').value = '';
                    document.getElementById('escuela').value = '';

                    // Mostrar mensaje de éxito
                    showNotification('¡Registro exitoso! Redirigiendo...', 'success');
                    
                    // Redirigir después de mostrar la notificación
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    throw new Error('Error en el registro: ' + xhr.statusText);
                }
            };

            xhr.onerror = function() {
                throw new Error('Error de conexión');
            };

            xhr.send(JSON.stringify(alumnoRegistroDTO));
        })
        .catch(error => {
            showNotification(error.message, 'error');
        })
        .finally(() => {
            // Remover el loading
            const loading = document.getElementById('loading');
            if (loading) {
                loading.remove();
            }
        });
}

// Agregar estilos para las notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(120%);
        transition: transform 0.3s ease-in-out;
        z-index: 10000;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification.success {
        border-left: 4px solid #4CAF50;
    }

    .notification.error {
        border-left: 4px solid #f44336;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .notification-icon {
        font-size: 20px;
    }

    .notification.success .notification-icon {
        color: #4CAF50;
    }

    .notification.error .notification-icon {
        color: #f44336;
    }

    .notification p {
        margin: 0;
        color: #333;
        font-size: 14px;
    }

    #loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .loading-spinner {
        background: white;
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    }

    .loading-spinner p {
        margin: 0;
        color: #333;
        font-size: 14px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(notificationStyles);

// Agregar Font Awesome para los iconos
const fontAwesome = document.createElement('link');
fontAwesome.rel = 'stylesheet';
fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
document.head.appendChild(fontAwesome);

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