import { supabaseAdmin } from '../config/supabase.js';
import { getOrCreateProfile } from '../services/profileService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });
    
    if (error) throw new AppError('AUTH_ERROR', error.message, 400);
    
    const profile = await getOrCreateProfile(data.user.id, name);
    sendSuccess(res, { userId: data.user.id, profileId: profile.id }, 201);
  } catch (err) {
    next(err);
  }
}

export async function profileSync(req, res, next) {
  try {
    const name = req.user.user_metadata?.name || 'User';
    const profile = await getOrCreateProfile(req.user.id, name);
    sendSuccess(res, { profileId: profile.id });
  } catch (err) {
    next(err);
  }
}
