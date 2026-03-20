export const dynamic = 'force-dynamic';

import { getUserProfile, getIntegrationsStatus } from '@/app/actions';
import { SettingsClient } from '@/components/SettingsClient';

const DEFAULT_INTEGRATIONS = {
  calendarConnected: false,
  comercios: [
    { id: 'qcqXIFsZeHPpN29BeHIW2T8LUh92', label: 'Vinoteca Talos', active: true },
    { id: 'N52iXyvZkvPbTVWYR87jP0bgID92', label: 'Central Comercio', active: true },
  ],
};

export default async function SettingsPage() {
  const [profile, integrations] = await Promise.all([
    getUserProfile().catch(() => null),
    getIntegrationsStatus().catch(() => DEFAULT_INTEGRATIONS),
  ]);
  return <SettingsClient profile={profile} integrations={integrations ?? DEFAULT_INTEGRATIONS} />;
}
