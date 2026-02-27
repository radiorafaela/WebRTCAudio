const peerIdDisplay = document.getElementById('peerIdDisplay');
const ledIndicator = document.getElementById('ledIndicator');
const statusLabel = document.getElementById('statusLabel');
const remoteAudio = document.getElementById('remoteAudio');

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
        remoteAudio.play().catch(e => {
            console.error("No se pudo auto-reproducir (políticas del navegador). Requiere interacción UI.", e);
            // Intentamos mutado por politicas de chrome
            remoteAudio.muted = true;
            remoteAudio.play().then(() => {
                remoteAudio.muted = false;
            });
        });
    });

    call.on('close', () => {
        ledIndicator.className = 'led-yellow';
        statusLabel.textContent = 'En espera...';
        remoteAudio.srcObject = null;
    });
});
