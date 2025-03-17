"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeZeroMqClient = initializeZeroMqClient;
exports.sendZeroMqMessage = sendZeroMqMessage;
const zmq = __importStar(require("zeromq"));
// Initialize ZeroMQ sockets for client
async function initializeZeroMqClient() {
    const requestSocket = new zmq.Request();
    const subscribeSocket = new zmq.Subscriber();
    try {
        // Connect both sockets
        await requestSocket.connect('tcp://127.0.0.1:3030');
        await subscribeSocket.connect('tcp://127.0.0.1:3031');
        await subscribeSocket.subscribe('update'); // Subscribe to 'update' topic
        console.log('Connected to ZeroMQ server (Request and Subscribe)');
        // Start listening for published messages
        void (async () => {
            for await (const [topic, msg] of subscribeSocket) {
                console.log('Received published message:', msg.toString());
            }
        })();
        return requestSocket;
    }
    catch (error) {
        console.error('ZeroMQ client connection error:', error);
        throw error;
    }
}
// Function to send message to server
async function sendZeroMqMessage(sock, message) {
    try {
        await sock.send(message);
        console.log('Sent message:', message);
        // const [reply] = await sock.receive();
        // return reply.toString();
    }
    catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}
