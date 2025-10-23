// Cấu trúc phân cấp 4 level: Cha -> Chủ đề -> Lĩnh vực (Loại) -> Giảng viên

export type LecturerItem = {
  id: string;
  name: string;
  academicTitle?: string;
  workUnit?: string;
  position?: string;
  image?: string | null;
  website?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FieldItem = {
  id: string;
  name: string;
  lecturers: LecturerItem[];
};

export type TopicItem = {
  id: string;
  name: string;
  fields: FieldItem[];
};

export type ParentItem = {
  id: string;
  name: string;
  description?: string;
  topics: TopicItem[];
};

export type ConfigurationData = {
  parents: ParentItem[];
};

export type Configuration = {
  id: string;
  key: string;
  value: ConfigurationData;
  createdAt: string;
  updatedAt: string;
};
