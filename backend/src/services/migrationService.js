import { prisma } from '../config/prisma.js';
import { getOrCreateProfile } from './profileService.js';

export async function migrateGuestData(authUserId, payload, userName = "Migrated User") {
  return await prisma.$transaction(async (tx) => {
    let profile = await tx.profile.findUnique({ where: { authUserId } });
    if (!profile) {
      profile = await tx.profile.create({ data: { authUserId, name: userName } });
    }

    const { applications, requirements, documents } = payload;
    let appsImported = 0, reqsImported = 0, docsImported = 0;
    
    const appIdMap = {};
    const reqIdMap = {};

    for (const app of applications) {
      const createdApp = await tx.application.create({
        data: {
          profileId: profile.id,
          title: app.title,
          description: app.description,
          category: app.category,
          deadline: app.deadline,
          status: app.status,
          archived: app.archived
        }
      });
      appIdMap[app.localId] = createdApp.id;
      appsImported++;
    }

    for (const req of requirements) {
      const realAppId = appIdMap[req.localApplicationId];
      if (!realAppId) continue;
      const createdReq = await tx.requirement.create({
        data: {
          applicationId: realAppId,
          title: req.title,
          description: req.description,
          required: req.required,
          completed: req.completed
        }
      });
      reqIdMap[req.localId] = createdReq.id;
      reqsImported++;
    }

    for (const doc of documents) {
      const realReqId = reqIdMap[doc.localRequirementId];
      if (!realReqId) continue;
      await tx.document.create({
        data: {
          requirementId: realReqId,
          name: doc.name,
          documentType: doc.documentType,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          notes: doc.notes
        }
      });
      docsImported++;
    }

    return { applicationsImported: appsImported, requirementsImported: reqsImported, documentsImported: docsImported };
  });
}
