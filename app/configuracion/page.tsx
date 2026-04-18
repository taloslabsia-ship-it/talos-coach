export const dynamic = 'force-dynamic';

import { getUserProfile, getIntegrationsStatus, getElevenLabsConfig } from '@/app/actions';
import { SettingsClient } from '@/components/SettingsClient';
import { requireSession } from '@/lib/session';

const DEFAULT_INTEGRATIONS = {
  calendarConnected: false,
  comercios: [
    { id: 'qcqXIFsZeHPpN29BeHIW2T8LUh92', label: 'Vinoteca Talos', active: true },
    { id: 'N52iXyvZkvPbTVWYR87jP0bgID92', label: 'Central Comercio', active: true },
  ],
};

export default async function ConfiguracionPage() {
  await requireSession();
  const [profile, integrations, elevenLabs] = await Promise.all([
    getUserProfile().catch(() => null),
    getIntegrationsStatus().catch(() => DEFAULT_INTEGRATIONS),
    getElevenLabsConfig().catch(() => null),
  ]);
  return (
    <SettingsClient
      profile={profile}
      integrations={integrations ?? DEFAULT_INTEGRATIONS}
      elevenLabs={elevenLabs}
    />
  );
}
