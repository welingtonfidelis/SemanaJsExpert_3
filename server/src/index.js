import SocketServer from './socket.js';
import Event from 'events';
import { constants } from './constants.js';
import Controller from './controller.js';

const eventEmitter = new Event();

const port  = process.env.PORT || 9898;
const socketServer = new SocketServer({ port });
const server = await socketServer.initialize(eventEmitter);
const controller = new Controller({ socketServer });

console.log('socket server is running at', server.address().port);


eventEmitter.on(
    constants.event.NEW_USER_CONNECTED, 
    controller.onNewConnection.bind(controller)
);
