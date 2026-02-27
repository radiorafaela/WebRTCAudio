const targetIdInput = document.getElementById('targetIdInput');
const callBtn = document.getElementById('callBtn');
const ledIndicator = document.getElementById('ledIndicator');
const statusLabel = document.getElementById('statusLabel');
const btnText = document.getElementById('btnText');

let peer;
let currentCall = null;
let currentStream = null;
let isStreaming = false;

// Inicializar Peer (ID aleatorio, no importa porque este llamará, no recibirá llamadas)
peer = new Peer();

peer.on('open', (id) => {
    console.log('Transmisor listo. ID interno:', id);
    statusLabel.textContent = 'Listo para conectar';
    ledIndicator.className = 'led-yellow';
});

peer.on('error', (err) => {
    console.error(err);
    alert('Error WebRTC: ' + err.message);
    stopCall();
});

callBtn.addEventListener('click', async () => {
    if (isStreaming) {
        stopCall();
    } else {
        await startCall();
    }
});

async function startCall() {
    const targetId = targetIdInput.value.trim();
    if (!targetId) {
        alert('Por favor, ingresa el ID numérico de 4 dígitos del estudio.');
        return;
    }

    try {
        // Pedir permisos de micrófono
        statusLabel.textContent = 'Accediendo a Mic...';
        currentStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false, // Mejorar calidad raw
                noiseSuppression: true,
                autoGainControl: true
            },
            video: false
        });

        statusLabel.textContent = 'Llamando...';

        // Iniciar la llamada hacia el ID del Receptor (PC) enviando nuestro micrófono
        currentCall = peer.call(targetId, currentStream);

        currentCall.on('stream', () => {
            // El receptor podría devolver audio, pero aquí no nos interesa
        });

        currentCall.on('close', () => {
            stopCall();
        });

        currentCall.on('error', (err) => {
            console.error(err);
            stopCall();
        });

        // Actualizar UI
        isStreaming = true;
        btnText.textContent = 'Terminar Transmisión';
        callBtn.classList.add('active-mode');
        ledIndicator.className = 'led-green';
        statusLabel.textContent = 'Transmitiendo en Vivo';

    } catch (err) {
        console.error('Error al capturar audio:', err);
        alert('No se pudo acceder al micrófono. Verifica los permisos.');
        stopCall();
    }
}

function stopCall() {
    if (currentCall) {
        currentCall.close();
        currentCall = null;
    }
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }

    isStreaming = false;
    btnText.textContent = 'Conectar y Transmitir';
    callBtn.classList.remove('active-mode');

    // Si PeerJS se conectó correctamente al inicio
    if (peer && !peer.disconnected && !peer.destroyed) {
        ledIndicator.className = 'led-yellow';
        statusLabel.textContent = 'Listo para conectar';
    } else {
        ledIndicator.className = 'led-red';
        statusLabel.textContent = 'Desconectado';
    }
}
