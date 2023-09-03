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

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  createClient(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.createClient(createResourceDto);
  }
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() folder: { folder: string },
  ) {
    return this.resourcesService.uploadImage(file, folder.folder);
  }

  @Get(':client')
  getAllClientResources(@Param('client') client: string) {
    return this.resourcesService.getAllClientResources(client);
  }

  @Delete()
  removeClientImages(@Body() dataClient: ClientDataDto) {
    return this.resourcesService.removeClientImages(dataClient);
  }
}
