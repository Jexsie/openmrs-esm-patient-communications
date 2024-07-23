import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { useLayoutType, showModal, ExtensionSlot, showSnackbar } from '@openmrs/esm-framework';
import styles from './providers-action-menu.scss';
import { launchOverlay } from '../../hooks/useOverlay';
import { type ProviderConfiguration } from '../../types';
import { useProviderConfigurations } from '../../hooks/useProviderConfigurations';
import { setAsDefaultConfig } from '../../api/providers.resource';

interface configurationsActionMenuProps {
  config: ProviderConfiguration;
}

export const ConfigurationsActionMenu = ({ config }: configurationsActionMenuProps) => {
  const { defaultConfig, mutateConfigs, providerConfigurations } = useProviderConfigurations();
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const isDefaultConfig = config.name === defaultConfig;
  const editConfigWorkspaceTitle = config
    ? t(`edit${config.name}`, `Edit ${config.name}`)
    : t('editConfig', 'Edit provider configuration');

  const state = useMemo(() => ({ providerName: config.name, ...config }), [config]);

  const launchEditConfigForm = useCallback(
    () => launchOverlay(editConfigWorkspaceTitle, <ExtensionSlot name="add-provider-config-form-slot" state={state} />),
    [editConfigWorkspaceTitle, state],
  );

  const launchConfigTestForm = useCallback(
    () =>
      launchOverlay(
        `${t('test', 'Test')} ${config.name}`,
        <ExtensionSlot name="test-provider-config-form-slot" state={state} />,
      ),
    [config.name, state, t],
  );

  const removeConfigPrompt = useCallback(() => {
    const close = showModal('remove-config-prompt-modal', {
      configName: config.name,
      closeDeleteModal: () => {
        close();
      },
    });
  }, [config]);

  const makeDefaultConfig = useCallback(async () => {
    await setAsDefaultConfig({ configs: providerConfigurations, defaultConfigName: config.name })
      .then(() => {
        mutateConfigs();
        showSnackbar({ kind: 'success', title: t('successMakingDefault', 'Default config updated') });
      })
      .catch(() =>
        showSnackbar({
          kind: 'error',
          title: t('errorMakingDefault', 'Failed to update default config'),
        }),
      );
  }, [config.name, mutateConfigs, providerConfigurations, t]);

  return (
    <Layer className={styles.layer}>
      <OverflowMenu aria-label="Test/edit/remove configuration" size={isTablet ? 'lg' : 'sm'} flipped align="left">
        <OverflowMenuItem
          className={styles.menuItem}
          id="testConfiguration"
          onClick={launchConfigTestForm}
          itemText={t('test', 'Test')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="editConfiguration"
          itemText={t('edit', 'Edit')}
          onClick={launchEditConfigForm}
          hasDivider
        />
        {!isDefaultConfig && (
          <OverflowMenuItem
            className={styles.menuItem}
            id="setAsDefault"
            itemText={t('setDefault', 'Set as default')}
            onClick={makeDefaultConfig}
            hasDivider
          />
        )}
        <OverflowMenuItem
          className={styles.menuItem}
          id="removeConfiguration"
          itemText={t('remove', 'Remove')}
          onClick={removeConfigPrompt}
          hasDivider
          isDelete
        />
      </OverflowMenu>
    </Layer>
  );
};