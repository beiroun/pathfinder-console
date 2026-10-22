// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { QrView } from '../types';

type TargetField =
  'target_ios_url' | 'target_huawei_url' | 'target_android_url' | 'target_desktop_url';

type ScanField =
  'scan_count_ios' | 'scan_count_huawei' | 'scan_count_android' | 'scan_count_desktop';

export interface QrTarget {
  field: TargetField;
  scans: ScanField;
  label: string;
  /** Which devices land there. */
  devices: string;
  placeholder: string;
  /** The desktop link is the fallback of every platform left blank, so it is the one required link. */
  isFallback: boolean;
}

/**
 * The four platforms of a QR code in the order the server resolves them: iOS, then Huawei / Honor / HarmonyOS (their
 * User-Agent says Android too), then Android, then everything else; a blank link of a platform leads to the desktop one.
 */
export const QR_TARGETS: readonly QrTarget[] = [
  {
    field: 'target_ios_url',
    scans: 'scan_count_ios',
    label: 'iOS',
    devices: 'iPhone, iPad',
    placeholder: 'https://apps.apple.com/…',
    isFallback: false
  },
  {
    field: 'target_huawei_url',
    scans: 'scan_count_huawei',
    label: 'Huawei',
    devices: 'Huawei, Honor, HarmonyOS',
    placeholder: 'https://appgallery.huawei.com/…',
    isFallback: false
  },
  {
    field: 'target_android_url',
    scans: 'scan_count_android',
    label: 'Android',
    devices: 'Google Play и другие Android',
    placeholder: 'https://play.google.com/…',
    isFallback: false
  },
  {
    field: 'target_desktop_url',
    scans: 'scan_count_desktop',
    label: 'Desktop',
    devices: 'компьютеры и всё остальное',
    placeholder: 'https://example.com/',
    isFallback: true
  }
];

export const targetsOf = (qr: QrView) =>
  QR_TARGETS.map(target => ({ target, url: qr[target.field] }));
