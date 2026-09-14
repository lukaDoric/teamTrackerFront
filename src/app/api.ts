import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class Api {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
}
