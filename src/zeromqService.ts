import * as zmq from 'zeromq';

export async function initializeZeroMqClient() {
    const requestSocket = new zmq.Request();
    const subscribeSocket = new zmq.Subscriber();

    try {
        await requestSocket.connect('tcp://127.0.0.1:3030');
        console.log('Connected to ZeroMQ Request socket on port 3030');

        await subscribeSocket.connect('tcp://127.0.0.1:3031');
        console.log('Connected to ZeroMQ Subscribe socket on port 3031');

        await subscribeSocket.subscribe('update');
        console.log('Subscribed to "update" topic');

        void (async () => {
            for await (const [topic, msg] of subscribeSocket) {
                console.log(`Received published message [${topic.toString()}]:`, msg.toString());
            }
        })();

        return requestSocket;
    } catch (error) {
        console.error('ZeroMQ client connection error:', error);
        throw error;
    }
}

export async function sendZeroMqMessage(
    sock: zmq.Request,
    message: string
) {
    try {
        await sock.send(message);
        console.log('Sent message:', message);

        const [reply] = await sock.receive();
        console.log('Received response:', reply.toString());
        return reply.toString();
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}
