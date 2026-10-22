// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
//
// Console copy in English and Russian - the single source of every display string. Language-invariant tokens
// (the wordmark, role abbreviations, numbers, hosts, e-mail) live in the components.
import type { Role } from '@/types';
import type { QrPlatform } from '@/shared/qrTargets';

export type Lang = 'en' | 'ru';

/** Locale for numbers and for sorting text in the language on screen. */
export function localeOf(lang: Lang): string {
  return lang === 'ru' ? 'ru-RU' : 'en-US';
}

export interface PageCopy {
  /** Browser tab and page heading. */
  title: string;
  /** Orange one-liner above the heading - what the page is for. */
  kicker: string;
}

interface PlatformCopy {
  label: string;
  /** Which devices land on this link. */
  devices: string;
}

export interface Copy {
  /** Suffix of every browser tab title. */
  consoleName: string;
  /** Under the wordmark in the header. */
  byline: string;
  nav: {
    qrCodes: string;
    about: string;
    menu: string;
  };
  pages: {
    login: PageCopy;
    qrCodes: PageCopy;
    /** Card of one code: the title names the browser tab, the kicker sits above the code's name. */
    qrCode: PageCopy;
    about: PageCopy;
    notFound: PageCopy;
  };
  header: {
    logOut: string;
    language: string;
    lightScheme: string;
    darkScheme: string;
  };
  footer: {
    /** Before the website link: "© 2026" + 84softworks.com. */
    copyright: string;
    server: string;
    console: string;
  };
  common: {
    cancel: string;
    create: string;
    save: string;
    copy: string;
    copied: string;
    copyValue: (label: string) => string;
    edit: string;
    delete: string;
    /** The menu of a record's changes in its card. */
    actions: string;
    back: string;
    toList: string;
    retry: string;
    none: string;
  };
  table: {
    /** Before the count under a table. */
    found: string;
    pageSize: string;
    sortDescending: string;
    sortAscending: string;
    sortReset: string;
    columnWidth: (title: string) => string;
    resizeHint: string;
    columnsHidden: (count: number) => string;
    columnWidths: string;
    notFitted: string;
    notFittedHint: string;
    resetWidths: string;
    loadError: string;
    nothingFound: string;
    resetFilters: string;
    /** Next to the search: clears the search and the filters. */
    reset: string;
  };
  search: {
    label: string;
    clear: string;
    tooShort: string;
    tooLong: string;
  };
  roles: {
    titles: Record<Role, string>;
    legend: string;
  };
  login: {
    login: string;
    password: string;
    submit: string;
    refused: string;
  };
  qrCodes: {
    newCode: string;
    searchPlaceholder: string;
    noCodesYet: string;
    columns: {
      name: string;
      slug: string;
      scans: string;
      updated: string;
      created: string;
    };
    platforms: Record<QrPlatform, PlatformCopy>;
    /** The order the server tries the platforms in, and where a blank link leads. */
    resolveOrder: string;
  };
  qrCard: {
    imageSection: string;
    imageHint: string;
    imageFailed: string;
    copyImage: string;
    imageCopied: string;
    imageCopyFailed: string;
    imageNotLoaded: string;
    downloadPng: string;
    downloadSvg: string;
    downloadFailed: string;
    scansSection: string;
    scansHint: string;
    totalScans: string;
    shareOfAll: (percent: string) => string;
    linksSection: string;
    redirectUrl: string;
    blankLink: string;
    codeSection: string;
    created: string;
    updated: string;
    notFoundTitle: string;
    notFoundBody: string;
    deleteTitle: (name: string) => string;
    deleteBody: (url: string) => string;
  };
  qrForm: {
    createTitle: string;
    editTitle: (name: string) => string;
    name: string;
    namePlaceholder: string;
    slug: string;
    slugPlaceholder: string;
    slugCreateHint: string;
    slugEditHint: string;
    targets: string;
    fallbackHint: string;
    nameRequired: string;
    slugInvalid: string;
    linkInvalid: string;
    fallbackRequired: string;
    missing: (fields: string) => string;
  };
  notFound: {
    body: string;
    back: string;
  };
  about: {
    intro: string;
    versions: string;
    console: string;
    server: string;
    serverUnknown: string;
    legal: string;
    product: string;
    productValue: string;
    licensor: string;
    /** Rendered as "<authorName> (<handle>) · 84softworks". */
    authorName: string;
    website: string;
    source: string;
    contact: string;
    license: string;
    licenseValue: string;
    licenseTerms: string;
    thirdParty: string;
    copyright: string;
  };
  api: {
    unknownError: string;
    unreachable: string;
    timeout: string;
    requestFailed: (status: string) => string;
  };
}

const en: Copy = {
  consoleName: 'Pathfinder QR',
  byline: 'by 84softworks',
  nav: {
    qrCodes: 'QR codes',
    about: 'About',
    menu: 'Menu'
  },
  pages: {
    login: { title: 'Log in', kicker: 'Management console' },
    qrCodes: { title: 'QR codes', kicker: 'One code, the right store for every device' },
    qrCode: { title: 'QR code', kicker: 'QR code' },
    about: { title: 'Pathfinder QR', kicker: 'About and legal' },
    notFound: { title: 'Page not found', kicker: 'Nothing at this address' }
  },
  header: {
    logOut: 'Log out',
    language: 'Language',
    lightScheme: 'Switch to the light theme',
    darkScheme: 'Switch to the dark theme'
  },
  footer: {
    copyright: '© 2026',
    server: 'Server',
    console: 'Console'
  },
  common: {
    cancel: 'Cancel',
    create: 'Create',
    save: 'Save',
    copy: 'Copy',
    copied: 'Copied',
    copyValue: label => `Copy ${label}`,
    edit: 'Edit',
    delete: 'Delete',
    actions: 'Actions',
    back: 'Back',
    toList: 'To the list',
    retry: 'Retry',
    none: '–'
  },
  table: {
    found: 'Found:',
    pageSize: 'Rows per page',
    sortDescending: 'Sort descending',
    sortAscending: 'Sort ascending',
    sortReset: 'Back to the default order',
    columnWidth: title => (title ? `Width of the column "${title}"` : 'Column width'),
    resizeHint: 'Drag to change the width. Double click - the default width',
    columnsHidden: count => `Columns that did not fit: ${count}`,
    columnWidths: 'Column widths',
    notFitted: 'Did not fit',
    notFittedHint: 'Widen the window or narrow other columns - they come back',
    resetWidths: 'Reset the widths',
    loadError: 'Failed to load',
    nothingFound: 'Nothing found for the search',
    resetFilters: 'Reset the search',
    reset: 'Reset'
  },
  search: {
    label: 'Search',
    clear: 'Clear the search',
    tooShort: 'Type at least 3 characters to search',
    tooLong: 'The query is longer than 100 characters'
  },
  roles: {
    titles: {
      ADMIN: 'Administrator',
      VIEWER: 'Viewer'
    },
    legend: 'Roles'
  },
  login: {
    login: 'Login',
    password: 'Password',
    submit: 'Log in',
    refused: 'Wrong login or password'
  },
  qrCodes: {
    newCode: 'New QR code',
    searchPlaceholder: 'Name, slug, links – partial works',
    noCodesYet: 'No QR codes yet',
    columns: {
      name: 'Name',
      slug: 'Slug',
      scans: 'Scans',
      updated: 'Changed',
      created: 'Created'
    },
    platforms: {
      ios: { label: 'iOS', devices: 'iPhone, iPad' },
      huawei: { label: 'Huawei', devices: 'Huawei, Honor, HarmonyOS' },
      android: { label: 'Android', devices: 'Google Play and other Android' },
      desktop: { label: 'Desktop', devices: 'computers and everything else' }
    },
    resolveOrder:
      'The platform is tried in this order: iOS → Huawei → Android → Desktop. A blank platform link leads to the Desktop link.'
  },
  qrCard: {
    imageSection: 'QR code',
    imageHint: 'Click the image to copy it as PNG',
    imageFailed: 'The image did not load – refresh the page',
    copyImage: 'Copy the image',
    imageCopied: 'The image is copied',
    imageCopyFailed: 'The browser did not allow copying the image',
    imageNotLoaded: 'The image has not loaded yet',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG',
    downloadFailed: 'The image did not download',
    scansSection: 'Scans',
    scansHint: 'The platform is recognised by the device that scanned the code',
    totalScans: 'scans in total',
    shareOfAll: percent => `${percent} of all`,
    linksSection: 'Links',
    redirectUrl: 'Link in the QR code',
    blankLink: 'Not set – leads to the Desktop link',
    codeSection: 'Code',
    created: 'Created',
    updated: 'Changed',
    notFoundTitle: 'QR code not found',
    notFoundBody:
      'There is no code with this slug: it was deleted, or the link has a typo. The slug is shown in the list of codes.',
    deleteTitle: name => `Delete "${name}"?`,
    deleteBody: url => `Printed codes with the link ${url} stop working. Deleting cannot be undone.`
  },
  qrForm: {
    createTitle: 'New QR code',
    editTitle: name => `Edit "${name}"`,
    name: 'Name',
    namePlaceholder: 'For example: the mobile app, a flyer',
    slug: 'Slug',
    slugPlaceholder: 'Blank – generated',
    slugCreateHint: 'The tail of the link in the code, /r/<slug>; it never changes afterwards',
    slugEditHint: 'Printed into the codes, never changes',
    targets: 'Target links',
    fallbackHint: 'also the fallback of every blank link',
    nameRequired: 'Give the code a name',
    slugInvalid: '3 to 64 characters: Latin letters, digits, "-" and "_"',
    linkInvalid: 'A link starts with http:// or https://',
    fallbackRequired: 'The Desktop link is required',
    missing: fields => `Fill in: ${fields}`
  },
  notFound: {
    body: 'There is nothing at this address.',
    back: 'Back to the QR codes'
  },
  about: {
    intro:
      'Management console of Pathfinder: QR codes that send every device to the right place – App Store, Google Play, AppGallery or the website – the rendered code and the scans by platform. Pathfinder is a product of 84softworks.',
    versions: 'Versions',
    console: 'Console',
    server: 'Server',
    serverUnknown: 'not reachable',
    legal: 'Legal',
    product: 'Product',
    productValue: 'Pathfinder – device-aware QR redirects by 84softworks',
    licensor: 'Author and licensor',
    authorName: 'Andrei Baranov',
    website: 'Website',
    source: 'Source code',
    contact: 'Contact',
    license: 'License',
    licenseValue: 'Business Source License 1.1',
    licenseTerms:
      'Non-production use is free. Production use is permitted for up to ten QR codes in total; beyond that a commercial license from the licensor is required. Four years after publication the work becomes available under the Mozilla Public License 2.0.',
    thirdParty:
      'Pathfinder ships alongside ZXing, Yauaa, PostgreSQL, nginx and other third-party software, each under its own license (NOTICE in the umbrella repository).',
    copyright:
      '© 2026 Andrei Baranov (84softworks). All rights reserved under the Business Source License 1.1.'
  },
  api: {
    unknownError: 'Unknown error',
    unreachable: 'Server is unreachable',
    timeout: 'The server did not answer in time',
    requestFailed: status => `Request failed (${status})`
  }
};

const ru: Copy = {
  consoleName: 'Pathfinder QR',
  byline: 'by 84softworks',
  nav: {
    qrCodes: 'QR-коды',
    about: 'О консоли',
    menu: 'Меню'
  },
  pages: {
    login: { title: 'Вход', kicker: 'Консоль управления' },
    qrCodes: { title: 'QR-коды', kicker: 'Один код – нужный магазин на каждом устройстве' },
    qrCode: { title: 'QR-код', kicker: 'QR-код' },
    about: { title: 'Pathfinder QR', kicker: 'О консоли и правовая информация' },
    notFound: { title: 'Страница не найдена', kicker: 'По этому адресу ничего нет' }
  },
  header: {
    logOut: 'Выйти',
    language: 'Язык',
    lightScheme: 'Светлая тема',
    darkScheme: 'Тёмная тема'
  },
  footer: {
    copyright: '© 2026',
    server: 'Сервер',
    console: 'Консоль'
  },
  common: {
    cancel: 'Отмена',
    create: 'Создать',
    save: 'Сохранить',
    copy: 'Копировать',
    copied: 'Скопировано',
    copyValue: label => `Копировать: ${label}`,
    edit: 'Изменить',
    delete: 'Удалить',
    actions: 'Действия',
    back: 'Назад',
    toList: 'К списку',
    retry: 'Повторить',
    none: '–'
  },
  table: {
    found: 'Найдено:',
    pageSize: 'Строк на странице',
    sortDescending: 'Сортировать по убыванию',
    sortAscending: 'Сортировать по возрастанию',
    sortReset: 'Вернуть порядок по умолчанию',
    columnWidth: title => (title ? `Ширина колонки «${title}»` : 'Ширина колонки'),
    resizeHint: 'Потяните, чтобы изменить ширину. Двойной щелчок – ширина по умолчанию',
    columnsHidden: count => `Не поместились колонки: ${count}`,
    columnWidths: 'Ширина колонок',
    notFitted: 'Не поместились',
    notFittedHint: 'Расширьте окно или сузьте другие колонки – они вернутся',
    resetWidths: 'Вернуть ширину по умолчанию',
    loadError: 'Ошибка загрузки',
    nothingFound: 'Ничего не найдено по поиску',
    resetFilters: 'Сбросить поиск',
    reset: 'Сбросить'
  },
  search: {
    label: 'Поиск',
    clear: 'Очистить поиск',
    tooShort: 'Для поиска введите не меньше 3 символов',
    tooLong: 'Запрос длиннее 100 символов'
  },
  roles: {
    titles: {
      ADMIN: 'Администратор',
      VIEWER: 'Наблюдатель'
    },
    legend: 'Роли'
  },
  login: {
    login: 'Логин',
    password: 'Пароль',
    submit: 'Войти',
    refused: 'Неверный логин или пароль'
  },
  qrCodes: {
    newCode: 'Новый QR-код',
    searchPlaceholder: 'Название, слаг, ссылки – можно частью',
    noCodesYet: 'QR-кодов пока нет',
    columns: {
      name: 'Название',
      slug: 'Слаг',
      scans: 'Сканы',
      updated: 'Изменён',
      created: 'Создан'
    },
    platforms: {
      ios: { label: 'iOS', devices: 'iPhone, iPad' },
      huawei: { label: 'Huawei', devices: 'Huawei, Honor, HarmonyOS' },
      android: { label: 'Android', devices: 'Google Play и другие Android' },
      desktop: { label: 'Desktop', devices: 'компьютеры и всё остальное' }
    },
    resolveOrder:
      'Платформа определяется в порядке iOS → Huawei → Android → Desktop. Пустая ссылка платформы ведёт на ссылку Desktop.'
  },
  qrCard: {
    imageSection: 'QR-код',
    imageHint: 'Нажмите на картинку, чтобы скопировать её в PNG',
    imageFailed: 'Картинка не загрузилась – обновите страницу',
    copyImage: 'Копировать картинку',
    imageCopied: 'Картинка скопирована',
    imageCopyFailed: 'Браузер не дал скопировать картинку',
    imageNotLoaded: 'Картинка ещё не загрузилась',
    downloadPng: 'Скачать PNG',
    downloadSvg: 'Скачать SVG',
    downloadFailed: 'Картинка не скачалась',
    scansSection: 'Сканы',
    scansHint: 'Платформа определяется по устройству, с которого отсканировали код',
    totalScans: 'сканов всего',
    shareOfAll: percent => `${percent} от всех`,
    linksSection: 'Ссылки',
    redirectUrl: 'Ссылка в QR-коде',
    blankLink: 'Не задана – ведёт на ссылку Desktop',
    codeSection: 'Код',
    created: 'Создан',
    updated: 'Изменён',
    notFoundTitle: 'QR-код не найден',
    notFoundBody:
      'Кода с таким слагом нет: его удалили, или в ссылке опечатка. Слаг виден в списке кодов.',
    deleteTitle: name => `Удалить «${name}»?`,
    deleteBody: url =>
      `Напечатанные коды со ссылкой ${url} перестанут работать. Отменить удаление нельзя.`
  },
  qrForm: {
    createTitle: 'Новый QR-код',
    editTitle: name => `Изменить «${name}»`,
    name: 'Название',
    namePlaceholder: 'Например: мобильное приложение, листовка',
    slug: 'Слаг',
    slugPlaceholder: 'Пусто – сгенерируется сам',
    slugCreateHint: 'Хвост ссылки в коде, /r/<слаг>; потом не меняется',
    slugEditHint: 'Зашит в напечатанные коды и не меняется',
    targets: 'Целевые ссылки',
    fallbackHint: 'она же запасная для пустых',
    nameRequired: 'Назовите код',
    slugInvalid: 'От 3 до 64 знаков: латиница, цифры, «-» и «_»',
    linkInvalid: 'Ссылка начинается с http:// или https://',
    fallbackRequired: 'Ссылка Desktop обязательна',
    missing: fields => `Заполните: ${fields}`
  },
  notFound: {
    body: 'По этому адресу ничего нет.',
    back: 'Вернуться к QR-кодам'
  },
  about: {
    intro:
      'Консоль управления Pathfinder: QR-коды, которые ведут каждое устройство куда нужно – в App Store, Google Play, AppGallery или на сайт, – картинка кода и сканы по платформам. Pathfinder – продукт 84softworks.',
    versions: 'Версии',
    console: 'Консоль',
    server: 'Сервер',
    serverUnknown: 'недоступен',
    legal: 'Правовая информация',
    product: 'Продукт',
    productValue: 'Pathfinder – QR-переходы по устройству от 84softworks',
    licensor: 'Автор и лицензиар',
    authorName: 'Андрей Баранов',
    website: 'Сайт',
    source: 'Исходный код',
    contact: 'Связь',
    license: 'Лицензия',
    licenseValue: 'Business Source License 1.1',
    licenseTerms:
      'Непродуктивное использование бесплатно. Продуктивное использование разрешено не более чем для десяти QR-кодов в сумме; сверх этого нужна коммерческая лицензия от лицензиара. Через четыре года после публикации код становится доступен по Mozilla Public License 2.0.',
    thirdParty:
      'Pathfinder поставляется вместе с ZXing, Yauaa, PostgreSQL, nginx и другим сторонним ПО, у каждого своя лицензия (NOTICE в зонтичном репозитории).',
    copyright:
      '© 2026 Андрей Баранов (84softworks). Все права защищены согласно Business Source License 1.1.'
  },
  api: {
    unknownError: 'Неизвестная ошибка',
    unreachable: 'Сервер недоступен',
    timeout: 'Сервер не ответил вовремя',
    requestFailed: status => `Запрос не выполнен (${status})`
  }
};

export const dict: Record<Lang, Copy> = { en, ru };
