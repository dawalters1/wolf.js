const axios = require('axios');
const cheerio = require('cheerio');
const ExpiryMap = require('expiry-map');

const axiosClient = axios.create({
  maxRedirects: 5,
  timeout: 8000,
  validateStatus: () => true
});

axiosClient.interceptors.request.use(config => {
  const controller = new AbortController();
  const targetUrl = new URL(config.url, config.baseURL);

  const blockedHosts = new Set([
    'localhost',
    '127.0.0.1',
    '::1'
  ]);

  if (blockedHosts.has(targetUrl.hostname)) {
    controller.abort();
    config.signal = controller.signal;
  }

  return config;
});

const expiryMap = new ExpiryMap(300000); // Keep results for 5 minutes

module.exports = async (api, url) => {
  if (expiryMap.has(url)) {
    return expiryMap.get(url); // Get from cache, because lets not flag ourselves.
  }

  const retrieve = async () => {
    try {
      const hasProtocol = api._botConfig.get('validation.link.protocols').some((proto) => url.toLowerCase().startsWith(proto))

      const formattedUrl = hasProtocol ? url : `http://${url}`; // format if it only starts with www.

      const head = await axiosClient.head(formattedUrl);
      const contentType = head.headers['content-type'];

      if (contentType?.startsWith('image/')) {
        // its an image, show it
        return {
          type: 'imagePreview',
          url: formattedUrl
        };
      }

      if (!contentType?.includes('text/html')) {
        return null; // its not html do not process further
      }

      const page = await axios.get(formattedUrl, {
        timeout: 5000,
        maxRedirects: 5,
        maxContentLength: 1024 * 1024,
        maxBodyLength: 128 * 1024,
        headers: {
          'User-Agent': 'WOLFJSBOT/1.0'
        },
        responseType: 'text'
      });

      const $ = cheerio.load(page.data);

      const title =
        $('#pageTitle')?.first()?.text()?.trim() ||
        $('meta[property="og:title"]')?.attr('content')?.trim()||
        $('meta[name="twitter:title"]')?.attr('content')?.trim() ||
        $('title')?.first()?.text()?.trim() ||
        '-';

      const description =
        $('meta[property="og:description"]')?.attr('content')?.trim() ||
        $('meta[name="description"]')?.attr('content')?.trim()||
        $('meta[name="twitter:description"]')?.attr('content')?.trim() ||
        '-';

      return {
        type: 'linkPreview',
        url: formattedUrl,
        title,
        body: description
      };
    } catch (error) {
      return null; // error occurred
    }
  };

  return expiryMap.set(url, await retrieve()).get(url); // cache result and retrieve it
};
