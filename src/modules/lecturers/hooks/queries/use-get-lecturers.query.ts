import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { LecturerApi } from "../../apis/lecturerApi";
import { QueryKeyEnum } from "../../../../shares/enums/queryKey";
import { ListLecturersResponse } from "../../types/response";

type Options = Omit<
  UseQueryOptions<ListLecturersResponse, Error, ListLecturersResponse, QueryKey>,
  "queryKey" | "queryFn"
>;

interface UseListLecturersQueryParams extends Options {
  filters?: Record<string, any>;
}

export function useListLecturersQuery(options?: UseListLecturersQueryParams) {
  const { filters, ...queryOptions } = options || {};

  return useQuery({
    queryKey: [QueryKeyEnum.Lecturer, filters],
    queryFn: () => LecturerApi.getAll(filters),
    ...queryOptions,
  });
}
