import { FastifyInstance, FastifyBaseLogger } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { IncomingMessage, Server, ServerResponse } from "node:http";

export type FastifyWithTypeProvider = FastifyInstance<
  Server<typeof IncomingMessage, typeof ServerResponse>,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

export type RetrievedEntity<T> = T & { id: number };

export type RetrievedSelectedCourse = RetrievedEntity<Course> &
  RetrievedEntity<Prerequisite>;

export type CourseWithPrerequisites = RetrievedEntity<Course> & {
  prerequisites: RetrievedEntity<Prerequisite>[];
};

export type SelectedMajor = Omit<RetrievedEntity<Major>, "degreeId"> & {
  degree: SelectedDegree;
  extensions: RetrievedEntity<Program>[];
  sequences: Sequence[];
};

export type SelectedDegree = RetrievedEntity<Degree> & {
  faculties: string[];
};

export type RetrievedParentPrerequisite =
  RetrievedEntity<ParentPrerequisite> & {
    prerequisites: RetrievedParentPrerequisite[];
  };
