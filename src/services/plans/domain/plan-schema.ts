import { Static, Type } from "@sinclair/typebox";
import {
  selectedMajorSchema,
  selectedProgramSchema,
} from "../../programs/domain/program-schema.js";

const termType = Type.Union([
  Type.Literal("Fall"),
  Type.Literal("Winter"),
  Type.Literal("Spring"),
]);

const planTermSchemaDTO = Type.Object({
  termType: termType,
  termYear: Type.Number(),
  termCourses: Type.Array(Type.Number()),
});

const planTermSchema = Type.Composite([
  Type.Object({
    id: Type.Number(),
  }),
  planTermSchemaDTO,
]);

export const planSchemaDTO = Type.Object({
  name: Type.String(),
  majors: Type.Array(Type.Number()),
  extensions: Type.Array(Type.Number()),
  planTerms: Type.Array(planTermSchemaDTO),
});

export const createPlanDTO = Type.Omit(planSchemaDTO, ["userId"]);

export const planSchema = Type.Composite([
  Type.Omit(planSchemaDTO, ["planTerms", "majors", "extensions"]),
  Type.Object({
    id: Type.Number(),
    majors: Type.Array(selectedMajorSchema),
    extensions: Type.Array(selectedProgramSchema),
    planTerms: Type.Array(planTermSchema),
  }),
]);

export const planListSchema = Type.Array(
  Type.Object({
    id: Type.Number(),
    name: Type.String(),
  }),
);

export type UserPlanDTO = Static<typeof planSchemaDTO>;

export type UserPlan = Static<typeof planSchema>;

export type PlanTerm = Static<typeof planTermSchema>;

export type PlanList = Static<typeof planListSchema>;
