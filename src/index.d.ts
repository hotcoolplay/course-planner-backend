interface Program {
  name: string;
  programSubtype: programSubtype;
  urlCode: string;
}

interface Major extends Program {
  degreeId: number;
  majorType: majorType;
  regular: boolean;
  coop: boolean;
}

interface Specialization extends Program {
  parentMajors: number[];
}

interface Option extends Program {
  parentDegrees: number[];
}

interface Degree {
  name: string;
}

interface Requirement {
  id: number;
  amount: number | null;
  requirementType: requirementType;
  requirementSubtype: requirementSubtype;
  degreeID: number | null;
  programID: number | null;
  childRequirements: Requirement[] | null;
  antirequirement: boolean;
  courses: PseudoCourse[] | null;
}

interface UnitRequirement extends Requirement {
  majorType: majorType;
  unitType: unitType;
  units: number;
}

interface AverageRequirement extends Requirement {
  averageType: averageType;
  average: number;
  majorType: majorType;
}

interface BreadthRequirement extends Requirement {
  name: string;
  units: number;
}

interface CommunicationRequirement extends Requirement {
  term: string | null;
  grade: number | null;
}

interface CourseRequirement extends Requirement {
  units: number | null;
  average: number | null;
}

interface DepthRequirement extends Requirement {
  units: number | null;
  prereqLength: number | null;
}

interface PdRequirement extends Requirement {
  catalogNumber: string | null;
  term: string | null;
}

interface WorkRequirement extends Requirement {
  workTerms: number;
  workType: workType;
}

interface CourseList {
  name: string | null;
  courseLists: CourseList[] | null;
  courses: PseudoCourse[] | null;
}

interface Course {
  subjectcode: string;
  catalogNumber: string;
  title: string;
  courseid: string;
  faculty: string;
  component: string;
  completions: number | null;
  simulEnroll: boolean | null;
  grading: string;
  units: number;
  description: string;
  prerequisites: Prerequisites[];
}

interface PseudoCourse {
  subject: string | null;
  catalogNumber: string | null;
  minCatalogNumber: number | null;
  maxCatalogNumber: number | null;
  topic: string | null;
  term: string | null;
  component: string | null;
  faculty: string | null;
}

interface Term {
  name: string;
  code: string;
}

interface Prerequisite {
  amount: number | null;
  parentId: number | null;
  courseId: number | null;
  requisiteType: requisiteType | null;
  requisiteSubtype: requisiteSubtype | null;
  grade: number | null;
  courses: Course[] | null;
}

interface CoursePrerequisite extends Prerequisite {
  units: number | null;
  pseudoCourses: PseudoCourse[];
}

interface ProgramPrerequisite extends Prerequisite {
  average: number | null;
  averageType: averageType | null;
  programs: number[] | null;
  faculties: string[] | null;
}

interface LevelPrerequisite extends Prerequisite {
  level: string;
}

interface OtherPrerequisite extends Prerequisite {
  other: string;
}

type requisiteType = "antireq" | "prereq" | "coreq";
type requisiteSubtype = "course" | "level" | "program" | "other" | "requisite";
type averageType = "CAV" | "MAV" | "SMAV" | "TAV";
type programSubtype =
  | "Diploma"
  | "Major"
  | "Minor"
  | "Option"
  | "Specialization";
type requirementType =
  | "average"
  | "breadth"
  | "communication"
  | "course"
  | "depth"
  | "pd"
  | "term"
  | "time"
  | "unit"
  | "work"
  | "requirement";
type requirementSubtype = "Declaration" | "Graduation";
type majorType = "H" | "JH" | "3G" | "4G";
type unitType = "failed" | "unusable" | "minimum";
type workType = "Standard" | "Flexible";
