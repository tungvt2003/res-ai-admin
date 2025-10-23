import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { DeleteKeywordResponse } from "../../types/response";
import { KeywordApi } from "../../apis/keywordApi";

type Options = Omit<UseMutationOptions<DeleteKeywordResponse, Error, string>, "mutationFn">;

function useDeleteKeywordMutation(options?: Options) {
  return useMutation({
    mutationFn: (keywordId: string) => KeywordApi.delete(keywordId),
    ...options,
  });
}

export { useDeleteKeywordMutation };
