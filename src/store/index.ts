import { configureStore } from '@reduxjs/toolkit';
import { useDispatch as useDispatchUntyped, useSelector as useSelectorUntyped } from 'react-redux';

import { chatPronounsApi } from '@store/apis/chatPronouns';
import { infoSlice } from '@store/slices/info';
import { twitchApi } from '@store/apis/twitch';
import { twitchAuthSlice } from '@store/slices/twitchAuth';
import { twitchEventSubSlice } from '@store/slices/twitchEventSub';
import { twitchPubSubSlice } from '@store/slices/twitchPubSub';

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatPronounsApi.middleware).concat(twitchApi.middleware),
  reducer: {
    [chatPronounsApi.reducerPath]: chatPronounsApi.reducer,
    [infoSlice.reducerPath]: infoSlice.reducer,
    [twitchApi.reducerPath]: twitchApi.reducer,
    [twitchAuthSlice.reducerPath]: twitchAuthSlice.reducer,
    [twitchEventSubSlice.reducerPath]: twitchEventSubSlice.reducer,
    [twitchPubSubSlice.reducerPath]: twitchPubSubSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const useDispatch = useDispatchUntyped.withTypes<AppDispatch>();
export const useSelector = useSelectorUntyped.withTypes<RootState>();
