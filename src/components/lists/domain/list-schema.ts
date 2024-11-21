import { Type } from "@sinclair/typebox";

const requisiteType = Type.Union([
  Type.Literal("antireq"),
  Type.Literal("coreq"),
  Type.Literal("prereq"),
]);

const requisiteSubtype = Type.Union([
  Type.Literal("course"),
  Type.Literal("level"),
  Type.Literal("program"),
  Type.Literal("other"),
  Type.Literal("parent"),
  Type.Literal("pseudoCourse"),
  Type.Literal("pseudoProgram"),
  Type.Literal("degree"),
  Type.Literal("cumulativeAverage"),
  Type.Literal("majorAverage"),
]);

const programSubtype = Type.Union([
  Type.Literal("Diploma"),
  Type.Literal("Major"),
  Type.Literal("Minor"),
  Type.Literal("Option"),
  Type.Literal("Specialization"),
]);

const majorType = Type.Union([
  Type.Literal("H"),
  Type.Literal("JH"),
  Type.Literal("3G"),
  Type.Literal("4G"),
]);

const prerequisiteSchema = Type.Object({
  id: Type.Number(),
  parentPrerequisiteSchemaId: Type.Union([Type.Number(), Type.Null()]),
  requisiteType: requisiteType,
  requisiteSubtype: requisiteSubtype,
});

export const courseSchema = Type.Object({
  id: Type.Number(),
  subject: Type.String(),
  catalogNumber: Type.String(),
  title: Type.String(),
  courseid: Type.String(),
  units: Type.Number(),
  faculty: Type.String(),
  component: Type.String(),
  completions: Type.Number(),
  simulEnroll: Type.Boolean(),
  grading: Type.String(),
  description: Type.String(),
});

export const selectedCourseSchema = Type.Object({
  id: Type.Number(),
  subject: Type.String(),
  catalogNumber: Type.String(),
  title: Type.String(),
  courseid: Type.String(),
  units: Type.Number(),
  faculty: Type.String(),
  component: Type.String(),
  completions: Type.Number(),
  simulEnroll: Type.Boolean(),
  grading: Type.String(),
  description: Type.String(),
  prerequisites: prerequisiteSchema,
});

export const courseListSchema = Type.Array(courseSchema);

export const programSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  programSubtype: programSubtype,
});

const sequenceSchema = Type.Object({
  name: Type.Union([Type.String(), Type.Null()]),
  sequence: Type.Array(Type.String()),
});

export const majorSchema = Type.Composite([
  programSchema,
  Type.Object({
    degreeId: Type.Number(),
    majorType: majorType,
    regular: Type.Boolean(),
    coop: Type.Boolean(),
  }),
]);

export const selectedMajorSchema = Type.Composite([
  programSchema,
  Type.Object({
    degreeId: Type.Number(),
    majorType: majorType,
    regular: Type.Boolean(),
    coop: Type.Boolean(),
    sequences: Type.Array(sequenceSchema),
    extensions: Type.Array(programSchema),
  }),
]);

export const majorListSchema = Type.Array(majorSchema);
