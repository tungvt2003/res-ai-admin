import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { BlogApi } from "../../apis/blogApi";
import { QueryKeyEnum } from "../../../../shares/enums/queryKey";
import { ListBlogsResponse } from "../../types/response";

type Options = Omit<
  UseQueryOptions<ListBlogsResponse, Error, ListBlogsResponse, QueryKey>,
  "queryKey" | "queryFn"
>;

interface UseListBlogsQueryParams extends Options {
  filters?: Record<string, any>;
}

export function useListBlogsQuery(options?: UseListBlogsQueryParams) {
  const { filters, ...queryOptions } = options || {};

  return useQuery({
    queryKey: [QueryKeyEnum.Blog, filters],
    queryFn: () => BlogApi.getAll(filters),
    ...queryOptions,
  });
}
