import React, { useEffect } from 'react';
import { Tab, Tabs, TabPanel, TabList, TabPanels } from '@carbon/react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import styles from './messages-settings-dashboard.scss';
import { useMessagesTemplates } from '../hooks/useMessagesTemplates';
import { ErrorState, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { TabsSkeleton } from '@carbon/react';
import MessagesTemplate from './messages-template/messages-template.component';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ButtonSet } from '@carbon/react';
import { Button } from '@carbon/react';
import { saveMessageTemplates } from '../api/api-remote';

const schema = z.object({
  dynamicFields: z.record(
    z.string(),
    z.object({
      fields: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
    }),
  ),
});

const MessagesDashboard: React.FC = () => {
  const { t } = useTranslation();
  const isLayoutTablet = useLayoutType() === 'tablet';
  const methods = useForm({
    resolver: zodResolver(schema),
  });
  const { setValue } = methods;

  const { handleSubmit } = methods;
  const { mutateTemplates, messagesTemplates, isLoadingTemplates, error } = useMessagesTemplates();

  const onSubmit = async (data) => {
    const updatedTemplates = messagesTemplates.map((template) => {
      if (data.dynamicFields[template.uuid]) {
        const updatedFields = template.templateFields.map((field) => ({
          ...field,
          defaultValue: data.dynamicFields[template.uuid].fields[field.type] || field.defaultValue,
        }));
        return { ...template, templateFields: updatedFields };
      }
      return template;
    });

    const payload = { templates: updatedTemplates };

    return await saveMessageTemplates(payload)
      .then(() =>
        showSnackbar({
          title: t('templatesUpdated', 'Default setting updated'),
          kind: 'success',
        }),
      )
      .catch(() =>
        showSnackbar({
          title: t('templatesNotUpdated', 'Error updating templates'),
          kind: 'error',
        }),
      );
  };
  const onError = (error) => console.error(error);

  useEffect(() => {
    if (messagesTemplates.length > 0) {
      messagesTemplates.forEach((template) => {
        template.templateFields.forEach((field) => {
          setValue(`dynamicFields.${template.uuid}.fields.${field.type}`, field.defaultValue);
        });
      });
    }
  }, [messagesTemplates, setValue]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className={classNames('omrs-main-content', styles.mainContainer, styles.messagesContent)}>
          <div className={classNames(isLayoutTablet ? styles.tabletContainer : styles.desktopContainer)}>
            <p className={styles.title}>{t('messagesSettings', 'Messages Settings')}</p>
            <div className={styles.tabContainer}>
              <p className={styles.heading}>
                {t('defaultPatientMessagesSettings', 'Default Patient messages settings')}
              </p>
              <div className={styles.tab}>
                {isLoadingTemplates ? (
                  <div
                    style={{
                      maxWidth: '100%',
                    }}
                  >
                    <TabsSkeleton />
                  </div>
                ) : (
                  <Tabs
                    className={classNames(styles.verticalTabs, {
                      [styles.tabletTab]: isLayoutTablet,
                      [styles.desktopTab]: !isLayoutTablet,
                    })}
                  >
                    <TabList>
                      {messagesTemplates.map((template) => (
                        <Tab id={template.uuid} key={template.uuid}>
                          {template.name}
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {messagesTemplates.map((template) => (
                        <TabPanel key={template.uuid}>
                          <MessagesTemplate template={template} />
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                )}
                {error && <ErrorState headerTitle="Error" error={error} />}
              </div>
            </div>
            <ButtonSet>
              <Button kind="secondary">{t('cancel', 'Cancel')}</Button>
              <Button kind="primary" type="submit">
                {t('save', 'Save')}
              </Button>
            </ButtonSet>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default MessagesDashboard;
