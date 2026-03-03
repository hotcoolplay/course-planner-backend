import { Static, Type } from "@sinclair/typebox";

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

export const programSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  programSubtype: programSubtype,
});

export const selectedProgramSchema = Type.Object({
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

const degreeSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
});

const selectedDegreeSchema = Type.Composite([
  degreeSchema,
  Type.Object({
    faculties: Type.Array(Type.String()),
  }),
]);

export const selectedMajorSchema = Type.Composite([
  programSchema,
  Type.Object({
    degree: selectedDegreeSchema,
    majorType: majorType,
    regular: Type.Boolean(),
    coop: Type.Boolean(),
    sequences: Type.Array(sequenceSchema),
    extensions: Type.Array(selectedProgramSchema),
  }),
]);

export const selectedProgramListSchema = Type.Array(selectedProgramSchema);

export const majorListSchema = Type.Array(majorSchema);

export type ProgramDTO = Static<typeof programSchema>;

export type SelectedProgramDTO = Static<typeof selectedProgramSchema>;

export type SequenceDTO = Static<typeof sequenceSchema>;

export type MajorDTO = Static<typeof majorSchema>;

export type SelectedMajorDTO = Static<typeof selectedMajorSchema>;

export type DegreeDTO = Static<typeof degreeSchema>;

export type SelectedDegreeDTO = Static<typeof selectedDegreeSchema>;
