function mapServiceErrorToHttp(err) {
  const name = err?.name || err?.code || "Error";
  const payload = { error: err.message || "Unexpected error" };

  if (err?.details) payload.details = err.details; // opcional

  switch (name) {
    case "ValidationError":
    case "VALIDATION":
      return { status: 400, body: payload };
    case "NotFoundError":
    case "NOT_FOUND":
      return { status: 404, body: payload };
    case "ConflictError":
    case "CONFLICT":
      return { status: 409, body: payload };
    case "UnauthorizedError":
    case "UNAUTHORIZED":
      return { status: 401, body: payload };
    case "ForbiddenError":
    case "FORBIDDEN":
      return { status: 403, body: payload };
    default:
      return { status: 500, body: payload };
  }
}

const httpHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    const { status, body } = mapServiceErrorToHttp(err);
    res.status(status).json(body);
  }
};

const ok      = (res, data) => res.status(200).json(data);
const created = (res, data) => res.status(201).json(data);
const noContent = (res)     => res.status(204).send();

module.exports = { httpHandler, ok, created, noContent, mapServiceErrorToHttp };