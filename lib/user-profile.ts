import type { User } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";

function getProvider(user: User) {
  return user.app_metadata?.provider ?? null;
}

function getAvatarUrl(user: User) {
  const metadata = user.user_metadata;

  return (
    metadata?.avatar_url ??
    metadata?.picture ??
    metadata?.profile_image_url ??
    null
  );
}

function getNickname(user: User) {
  const metadata = user.user_metadata;

  return metadata?.name ?? metadata?.full_name ?? metadata?.user_name ?? null;
}

export async function upsertUserProfile(user: User) {
  if (!user.email) {
    throw new Error("Authenticated user email is required to sync profile.");
  }

  return prisma.userProfile.upsert({
    where: { supabaseUserId: user.id },
    update: {
      email: user.email,
      nickname: getNickname(user),
      avatarUrl: getAvatarUrl(user),
      provider: getProvider(user),
    },
    create: {
      supabaseUserId: user.id,
      email: user.email,
      nickname: getNickname(user),
      avatarUrl: getAvatarUrl(user),
      provider: getProvider(user),
    },
  });
}

export async function getUserProfileBySupabaseUserId(supabaseUserId: string) {
  return prisma.userProfile.findUnique({
    where: { supabaseUserId },
  });
}

export async function getOrCreateUserProfile(user: User) {
  const existingProfile = await getUserProfileBySupabaseUserId(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  return upsertUserProfile(user);
}
