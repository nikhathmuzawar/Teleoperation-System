 const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
const session = require('express-session');

let senderStream;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const USER_DATA = {
    username: 'user',
    password: '123'
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === USER_DATA.username && password === USER_DATA.password) {
        req.session.user = username;
        res.status(200).send();
    } else {
        res.status(401).send();
    }
});

app.get('/protected', (req, res) => {
    if (req.session.user) {
        res.send('This is a protected route');
    } else {
        res.status(401).send('Unauthorized');
    }
});

app.post("/consumer", async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

app.post('/broadcast', async ({ body }, res) => {
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

app.post('/update_joystick', (req, res) => {
    const joystickData = req.body;
    console.log('Joystick data received:', joystickData);

    res.json({ status: 'success', data: joystickData });
});

app.post('/move_left', (req, res) => {
    console.log('moved left');
});

app.post('/move_right', (req, res) => {
    console.log('moved right');
});

app.post('/stop_rob', (req, res) => {
    console.log('stopped');
});

function handleTrackEvent(e, peer) {
    senderStream = e.streams[0];
};


app.listen(8080, () => console.log('server started'));