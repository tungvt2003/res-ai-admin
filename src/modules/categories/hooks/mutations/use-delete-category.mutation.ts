import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { DeleteCategoryResponse } from "../../types/response";
import { CategoryApi } from "../../apis/categoryApi";

type Options = Omit<UseMutationOptions<DeleteCategoryResponse, Error, string>, "mutationFn">;

function useDeleteCategoryMutation(options?: Options) {
  return useMutation({
    mutationFn: (categoryId: string) => CategoryApi.delete(categoryId),
    ...options,
  });
}

export { useDeleteCategoryMutation };
