import { Keyword } from "../../keywords/types/keyword";

type Lecturer = {
  id: string;
  fullName: string;
  academicTitle: string;
  workUnit: string;
  position: string;
  image: string | null;
  website: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  keywords: Keyword[];
};

export { Lecturer };
