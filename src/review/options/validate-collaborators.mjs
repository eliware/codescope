export function validateReviewCollaborators({ write, readFile, combine, createClient, register, openEnvFile, inspectFile }) {
  for (const [name, value] of Object.entries({ write, readFile, combine, createClient, register }))
    if (typeof value !== 'function') throw new Error(`runReview option ${name} must be a function`);
  if (openEnvFile !== undefined && typeof openEnvFile !== 'function')
    throw new Error('runReview option openEnvFile must be a function');
  if (inspectFile !== undefined && typeof inspectFile !== 'function')
    throw new Error('runReview option inspectFile must be a function');
}
