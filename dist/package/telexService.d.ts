interface TelexConfig {
    channelId: string;
    enableConsoleCapture?: boolean;
    tags?: Record<string, string>;
}
/**
 * This function initializes the Telex SDK with the provided configuration.
 * @param config[channelId] - The unique identifier for the Telex channel.
 * @param config[enableConsoleCapture] - Whether to capture console logs. Defaults to true.
 * @param config[tags] - Additional tags to be associated with the logs. Defaults to an empty object.
 * @returns Promise<void]
 */
export declare const initializeTelex: (config: TelexConfig) => Promise<void>;
export declare const captureError: (error: Error, context?: Record<string, any>) => Promise<void>;
export {};
//# sourceMappingURL=telexService.d.ts.map