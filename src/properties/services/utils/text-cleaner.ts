export const cleanText = (text: string = ''): string => {
  return text
    .replace(/Перевести[\s\S]*$/i, '')
    .replace(/Перевод может быть неточным/gi, '')
    .replace(/Показать оригинал/gi, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
};
