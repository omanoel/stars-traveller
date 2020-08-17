import { browser, by, element } from 'protractor';

export class AppPage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigateTo(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText(): Promise<string> {
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }
}
