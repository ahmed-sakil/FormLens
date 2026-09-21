import * as migService from '../services/migrationService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function importGuestData(req, res, next) {
  try {
    const name = req.user.user_metadata?.name || 'User';
    const result = await migService.migrateGuestData(req.user.id, req.body, name);
    sendSuccess(res, result);
  } catch (err) { next(err); }
}
