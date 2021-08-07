const { language } = require('@dawalters1/constants');

module.exports = (lang) => {
  switch (lang) {
    case language.ARABIC : return 'ar';
    case language.BAHASA_INDONESIA : return 'bin';
    case language.BRAZILIAN_PORTUGUESE : return 'brpt';
    case language.BULGARIAN : return 'bu';
    case language.CHINESE_SIMPLIFIED : return 'ch';
    case language.CZECH : return 'cz';
    case language.DANISH : return 'da';
    case language.DUTCH : return 'du';
    case language.ENGLISH : return 'en';
    case language.ESTONIAN : return 'est';
    case language.FINNISH : return 'fi';
    case language.FRENCH : return 'fr';
    case language.GERMAN : return 'ge';
    case language.GREEK : return 'gr';
    case language.HINDI : return 'hi';
    case language.HUNGARIAN : return 'hu';
    case language.ITALIAN : return 'it';
    case language.JAPANESE : return 'ja';
    case language.KAZAKH : return 'ka';
    case language.KOREAN : return 'ko';
    case language.LATIN_SPANISH : return 'les';
    case language.LATVIAN : return 'la';
    case language.LITHUANIAN : return 'li';
    case language.MALAY : return 'ma';
    case language.NORWEGIAN : return 'no';
    case language.PERSIAN_FARSI : return 'fa';
    case language.POLISH : return 'po';
    case language.PORTUGUESE : return 'pt';
    case language.RUSSIAN : return 'ru';
    case language.SLOVAK : return 'sl';
    case language.SPANISH : return 'es';
    case language.SWEDISH : return 'sv';
    case language.THAI : return 'th';
    case language.TURKISH : return 'tr';
    case language.UKRAINIAN : return 'uk';
    case language.VIETNAMESE : return 'vi';
    default: return 'en';
  }
};
