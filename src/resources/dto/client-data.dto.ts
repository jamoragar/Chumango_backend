import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClientDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre de la carpeta del cliente.' })
  client: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: 'Listado de imagenes a subir.' })
  images: Array<string>;
}
