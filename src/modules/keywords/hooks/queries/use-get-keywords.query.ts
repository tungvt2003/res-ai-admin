import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { KeywordApi } from "../../apis/keywordApi";
import { QueryKeyEnum } from "../../../../shares/enums/queryKey";
import { ListKeywordsResponse } from "../../types/response";

type Options = Omit<
  UseQueryOptions<ListKeywordsResponse, Error, ListKeywordsResponse, QueryKey>,
  "queryKey" | "queryFn"
>;

interface UseListKeywordsQueryParams extends Options {
  filters?: Record<string, any>;
}

export function useListKeywordsQuery(options?: UseListKeywordsQueryParams) {
  const { filters, ...queryOptions } = options || {};

  return useQuery({
    queryKey: [QueryKeyEnum.Keyword, filters],
    queryFn: () => KeywordApi.getAll(filters),
    ...queryOptions,
  });
}
