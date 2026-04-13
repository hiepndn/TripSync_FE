# Project Structure (Tom Gon)

Luu y: Cay ben duoi tom gon cac thanh phan chinh cua du an, bo qua cac thu muc he thong/phu thuoc nhu `node_modules` va `.git`.

TripSync_FE/
|- public/
|- src/
|  |- app/
|  |  |- providers.tsx
|  |  |- store.ts
|  |- assets/
|  |- components/
|  |  |- common/
|  |  |- forms/
|  |  |- layouts/
|  |  |- ui/
|  |- config/
|  |  |- constants.ts
|  |  |- api/
|  |     |- endpoint.ts
|  |     |- index.ts
|  |- features/
|  |  |- auth/
|  |  |  |- index.tsx
|  |  |  |- redux/
|  |  |     |- actions.ts
|  |  |     |- reducer.ts
|  |  |     |- types.ts
|  |  |- dashboard/
|  |  |  |- index.tsx
|  |  |  |- redux/
|  |  |  |  |- action.ts
|  |  |  |  |- reducer.ts
|  |  |  |  |- types.ts
|  |  |  |- tabs/
|  |  |     |- exploreTab.tsx
|  |  |     |- myTripsTab.tsx
|  |  |     |- overViewTab.tsx
|  |  |     |- components/
|  |  |        |- addGroupDialog.tsx
|  |  |        |- joinGroupDialog.tsx
|  |  |- landingPage/
|  |  |  |- index.tsx
|  |  |- trip-detail/
|  |     |- index.tsx
|  |     |- components/
|  |     |  |- aiGeneratingBanner.tsx
|  |     |  |- tripHeader.tsx
|  |     |  |- tripNavigation.tsx
|  |     |  |- tabs/
|  |     |     |- expenseTab/
|  |     |     |  |- index.tsx
|  |     |     |- itineraryTab/
|  |     |        |- daySelector.tsx
|  |     |        |- index.tsx
|  |     |        |- AddActivityDialog/
|  |     |        |  |- index.tsx
|  |     |        |- timeline/
|  |     |        |  |- timelineItem.tsx
|  |     |        |  |- votingCard.tsx
|  |     |        |- widgets/
|  |     |           |- mapWidget.tsx
|  |     |           |- pendingVoteWidget.tsx
|  |     |- redux/
|  |        |- action.ts
|  |        |- reducer.ts
|  |        |- types.ts
|  |- hooks/
|  |- lib/
|  |  |- axios.ts
|  |  |- mui.ts
|  |- models/
|  |  |- activity.ts
|  |  |- group.ts
|  |  |- profile.ts
|  |- services/
|  |  |- realtime/
|  |  |- storage/
|  |- types/
|  |  |- api.types.ts
|  |  |- auth.types.ts
|  |  |- index.ts
|  |- utils/
|  |  |- constants/
|  |  |- helpers/
|  |  |- permissions/
|  |  |  |- checkPermission.ts
|  |  |- validation/
|  |- App.css
|  |- App.tsx
|  |- index.css
|  |- main.tsx
|  |- vite-env.d.ts
|- eslint.config.js
|- index.html
|- package.json
|- README.md
|- TripSyncV2.md
|- progress_note.md
|- tsconfig.app.json
|- tsconfig.json
|- tsconfig.node.json
|- vite.config.ts

## Ghi chu nhanh
- Kien truc theo feature-first, ket hop cac module dung chung (`components`, `lib`, `utils`, `types`).
- Moi feature lon (`auth`, `dashboard`, `trip-detail`) co entry point rieng va redux scope rieng.
- Phan `trip-detail` la khu vuc co cau truc chi tiet nhat (tabs, timeline, widgets, dialogs).
