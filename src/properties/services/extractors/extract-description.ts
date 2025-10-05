import { cleanText } from '../utils/text-cleaner';

export function extractDescription(document: Document): string {
  const text =
    document.querySelector('.offer__description .text')?.textContent?.trim() ||
    document.querySelector('.a-description__text')?.textContent?.trim() ||
    '';
  return cleanText(text);
}
