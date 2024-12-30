import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientDataDto } from './dto/client-data.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ConfigService } from '@nestjs/config';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import { EditResourceDto } from './dto/edit-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUD_NAME'),
      api_key: this.configService.get<string>('API_KEY'),
      api_secret: this.configService.get<string>('API_SECRET'),
      secure: true,
    });
  }

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

  async editClientName(editResourceDto: EditResourceDto) {
    const clientName = `clients/${editResourceDto.client_name}`;
    const newClientName = `clients/${editResourceDto.new_client_name}`;
    try {
      // Listar todos los recursos en la carpeta antigua
      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: clientName,
        max_results: 500,
      });
      console.log(resources);

      // Mover cada recurso a la nueva carpeta
      for (const resource of resources.resources) {
        const oldPublicId = resource.public_id;
        const newPublicId = oldPublicId.replace(clientName, newClientName);

        await cloudinary.uploader.rename(oldPublicId, newPublicId);
        console.log(`Recurso movido: ${oldPublicId} -> ${newPublicId}`);
      }

      await cloudinary.api.delete_folder(clientName);
      console.log(`Carpeta eliminada: ${clientName}`);
    } catch (error) {
      console.error('Error renombrando la carpeta:', error);
      throw error;
    }
  }

  async getAllClients() {
    return await cloudinary.api.sub_folders('clients').then((response) => {
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
      .then(async (response) => {
        if (response.deleted) {
          await cloudinary.api.delete_folder(path);
          return response;
        } else {
          throw new Error('Failed to delete some resources');
        }
      })
      .catch((error) => {
        throw new Error(`Error deleting resources: ${error.message}`);
      });
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

  async deleteImage(client: string, publicId: string): Promise<any> {
    return await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        `clients/${client}/${publicId}`,
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        },
      );
    });
  }
}
