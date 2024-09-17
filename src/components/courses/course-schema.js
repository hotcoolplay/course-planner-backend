"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseListSchema = exports.courseSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.courseSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    subjectcode: typebox_1.Type.String(),
    catalogNumber: typebox_1.Type.String(),
    title: typebox_1.Type.String(),
    courseid: typebox_1.Type.String(),
    units: typebox_1.Type.Number(),
    faculty: typebox_1.Type.String(),
    component: typebox_1.Type.String(),
    completions: typebox_1.Type.Number(),
    simulEnroll: typebox_1.Type.Boolean(),
    grading: typebox_1.Type.String(),
    description: typebox_1.Type.String()
});
exports.courseListSchema = typebox_1.Type.Array(exports.courseSchema);
