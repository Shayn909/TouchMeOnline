const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static files from 'public' folder
app.use(express.static('public'));

let players = {};
let greenDot = { x: Math.random() * 780 + 10, y: Math.random() * 580 + 10, speed: 2, directionX: 1, directionY: 1 };

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Add player to the game
    players[socket.id] = { x: Math.random() * 800, y: Math.random() * 600, color: getRandomColor(), score: 0 };
    socket.emit('currentPlayers', players);
    socket.emit('greenDot', greenDot);
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    socket.on('playerMovement', (movementData) => {
        const player = players[socket.id];
        if (player) {
            player.x += movementData.x * 5;
            player.y += movementData.y * 5;
            player.x = Math.max(0, Math.min(780, player.x));
            player.y = Math.max(0, Math.min(580, player.y));
        }
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

setInterval(() => {
    greenDot.x += greenDot.directionX * greenDot.speed;
    greenDot.y += greenDot.directionY * greenDot.speed;
    if (greenDot.x <= 0 || greenDot.x >= 780) greenDot.directionX *= -1;
    if (greenDot.y <= 0 || greenDot.y >= 580) greenDot.directionY *= -1;
    io.emit('updateGreenDot', greenDot);
    io.emit('updatePlayers', players);
}, 1000 / 60);

function getRandomColor() {
    return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

server.listen(PORT, () => {
    console.log(`Server running on http://192.168.0.157:${PORT}`);
});
