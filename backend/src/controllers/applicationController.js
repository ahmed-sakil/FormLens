import * as applicationService from '../services/applicationService.js';
import { getProfile } from '../services/profileService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function list(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const apps = await applicationService.listApplications(profile.id, req.query);
    sendSuccess(res, apps);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const app = await applicationService.createApplication(profile.id, req.body);
    sendSuccess(res, app, 201);
  } catch (err) { next(err); }
}

export async function get(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const app = await applicationService.getApplication(profile.id, req.params.id);
    sendSuccess(res, app);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const app = await applicationService.updateApplication(profile.id, req.params.id, req.body);
    sendSuccess(res, app);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    await applicationService.deleteApplication(profile.id, req.params.id);
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
}

export async function readiness(req, res, next) {
  try {
    const profile = await getProfile(req.user.id);
    const data = await applicationService.calculateReadiness(profile.id, req.params.id);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}
