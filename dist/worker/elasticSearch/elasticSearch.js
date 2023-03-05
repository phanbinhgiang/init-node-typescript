"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
/* eslint-disable space-before-function-paren */
const elasticsearch_1 = require("@elastic/elasticsearch");
const fs_1 = __importDefault(require("fs"));
const client = new elasticsearch_1.Client({
    node: process.env.SEARCH_SERVER,
    auth: {
        username: 'elastic',
        password: process.env.ELASTIC_PASSWORD,
    },
    tls: {
        ca: fs_1.default.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false,
    },
});
class ElasticsearchService {
    static queryElasticSearch(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // // Let's start by indexing some data
            // await client.index({
            //   index: 'device-sources-test',
            //   document: {
            //     character: 'Ned Stark',
            //     quote: 'Winter is coming.',
            //   },
            // });
            // await client.index({
            //   index: 'device-sources-test',
            //   document: {
            //     character: 'Daenerys Targaryen',
            //     quote: 'I am the blood of the dragon.',
            //   },
            // });
            // Let's search!
            const result = yield client.search({
                index: 'game-of-thrones',
                query: {
                    match: {
                        quote: 'winter',
                    },
                },
            });
            // console.log('🚀 ~ file: elasticSearch.js:54 ~ ElasticsearchService ~ run ~ result', result)
            req.response = result;
            next();
        });
    }
}
exports.default = ElasticsearchService;
//# sourceMappingURL=elasticSearch.js.map