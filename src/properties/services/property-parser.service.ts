import { Injectable } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { extractBasicData } from './extractors/extract-basic-data';
import { extractParameters } from './extractors/extract-parameters';
import { extractPhotos } from './extractors/extract-photos';
import { extractDescription } from './extractors/extract-description';
import { PageLoaderService } from './page-loader.service';

@Injectable()
export class PropertyParserService {
  constructor(private readonly pageLoader: PageLoaderService) {}

  async parse(url: string) {
    const { browser, page } = await this.pageLoader.load(url);

    try {
      // 🧩 Получаем HTML страницы
      const html = await page.content();

      // 🧠 Создаём DOM через jsdom (эмулируем браузер)
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // 💡 Теперь можно безопасно использовать наши extractors
      const basic = extractBasicData(document);
      const params = extractParameters(document);
      const photos = extractPhotos(document);
      const description = extractDescription(document);

      return { ...basic, ...params, photos, description };
    } finally {
      await browser.close();
    }
  }
}
