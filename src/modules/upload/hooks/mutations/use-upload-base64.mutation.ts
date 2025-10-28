import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  UploadBase64Api,
  UploadBase64Response,
  UploadBase64Request,
} from "../../apis/uploadBase64Api";

type UploadBase64Options = Omit<
  UseMutationOptions<UploadBase64Response, AxiosError, UploadBase64Request>,
  "mutationFn"
>;

function useUploadBase64Mutation(options?: UploadBase64Options) {
  return useMutation<UploadBase64Response, AxiosError, UploadBase64Request>({
    mutationFn: (request) => UploadBase64Api.uploadBase64Images(request.images),
    ...options,
  });
}

export { useUploadBase64Mutation };
