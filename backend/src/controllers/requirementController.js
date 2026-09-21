import * as reqService from '../services/requirementService.js';
import { getProfile } from '../services/profileService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function list(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const reqs = await reqService.listRequirements(profile.id, req.params.id);
    sendSuccess(res, reqs);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const r = await reqService.createRequirement(profile.id, req.params.id, req.body);
    sendSuccess(res, r, 201);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const r = await reqService.updateRequirement(profile.id, req.params.id, req.body);
    sendSuccess(res, r);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    await reqService.deleteRequirement(profile.id, req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
}
