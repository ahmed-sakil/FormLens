import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function getOrCreateProfile(authUserId, name) {
  return await prisma.profile.upsert({
    where: { authUserId },
    update: {},
    create: { authUserId, name }
  });
}

export async function getProfile(authUserId, defaultName = 'User') {
  let profile = await prisma.profile.findUnique({ where: { authUserId } });
  if (!profile) {
    try {
      profile = await prisma.profile.create({
        data: { authUserId, name: defaultName }
      });
    } catch {
      profile = await prisma.profile.findUnique({ where: { authUserId } });
    }
  }
  if (!profile) {
    throw new AppError('NOT_FOUND', 'Profile not found', 404);
  }
  return profile;
}

export async function updateProfile(authUserId, data) {
  return await prisma.profile.update({
    where: { authUserId },
    data: { name: data.name }
  });
}

