const peerIdDisplay = document.getElementById('peerIdDisplay');
const ledIndicator = document.getElementById('ledIndicator');
const statusLabel = document.getElementById('statusLabel');
const remoteAudio = document.getElementById('remoteAudio');
const manualPlayBtn = document.getElementById('manualPlayBtn');

// Inicializar PeerJS (Usa el servidor público gratuito de PeerJS por defecto)
// Generamos un ID aleatorio de 4 dígitos para que sea fácil de copiar
const randomId = Math.floor(1000 + Math.random() * 9000).toString();
const peer = new Peer(randomId);

peer.on('open', (id) => {
    peerIdDisplay.textContent = id;
    ledIndicator.className = 'led-yellow';
    statusLabel.textContent = 'En espera...';
    console.log('Mi ID de PC es: ' + id);
});

peer.on('error', (err) => {
    console.error(err);
    statusLabel.textContent = 'Error de conexión';
    ledIndicator.className = 'led-red';
});

// Evento: Alguien llama (El celular se conecta)
peer.on('call', (call) => {
    console.log('Llamada entrante detectada');

    // Responder a la llamada (sin enviar stream de audio local al celular, porque la PC solo recibe)
    call.answer(null);

    // UI Update
    ledIndicator.className = 'led-green';
    statusLabel.textContent = 'Conectado - Recibiendo Audio';

    // Cuando el celular empieza a enviar su flujo de audio
    call.on('stream', (remoteStream) => {
        console.log('Stream recibido del celular', remoteStream);

        // Asignar el stream al elemento <audio> para que se reproduzca en los altavoces de la PC
        remoteAudio.srcObject = remoteStream;

        // Asegurarse de que reproduzca
        remoteAudio.play().then(() => {
            console.log("Audio reproduciendo automáticamente.");
        }).catch(e => {
            console.error("El navegador bloqueó la reproducción automática. Se requiere hacer clic en el botón.", e);
            statusLabel.textContent = 'Audio bloqueado. Haz clic abajo';
            ledIndicator.className = 'led-red';

            // Mostrar botón para que el usuario fuerce el desbloqueo del audio
            manualPlayBtn.style.display = 'block';
        });
    });

    // Evento para forzar playback manual
    manualPlayBtn.addEventListener('click', () => {
        remoteAudio.play().then(() => {
            manualPlayBtn.style.display = 'none';
            statusLabel.textContent = 'Conectado - Reproduciendo';
            ledIndicator.className = 'led-green';
        }).catch(err => alert("Error al intentar reproducir el audio: " + err.message));
    });

    call.on('close', () => {
        ledIndicator.className = 'led-yellow';
        statusLabel.textContent = 'En espera...';
        remoteAudio.srcObject = null;
        manualPlayBtn.style.display = 'none';
    });
});
