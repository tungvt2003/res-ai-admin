import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { UpdateCategoryResponse } from "../../types/response";
import { UpdateCategoryBody } from "../../types/body";
import { CategoryApi } from "../../apis/categoryApi";

type UpdateCategoryVariables = UpdateCategoryBody & {
  id: string;
};

type Options = Omit<
  UseMutationOptions<UpdateCategoryResponse, Error, UpdateCategoryVariables>,
  "mutationFn"
>;

function useUpdateCategoryMutation(options?: Options) {
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateCategoryVariables) => CategoryApi.update(id, body),
    ...options,
  });
}

export { useUpdateCategoryMutation };
