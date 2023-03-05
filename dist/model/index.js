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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultModel = exports.createSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../middleware/constants");
const createSchema = (schema, key, options, indexOptions) => {
    const schemaModel = new mongoose_1.Schema(schema, options ? Object.assign(options, { versionKey: false, timestamps: true })
        : { versionKey: false, timestamps: true });
    if (indexOptions) {
        schemaModel.index(indexOptions.field, indexOptions.options);
    }
    return mongoose_1.default.model(key, schemaModel);
};
exports.createSchema = createSchema;
exports.defaultModel = {
    date: { type: Date },
    string: { type: String, default: '' },
    numberUnique: { type: Number, required: true, unique: true },
    stringUnique: { type: String, required: true, unique: true },
    array: { type: Array, default: [] },
    number: { type: Number, default: 0 },
    boolean: { type: Boolean, default: true },
    booleanFalse: { type: Boolean, default: false },
    object: { type: Object, default: {} },
    stringStatus: { type: String, default: constants_1.postStatus.waitingReview },
    stringContent: { type: Object, default: { gb: '', vn: '' } },
};
//# sourceMappingURL=index.js.map