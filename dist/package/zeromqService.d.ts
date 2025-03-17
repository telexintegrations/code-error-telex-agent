import * as zmq from 'zeromq';
export declare function initializeZeroMqClient(): Promise<zmq.Request>;
export declare function sendZeroMqMessage(sock: zmq.Request, message: string): Promise<void>;
//# sourceMappingURL=zeromqService.d.ts.map