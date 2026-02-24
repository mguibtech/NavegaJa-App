import {NativeModules, TurboModuleRegistry} from 'react-native';

export interface DocumentPickerResult {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

/**
 * Em new architecture (RN 0.73+), TurboModuleRegistry é a forma preferida.
 * Fallback para NativeModules para compatibilidade.
 */
const RNDocumentPicker: any =
  TurboModuleRegistry.get<any>('RNDocumentPicker') ??
  NativeModules.RNDocumentPicker;

/**
 * Abre o seletor de documentos nativo do Android.
 * @param types — MIME types aceites, ex: ['application/pdf']
 * @throws erro com code='DOCUMENT_PICKER_CANCELED' se o usuário cancelar
 */
export async function pickDocument(
  types: string[] = ['application/pdf'],
): Promise<DocumentPickerResult> {
  if (!RNDocumentPicker) {
    throw Object.assign(
      new Error('Módulo de documentos não encontrado. Rebuilde o app.'),
      {code: 'E_MODULE_NOT_FOUND'},
    );
  }
  return RNDocumentPicker.pick({type: types});
}

export function isDocumentPickerCancelled(error: unknown): boolean {
  return (error as {code?: string})?.code === 'DOCUMENT_PICKER_CANCELED';
}
