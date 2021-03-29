import Events from 'events';
import CliConfig from './src/cliConfig.js';
import EventMager from './src/eventManager.js';
import SocketClient from './src/socket.js';
import TerminalController from "./src/terminalController.js";

const [nodePath, filePath, ...commands] = process.argv;
const config = CliConfig.parseArguments(commands);

const componentEmitter = new Events();
const socketClient = new SocketClient(config);

await socketClient.initialize();

const eventMager = new EventMager({ componentEmitter, socketClient });
const events = eventMager.getEvents();

socketClient.attachEvents(events);

const data = {
    roomId: config.room,
    userName: config.username
}

eventMager.joinRoonAndWaitForMessages(data);

const terminalController = new TerminalController();

await terminalController.initializeTable(componentEmitter);
 