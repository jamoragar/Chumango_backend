import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EditResourceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre del cliente ha editar.' })
  client_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nuevo nombre del cliente.' })
  new_client_name: string;
}
