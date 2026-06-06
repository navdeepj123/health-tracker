// Custom error classes so every layer can throw a typed error
// that carries its own HTTP status code. The error middleware
// reads the type and responds — no try/catch needed in every route.

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 — bad input from the client
export class ValidationError extends AppError {
  constructor(m: string) { super(m, 400); }
}

// 404 — resource doesn't exist or doesn't belong to this user
export class NotFoundError extends AppError {
  constructor(r: string) { super(`${r} not found`, 404); }
}

// 401 — missing or invalid JWT
export class UnauthorizedError extends AppError {
  constructor(m = 'Not authorized') { super(m, 401); }
}

// 409 — duplicate (e.g. email already registered)
export class ConflictError extends AppError {
  constructor(m: string) { super(m, 409); }
}
