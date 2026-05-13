import axios from 'axios';
import * as cheerio from 'cheerio';
import dns from 'dns/promises';
import ExpiryMap from 'expiry-map';
import net from 'net';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CONTENT_LENGTH = 1024 * 1024; // 1 MB
const MAX_BODY_LENGTH = 128 * 1024; // 128 KB
const REQUEST_TIMEOUT_MS = 8000;
const PAGE_TIMEOUT_MS = 5000;
const USER_AGENT = 'WOLFJSBOT/3.0';
const BLOCKED_SCHEMES = new Set(['wolf', 'file', 'ftp', 'data', 'javascript']);

const PRIVATE_CIDRS = [
  { start: ip('10.0.0.0'), end: ip('10.255.255.255') }, // RFC 1918
  { start: ip('172.16.0.0'), end: ip('172.31.255.255') }, // RFC 1918
  { start: ip('192.168.0.0'), end: ip('192.168.255.255') }, // RFC 1918
  { start: ip('127.0.0.0'), end: ip('127.255.255.255') }, // Loopback
  { start: ip('169.254.0.0'), end: ip('169.254.255.255') }, // Link-local
  { start: ip('0.0.0.0'), end: ip('0.255.255.255') }, // "This" network
  { start: ip('100.64.0.0'), end: ip('100.127.255.255') } // Shared address (RFC 6598)
];

// ─── Utilities ───────────────────────────────────────────────────────────────

function ip (addr) {
  return addr.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

function isPrivateIP (addr) {
  if (net.isIPv6(addr)) { return true; } // Block IPv6 (includes ::1) for simplicity
  const n = ip(addr);
  return PRIVATE_CIDRS.some(({ start, end }) => n >= start && n <= end);
}

function normalizeUrl (raw) {
  return /^[a-zA-Z][\w+\-.]*:\/\//.test(raw)
    ? raw
    : `http://${raw}`;
}

async function assertPublicHost (urlString) {
  const { hostname } = new URL(urlString);
  let addresses;

  try {
    addresses = await dns.resolve4(hostname);
  } catch {
    try {
      await dns.resolve6(hostname);
    } catch {
      throw new Error(`DNS resolution failed for "${hostname}"`);
    }
    throw new Error(`IPv6-only host "${hostname}" is not allowed`);
  }

  if (addresses.some(isPrivateIP)) {
    throw new Error(`Host "${hostname}" resolves to a private/reserved address`);
  }
}

const http = axios.create({
  maxRedirects: 5,
  timeout: REQUEST_TIMEOUT_MS,
  validateStatus: () => true
});

const cache = new ExpiryMap(CACHE_TTL_MS);

async function fetchPreview (rawUrl) {
  const url = normalizeUrl(rawUrl);
  const { protocol, hostname } = new URL(url);
  const scheme = protocol.replace(/:$/, '');

  if (BLOCKED_SCHEMES.has(scheme)) { return null; }
  if (!hostname) { return null; }

  await assertPublicHost(url);

  const head = await http.head(url, {
    headers: { 'User-Agent': USER_AGENT }
  });

  const contentType = head.headers['content-type'] ?? '';

  if (contentType.startsWith('image/')) {
    return { type: 'imagePreview', url };
  }

  if (!contentType.includes('text/html')) { return null; }

  const response = await http.get(url, {
    timeout: PAGE_TIMEOUT_MS,
    maxContentLength: MAX_CONTENT_LENGTH,
    maxBodyLength: MAX_BODY_LENGTH,
    headers: { 'User-Agent': USER_AGENT },
    responseType: 'text'
  });

  if (typeof response.data !== 'string') { return null; }

  const $ = cheerio.load(response.data);

  const title =
    $('#pageTitle').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    $('title').first().text().trim() ||
    '-';

  const body =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim() ||
    '-';

  return { type: 'linkPreview', url, title, body };
}

export default async function getPreview (rawUrl) {
  if (cache.has(rawUrl)) { return cache.get(rawUrl); }

  let result = null;

  try {
    result = await fetchPreview(rawUrl);
  } catch {
    // Network errors, SSRF guard rejections, DNS failures → return null quietly
  }

  cache.set(rawUrl, result);
  return result;
}
