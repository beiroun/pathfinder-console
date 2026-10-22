// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { QrView } from '@/types';

export type QrPlatform = 'ios' | 'huawei' | 'android' | 'desktop';

type TargetField =
  'target_ios_url' | 'target_huawei_url' | 'target_android_url' | 'target_desktop_url';
type ScanField =
  'scan_count_ios' | 'scan_count_huawei' | 'scan_count_android' | 'scan_count_desktop';

export interface QrTarget {
  platform: QrPlatform;
  field: TargetField;
  scans: ScanField;
  placeholder: string;
  /** The desktop link is the fallback of every platform left blank, so it is the one required link. */
  isFallback: boolean;
}

/**
 * The four platforms of a code in the order the server resolves them: iOS, then Huawei / Honor / HarmonyOS (their
 * User-Agent says Android too), then Android, then everything else; a blank link of a platform leads to the desktop one.
 */
export const qrTargets: readonly QrTarget[] = [
  {
    platform: 'ios',
    field: 'target_ios_url',
    scans: 'scan_count_ios',
    placeholder: 'https://apps.apple.com/…',
    isFallback: false
  },
  {
    platform: 'huawei',
    field: 'target_huawei_url',
    scans: 'scan_count_huawei',
    placeholder: 'https://appgallery.huawei.com/…',
    isFallback: false
  },
  {
    platform: 'android',
    field: 'target_android_url',
    scans: 'scan_count_android',
    placeholder: 'https://play.google.com/…',
    isFallback: false
  },
  {
    platform: 'desktop',
    field: 'target_desktop_url',
    scans: 'scan_count_desktop',
    placeholder: 'https://example.com/',
    isFallback: true
  }
];

export const targetUrlOf = (qr: QrView, target: QrTarget) => qr[target.field];
