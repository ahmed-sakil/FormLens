import { getProfile, updateProfile as updateProfileService } from '../services/profileService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { supabaseAdmin } from '../config/supabase.js';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';
import { PASSWORD_CHANGE_COOLDOWN_MINUTES } from '../config/constants.js';

export async function getProfileCtrl(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfileCtrl(req, res, next) {
  try {
    const profile = await updateProfileService(req.user.id, req.body);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const now = new Date();
    
    if (profile.passwordChangedAt) {
      const diffMin = (now - new Date(profile.passwordChangedAt)) / (1000 * 60);
      if (diffMin < PASSWORD_CHANGE_COOLDOWN_MINUTES) {
        return res.status(429).json({
          success: false, 
          error: { code: 'RATE_LIMITED', message: 'Password changed recently.' },
          retryAfter: Math.ceil(PASSWORD_CHANGE_COOLDOWN_MINUTES - diffMin)
        });
      }
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, { password: req.body.newPassword });
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);

    await prisma.profile.update({
      where: { authUserId: req.user.id },
      data: { passwordChangedAt: now }
    });

    logger.security('Password changed', { userId: req.user.id });
    sendSuccess(res, { message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}
