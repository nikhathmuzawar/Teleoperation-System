window.onload = async () =>  {
    const response = await fetch('/protected');
        if (response.status === 401) {
            window.location.href = 'login.html'; // Redirect to login if not authenticated
        } else {


    const streamButton = document.getElementById('stream');
    const viewButton = document.getElementById('view');

    if (streamButton && viewButton) {
        streamButton.onclick = () => {
            stream_init();
        }
        viewButton.onclick = () => {
            viewer_init();
        }
    } else {
        console.error('Stream or View button not found!');
    }

    const left = document.getElementById('left');
    const right = document.getElementById('right');
    const stop = document.getElementById('stop');

    left.addEventListener('click', moveleft);
    right.addEventListener('click', moveright);
    stop.addEventListener('click', stoprob);

    var options = {
        zone: document.getElementById('joystick'),
        color: 'blue',
    };
    var joystick = nipplejs.create(options);

    joystick.on('move', function (evt, data) {
        console.log('Joystick data:', data);

        fetch('/update_joystick', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                direction: data.direction,
                distance: data.distance,
                angle: data.angle
            })
        })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));
    });

}
}

async function stream_init() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById("video").srcObject = stream;
    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
}

async function viewer_init() {
    const peer = createPeer1();
    peer.addTransceiver("video", { direction: "recvonly" })
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

function createPeer1() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent1(peer);

    return peer;
}

async function handleNegotiationNeededEvent1(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };

    const { data } = await axios.post('/consumer', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };

    const { data } = await axios.post('/broadcast', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

function handleTrackEvent(e) {
    document.getElementById("video1").srcObject = e.streams[0];
};

function moveleft() {
    fetch('/move_left', {
        method: 'POST',
    })
    .then(response=> {
        if(response.ok){
            console.log("turned left");
        }
        else {
            console.error('failed to turn left');
        }
    })
    .catch(error=> console.error('error turning left',error));
}

function moveright() {
    fetch('/move_right', {
        method: 'POST',
    })
    .then(response=> {
        if(response.ok){
            console.log("turned right");
        }
        else {
            console.error('failed to turn right');
        }
    })
    .catch(error=> console.error('error turning right',error));
}

function stoprob() {
    fetch('/stop_rob', {
        method: 'POST',
    })
    .then(response=> {
        if(response.ok){
            console.log("stopped");
        }
        else {
            console.error('failed to stop');
        }
    })
    .catch(error=> console.error('error stopping',error));
}

