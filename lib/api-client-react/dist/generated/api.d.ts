import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { DiscoverStats, GetDiscoverFeedParams, HealthStatus, Match, Message, MessageInput, Profile, ProfileInput, ProfileUpdate, SwipeInput, SwipeResult } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListProfilesUrl: () => string;
/**
 * @summary List all profiles (admin/debug)
 */
export declare const listProfiles: (options?: RequestInit) => Promise<Profile[]>;
export declare const getListProfilesQueryKey: () => readonly ["/api/profiles"];
export declare const getListProfilesQueryOptions: <TData = Awaited<ReturnType<typeof listProfiles>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProfiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listProfiles>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListProfilesQueryResult = NonNullable<Awaited<ReturnType<typeof listProfiles>>>;
export type ListProfilesQueryError = ErrorType<unknown>;
/**
 * @summary List all profiles (admin/debug)
 */
export declare function useListProfiles<TData = Awaited<ReturnType<typeof listProfiles>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listProfiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProfileUrl: () => string;
/**
 * @summary Create a new profile
 */
export declare const createProfile: (profileInput: ProfileInput, options?: RequestInit) => Promise<Profile>;
export declare const getCreateProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProfile>>, TError, {
        data: BodyType<ProfileInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProfile>>, TError, {
    data: BodyType<ProfileInput>;
}, TContext>;
export type CreateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof createProfile>>>;
export type CreateProfileMutationBody = BodyType<ProfileInput>;
export type CreateProfileMutationError = ErrorType<unknown>;
/**
* @summary Create a new profile
*/
export declare const useCreateProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProfile>>, TError, {
        data: BodyType<ProfileInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProfile>>, TError, {
    data: BodyType<ProfileInput>;
}, TContext>;
export declare const getGetMyProfileUrl: () => string;
/**
 * @summary Get the current user's profile
 */
export declare const getMyProfile: (options?: RequestInit) => Promise<Profile>;
export declare const getGetMyProfileQueryKey: () => readonly ["/api/profiles/me"];
export declare const getGetMyProfileQueryOptions: <TData = Awaited<ReturnType<typeof getMyProfile>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getMyProfile>>>;
export type GetMyProfileQueryError = ErrorType<void>;
/**
 * @summary Get the current user's profile
 */
export declare function useGetMyProfile<TData = Awaited<ReturnType<typeof getMyProfile>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateMyProfileUrl: () => string;
/**
 * @summary Update the current user's profile
 */
export declare const updateMyProfile: (profileUpdate: ProfileUpdate, options?: RequestInit) => Promise<Profile>;
export declare const getUpdateMyProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMyProfile>>, TError, {
        data: BodyType<ProfileUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMyProfile>>, TError, {
    data: BodyType<ProfileUpdate>;
}, TContext>;
export type UpdateMyProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateMyProfile>>>;
export type UpdateMyProfileMutationBody = BodyType<ProfileUpdate>;
export type UpdateMyProfileMutationError = ErrorType<unknown>;
/**
* @summary Update the current user's profile
*/
export declare const useUpdateMyProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMyProfile>>, TError, {
        data: BodyType<ProfileUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMyProfile>>, TError, {
    data: BodyType<ProfileUpdate>;
}, TContext>;
export declare const getGetProfileUrl: (id: number) => string;
/**
 * @summary Get a profile by ID
 */
export declare const getProfile: (id: number, options?: RequestInit) => Promise<Profile>;
export declare const getGetProfileQueryKey: (id: number) => readonly [`/api/profiles/${number}`];
export declare const getGetProfileQueryOptions: <TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getProfile>>>;
export type GetProfileQueryError = ErrorType<void>;
/**
 * @summary Get a profile by ID
 */
export declare function useGetProfile<TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDiscoverFeedUrl: (params?: GetDiscoverFeedParams) => string;
/**
 * @summary Get profiles to swipe on (discovery feed)
 */
export declare const getDiscoverFeed: (params?: GetDiscoverFeedParams, options?: RequestInit) => Promise<Profile[]>;
export declare const getGetDiscoverFeedQueryKey: (params?: GetDiscoverFeedParams) => readonly ["/api/discover", ...GetDiscoverFeedParams[]];
export declare const getGetDiscoverFeedQueryOptions: <TData = Awaited<ReturnType<typeof getDiscoverFeed>>, TError = ErrorType<unknown>>(params?: GetDiscoverFeedParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDiscoverFeed>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDiscoverFeed>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDiscoverFeedQueryResult = NonNullable<Awaited<ReturnType<typeof getDiscoverFeed>>>;
export type GetDiscoverFeedQueryError = ErrorType<unknown>;
/**
 * @summary Get profiles to swipe on (discovery feed)
 */
export declare function useGetDiscoverFeed<TData = Awaited<ReturnType<typeof getDiscoverFeed>>, TError = ErrorType<unknown>>(params?: GetDiscoverFeedParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDiscoverFeed>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDiscoverStatsUrl: () => string;
/**
 * @summary Get discovery stats (total users, matches today, etc.)
 */
export declare const getDiscoverStats: (options?: RequestInit) => Promise<DiscoverStats>;
export declare const getGetDiscoverStatsQueryKey: () => readonly ["/api/discover/stats"];
export declare const getGetDiscoverStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDiscoverStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDiscoverStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDiscoverStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDiscoverStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDiscoverStats>>>;
export type GetDiscoverStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get discovery stats (total users, matches today, etc.)
 */
export declare function useGetDiscoverStats<TData = Awaited<ReturnType<typeof getDiscoverStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDiscoverStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRecordSwipeUrl: () => string;
/**
 * @summary Record a swipe (like or pass)
 */
export declare const recordSwipe: (swipeInput: SwipeInput, options?: RequestInit) => Promise<SwipeResult>;
export declare const getRecordSwipeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordSwipe>>, TError, {
        data: BodyType<SwipeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof recordSwipe>>, TError, {
    data: BodyType<SwipeInput>;
}, TContext>;
export type RecordSwipeMutationResult = NonNullable<Awaited<ReturnType<typeof recordSwipe>>>;
export type RecordSwipeMutationBody = BodyType<SwipeInput>;
export type RecordSwipeMutationError = ErrorType<unknown>;
/**
* @summary Record a swipe (like or pass)
*/
export declare const useRecordSwipe: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordSwipe>>, TError, {
        data: BodyType<SwipeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof recordSwipe>>, TError, {
    data: BodyType<SwipeInput>;
}, TContext>;
export declare const getListLikesReceivedUrl: () => string;
/**
 * @summary List profiles that liked you (not yet swiped back on)
 */
export declare const listLikesReceived: (options?: RequestInit) => Promise<Profile[]>;
export declare const getListLikesReceivedQueryKey: () => readonly ["/api/likes/received"];
export declare const getListLikesReceivedQueryOptions: <TData = Awaited<ReturnType<typeof listLikesReceived>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLikesReceived>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listLikesReceived>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListLikesReceivedQueryResult = NonNullable<Awaited<ReturnType<typeof listLikesReceived>>>;
export type ListLikesReceivedQueryError = ErrorType<unknown>;
/**
 * @summary List profiles that liked you (not yet swiped back on)
 */
export declare function useListLikesReceived<TData = Awaited<ReturnType<typeof listLikesReceived>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLikesReceived>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListMatchesUrl: () => string;
/**
 * @summary List all matches for the current user
 */
export declare const listMatches: (options?: RequestInit) => Promise<Match[]>;
export declare const getListMatchesQueryKey: () => readonly ["/api/matches"];
export declare const getListMatchesQueryOptions: <TData = Awaited<ReturnType<typeof listMatches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMatches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMatches>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMatchesQueryResult = NonNullable<Awaited<ReturnType<typeof listMatches>>>;
export type ListMatchesQueryError = ErrorType<unknown>;
/**
 * @summary List all matches for the current user
 */
export declare function useListMatches<TData = Awaited<ReturnType<typeof listMatches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMatches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUnmatchUrl: (id: number) => string;
/**
 * @summary Unmatch with someone
 */
export declare const unmatch: (id: number, options?: RequestInit) => Promise<void>;
export declare const getUnmatchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unmatch>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof unmatch>>, TError, {
    id: number;
}, TContext>;
export type UnmatchMutationResult = NonNullable<Awaited<ReturnType<typeof unmatch>>>;
export type UnmatchMutationError = ErrorType<unknown>;
/**
* @summary Unmatch with someone
*/
export declare const useUnmatch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unmatch>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof unmatch>>, TError, {
    id: number;
}, TContext>;
export declare const getListMessagesUrl: (matchId: number) => string;
/**
 * @summary Get messages for a match conversation
 */
export declare const listMessages: (matchId: number, options?: RequestInit) => Promise<Message[]>;
export declare const getListMessagesQueryKey: (matchId: number) => readonly [`/api/messages/${number}`];
export declare const getListMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listMessages>>, TError = ErrorType<unknown>>(matchId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listMessages>>>;
export type ListMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get messages for a match conversation
 */
export declare function useListMessages<TData = Awaited<ReturnType<typeof listMessages>>, TError = ErrorType<unknown>>(matchId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSendMessageUrl: (matchId: number) => string;
/**
 * @summary Send a message in a match conversation
 */
export declare const sendMessage: (matchId: number, messageInput: MessageInput, options?: RequestInit) => Promise<Message>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        matchId: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    matchId: number;
    data: BodyType<MessageInput>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<MessageInput>;
export type SendMessageMutationError = ErrorType<unknown>;
/**
* @summary Send a message in a match conversation
*/
export declare const useSendMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        matchId: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    matchId: number;
    data: BodyType<MessageInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map