
export const AllowedAlgorithms = Object.freeze({
  HS256: "HS256",
  HS384: "HS384",
  HS512: "HS512",
  RS256: "RS256",
  RS384: "RS384",
  RS512: "RS512",
});


export interface userPaylaod {
    userId: string, email: string, jti: string, exp: string,
    tokenType: string
}
