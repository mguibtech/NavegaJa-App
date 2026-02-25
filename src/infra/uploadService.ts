import {api} from '@api';
import {normalizeFileUrl} from '@api/config';

/**
 * Upload de imagem para o servidor
 * @param formData FormData com o campo 'file'
 * @param folder Subpasta de destino (ex: 'boats', 'avatars')
 * @returns URL pública normalizada
 */
async function uploadImage(formData: FormData, folder?: string): Promise<string> {
  const endpoint = folder ? `/upload/image?folder=${folder}` : '/upload/image';
  const response = await api.upload<{url: string}>(endpoint, formData);
  return normalizeFileUrl(response.url);
}

/**
 * Upload de documento para o servidor
 * @param formData FormData com o campo 'file'
 * @param folder Subpasta de destino (ex: 'documents')
 * @returns URL pública normalizada
 */
async function uploadDocument(formData: FormData, folder?: string): Promise<string> {
  const endpoint = folder ? `/upload/document?folder=${folder}` : '/upload/document';
  const response = await api.upload<{url: string}>(endpoint, formData);
  return normalizeFileUrl(response.url);
}

export const uploadService = {
  uploadImage,
  uploadDocument,
};
