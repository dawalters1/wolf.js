const Url = require('url').URL;
const protocols = ['http', 'https', 'ftp', 'ws', 'wss', 'smtp'];
const punctuation = /[/"()&*$￥^+=`~<>{}[]|-!#%,:;@¡§«¶·»¿;·՚-՟։֊؉،॥॰෴๏๚๛༄-༒༔༺-༽྅჻፠-፨᐀᙭᙮។-៖៘-៚‧‰-⁃⁅-⁑⁓-⁞⁽⁾₍₎、〃〈-【】〔-〟〰〽゠・﴾﴿︐-︙︰-﹒﹔-﹡﹣﹨﹪﹫！-＃％-＊，-／：；？＠［-］＿｛｝｟-･〔〕《》]/;

const BaseUtility = require('../BaseUtility');

const validator = require('../../utils/validator');

module.exports = class IsValidUrl extends BaseUtility {
  constructor (api) {
    super(api, 'isValidUrl');
  }

  _func (url) {
    if (!url || !url.includes('.')) {
      return false;
    }

    url = protocols.some((proto) => url.toLowerCase().startsWith(proto)) ? url : `http://${url}`;

    while (true) {
      const lastCharacter = url.slice(-1);

      if (lastCharacter.match(punctuation)) {
        url = url.slice(0, url.length - 1);
      } else {
        break;
      }
    }

    try {
      const data = new Url(url);

      if (data.host.includes('.')) {
        const tld = data.host.split('.').pop();
        if (validator.isValidNumber(tld) || tld.length < 2) {
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };
};
