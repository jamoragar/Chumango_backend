import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre del cliente ha crear.' })
  client_name: string;
}
