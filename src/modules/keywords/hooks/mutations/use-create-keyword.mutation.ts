import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CreateKeywordResponse } from "../../types/response";
import { CreateKeywordBody } from "../../types/body";
import { KeywordApi } from "../../apis/keywordApi";

type Options = Omit<
  UseMutationOptions<CreateKeywordResponse, Error, CreateKeywordBody>,
  "mutationFn"
>;

function useCreateKeywordMutation(options?: Options) {
  return useMutation({
    mutationFn: (body: CreateKeywordBody) => KeywordApi.create(body),
    ...options,
  });
}

export { useCreateKeywordMutation };
