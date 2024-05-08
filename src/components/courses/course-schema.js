"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseListSchema = exports.courseSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.courseSchema = typebox_1.Type.Object({
    subjectcode: typebox_1.Type.String(),
    catalognumber: typebox_1.Type.String(),
    courseid: typebox_1.Type.String()
});
exports.courseListSchema = typebox_1.Type.Array(exports.courseSchema);
