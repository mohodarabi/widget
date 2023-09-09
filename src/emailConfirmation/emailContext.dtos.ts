import { IsString, IsNotEmpty } from 'class-validator';

export class EmailContext {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export default EmailContext;
