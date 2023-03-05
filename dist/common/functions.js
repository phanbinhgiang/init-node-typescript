"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genSkipNum = exports.getLength = void 0;
/* eslint-disable max-len */
const getLength = (value) => (value ? value.length : 0);
exports.getLength = getLength;
const genSkipNum = (page, size) => (parseInt(page, 10) - 1) * parseInt(size, 10);
exports.genSkipNum = genSkipNum;
exports.default = exports.getLength;
//# sourceMappingURL=functions.js.map