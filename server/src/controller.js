import { constants } from "./constants.js";

export default class Controller {
    #users = new Map();
    #rooms = new Map();

    constructor({ socketServer }) {
        this.socketServer = socketServer;
    }

    onNewConnection(socket) {
        const { id } = socket;
        const userData = { id, socket };

        console.log('connection stablished with', id);

        this.#updateGlobalUserData(id, userData);

        socket.on('data', this.#onScoketData(id));
        socket.on('error', this.#onScoketClosed(id));
        socket.on('end', this.#onScoketClosed(id));
    }

    async joinRoom(socketId, data) {
        const userData = data;
        console.log(`${userData.userName} joined! ${socketId}`);
        const { roomId } = userData;
        const user = this.#updateGlobalUserData(socketId, userData);
        const users = this.#joinUserOnRoom(roomId, user);

        const currentUsers = Array
            .from(users.values())
            .map(({ id, userName }) => ({ userName, id }));

        this.socketServer.sendMessage(user.socket, constants.event.UPDATE_USERS, currentUsers);

        this.broadCast({
            socketId,
            roomId,
            message: { id: socketId, userName: userData.userName },
            event: constants.event.NEW_USER_CONNECTED
        });
    }

    broadCast({ socketId, roomId, event, message, includeCurrentSocket = false }) {
        const usersOnRoom = this.#rooms.get(roomId);

        for(const [ key, user] of usersOnRoom) {
            if (!includeCurrentSocket && key === socketId) continue;

            this.socketServer.sendMessage(user.socket, event, message);
        }
    }

    #joinUserOnRoom(roomId, user) {
        const usersOnRoom = this.#rooms.get(roomId) ?? new Map();
        usersOnRoom.set(user.id, user);
        this.#rooms.set(roomId, usersOnRoom);

        return usersOnRoom;
    }

    #onScoketData(id) {
        return data => {
            try {
                const { event, message } = JSON.parse(data);
                this[event](id, message);
            } catch (error) {
                console.log('Wrong event format!!!', error, data.toString());
            }
        }
    }

    #onScoketClosed(id) {
        return data => {
            console.log('onSocketClosed', id);
        }
    }

    #updateGlobalUserData(socketId, userData) {
        const users = this.#users;
        const user = users.get(socketId) ?? {};

        const updateUserData = {
            ...user,
            ...userData
        }

        users.set(socketId, updateUserData);

        return users.get(socketId);
    }
}