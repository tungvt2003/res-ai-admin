import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CreateBlogResponse } from "../../types/response";
import { CreateBlogBody } from "../../types/body";
import { BlogApi } from "../../apis/blogApi";

type CreateBlogVariables = CreateBlogBody & {
  image?: unknown[];
};

type Options = Omit<
  UseMutationOptions<CreateBlogResponse, Error, CreateBlogVariables>,
  "mutationFn"
>;

function useCreateBlogMutation(options?: Options) {
  return useMutation({
    mutationFn: async (body: CreateBlogVariables): Promise<CreateBlogResponse> => {
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

      return BlogApi.create(formData);
    },
    ...options,
  });
}

export { useCreateBlogMutation };
