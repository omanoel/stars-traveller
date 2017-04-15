import { StarsTravelPage } from './app.po';

describe('stars-travel App', () => {
  let page: StarsTravelPage;

  beforeEach(() => {
    page = new StarsTravelPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
