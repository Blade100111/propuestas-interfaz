import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { Router, NavigationStart } from '@angular/router';
import { singleSpaAngular, provideSingleSpaPlatform } from 'single-spa-angular';

import { appConfig } from './app/app.config';
import { App } from './app/app';

const lifecycles = singleSpaAngular({
  bootstrapFunction: () => {
    const platformRef = platformBrowser(provideSingleSpaPlatform());
    return bootstrapApplication(App, appConfig, { platformRef });
  },
  NgZone: 'noop',
  template: '<app-root />',
  Router,
  NavigationStart,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
