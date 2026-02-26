import {useState} from 'react';
import {Platform} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import {API_BASE_URL} from '@api/config';
import {authStorage} from '@services';
import {useToast} from './useToast';

export function usePdfDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const toast = useToast();

  async function download(endpoint: string, filename: string) {
    if (isDownloading) {return;}
    setIsDownloading(true);
    try {
      const token = await authStorage.getToken();
      const url = `${API_BASE_URL}${endpoint}`;
      const dirs = ReactNativeBlobUtil.fs.dirs;
      const destPath =
        Platform.OS === 'android'
          ? `${dirs.CacheDir}/${filename}`
          : `${dirs.DocumentDir}/${filename}`;

      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: destPath,
      }).fetch('GET', url, {
        Authorization: `Bearer ${token ?? ''}`,
        Accept: 'application/pdf',
      });

      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.android.actionViewIntent(
          res.path(),
          'application/pdf',
        );
      } else {
        await ReactNativeBlobUtil.ios.openDocument(res.path());
      }
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao baixar arquivo');
    } finally {
      setIsDownloading(false);
    }
  }

  return {download, isDownloading};
}
