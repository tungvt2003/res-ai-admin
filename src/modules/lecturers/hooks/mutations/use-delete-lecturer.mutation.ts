import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { DeleteLecturerResponse } from "../../types/response";
import { LecturerApi } from "../../apis/lecturerApi";

type Options = Omit<UseMutationOptions<DeleteLecturerResponse, Error, string>, "mutationFn">;

function useDeleteLecturerMutation(options?: Options) {
  return useMutation({
    mutationFn: (lecturerId: string) => LecturerApi.delete(lecturerId),
    ...options,
  });
}

export { useDeleteLecturerMutation };
