export const languages = {
  ja: '日本語',
  en: 'English',
};

export const defaultLang = 'ja';

export type Lang = keyof typeof languages;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}

export function getRouteFromUrl(url: URL): string {
  const [, , ...rest] = url.pathname.split('/');
  return rest.join('/') || '';
}

export const ui = {
  ja: {
    'nav.home': 'ホーム',
    'nav.career': 'キャリア',
    'nav.about': 'アバウト',
    'nav.downloads': '履歴書 ダウンロード',
    'page.home': 'Home',
    'page.career': 'Career',
    'page.about': 'About',
    'page.download': 'Download',
    'download.cv': '職務経歴書',
    'download.resume': '履歴書',
  },
  en: {
    'nav.home': 'Home',
    'nav.career': 'Career',
    'nav.about': 'About',
    'nav.downloads': 'CV download',
    'page.home': 'Home',
    'page.career': 'Career',
    'page.about': 'About',
    'page.download': 'Download',
    'download.cv': 'CV',
    'download.resume': 'Resume(Japanese)',
  },
} as const;

export function useTranslations(lang: Lang) {
  return function t(key: keyof typeof ui[typeof defaultLang]): string {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getLocalizedPath(lang: Lang, path: string): string {
  return `/${lang}${path.startsWith('/') ? path : '/' + path}`;
}

