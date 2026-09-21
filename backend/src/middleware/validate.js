export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: messages } });
    }
    req.body = result.data;
    next();
  };
}
