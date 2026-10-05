declare const __webpack_public_path__: string;

export function assetUrl(url: string): string {
  const publicPath = __webpack_public_path__ || '/';
  const publicPathSuffix = publicPath.endsWith('/') ? '' : '/';
  const urlPrefix = url.startsWith('/') ? '' : '/';
  return `${publicPath}${publicPathSuffix}assets${urlPrefix}${url}`;
}
