import { BadRequestException } from "@nestjs/common";
import type { ValidationError } from "class-validator";

type ValidationDetail = {
  field: string;
  messages: string[];
};

function flattenValidationErrors(errors: ValidationError[], parentPath = ""): ValidationDetail[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const messages = Object.values(error.constraints ?? {});
    const current = messages.length > 0 ? [{ field, messages }] : [];
    const children = flattenValidationErrors(error.children ?? [], field);

    return [...current, ...children];
  });
}

export function validationExceptionFactory(errors: ValidationError[]) {
  return new BadRequestException({
    code: "VALIDATION_ERROR",
    message: "Confira os campos enviados.",
    details: flattenValidationErrors(errors)
  });
}
