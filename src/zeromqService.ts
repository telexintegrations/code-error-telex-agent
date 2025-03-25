import * as zmq from "zeromq";
import { logger } from "./utils/logger";
import {getConfig} from './config/config';

// Use environment variables if available; otherwise, fallback to server defaults.

const host = getConfig().IS_DEV ? "127.0.0.1" : "49.12.208.6";
console.log('host', host)
const basePort = getConfig().IS_DEV ? 4000 : 18001;
const ZEROMQ_SUBSCRIBE_URL = `tcp://${host}:${basePort + 1}`;
const ZEROMQ_REQUEST_URL = `tcp://${host}:${basePort + 2}`;

const SUBSCRIPTION_TOPIC = "update";

/**
 * Initializes the ZeroMQ client by connecting both a Request and a Subscriber socket.
 * The Request socket is used for sending messages, and the Subscriber socket listens
 * for published messages on a predefined topic.
 *
 * @returns A Promise that resolves to the initialized ZeroMQ Request socket.
 */
export async function initializeZeroMqClient(): Promise<zmq.Request> {
    const requestSocket = new zmq.Request();
    const subscribeSocket = new zmq.Subscriber();

    try {
        await requestSocket.connect(ZEROMQ_REQUEST_URL);
        logger.info(`🔗 Connected to ZeroMQ Request socket on ${ZEROMQ_REQUEST_URL}`);

        await subscribeSocket.connect(ZEROMQ_SUBSCRIBE_URL);
        logger.info(`🔗 Connected to ZeroMQ Subscriber socket on ${ZEROMQ_SUBSCRIBE_URL}`);

        await subscribeSocket.subscribe(SUBSCRIPTION_TOPIC);
        logger.info(`📡 Subscribed to "${SUBSCRIPTION_TOPIC}" topic`);

        // Start async loop to process incoming messages on the Subscriber socket.
        (async () => {
            for await (const [topic, msg] of subscribeSocket) {
                logger.info(`📨 Received message on topic [${topic.toString()}]: ${msg.toString()}`);
            }
        })();

        return requestSocket;
    } catch (error) {
        logger.error("❌ ZeroMQ client connection error:", error);
        throw error;
    }
}

/**
 * Sends a message using the provided ZeroMQ Request socket.
 * It logs both the sent message and the reply from the server.
 *
 * @param sock - The ZeroMQ Request socket.
 * @param errorPayload - The payload to send as a string.
 */
export async function sendZeroMqMessage(
    sock: zmq.Request,
    errorPayload: string
): Promise<void> {
    try {
        await sock.send(errorPayload);
        logger.info(`📤 Sent ZeroMQ message: ${errorPayload}`);

        const [reply] = await sock.receive();
        logger.info(`📥 Received ZeroMQ reply: ${reply.toString()}`);
    } catch (error) {
        logger.error("❌ Error sending ZeroMQ message:", error);
        throw error;
    }
}

// import * as zmq from "zeromq";
// import { logger } from "./utils/logger";

// const ZEROMQ_REQUEST_URL =
//   process.env.ZEROMQ_REQUEST_URL || "tcp://127.0.0.1:3030";
// const ZEROMQ_SUBSCRIBE_URL =
//   process.env.ZEROMQ_SUBSCRIBE_URL || "tcp://127.0.0.1:3031";
// const SUBSCRIPTION_TOPIC = "update";

// /**
//  * Initializes the ZeroMQ client by connecting both a Request and a Subscriber socket.
//  * The Request socket is used for sending messages, and the Subscriber socket listens
//  * for published messages on a predefined topic.
//  *
//  * @returns A Promise that resolves to the initialized ZeroMQ Request socket.
//  */
// export async function initializeZeroMqClient(): Promise<zmq.Request> {
//   const requestSocket = new zmq.Request();
//   const subscribeSocket = new zmq.Subscriber();

//   try {
//     await requestSocket.connect(ZEROMQ_REQUEST_URL);
//     logger.info(
//       `🔗 Connected to ZeroMQ Request socket on ${ZEROMQ_REQUEST_URL}`
//     );

//     await subscribeSocket.connect(ZEROMQ_SUBSCRIBE_URL);
//     logger.info(
//       `🔗 Connected to ZeroMQ Subscriber socket on ${ZEROMQ_SUBSCRIBE_URL}`
//     );

//     await subscribeSocket.subscribe(SUBSCRIPTION_TOPIC);
//     logger.info(`📡 Subscribed to "${SUBSCRIPTION_TOPIC}" topic`);

//     // Start async loop to process incoming messages on the Subscriber socket.
//     (async () => {
//       for await (const [topic, msg] of subscribeSocket) {
//         logger.info(
//           `📨 Received message on topic [${topic.toString()}]: ${msg.toString()}`
//         );
//       }
//     })();

//     return requestSocket;
//   } catch (error) {
//     logger.error("❌ ZeroMQ client connection error:", error);
//     throw error;
//   }
// }

// /**
//  * Sends a message using the provided ZeroMQ Request socket.
//  * It logs both the sent message and the reply from the server.
//  *
//  * @param sock - The ZeroMQ Request socket.
//  * @param errorPayload - The payload to send as a string.
//  */
// export async function sendZeroMqMessage(
//   sock: zmq.Request,
//   errorPayload: string
// ): Promise<void> {
//   try {
//     await sock.send(errorPayload);
//     logger.info(`📤 Sent ZeroMQ message: ${errorPayload}`);

//     const [reply] = await sock.receive();
//     logger.info(`📥 Received ZeroMQ reply: ${reply.toString()}`);
//   } catch (error) {
//     logger.error("❌ Error sending ZeroMQ message:", error);
//     throw error;
//   }
// }




// communication mechanism is 
// PUB/SUB 
// REQ/REP