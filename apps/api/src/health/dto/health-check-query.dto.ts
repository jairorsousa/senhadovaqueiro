import { IsBooleanString, IsOptional } from "class-validator";

export class HealthCheckQueryDto {
  @IsOptional()
  @IsBooleanString({
    message: "verbose deve ser true ou false."
  })
  verbose?: string;
}
