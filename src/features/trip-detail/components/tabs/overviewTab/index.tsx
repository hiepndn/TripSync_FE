import React from 'react';
import { Grid, Stack } from '@mui/material';
import { useAppSelector } from '@/app/store';
import GroupInfoCard from './GroupInfoCard';
import InviteCard from './InviteCard';
import MembersCard from './MembersCard';
import DangerZoneCard from './DangerZoneCard';

export default function OverviewTab() {
  const { groupDetail } = useAppSelector((state: any) => state.tripDetail);

  if (!groupDetail) return null;

  return (
    <Grid container spacing={3}>
      {/* Left column */}
      <Grid size={{ xs: 12, md: 8 }}>
        <GroupInfoCard />
      </Grid>

      {/* Right column */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2}>
          <InviteCard />
          <MembersCard />
          <DangerZoneCard />
        </Stack>
      </Grid>
    </Grid>
  );
}
