// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
//
// Console copy in English and Russian - the single source of every display string. Language-invariant tokens
// (the wordmark, role abbreviations, numbers, hosts, e-mail) live in the components.
import type { Role } from '@/types';
import type { QrPlatform } from '@/shared/qrTargets';
import type { PeriodPreset } from '@/pages/Stats/statsModel';

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
    stats: string;
    about: string;
    menu: string;
  };
  pages: {
    login: PageCopy;
    qrCodes: PageCopy;
    /** Card of one code: the title names the browser tab, the kicker sits above the code's name. */
    qrCode: PageCopy;
    stats: PageCopy;
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
    /** Over a link that copies itself on a click. */
    clickToCopy: string;
    copyRefused: string;
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
      link: string;
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
    statsLink: string;
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
  stats: {
    periods: Record<PeriodPreset, string>;
    from: string;
    to: string;
    code: string;
    allCodes: string;
    fromAfterTo: string;
    tooLong: (days: number) => string;
    trackingSince: (when: string) => string;
    trackingNotStarted: string;
    loading: string;
    /** Who scanned: the device. */
    devices: Record<QrPlatform, string>;
    /** Where the scanner was sent: the link of that platform. */
    destinations: Record<QrPlatform, string>;
    /** Monday first, as the server counts ISO weekdays. */
    weekdays: string[];
    kpi: {
      total: string;
      noCompare: string;
      noPrevious: (days: number) => string;
      change: (signedPercent: string, days: number, previous: string) => string;
      perDay: string;
      perDayNote: (days: number) => string;
      toStores: string;
      toStoresNote: (part: string, whole: string) => string;
      topCode: string;
    };
    noScans: string;
    daily: {
      title: string;
      lede: string;
      asTable: string;
      asChart: string;
      day: string;
      total: string;
    };
    whoScans: { title: string; lede: string };
    whereTo: {
      title: string;
      lede: string;
      fallback: (device: string, scans: string, store: string) => string;
    };
    codes: {
      title: string;
      lede: string;
      code: string;
      scans: string;
      share: string;
      devices: string;
    };
    heatmap: {
      title: string;
      busiest: (weekday: string, hours: string, scans: string) => string;
      zoneNote: string;
      label: string;
      less: string;
      more: string;
    };
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
    stats: 'Statistics',
    about: 'About',
    menu: 'Menu'
  },
  pages: {
    login: { title: 'Log in', kicker: 'Management console' },
    qrCodes: { title: 'QR codes', kicker: 'One code, the right store for every device' },
    qrCode: { title: 'QR code', kicker: 'QR code' },
    stats: { title: 'Statistics', kicker: 'Who scanned, where they went, from which code' },
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
    clickToCopy: 'Click to copy the link',
    copyRefused: 'The browser did not allow copying – copy the link by hand',
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
      link: 'Link in the QR code',
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
    statsLink: 'Statistics of the code',
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
  stats: {
    periods: { '7': '7 days', '30': '30 days', '90': '90 days', '365': 'Year', custom: 'Custom' },
    from: 'From',
    to: 'To',
    code: 'Code',
    allCodes: 'All codes',
    fromAfterTo: 'The start is after the end',
    tooLong: days => `No more than ${days} days`,
    trackingSince: when =>
      `Scans by day are recorded since ${when}: before that only the lifetime counters of the code cards exist.`,
    trackingNotStarted:
      'Scans by day are recorded from the first scan after this update. The lifetime counters are in the code cards.',
    loading: 'Loading the statistics',
    devices: {
      ios: 'iOS',
      huawei: 'Huawei',
      android: 'Android',
      desktop: 'Computers and others'
    },
    destinations: {
      ios: 'App Store',
      huawei: 'AppGallery',
      android: 'Google Play',
      desktop: 'Website (Desktop link)'
    },
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    kpi: {
      total: 'scans in the period',
      noCompare: 'Nothing to compare with: the previous period is before the recording started',
      noPrevious: days => `No scans in the previous ${days} days`,
      change: (signedPercent, days, previous) =>
        `${signedPercent} vs the previous ${days} days (${previous})`,
      perDay: 'scans a day on average',
      perDayNote: days => `over ${days} days`,
      toStores: 'sent to the app stores',
      toStoresNote: (part, whole) => `${part} of ${whole}: App Store, Google Play, AppGallery`,
      topCode: 'scans of the top code'
    },
    noScans: 'No scans in the period',
    daily: {
      title: 'Scans by day',
      lede: 'Colour – the device the code was scanned with',
      asTable: 'Show as a table',
      asChart: 'Show as a chart',
      day: 'Day',
      total: 'Total'
    },
    whoScans: { title: 'Who scans', lede: 'The device the code was scanned with' },
    whereTo: {
      title: 'Where they went',
      lede: 'The link the code sent the person to',
      fallback: (device, scans, store) =>
        `${device} → website: ${scans} – the code has no ${store} link.`
    },
    codes: {
      title: 'Which codes',
      lede: 'Every code of the period, the most scanned on top; the bar – the share of devices',
      code: 'Code',
      scans: 'Scans',
      share: 'Share',
      devices: 'By device'
    },
    heatmap: {
      title: 'When they scan',
      busiest: (weekday, hours, scans) => `Most often – ${weekday}, ${hours} (${scans})`,
      zoneNote: 'Weekday and hour – by the server clock',
      label: 'Scans by weekday and hour',
      less: 'less',
      more: 'more'
    }
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
    stats: 'Статистика',
    about: 'О консоли',
    menu: 'Меню'
  },
  pages: {
    login: { title: 'Вход', kicker: 'Консоль управления' },
    qrCodes: { title: 'QR-коды', kicker: 'Один код – нужный магазин на каждом устройстве' },
    qrCode: { title: 'QR-код', kicker: 'QR-код' },
    stats: { title: 'Статистика', kicker: 'Кто сканировал, куда ушёл, из какого кода' },
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
    clickToCopy: 'Нажмите, чтобы скопировать ссылку',
    copyRefused: 'Браузер не дал скопировать – скопируйте ссылку вручную',
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
      link: 'Ссылка в QR-коде',
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
    statsLink: 'Статистика кода',
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
  stats: {
    periods: {
      '7': '7 дней',
      '30': '30 дней',
      '90': '90 дней',
      '365': 'Год',
      custom: 'Свой период'
    },
    from: 'С',
    to: 'По',
    code: 'Код',
    allCodes: 'Все коды',
    fromAfterTo: 'Начало позже конца',
    tooLong: days => `Не больше ${days} дней`,
    trackingSince: when =>
      `Сканы по дням записываются с ${when}: раньше этой даты есть только общие счётчики в карточках кодов.`,
    trackingNotStarted:
      'Сканы по дням начнут записываться с первого скана после обновления. Общие счётчики за всё время – в карточках кодов.',
    loading: 'Загружаем статистику',
    devices: {
      ios: 'iOS',
      huawei: 'Huawei',
      android: 'Android',
      desktop: 'Компьютеры и прочие'
    },
    destinations: {
      ios: 'App Store',
      huawei: 'AppGallery',
      android: 'Google Play',
      desktop: 'Сайт (ссылка Desktop)'
    },
    weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    kpi: {
      total: 'сканов за период',
      noCompare: 'Сравнить не с чем: прошлый период раньше начала записи',
      noPrevious: days => `В прошлые ${days} дн. сканов не было`,
      change: (signedPercent, days, previous) =>
        `${signedPercent} к прошлым ${days} дн. (${previous})`,
      perDay: 'сканов в день в среднем',
      perDayNote: days => `за ${days} дн.`,
      toStores: 'ушли в магазины приложений',
      toStoresNote: (part, whole) => `${part} из ${whole}: App Store, Google Play, AppGallery`,
      topCode: 'сканов у лучшего кода'
    },
    noScans: 'За период сканов нет',
    daily: {
      title: 'Сканы по дням',
      lede: 'Цвет – устройство, с которого отсканировали код',
      asTable: 'Показать таблицей',
      asChart: 'Показать графиком',
      day: 'День',
      total: 'Всего'
    },
    whoScans: { title: 'Кто сканирует', lede: 'Устройство, с которого отсканировали код' },
    whereTo: {
      title: 'Куда ушли',
      lede: 'Ссылка, на которую код отправил человека',
      fallback: (device, scans, store) =>
        `${device} → сайт: ${scans} – у кода нет ссылки на ${store}.`
    },
    codes: {
      title: 'Из каких кодов',
      lede: 'Все коды за период, самые сканируемые сверху; полоса – доля устройств',
      code: 'Код',
      scans: 'Сканы',
      share: 'Доля',
      devices: 'По устройствам'
    },
    heatmap: {
      title: 'Когда сканируют',
      busiest: (weekday, hours, scans) => `Чаще всего – ${weekday}, ${hours} (${scans})`,
      zoneNote: 'День недели и час – по времени сервера',
      label: 'Сканы по дням недели и часам',
      less: 'меньше',
      more: 'больше'
    }
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
