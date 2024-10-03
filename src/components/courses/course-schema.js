import { Type } from "@sinclair/typebox";
export const courseSchema = Type.Object({
    id: Type.Number(),
    subject: Type.String(),
    catalogNumber: Type.String(),
    title: Type.String(),
    courseId: Type.String(),
    units: Type.Number(),
    faculty: Type.String(),
    component: Type.String(),
    completions: Type.Number(),
    simulEnroll: Type.Boolean(),
    grading: Type.String(),
    description: Type.String(),
});
export const courseListSchema = Type.Array(courseSchema);
