import { z } from "zod";
import { createKeywordSchema } from "../schemas/createKeyword.schema";
import { updateKeywordSchema } from "../schemas/updateKeyword.schema";

type CreateKeywordBody = z.infer<typeof createKeywordSchema>;
type UpdateKeywordBody = z.infer<typeof updateKeywordSchema>;

export { CreateKeywordBody, UpdateKeywordBody };
