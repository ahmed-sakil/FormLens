import * as docService from '../services/documentService.js';
import { getProfile } from '../services/profileService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function get(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const doc = await docService.getDocument(profile.id, req.params.id);
    sendSuccess(res, doc);
  } catch (err) { next(err); }
}

export async function upsert(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const doc = await docService.upsertDocument(profile.id, req.params.id, req.body);
    sendSuccess(res, doc);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    await docService.deleteDocument(profile.id, req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
}
