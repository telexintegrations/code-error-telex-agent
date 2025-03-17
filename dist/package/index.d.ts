import { captureError } from './telexService';
interface TelexSDKOptions {
    channelId: string;
    enableConsoleCapture?: boolean;
    tags?: Record<string, string>;
}
export declare const initializeTelexSDK: (options: TelexSDKOptions) => Promise<{
    captureError: (error: Error, context?: Record<string, any>) => Promise<void>;
}>;
export { captureError };
//# sourceMappingURL=index.d.ts.map