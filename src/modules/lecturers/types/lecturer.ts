import { Keyword } from "../../keywords/types/keyword";

type Lecturer = {
  id: string;
  fullName: string;
  academicDegree: string;
  academicRank: string;
  workUnit: string;
  position: string;
  image: string | null;
  website: string;
  zalo: string | null;
  message: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  keywords: Keyword[];
};

export { Lecturer };
