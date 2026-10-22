// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Group, Modal, Stack, Text, TextInput, Tooltip } from '@mantine/core';

import { api } from '@/api/api';
import { useLang } from '@/i18n/LangContext';
import { describeApiError } from '@/shared/apiErrors';
import { qrTargets, type QrTarget } from '@/shared/qrTargets';
import { useIsPhone } from '@/shared/useIsPhone';
import type { QrView } from '@/types';

interface QrCodeFormModalProps {
  opened: boolean;
  /** null = a new code. */
  editing: QrView | null;
  onClose: () => void;
  onSaved: (saved: QrView) => void;
}

/** A new code, or the name and the links of an existing one; the slug is set once and printed into the codes. */
export function QrCodeFormModal({ opened, editing, onClose, onSaved }: QrCodeFormModalProps) {
  const { t } = useLang();
  const isPhone = useIsPhone();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      fullScreen={isPhone}
      title={editing ? t.qrForm.editTitle(editing.name) : t.qrForm.createTitle}
    >
      {/* Mounted per opening, so the fields start from the code's current values (or empty) every time */}
      {opened && <QrCodeForm editing={editing} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

type FieldName = 'name' | 'slug' | QrTarget['field'];
type FormValues = Record<FieldName, string>;

const valuesOf = (qr: QrView | null): FormValues => ({
  name: qr?.name ?? '',
  slug: qr?.slug ?? '',
  target_ios_url: qr?.target_ios_url ?? '',
  target_huawei_url: qr?.target_huawei_url ?? '',
  target_android_url: qr?.target_android_url ?? '',
  target_desktop_url: qr?.target_desktop_url ?? ''
});

// The server's rules (pathfinder-server validates the same and answers 400): the slug becomes a path segment of the
// printed link, the targets are absolute web links, the desktop link is the fallback and is required
const slugPattern = /^[A-Za-z0-9_-]{3,64}$/;
const httpLink = /^https?:\/\/\S+$/i;

function QrCodeForm({
  editing,
  onClose,
  onSaved
}: {
  editing: QrView | null;
  onClose: () => void;
  onSaved: (saved: QrView) => void;
}) {
  const { t } = useLang();
  const [values, setValues] = useState<FormValues>(() => valuesOf(editing));
  // A field shows its error once the operator left it or tried to save: an empty form is not red
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isEdit = editing !== null;

  const errors: Partial<Record<FieldName, string>> = {};
  if (!values.name.trim()) errors.name = t.qrForm.nameRequired;
  if (!isEdit && values.slug.trim() && !slugPattern.test(values.slug.trim())) {
    errors.slug = t.qrForm.slugInvalid;
  }
  for (const target of qrTargets) {
    const url = values[target.field].trim();
    if (!url && target.isFallback) errors[target.field] = t.qrForm.fallbackRequired;
    else if (url && !httpLink.test(url)) errors[target.field] = t.qrForm.linkInvalid;
  }
  const invalid = Object.keys(errors) as FieldName[];
  const labelOf = (field: FieldName) => {
    if (field === 'name') return t.qrForm.name;
    if (field === 'slug') return t.qrForm.slug;
    const target = qrTargets.find(candidate => candidate.field === field);
    return target ? t.qrCodes.platforms[target.platform].label : field;
  };

  const fieldProps = (field: FieldName) => ({
    value: values[field],
    error: touched[field] ? errors[field] : undefined,
    disabled: isSaving,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value;
      setValues(previous => ({ ...previous, [field]: next }));
    },
    onBlur: () => setTouched(previous => ({ ...previous, [field]: true }))
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (invalid.length) {
      setTouched(Object.fromEntries(invalid.map(field => [field, true])));
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const targets = {
      target_ios_url: values.target_ios_url.trim(),
      target_huawei_url: values.target_huawei_url.trim(),
      target_android_url: values.target_android_url.trim(),
      target_desktop_url: values.target_desktop_url.trim()
    };
    try {
      const saved = editing
        ? await api.updateQrCode(editing.slug, { name: values.name.trim(), ...targets })
        : await api.createQrCode({
            name: values.name.trim(),
            // A blank slug is not sent: the server generates a unique one
            slug: values.slug.trim() || undefined,
            ...targets
          });
      onClose();
      onSaved(saved);
    } catch (failure) {
      setSaveError(describeApiError(failure, t.api));
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <TextInput
          label={t.qrForm.name}
          placeholder={t.qrForm.namePlaceholder}
          maxLength={255}
          withAsterisk
          data-autofocus
          {...fieldProps('name')}
        />
        <TextInput
          label={t.qrForm.slug}
          placeholder={isEdit ? undefined : t.qrForm.slugPlaceholder}
          description={isEdit ? t.qrForm.slugEditHint : t.qrForm.slugCreateHint}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...fieldProps('slug')}
          disabled={isEdit || isSaving}
        />

        <div>
          <Text size="sm">{t.qrForm.targets}</Text>
          <Text size="xs" c="dimmed">
            {t.qrCodes.resolveOrder}
          </Text>
        </div>
        {qrTargets.map(target => {
          const platform = t.qrCodes.platforms[target.platform];
          return (
            <TextInput
              key={target.field}
              type="url"
              inputMode="url"
              label={platform.label}
              description={
                target.isFallback
                  ? `${platform.devices}; ${t.qrForm.fallbackHint}`
                  : platform.devices
              }
              placeholder={target.placeholder}
              withAsterisk={target.isFallback}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              {...fieldProps(target.field)}
            />
          );
        })}

        {saveError && <Alert color="red">{saveError}</Alert>}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={isSaving}>
            {t.common.cancel}
          </Button>
          <Tooltip
            label={t.qrForm.missing(invalid.map(labelOf).join(', '))}
            disabled={invalid.length === 0}
            multiline
            w={260}
          >
            {/* A disabled button gets no pointer events: the box carries the tooltip */}
            <Box component="span">
              <Button type="submit" loading={isSaving} disabled={invalid.length > 0}>
                {isEdit ? t.common.save : t.common.create}
              </Button>
            </Box>
          </Tooltip>
        </Group>
      </Stack>
    </form>
  );
}
