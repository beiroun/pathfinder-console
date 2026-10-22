// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core';
import { IconArrowLeft, IconQrcode } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router';
import { DescriptionPage } from '@ui/DescriptionPage/DescriptionPage.tsx';
import { PageSection } from '@ui/PageSection/PageSection.tsx';
import { CopyableId } from '@ui/CopyableId/CopyableId.tsx';
import { CardLoadError } from '@ui/CardLoadError/CardLoadError.tsx';
import { useGoBack } from '@hooks/useGoBack.ts';
import { QR_LIST_PATH, qrCardPath } from '@routes/paths.ts';
import { api } from '../../api/api.ts';
import { useQrCodeQuery } from '../../api/queries.ts';
import type { QrView } from '../../types';
import { apiErrorText } from '../../utils/apiError.ts';
import { notifyFailure, notifySuccess } from '../../utils/notify.ts';
import { formatDateTime } from '../../utils/localTime.ts';
import { QR_TARGETS, type QrTarget } from '../../utils/qrTargets.ts';

type TargetValues = Record<QrTarget['field'], string>;

interface FormValues extends TargetValues {
  name: string;
  slug: string;
}

const EMPTY_VALUES: FormValues = {
  name: '',
  slug: '',
  target_ios_url: '',
  target_huawei_url: '',
  target_android_url: '',
  target_desktop_url: ''
};

const valuesOf = (qr: QrView): FormValues => ({
  name: qr.name,
  slug: qr.slug,
  target_ios_url: qr.target_ios_url,
  target_huawei_url: qr.target_huawei_url,
  target_android_url: qr.target_android_url,
  target_desktop_url: qr.target_desktop_url
});

// The slug becomes a path segment of the printed link (/r/<slug>): no spaces, slashes or letters a phone could mangle
const SLUG_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;
const HTTP_LINK = /^https?:\/\/\S+$/i;

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const errorsOf = (values: FormValues, isEdit: boolean): FieldErrors => {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Укажите название';
  const slug = values.slug.trim();
  if (!isEdit && slug && !SLUG_PATTERN.test(slug))
    errors.slug = 'От 3 до 64 знаков: латиница, цифры, «-» и «_»';
  for (const target of QR_TARGETS) {
    const url = values[target.field].trim();
    if (!url) {
      if (target.isFallback) errors[target.field] = 'Обязательная ссылка';
    } else if (!HTTP_LINK.test(url)) {
      errors[target.field] = 'Ссылка начинается с http:// или https://';
    }
  }
  return errors;
};

const FIELD_LABELS: Record<keyof FormValues, string> = {
  name: 'Название',
  slug: 'Слаг',
  target_ios_url: 'iOS',
  target_huawei_url: 'Huawei',
  target_android_url: 'Android',
  target_desktop_url: 'Desktop'
};

interface QrCodeFormBodyProps {
  /** None – a new code. */
  editing: QrView | null;
}

/**
 * The form of a QR code: the header card with «Назад» and the main action, then the sections.
 * The slug is set once – it is printed into the codes – and the desktop link is required as the fallback of every
 * platform left blank.
 */
const QrCodeFormBody: React.FC<QrCodeFormBodyProps> = ({ editing }) => {
  const navigate = useNavigate();
  const isEdit = editing !== null;
  const goBack = useGoBack(isEdit ? qrCardPath(editing.slug) : QR_LIST_PATH);
  const [values, setValues] = useState<FormValues>(editing ? valuesOf(editing) : EMPTY_VALUES);
  // A field shows its error once the operator left it or tried to save: an empty form is not red
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const errors = errorsOf(values, isEdit);
  const invalidFields = Object.keys(errors) as (keyof FormValues)[];
  const shownError = (field: keyof FormValues) => (touched[field] ? errors[field] : undefined);

  const fieldProps = (field: keyof FormValues) => ({
    value: values[field],
    error: shownError(field),
    disabled: isSaving,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value;
      setValues(previous => ({ ...previous, [field]: next }));
    },
    onBlur: () => setTouched(previous => ({ ...previous, [field]: true }))
  });

  const save = async () => {
    if (invalidFields.length) {
      setTouched(Object.fromEntries(invalidFields.map(field => [field, true])));
      return;
    }
    setIsSaving(true);
    const targets = {
      target_ios_url: values.target_ios_url.trim(),
      target_huawei_url: values.target_huawei_url.trim(),
      target_android_url: values.target_android_url.trim(),
      target_desktop_url: values.target_desktop_url.trim()
    };
    try {
      const saved = isEdit
        ? await api.updateQrCode(editing.slug, {
            name: values.name.trim(),
            ...targets
          })
        : await api.createQrCode({
            name: values.name.trim(),
            // A blank slug is not sent: the server generates a unique one
            slug: values.slug.trim() || undefined,
            ...targets
          });
      notifySuccess(isEdit ? `QR-код «${saved.name}» сохранён` : `QR-код «${saved.name}» создан`);
      // The card shows the code to print right away; the form does not stay in the history
      navigate(qrCardPath(saved.slug), { replace: true });
    } catch (error) {
      notifyFailure(apiErrorText(error)?.message ?? 'Не удалось сохранить QR-код');
      setIsSaving(false);
    }
  };

  const submitLabel = isEdit ? 'Сохранить изменения' : 'Создать';
  const missing = invalidFields.map(field => FIELD_LABELS[field]).join(', ');

  return (
    <Stack gap="md">
      <DescriptionPage
        icon={IconQrcode}
        page="QR-коды"
        title="Все QR-коды"
        entity={isEdit ? `Изменение «${editing.name}»` : 'Новый QR-код'}
      />

      <Paper withBorder p="md">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Stack gap={6} style={{ minWidth: 0, flex: '1 1 320px' }}>
            <Title order={3}>{isEdit ? `QR-код «${editing.name}»` : 'Новый QR-код'}</Title>
            {isEdit && <CopyableId label="слаг" value={editing.slug} />}
            {isEdit && (
              <Text size="sm" c="dimmed">
                Создан {formatDateTime(editing.created_at)} · изменён{' '}
                {formatDateTime(editing.updated_at)}
              </Text>
            )}
          </Stack>
          <Group gap="xs" wrap="wrap">
            <Button
              size="xs"
              variant="subtle"
              leftSection={<IconArrowLeft size={14} />}
              onClick={goBack}
              disabled={isSaving}
            >
              Назад
            </Button>
            <Tooltip
              label={`Заполните: ${missing}`}
              disabled={!invalidFields.length}
              multiline
              w={260}
            >
              {/* A disabled button gets no pointer events: the box carries the tooltip */}
              <Box component="span">
                <Button
                  size="xs"
                  loading={isSaving}
                  disabled={invalidFields.length > 0}
                  onClick={save}
                >
                  {submitLabel}
                </Button>
              </Box>
            </Tooltip>
          </Group>
        </Group>
      </Paper>

      <form
        onSubmit={event => {
          event.preventDefault();
          save();
        }}
        style={{ maxWidth: 1000 }}
      >
        <Stack gap="md">
          <PageSection title="Основное">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Название"
                placeholder="Например: мобильное приложение, листовка"
                withAsterisk
                {...fieldProps('name')}
              />
              <TextInput
                label="Слаг"
                placeholder={isEdit ? undefined : 'Пусто – сгенерируется сам'}
                description={
                  isEdit
                    ? 'Зашит в напечатанные QR-коды и не меняется'
                    : 'Часть ссылки в QR-коде: /r/<слаг>; потом не меняется'
                }
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                {...fieldProps('slug')}
                disabled={isEdit || isSaving}
              />
            </SimpleGrid>
          </PageSection>

          <PageSection
            title="Целевые ссылки"
            description="Порядок определения платформы: iOS → Huawei → Android → Desktop. Пустая ссылка платформы ведёт на ссылку Desktop"
          >
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {QR_TARGETS.map(target => (
                <TextInput
                  key={target.field}
                  type="url"
                  inputMode="url"
                  label={target.label}
                  description={
                    target.isFallback ? `${target.devices}; запасная для пустых` : target.devices
                  }
                  placeholder={target.placeholder}
                  withAsterisk={target.isFallback}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  {...fieldProps(target.field)}
                />
              ))}
            </SimpleGrid>
          </PageSection>
          {/* Enter in a field saves, like the button in the header card */}
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </Stack>
      </form>
    </Stack>
  );
};

/** `/create-qr`: an empty form. */
export const QrCodeCreate: React.FC = () => <QrCodeFormBody editing={null} />;

/** `/qr/:slug/edit`: the form over the code as the server has it now. */
export const QrCodeEdit: React.FC = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const qrQuery = useQrCodeQuery(slug);

  if (qrQuery.data) return <QrCodeFormBody editing={qrQuery.data} />;

  return (
    <Stack gap="md">
      <DescriptionPage
        icon={IconQrcode}
        page="QR-коды"
        title="Все QR-коды"
        entity={`Изменение ${slug}`}
      />
      {qrQuery.error != null ? (
        <CardLoadError
          error={qrQuery.error}
          notFoundTitle={`QR-код ${slug} не найден`}
          notFoundHint="Кода с таким слагом нет – его удалили, или в ссылке опечатка. Слаг виден в списке QR-кодов."
          onRetry={qrQuery.refetch}
          isRetrying={qrQuery.isFetching}
          onToList={() => navigate(QR_LIST_PATH)}
        />
      ) : (
        <Center py="xl">
          <Loader type="bars" />
        </Center>
      )}
    </Stack>
  );
};
