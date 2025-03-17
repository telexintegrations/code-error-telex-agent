"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConfig = exports.ConfigConstant = void 0;
exports.ConfigConstant = {
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
const UpdateConfig = (options) => {
    Object.assign(exports.ConfigConstant, options);
};
exports.UpdateConfig = UpdateConfig;
