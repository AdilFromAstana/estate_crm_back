import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PageLoaderService {
  private readonly logger = new Logger(PageLoaderService.name);

  async load(url: string) {
    if (!url.includes('krisha.kz')) {
      throw new BadRequestException('URL должен быть с сайта krisha.kz');
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();

    try {
      // 🚀 Отключаем загрузку ненужных ресурсов (ускоряет в 2–3 раза)
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const blocked = ['image', 'stylesheet', 'font', 'media'];
        if (blocked.includes(req.resourceType())) req.abort();
        else req.continue();
      });

      this.logger.log(`Загрузка страницы: ${url}`);

      await page.goto(url, {
        waitUntil: 'domcontentloaded', // ⚡️ быстрее, чем networkidle2
        timeout: 60000,
      });

      // Дождаться появления ключевых элементов
      await page.waitForSelector('.offer__advert-title', { timeout: 30000 });

      const html = await page.content();
      return { browser, page, html };
    } catch (err) {
      await browser.close();
      this.logger.error(`Ошибка загрузки ${url}: ${err.message}`);
      throw new BadRequestException(`Ошибка загрузки страницы: ${err.message}`);
    }
  }
}
