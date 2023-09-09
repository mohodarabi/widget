import TokenType from "./tokenPayload.enum";

interface TokenPayload {
  userId: string;
  tokenType: TokenType;
}

export default TokenPayload;
