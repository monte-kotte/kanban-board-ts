export interface SignupRequest {
  email: string;
  password: string;
}

/** POST /auth/signup response — never includes the password or its hash. */
export interface SignupResponse {
  id: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/login response. The session itself travels via an httpOnly cookie. */
export interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
}

/** GET /auth/me response. */
export interface MeResponse {
  id: string;
  email: string;
}
