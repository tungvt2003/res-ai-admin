import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CreateLecturerResponse } from "../../types/response";
import { CreateLecturerBody } from "../../types/body";
import { LecturerApi } from "../../apis/lecturerApi";

type CreateLecturerVariables = CreateLecturerBody & {
  image?: unknown[];
};

type Options = Omit<
  UseMutationOptions<CreateLecturerResponse, Error, CreateLecturerVariables>,
  "mutationFn"
>;

function useCreateLecturerMutation(options?: Options) {
  return useMutation({
    mutationFn: async (body: CreateLecturerVariables): Promise<CreateLecturerResponse> => {
      const { image, ...rest } = body;

      const formData = new FormData();

      // Append all fields except image (only non-empty values)
      Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        formData.append(key, value as string);
      });

      // Handle image upload - Only append if there's an actual file
      if (image && Array.isArray(image) && image.length > 0) {
        const firstFile = image[0] as { originFileObj?: File };
        if (firstFile.originFileObj) {
          formData.append("image", firstFile.originFileObj);
        }
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      return LecturerApi.create(formData);
    },
    ...options,
  });
}

export { useCreateLecturerMutation };
