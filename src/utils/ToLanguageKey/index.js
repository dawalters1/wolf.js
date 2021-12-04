const { Language } = require('../../constants');

module.exports = (lang) => {
  switch (lang) {
    case Language.ARABIC : return 'ar';
    case Language.BAHASA_INDONESIA : return 'in';
    case Language.BRAZILIAN_PORTUGUESE : return 'br';
    case Language.BULGARIAN : return 'bu';
    case Language.CHINESE_SIMPLIFIED : return 'ch';
    case Language.CZECH : return 'cz';
    case Language.DANISH : return 'da';
    case Language.DUTCH : return 'du';
    case Language.ENGLISH : return 'en';
    case Language.ESTONIAN : return 'et';
    case Language.FINNISH : return 'fi';
    case Language.FRENCH : return 'fr';
    case Language.GERMAN : return 'ge';
    case Language.GREEK : return 'gr';
    case Language.HINDI : return 'hi';
    case Language.HUNGARIAN : return 'hu';
    case Language.ITALIAN : return 'it';
    case Language.JAPANESE : return 'ja';
    case Language.KAZAKH : return 'ka';
    case Language.KOREAN : return 'ko';
    case Language.LATIN_SPANISH : return 'ls';
    case Language.LATVIAN : return 'la';
    case Language.LITHUANIAN : return 'li';
    case Language.MALAY : return 'ma';
    case Language.NORWEGIAN : return 'no';
    case Language.PERSIAN_FARSI : return 'fa';
    case Language.POLISH : return 'po';
    case Language.PORTUGUESE : return 'pt';
    case Language.RUSSIAN : return 'ru';
    case Language.SLOVAK : return 'sl';
    case Language.SPANISH : return 'es';
    case Language.SWEDISH : return 'sv';
    case Language.THAI : return 'th';
    case Language.TURKISH : return 'tr';
    case Language.UKRAINIAN : return 'uk';
    case Language.VIETNAMESE : return 'vi';
    default: return 'en';
  }
};
