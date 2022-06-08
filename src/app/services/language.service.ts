import { Injectable } from '@angular/core';
import { TranslationService } from './translation.service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private supportedLanguages: Array<string>;

  public constructor(private translations: TranslationService) {
    this.supportedLanguages = Object.keys(this.translations.languages);
  }

  /**
   * Get the default browser language.
   */
   getBrowserLanguage(): string {
    // navigator.languages returns something like ["en-US", "en", "fr-FR", "fr"]
    // navigator.language return something like "fr"
    // We build an array of languages like ["en", "fr"] and return the first element
    const languages = (navigator.languages || [])
      .concat(navigator.language)
      .map(e => e.split('-')[0]) // keep only the string before "-"
      .filter((e, i, arr) => arr.indexOf(e) === i) // drop doubles
      .filter(lang => lang === 'fr' || lang === 'en'); // drop unsupported languages
    return languages.length > 0 ? languages[0] : 'en';
  }

  getSupportedLanguages(): Array<string> {
    return this.supportedLanguages;
  }
}
