export function extractPhotos(document: Document): string[] {
  const urls: string[] = [];

  document.querySelectorAll('.gallery__small-item').forEach((item) => {
    let url: string | null | undefined = item.getAttribute('data-photo-url');
    if (!url) {
      const source = item.querySelector('source[type="image/webp"]');
      if (source) url = source.getAttribute('srcset')?.split(' ')[0];
      if (!url) url = item.querySelector('img')?.getAttribute('src') || '';
    }
    if (url && !urls.includes(url)) urls.push(url);
  });

  if (urls.length === 0) {
    const main = document.querySelector('.gallery__main img');
    if (main) urls.push(main.getAttribute('src') || '');
  }

  return urls;
}
