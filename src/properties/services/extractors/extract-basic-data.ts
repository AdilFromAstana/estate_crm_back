export function extractBasicData(document: Document) {
  const safe = (sel: string) =>
    document.querySelector(sel)?.textContent?.trim() || '';

  const rawTitle = safe('.offer__advert-title h1');
  const priceRaw = safe('.offer__price');
  const addressRaw = safe('.offer__location');

  const cityAndDistrict = addressRaw.split('\n')[0]?.trim() || '';
  const parts = cityAndDistrict.split(',').map((x) => x.trim());
  const city = parts[0] || '';
  const district = parts[1] || '';

  return { rawTitle, priceRaw, addressRaw, city, district };
}
