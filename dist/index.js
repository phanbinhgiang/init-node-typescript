"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import swaggerUI from 'swagger-ui-express';
const index_1 = __importDefault(require("./route/index"));
const connectDB_1 = require("./common/connectDB");
const constants_1 = require("./middleware/constants");
// import swaggerDocument from './swagger.json';
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.json({ limit: '15MB' }));
app.use((0, morgan_1.default)('dev'));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.send('<h1>Local API</h1><a href="/api-docs">Documentation</a>');
});
app.post('/', (req, res) => {
    // eslint-disable-next-line prefer-destructuring
    // const { title } = req.body;
    console.log(req.body);
    // console.log({ title });
    res.json(true);
});
const pretty = (req, res) => {
    var _a;
    if (!req.response && req.response !== 0 && req.response !== false) {
        res.status(500);
        return res.send(constants_1.mess500);
    }
    const message = {
        data: {},
        success: true,
        status: 400,
    };
    message.data = req.response;
    message.success = ((_a = req.response) === null || _a === void 0 ? void 0 : _a.errMess) ? false : (req.success !== false);
    message.status = req.status || 200;
    return res.status(message.status).send(message);
};
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/adapters', index_1.default, pretty);
app.listen(port, () => console.log(`Express is listening at http://localhost:${port}`));
(0, connectDB_1.connectDatabase)();
//# sourceMappingURL=index.js.map