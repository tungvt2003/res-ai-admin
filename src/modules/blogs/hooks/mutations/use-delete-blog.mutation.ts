import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { DeleteBlogResponse } from "../../types/response";
import { BlogApi } from "../../apis/blogApi";

type Options = Omit<UseMutationOptions<DeleteBlogResponse, Error, string>, "mutationFn">;

function useDeleteBlogMutation(options?: Options) {
  return useMutation({
    mutationFn: (blogId: string) => BlogApi.delete(blogId),
    ...options,
  });
}

export { useDeleteBlogMutation };
