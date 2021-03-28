import SocketServer from './socket.js';
import Event from 'events';
import { constants } from './constants.js';
import Controller from './controller.js';

const eventEmitter = new Event();

// async function testServer() {
//     const options = {
//         port: 9898,
//         host: 'localhost',
//         headers: {
//             Connection: 'Upgrade',
//             Upgrade: 'webSocket'
//         }
//     }

//     const http = await import('http');
//     const req = http.request(options);
//     req.end();

//     req.on('upgrade', (req, socket) => {
//         socket.on('data', data => {
//             console.log('client receveid', data.toString());
//         });

//         setInterval(() => {
//             socket.write('Hello!');
//         }, 500);
//     });
// }

const port  = process.env.PORT || 9898;
const socketServer = new SocketServer({ port });
const server = await socketServer.initialize(eventEmitter);
const controller = new Controller({ socketServer });

console.log('socket server is running at', server.address().port);


eventEmitter.on(
    constants.event.NEW_USER_CONNECTED, 
    controller.onNewConnection.bind(controller)
);

// eventEmitter.on(constants.event.NEW_USER_CONNECTED, (socket) => {
//     console.log('new connection!!!', socket.id);

//     socket.on('data', data => {
//         console.log('server receveid', data.toString());
//         socket.write('World!');
//     });
// });

// await testServer();