import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-messages-app';

const options = {
  featureName: 'messages',
  moduleName,
};

export const importTranslation = require.context('../translations', true, /.json$/, 'lazy');

export const messagesDashboard = getAsyncLifecycle(
  () => import('./messages/messages-settings-dashboard.component'),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
