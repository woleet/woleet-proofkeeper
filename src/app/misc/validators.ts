import { AbstractControl, ValidationErrors } from '@angular/forms';


export function tokenFormatValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  if ((control.value.match(/\./g) || []).length !== 2) {
    return {invalidJWTFormat: true};
  }
  const base64 = control.value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  try {
    const jwtObject = JSON.parse(atob(base64));
    if ( jwtObject.hasOwnProperty('sub') && jwtObject.hasOwnProperty('iat') ) {
      return null;
    }
  } catch {
    return {invalidJWTFormat: true};
  }
  return {invalidJWTFormat: true};
}
