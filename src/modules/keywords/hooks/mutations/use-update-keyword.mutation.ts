import { UpdateKeywordResponse } from "../../types/response";
import { UpdateKeywordBody } from "../../types/body";
import { KeywordApi } from "../../apis/keywordApi";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

type UpdateKeywordVariables = UpdateKeywordBody & {
  id: string;
};

type Options = Omit<
  UseMutationOptions<UpdateKeywordResponse, Error, UpdateKeywordVariables>,
  "mutationFn"
>;

function useUpdateKeywordMutation(options?: Options) {
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateKeywordVariables) => KeywordApi.update(id, body),
    ...options,
  });
}

export { useUpdateKeywordMutation };
