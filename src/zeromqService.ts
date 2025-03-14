import * as zmq from 'zeromq';

// Initialize ZeroMQ sockets for client
export async function initializeZeroMqClient() {
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
    } catch (error) {
        console.error('ZeroMQ client connection error:', error);
        throw error;
    }
}

// Function to send message to server
export async function sendZeroMqMessage(
    sock: zmq.Request,
    message: string
){
    try {
        await sock.send(message);
        console.log('Sent message:', message);

        // const [reply] = await sock.receive();
        // return reply.toString();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}