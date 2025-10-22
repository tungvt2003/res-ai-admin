import { z } from "zod";
import { createLecturerSchema } from "../schemas/createLecturer.schema";
import { updateLecturerSchema } from "../schemas/updateLecturer.schema";

type CreateLecturerBody = z.infer<typeof createLecturerSchema>;
type UpdateLecturerBody = z.infer<typeof updateLecturerSchema>;

export { CreateLecturerBody, UpdateLecturerBody };
