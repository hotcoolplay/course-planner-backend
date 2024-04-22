"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseListSchema = exports.courseSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.courseSchema = typebox_1.Type.Object({
    deliveryAddress: typebox_1.Type.String(),
    paymentTermsInDays: typebox_1.Type.Number(),
    countryId: typebox_1.Type.Number(),
    productId: typebox_1.Type.Integer(),
    userId: typebox_1.Type.Integer(),
});
exports.courseListSchema = typebox_1.Type.Array(exports.courseSchema);
