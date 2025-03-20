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
async function initializeZeroMqClient() {
    const requestSocket = new zmq.Request();
    const subscribeSocket = new zmq.Subscriber();
    try {
        await requestSocket.connect('tcp://code-error-microservice.onrender:3030');
        console.log('Connected to ZeroMQ Request socket on port 3030');
        await subscribeSocket.connect('tcp://code-error-microservice.onrender:3031');
        console.log('Connected to ZeroMQ Subscribe socket on port 3031');
        await subscribeSocket.subscribe('update');
        console.log('Subscribed to "update" topic');
        void (async () => {
            for await (const [topic, msg] of subscribeSocket) {
                console.log(`Received published message [${topic.toString()}]:`, msg.toString());
            }
        })();
        return requestSocket;
    }
    catch (error) {
        console.error('ZeroMQ client connection error:', error);
        throw error;
    }
}
async function sendZeroMqMessage(sock, 
// message: string,
errorPayload) {
    // try {
    //     await sock.send(message);
    //     console.log('Sent message:', message);
    //     const [reply] = await sock.receive();
    //     console.log('Received response:', reply.toString());
    //     return reply.toString();
    // } catch (error) {
    //     console.error('Error sending message:', error);
    //     throw error;
    // }
    try {
        await sock.send(errorPayload);
        console.log('Sent message:', errorPayload);
        const [reply] = await sock.receive();
        console.log('Received response:', reply.toString());
    }
    catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}
