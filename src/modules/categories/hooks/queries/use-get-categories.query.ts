import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { CategoryApi } from "../../apis/categoryApi";
import { QueryKeyEnum } from "../../../../shares/enums/queryKey";
import { ListCategoriesResponse } from "../../types/response";

type Options = Omit<
  UseQueryOptions<ListCategoriesResponse, Error, ListCategoriesResponse, QueryKey>,
  "queryKey" | "queryFn"
>;

interface UseListCategoriesQueryParams extends Options {
  filters?: Record<string, any>;
}

export function useListCategoriesQuery(options?: UseListCategoriesQueryParams) {
  const { filters, ...queryOptions } = options || {};

  return useQuery({
    queryKey: [QueryKeyEnum.Category, filters],
    queryFn: () => CategoryApi.getAll(filters),
    ...queryOptions,
  });
}
