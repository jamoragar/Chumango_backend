import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ClientDataDto } from './dto/client-data.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EditResourceDto } from './dto/edit-resource.dto';

@ApiTags('images')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('clients')
  @ApiOperation({
    summary: 'Obtiene todos los clientes creados en Cloudinary.',
  })
  getAllClients() {
    return this.resourcesService.getAllClients();
  }

  @Get('clients/:client')
  @ApiOperation({
    summary: 'Obtiene todas las imagenes de un cliente, y su metadata.',
  })
  getAllClientResources(@Param('client') client: string) {
    return this.resourcesService.getAllClientResources(client);
  }

  @Post()
  @ApiOperation({ summary: 'Crea la carpeta clientes en Cloudinary.' })
  createClient(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.createClient(createResourceDto);
  }

  @Post('renameClient')
  @ApiOperation({
    summary: 'Cambia el nombre de la carpeta del cliente por uno nuevo.',
  })
  editClientName(@Body() editResourceDto: EditResourceDto) {
    return this.resourcesService.editClientName(editResourceDto);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Sube una imagen a la carpeta asignada.' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() folder: { folder: string },
  ) {
    const result = await this.resourcesService.uploadImage(file, folder.folder);
    return result;
  }

  @Delete()
  @ApiOperation({
    summary:
      'Elimina todas las imagenes de un cliente en Cloudinary y su respectiva carpeta.',
  })
  removeClientImages(@Body() dataClient: ClientDataDto) {
    return this.resourcesService.removeClientImages(dataClient);
  }

  @Delete(':client/:publicId')
  @ApiOperation({ summary: 'Borra la imagen especificada del cliente.' })
  async deleteImage(
    @Param('client') client: string,
    @Param('publicId') publicId: string,
  ) {
    return await this.resourcesService.deleteImage(client, publicId);
  }
}
