import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientDataDto } from './dto/client-data.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import * as streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

@Injectable()
export class ResourcesService {
  async isClientCreated(CreateResourceDto: CreateResourceDto) {
    const clientName = CreateResourceDto.client_name;
    return await cloudinary.api.sub_folders(`clients`).then((response) => {
      const folders: Array<object> = response.folders;
      const existFolderClient: boolean = folders.some((folder) =>
        Object.values(folder).some((name) => name.includes(clientName)),
      );
      return existFolderClient;
    });
  }

  async createClient(createResourceDto: CreateResourceDto) {
    const client = createResourceDto.client_name;
    return await this.isClientCreated(createResourceDto).then((response) => {
      const existFolderClient = response;
      if (existFolderClient)
        throw new NotFoundException(
          `Client with name ${client} already exist.`,
        );
      else
        return cloudinary.api
          .create_folder(`clients/${client}`)
          .then((response) => {
            return response;
          });
    });
  }

  async getAllClients() {
    return await cloudinary.api.sub_folders('clients/').then((response) => {
      console.log(response);
      return response;
    });
  }
  async getAllClientResources(client: string) {
    return await cloudinary.api
      .resources({
        type: 'upload',
        resource_type: 'image',
        prefix: `clients/${client}`,
      })
      .then((response) => {
        const rawResponse = response.resources;
        return rawResponse.filter((content) => content.folder.includes(client));
      });
  }

  async removeClientImages(dataClient: ClientDataDto) {
    const client: string = dataClient.client;
    const images: Array<string> = dataClient.images;
    const path = `clients/${client}`;
    const cloudinaryPath = images.map((image) => `${path}/${image}`);

    return await cloudinary.api
      .delete_resources(cloudinaryPath)
      .then((response) => response);
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `clients/${folder}` },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
