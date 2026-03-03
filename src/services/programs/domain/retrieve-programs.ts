import * as db from "../data-access/program-db.js";
import { FastifyWithTypeProvider } from "../../index.js";
import { standardSequence } from "./standard-sequence.js";
import {
  MajorDTO,
  SelectedMajorDTO,
  SelectedProgramDTO,
} from "./program-schema.js";

export async function getMajors(
  fastify: FastifyWithTypeProvider,
): Promise<MajorDTO[]> {
  const majorList = await db.fetchMajors(fastify);
  return majorList;
}

export async function getSelectedMajor(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<SelectedMajorDTO> {
  const major = await db.fetchMajorById(fastify, id);
  const sequences = await db.fetchMajorSequences(
    fastify,
    major.id,
    major.degreeId,
  );

  // Add the standard sequence if non-co-op is an option
  if (major.regular) sequences.push(standardSequence);

  const extensions = await db.fetchMajorExtensions(
    fastify,
    major.id,
    major.degreeId,
  );

  const selectedDegree = await db.fetchSelectedDegree(fastify, major.degreeId);

  const response: SelectedMajorDTO = {
    ...major,
    degree: selectedDegree,
    sequences: sequences,
    extensions: extensions,
  };
  return response;
}

export async function getSelectedProgram(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<SelectedProgramDTO> {
  const program = await db.fetchProgramById(fastify, id);
  return program;
}

export async function getCommonExtensions(
  fastify: FastifyWithTypeProvider,
): Promise<SelectedProgramDTO[]> {
  const extensions = await db.getCommonExtensions(fastify);
  return extensions;
}
