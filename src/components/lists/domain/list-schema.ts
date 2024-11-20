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

const majorType = Type.Union([
  Type.Literal("H"),
  Type.Literal("JH"),
  Type.Literal("3G"),
  Type.Literal("4G"),
]);

const majorSystem = Type.Union([
  Type.Literal("Regular"),
  Type.Literal("Co-operative"),
]);

const prerequisiteSchema = Type.Object({
  id: Type.Number(),
  parentPrerequisiteSchemaId: Type.Union([Type.Number(), Type.Null()]),
  requisiteType: requisiteType,
  requisiteSubtype: requisiteSubtype,
});

const parentPrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    amount: Type.Union([Type.Number(), Type.Null()]),
    grade: Type.Union([Type.Number(), Type.Null()]),
    units: Type.Union([Type.Number(), Type.Null()]),
    programAverage: Type.Union([Type.Number(), Type.Null()]),
    prerequisites: Type.Union([Type.Array(prerequisiteSchema), Type.Null()]),
  }),
]);

const coursePrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    courseId: Type.Number(),
  }),
]);

const programPrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    programId: Type.Number(),
  }),
]);

const levelPrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    level: Type.String(),
  }),
]);

const otherPrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    other: Type.String(),
  }),
]);

const pseudoCoursePrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    subject: Type.Union([Type.String(), Type.Null()]),
    catalogNumber: Type.Union([Type.String(), Type.Null()]),
    minCatalogNumber: Type.Union([Type.Number(), Type.Null()]),
    maxCatalogNumber: Type.Union([Type.Number(), Type.Null()]),
    topic: Type.Union([Type.String(), Type.Null()]),
    term: Type.Union([Type.String(), Type.Null()]),
    component: Type.Union([Type.String(), Type.Null()]),
  }),
]);

const cumulativeAveragePrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    cumulativeAverage: Type.Number(),
  }),
]);

const majorAveragePrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    majorAverage: Type.Number(),
  }),
]);

const pseudoProgramPrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    faculty: Type.Union([Type.String(), Type.Null()]),
    majorType: Type.Union([majorType, Type.Null()]),
    majorSystem: Type.Union([majorSystem, Type.Null()]),
  }),
]);

const degreePrerequisiteSchema = Type.Composite([
  prerequisiteSchema,
  Type.Object({
    degreeId: Type.Number(),
  }),
]);

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

export const courseListSchema = Type.Array(courseSchema);
