export interface UploadFileParams {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder: string;
}

export interface UploadedFile {
  key: string;
  url: string;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export interface StorageService {
  upload(params: UploadFileParams): Promise<UploadedFile>;
  delete(key: string): Promise<void>;
}
