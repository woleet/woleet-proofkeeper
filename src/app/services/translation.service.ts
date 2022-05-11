import { Injectable } from '@angular/core';
import en from '../../assets/i18n/en';

export function GenericClass<Props>(): new () => Props {
  return class {} as any;
}

function concatIfExistsPath(path: string, suffix: string): string {
  return path ? `${path}.${suffix}` : suffix;
}

function transformObjectToPath<T extends Record<string, unknown> | string>(suffix: string, objectToTransformOrEndOfPath: T, path = ''): T {
  return typeof objectToTransformOrEndOfPath === 'object'
    ? Object.entries(objectToTransformOrEndOfPath).reduce((objectToTransform, [key, value]) => {
        objectToTransform[key] = transformObjectToPath(key, value as typeof en, concatIfExistsPath(path, suffix));
        return objectToTransform;
      }, {} as T)
    : (concatIfExistsPath(path, suffix) as T);
}

@Injectable()
export class TranslationService extends GenericClass<typeof en>() {
  constructor() {
    super();
    Object.assign(this, transformObjectToPath('', en));
  }

  /**
   * Get a specific list of translations.
   * @param translations The translations
   * @returns A list of translations
   */
  getListOfTranslations(translations: Record<string, string>): Array<string> {
    return Object.values(translations);
  }
}
