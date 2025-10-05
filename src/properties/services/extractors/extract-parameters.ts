export function extractParameters(document: Document) {
  const params: Record<string, string> = {};

  // короткие параметры
  document
    .querySelectorAll('.offer__short-description .offer__info-item')
    .forEach((el) => {
      const key =
        el.getAttribute('data-name') ||
        el.querySelector('.offer__info-title')?.textContent?.trim() ||
        '';
      const value =
        el.querySelector('.offer__advert-short-info')?.textContent?.trim() ||
        '';
      if (key) params[key] = value;
    });

  // детальные параметры
  document.querySelectorAll('.offer__parameters dl').forEach((dl) => {
    const dt = dl.querySelector('dt');
    const dd = dl.querySelector('dd');
    if (dt && dd) {
      const key = dt.getAttribute('data-name') || dt.textContent?.trim() || '';
      const value = dd.textContent?.trim() || '';
      if (key) params[key] = value;
    }
  });

  return {
    buildingType: params['flat.building'] || '',
    complex: params['map.complex'] || '',
    yearBuilt: params['house.year'] || '',
    condition: params['flat.renovation'] || '',
    bathroom: params['flat.toilet'] || '',
    balcony: params['flat.balcony'] || '',
    parking: params['flat.parking'] || '',
    furniture: params['live.furniture'] || '',
    areaFull: params['live.square'] || '',
    floorInfo: params['flat.floor'] || '',
    roomsParam: params['live.rooms'] || '',
  };
}
