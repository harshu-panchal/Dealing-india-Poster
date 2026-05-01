/**
 * Localizes an object with multilingual fields based on the requested language.
 * @param {Object} obj The document object
 * @param {String} lang The requested language code (en, hi, gu, mr)
 * @param {Array} fields The fields to localize
 */
export const localizeObject = (obj, lang = 'en', fields = ['name']) => {
  if (!obj) return obj;
  
  const localized = { ...obj };
  if (obj._doc) Object.assign(localized, obj._doc);

  fields.forEach(field => {
    if (localized[field] && typeof localized[field] === 'object') {
      localized[field] = localized[field][lang] || localized[field]['en'] || '';
    }
  });

  return localized;
};
