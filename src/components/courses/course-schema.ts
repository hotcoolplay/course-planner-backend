import { Type } from '@sinclair/typebox';

export const courseSchema = Type.Object({
    subjectcode: Type.String(),
    catalognumber: Type.String(),
    courseid: Type.String(),
})

export const courseListSchema = Type.Array(courseSchema);
