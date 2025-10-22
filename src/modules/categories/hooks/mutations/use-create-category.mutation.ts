import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CreateCategoryResponse } from "../../types/response";
import { CreateCategoryBody } from "../../types/body";
import { CategoryApi } from "../../apis/categoryApi";

type Options = Omit<
  UseMutationOptions<CreateCategoryResponse, Error, CreateCategoryBody>,
  "mutationFn"
>;

function useCreateCategoryMutation(options?: Options) {
  return useMutation({
    mutationFn: (body: CreateCategoryBody) => CategoryApi.create(body),
    ...options,
  });
}

export { useCreateCategoryMutation };
