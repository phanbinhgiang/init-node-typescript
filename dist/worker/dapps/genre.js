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
const function_1 = require("../function");
const Genre_1 = __importDefault(require("../../model/dapps/Genre"));
const Dapps_1 = __importDefault(require("../../model/dapps/Dapps"));
class GenreWorker {
    static getGenre(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield (0, function_1.fetchCacheRedisLocal)('GENRE_DAPPS', 120000, () => __awaiter(this, void 0, void 0, function* () {
                const response = yield Genre_1.default.find({ isActive: true, $or: [{ source: '' }, { source: { $exists: false } }] }, {
                    slug: 1, title: 1, logo: 1, _id: 0, description: 1,
                }).sort({ weight: -1 });
                return response;
            }));
            req.response = payload;
            return next();
        });
    }
    static getAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, size = 100 } = req.query;
            const payload = yield Genre_1.default.find({ isActive: true }).sort({ createdAt: -1 }).skip((parseInt(page) - 1) * parseInt(size)).limit(parseInt(size));
            req.response = payload;
            next();
        });
    }
    static getGenreBySlug(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const slug = req.params.id;
            const payload = yield Genre_1.default.findOne({ isActive: true, slug }, {
                slug: 1, title: 1, logo: 1, _id: 1, description: 1, banner: 1,
            }).lean();
            const totalDapps = yield Dapps_1.default.countDocuments({ isActive: true, genre: payload._id.toString() });
            req.response = Object.assign({ totalDapps }, payload);
            next();
        });
    }
    static putPin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const findGenre = yield Genre_1.default.findOne({ _id: req.params.id }, { isPinned: 1 });
            if (!findGenre)
                return next();
            yield Genre_1.default.updateOne({ isPinned: !findGenre.isPinned });
            req.response = true;
            return next();
        });
    }
    static postGenre(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, description, logo, banner = [], weight = 0, tags = [], } = req.body;
            if ((0, function_1.getLength)(title === 0) || (0, function_1.getLength)(logo === 0))
                return next();
            if ((yield Genre_1.default.countDocuments({ slug: (0, function_1.createSlug)(title) })) > 0)
                return next();
            yield Genre_1.default.create({
                slug: (0, function_1.createSlug)(title),
                title,
                description,
                logo,
                banner,
                createdUser: req.user,
                isPinned: false,
                weight,
                tags,
            });
            req.response = true;
            return next();
        });
    }
    static putGenre(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const findGenre = yield Genre_1.default.findOne({ _id: req.body.id });
            if (!findGenre)
                return next();
            const stateUpdate = (0, function_1.genUpdate)(req.body, ['title', 'description', 'logo', 'banner', 'weight', 'tags']);
            if (stateUpdate.title) {
                stateUpdate.slug = (0, function_1.createSlug)(stateUpdate.title);
            }
            yield Genre_1.default.updateOne({ _id: req.body.id }, stateUpdate);
            req.response = true;
            return next();
        });
    }
    static deleteGenre(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const findGenre = yield Genre_1.default.findOne({ _id: req.params.id }, { isActive: 1, _id: 1 });
            if (!findGenre)
                return next();
            yield Genre_1.default.updateOne({ _id: req.params.id }, { isActive: !findGenre.isActive, slug: `DELETE-GENRE-${Date.now()}` });
            req.response = true;
            return next();
        });
    }
}
exports.default = GenreWorker;
//# sourceMappingURL=genre.js.map