import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation.service';

@Pipe({
  name: 'langPipe',
})
export class LangPipe implements PipeTransform {
  constructor(
    private translateService: TranslateService,
    private translations: TranslationService
  ) {}

  transform(value: string): any {
    return this.translateService.instant(this.translations.languages[value]);
  }
}
