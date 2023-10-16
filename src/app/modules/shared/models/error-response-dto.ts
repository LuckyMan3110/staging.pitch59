import { FieldErrorDto } from './field-error-dto';
export class ErrorResponseDto {
  identifier: string;
  fielsErrors: FieldErrorDto[];
}
