import { FastifyWithTypeProvider } from "../../index.js";

import {
  MajorDTO,
  SelectedProgramDTO,
  ProgramDTO,
  SequenceDTO,
  DegreeDTO,
  SelectedDegreeDTO,
} from "../domain/program-schema.js";

export async function fetchMajors(
  fastify: FastifyWithTypeProvider,
): Promise<MajorDTO[]> {
  const gotList = await fastify.pg.query<MajorDTO>(
    `SELECT id, name, program_subtype AS "programSubtype", degree_id AS "degreeId", \
    major_type AS "majorType", regular, coop FROM programs
    INNER JOIN majors
    USING (id)`,
  );
  return gotList.rows;
}

export async function fetchMajorById(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<MajorDTO> {
  const gotMajor = await fastify.pg.query<MajorDTO>(
    `SELECT id, name, program_subtype AS "programSubtype", degree_id AS "degreeId", \
    major_type AS "majorType", regular, coop FROM programs
    INNER JOIN majors
    USING (id)
    WHERE id = $1`,
    [id],
  );
  return gotMajor.rows[0];
}

export async function fetchProgramById(
  fastify: FastifyWithTypeProvider,
  id: number,
): Promise<ProgramDTO> {
  const gotProgram = await fastify.pg.query<ProgramDTO>(
    `SELECT id, name, program_subtype AS "programSubtype" FROM programs
    WHERE id = $1`,
    [id],
  );
  return gotProgram.rows[0];
}

export async function fetchMajorSequences(
  fastify: FastifyWithTypeProvider,
  majorId: number,
  degreeId: number,
): Promise<SequenceDTO[]> {
  let sequences = await fastify.pg.query<SequenceDTO>(
    `SELECT name, sequence FROM sequences
    WHERE major_id = $1`,
    [majorId],
  );
  //If no sequences in major check degree sequences
  if (sequences.rows.length === 0) {
    sequences = await fastify.pg.query<SequenceDTO>(
      `SELECT name, sequence FROM sequences
      WHERE degree_id = $1`,
      [degreeId],
    );
  }
  return sequences.rows;
}

export async function fetchMajorExtensions(
  fastify: FastifyWithTypeProvider,
  majorId: number,
  degreeId: number,
): Promise<SelectedProgramDTO[]> {
  const specializations = await fastify.pg.query<SelectedProgramDTO>(
    `SELECT id, name, program_subtype AS "programSubtype" FROM programs p
INNER JOIN major_specializations ms
ON p.id = ms.specialization_id
WHERE ms.major_id = $1`,
    [majorId],
  );
  const options = await fastify.pg.query<SelectedProgramDTO>(
    `SELECT id, name, program_subtype AS "programSubtype" FROM programs p
INNER JOIN degree_options deo
ON p.id = deo.option_id
WHERE deo.degree_id = $1`,
    [degreeId],
  );
  const extensions = specializations.rows;
  extensions.push(...options.rows);
  return extensions;
}

export async function getCommonExtensions(
  fastify: FastifyWithTypeProvider,
): Promise<SelectedProgramDTO[]> {
  const commonExtensions = await fastify.pg.query<SelectedProgramDTO>(
    `SELECT id, name, program_subtype AS "programSubtype" FROM programs
    WHERE program_subtype = 'Diploma'
	OR program_subtype = 'Minor'`,
  );
  return commonExtensions.rows;
}

export async function fetchSelectedDegree(
  fastify: FastifyWithTypeProvider,
  degreeId: number,
): Promise<SelectedDegreeDTO> {
  const degree = await fastify.pg.query<DegreeDTO>(
    `SELECT id, name FROM degrees 
    WHERE id = $1`,
    [degreeId],
  );
  const facultyCodes = await fastify.pg.query<{ facultyCode: string }>(
    `SELECT faculty_code AS "facultyCode" FROM degree_faculties
    WHERE degree_id = $1`,
    [degreeId],
  );

  const faculties: string[] = [];

  for (const facultyCode of facultyCodes.rows) {
    faculties.push(facultyCode.facultyCode);
  }

  const selectedDegree: SelectedDegreeDTO = {
    ...degree.rows[0],
    faculties: faculties,
  };
  return selectedDegree;
}
