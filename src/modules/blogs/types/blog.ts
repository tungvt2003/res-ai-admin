import { Category } from "../../categories/types/category";

type Blog = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  contents: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
};

export { Blog };
