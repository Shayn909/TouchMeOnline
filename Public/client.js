const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};
let greenDot = {};

socket.on('currentPlayers', (serverPlayers) => {
    players = serverPlayers;
});

socket.on('newPlayer', ({ id, player }) => {
    players[id] = player;
});

socket.on('playerDisconnected', (id) => {
    delete players[id];
});

socket.on('updateGreenDot', (dot) => {
    greenDot = dot;
});

socket.on('updatePlayers', (serverPlayers) => {
    players = serverPlayers;
});

const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

setInterval(() => {
    let x = 0, y = 0;
    if (keys.w) y -= 1;
    if (keys.s) y += 1;
    if (keys.a) x -= 1;
    if (keys.d) x += 1;
    socket.emit('playerMovement', { x, y });
}, 1000 / 30);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (greenDot) {
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(greenDot.x, greenDot.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let id in players) {
        const player = players[id];
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

draw();
