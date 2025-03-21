import * as zmq from 'zeromq';
export declare function initializeZeroMqClient(): Promise<zmq.Request>;
export declare function sendZeroMqMessage(sock: zmq.Request, errorPayload: string): Promise<void>;
