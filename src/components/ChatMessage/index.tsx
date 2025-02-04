import { Fragment } from 'react';
import { css } from '@emotion/react';

import type { ChatMessageProps, TwitchChatBoxBadge } from '@components/ChatMessage/types';

import cheer1Image from '@assets/images/cheer1.gif';
import cheer100Image from '@assets/images/cheer100.gif';
import cheer1000Image from '@assets/images/cheer1000.gif';
import cheer5000Image from '@assets/images/cheer5000.gif';
import cheer10000Image from '@assets/images/cheer10000.gif';
import cheer100000Image from '@assets/images/cheer100000.gif';
import cosmicAbyssTallVideo from '@assets/videos/cosmic-abyss-tall.mp4';
import { AnnouncementIcon } from '@components/shared/svgs/AnnouncementIcon';
import { BitsIcon } from '@components/shared/svgs/BitsIcon';
import { ChannelPointIcon } from '@components/shared/svgs/ChannelPointIcon';
import { FlexContainer } from '@components/shared/FlexContainer';
import { PinIcon } from '@components/shared/svgs/PinIcon';
import { SparkleIcon } from '@components/shared/svgs/SparkleIcon';
import { SubscriberIcon } from '@components/shared/svgs/SubscriberIcon';
import { TwitchIcon } from '@components/shared/svgs/TwitchIcon';
import { useGetChannelChatBadgesQuery } from '@store/apis/twitch/getChannelChatBadges';
import { useGetGlobalChatBadgesQuery } from '@store/apis/twitch/getGlobalChatBadges';
import { useGetPronounsQuery } from '@store/apis/chatPronouns/getPronouns';
import { useGetUserQuery } from '@store/apis/chatPronouns/getUser';
import { useSelector } from '@store';
import { Message } from '@components/shared/Message';

export const noticeTypes = {
  announcement: AnnouncementIcon,
  channel_points_highlighted: ChannelPointIcon,
  channel_points_sub_only: ChannelPointIcon,
  cheered: BitsIcon,
  default: TwitchIcon,
  pinned: PinIcon,
  power_ups_gigantified_emote: BitsIcon,
  power_ups_message_effect: BitsIcon,
  resub: SubscriberIcon,
  user_intro: SparkleIcon,
} as const;

export const announcementColors = {
  BLUE: 'linear-gradient(#00d6d6, #9146ff)',
  GREEN: 'linear-gradient(#00db84, #57bee6)',
  ORANGE: 'linear-gradient(#ffb31a, #e0e000)',
  PURPLE: 'linear-gradient(#9146ff, #ff75e6)',
} as const;

export const cheermotes = {
  cheer: {
    '1': {
      color: 'rgb(151, 151, 151)',
      url: cheer1Image,
    },
    '100': {
      color: 'rgb(156, 62, 232)',
      url: cheer100Image,
    },
    '1000': {
      color: 'rgb(29, 178, 165)',
      url: cheer1000Image,
    },
    '5000': {
      color: 'rgb(0, 153, 254)',
      url: cheer5000Image,
    },
    '10000': {
      color: 'rgb(244, 48, 33)',
      url: cheer10000Image,
    },
    '100000': {
      color: 'rgb(243, 167, 26)',
      url: cheer100000Image,
    },
  },
} as const;

export const ChatMessage = ({ event }: ChatMessageProps) => {
  const { broadcasterId, broadcasterColor } = useSelector(({ info }) => info);
  const {
    data: channelChatBadgesData,
    // error: channelChatBadgesError,
    isLoading: isChannelChatBadgesLoading,
  } = useGetChannelChatBadgesQuery({ broadcasterId });
  const {
    data: globalChatBadgesData,
    // error: globalChatBadgesError,
    isLoading: isGlobalChatBadgesLoading,
  } = useGetGlobalChatBadgesQuery();
  const { data: pronounsData, /* error: pronounsError, */ isLoading: isPronounsLoading } = useGetPronounsQuery();
  const {
    data: userData,
    // error: userError,
    isLoading: isUserLoading,
  } = useGetUserQuery({ login: event.chatter_user_login });
  const isLoading = isChannelChatBadgesLoading || isGlobalChatBadgesLoading || isPronounsLoading || isUserLoading;
  const isRenderable = !!(channelChatBadgesData && globalChatBadgesData && pronounsData && userData);
  const isAction = event.message.text.startsWith('\u0001ACTION');
  const isCosmicAbyss = 'message_type' in event && event.channel_points_animation_id === 'cosmic-abyss';
  const isDeleted = !!event.deletedTimestamp;
  const isSpecialMessage =
    'notice_type' in event ||
    event.cheer ||
    event.channel_points_custom_reward_id ||
    event.message_type !== 'text' ||
    event.pinId;
  const isGigantifiedEmote = 'message_type' in event && event.message_type === 'power_ups_gigantified_emote';
  const isHighlightMessage = 'message_type' in event && event.message_type === 'channel_points_highlighted';
  const isRainbowEclipse = 'message_type' in event && event.channel_points_animation_id === 'rainbow-eclipse';
  const isSimmer = 'message_type' in event && event.channel_points_animation_id === 'simmer';
  const isMessageEffect = isCosmicAbyss || isRainbowEclipse || isSimmer;
  const specialType = 'notice_type' in event ? event.notice_type : event.message_type;
  let IconComponent: (typeof noticeTypes)[keyof typeof noticeTypes] | null = null;

  const { badges: messageBadges, message } = event;
  const badgesData = [...((globalChatBadgesData || {}).data || []), ...((channelChatBadgesData || {}).data || [])];
  const pronouns = ((pronounsData || []).find(({ name }) => name === ((userData || [])[0] || {}).pronoun_id) || {})
    .display;
  const badges = badgesData.reduce(
    (acc: TwitchChatBoxBadge[], { set_id: setId, versions }) => [
      ...acc,
      ...versions.map((version) => ({ ...version, set_id: setId })),
    ],
    [],
  );

  if (isSpecialMessage) {
    if ('message_type' in event && event.channel_points_custom_reward_id)
      IconComponent = noticeTypes.channel_points_highlighted;
    else if ('message_type' in event && event.cheer) IconComponent = noticeTypes.cheered;
    else if (event.pinId) IconComponent = noticeTypes.pinned;
    else IconComponent = noticeTypes[specialType] || noticeTypes.default;
  }

  const animationDivMessageEffectBefore = isSimmer ? 'none' : 'rotate 4s linear infinite';
  const backgroundDivMarker =
    'notice_type' in event && event.notice_type === 'announcement' && event.announcement.color !== 'PRIMARY'
      ? announcementColors[event.announcement.color]
      : broadcasterColor;
  const backgroundImageDivMessageEffectBefore = isSimmer
    ? 'linear-gradient(90deg, #3866dd, #ff4c5b)'
    : 'conic-gradient(#b23ff8, #3cc890, #38a7ca, #b23ff8)';
  const colorStrongLogin = event.color || '#808080';
  const filterDivMessageEffect = isRainbowEclipse ? 'blur(8px)' : 'none';
  const filterSpanPronouns = isSpecialMessage ? 'brightness(90%)' : 'brightness(110%)';
  const marginContainerContent = isMessageEffect ? 'calc(var(--padding) * (2 / 3))' : '0';
  const marginDivMessageEffect = isRainbowEclipse ? 'calc(var(--padding) * (2 / 3))' : '0';
  const paddingDivMessageEffect = !isRainbowEclipse ? 'calc(var(--padding) * (2 / 3))' : '0';
  const widthDivMessageEffectBefore = isSimmer ? '100%' : '99999px';
  let backgroundColorContainerContent = isSpecialMessage ? 'rgba(0, 0, 0, 70%)' : 'transparent';

  if (isMessageEffect) backgroundColorContainerContent = 'rgba(0, 0, 0, 100%)';

  const cssContainerContainer = css`
    position: relative;
    gap: calc(var(--padding) / 2);
  `;
  const cssDivMessageEffect = css`
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    height: calc(100% - calc(var(--padding) * (4 / 3)));
    width: calc(100% - calc(var(--padding) * (4 / 3)));
    margin: ${marginDivMessageEffect};
    padding: ${paddingDivMessageEffect};
    filter: ${filterDivMessageEffect};

    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${widthDivMessageEffectBefore};
      height: 99999px;
      background-image: ${backgroundImageDivMessageEffectBefore};
      background-position: 0 0;
      background-repeat: no-repeat;
      transform: translate(-50%, -50%) rotate(0deg);
      animation: ${animationDivMessageEffectBefore};
      content: '';
    }
  `;
  const cssVideoCosmicAbyss = css`
    position: absolute;
    object-fit: cover;
    top: 0;
    left: 0;
  `;
  const cssContainerContent = css`
    position: relative;
    align-items: center;
    width: 100%;
    margin: ${marginContainerContent};
    background-color: ${backgroundColorContainerContent};
  `;
  const cssDivMarker = css`
    position: absolute;
    left: 0;
    width: calc(var(--padding) / 4);
    height: 100%;
    margin: auto 0;
    background: ${backgroundDivMarker};
  `;
  const cssIconNotice = css`
    position: absolute;
    left: calc(var(--padding) / 1.6);
    height: calc(var(--line-height) - (var(--padding) / 2));
  `;
  const cssPMessage = css`
    padding: calc(var(--padding) / 4) 0 calc(var(--padding) / 4)
      calc((var(--line-height) - (var(--padding) / 2)) + var(--padding));
    line-height: calc(((var(--bar-height) - var(--padding)) / 3) - (var(--padding) / 2));
    font-size: calc((((var(--bar-height) - var(--padding)) / 3) - (var(--padding) / 2)) / 6 * 5);
  `;
  const cssImgBadge = css`
    height: calc(((var(--bar-height) - var(--padding)) / 3) - (var(--padding) / 2));
    width: calc(((var(--bar-height) - var(--padding)) / 3) - (var(--padding) / 2));
    margin: 0 calc(var(--padding) / 4) 0 0;
    vertical-align: text-bottom;
  `;
  const cssStrongLogin = css`
    color: ${colorStrongLogin};
  `;
  const cssSpanPronouns = css`
    color: ${colorStrongLogin};
    filter: ${filterSpanPronouns};
  `;

  // Render nothing if data is loading or required data is incomplete
  if (isLoading || !isRenderable) return false;

  // Render component
  return (
    <FlexContainer cssContainer={cssContainerContainer}>
      {isMessageEffect ? (
        <div css={cssDivMessageEffect}>
          {isCosmicAbyss ? (
            <video autoPlay loop playsInline css={cssVideoCosmicAbyss}>
              <source src={cosmicAbyssTallVideo} type="video/mp4" />
            </video>
          ) : null}
        </div>
      ) : null}
      <FlexContainer cssContainer={cssContainerContent}>
        {IconComponent ? (
          <Fragment>
            <div css={cssDivMarker} />
            <IconComponent cssIcon={cssIconNotice} />
          </Fragment>
        ) : null}

        <p css={cssPMessage}>
          {messageBadges.map((messageBadge, i) => {
            const { image_url_4x: imageUrl4x } =
              badges.find(({ id, set_id: setId }) => id === messageBadge.id && setId === messageBadge.set_id) || {};

            if (imageUrl4x) return <img key={i} src={imageUrl4x} css={cssImgBadge} />;
            return null;
          })}
          <strong css={cssStrongLogin}>{event.chatter_user_name}</strong>
          {pronouns ? <strong css={cssSpanPronouns}> ({pronouns.toLowerCase()})</strong> : null}
          :&nbsp;
          <Message
            message={message}
            isAction={isAction}
            isDeleted={isDeleted}
            isGigantifiedEmote={isGigantifiedEmote}
            isHighlightMessage={isHighlightMessage}
          />
        </p>
      </FlexContainer>
    </FlexContainer>
  );
};
