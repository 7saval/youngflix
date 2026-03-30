export type ApiFailure = {
  ok: false;
  error: string;
};

export type ApiSuccess<T> = {
  ok: true;
} & T;

export type SyncUserProfileResponse = ApiSuccess<{
  profile: {
    id: string;
    supabaseUserId: string;
    email: string;
  };
}>;

export type WishlistStateResponse = ApiSuccess<{
  wishlisted: boolean;
}>;
