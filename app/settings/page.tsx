export const dynamic = 'force-dynamic';

import { getUserProfile, getIntegrationsStatus } from '@/app/actions';
import { SettingsClient } from '@/components/SettingsClient';

export default async function SettingsPage() {
  const [profile, integrations] = await Promise.all([
    getUserProfile(),
    getIntegrationsStatus(),
  ]);
  return <SettingsClient profile={profile} integrations={integrations} />;
}
