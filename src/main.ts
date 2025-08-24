import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';

import { AppModule } from './app/app.module';

// Rejestrujemy polskie dane lokalizacyjne
registerLocaleData(localePl);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
