"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genSkipNum = exports.genSortStateMongo = void 0;
/* eslint-disable arrow-body-style */
/* eslint-disable import/prefer-default-export */
const getLength = (value) => {
    return value ? value.length : 0;
};
const genSortStateMongo = (sortString = '') => {
    if (getLength(sortString) === 0)
        return { createdAt: -1 };
    const isDesc = sortString[0] === '-';
    return isDesc ? { [sortString.substring(1)]: -1 } : { [sortString]: 1 };
};
exports.genSortStateMongo = genSortStateMongo;
const genSkipNum = (page, size) => {
    return (parseInt(page) - 1) * parseInt(size);
};
exports.genSkipNum = genSkipNum;
//# sourceMappingURL=functions.js.map