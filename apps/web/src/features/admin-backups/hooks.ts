import { useMutation } from "@tanstack/react-query";
import { downloadBackup, restoreBackup } from "./api";

export function useDownloadBackup() {
  return useMutation({ mutationFn: downloadBackup });
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: ({ file, confirmation }: { file: File; confirmation: string }) =>
      restoreBackup(file, confirmation),
  });
}
