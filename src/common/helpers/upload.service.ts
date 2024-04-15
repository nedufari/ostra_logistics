import { BadRequestException, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import * as fs from 'fs';
import * as fileType from 'file-type';
import {  UnsupportedMediaTypeException } from "@nestjs/common";


@Injectable()
export class UploadService{
    constructor(){}



async uploadFile  (file: Express.Multer.File): Promise<string>{
    const extension = extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.ogg', 'webm'];


    if (!allowedExtensions.includes(extension)) {
        throw new BadRequestException(
            'Only files with the following extensions are allowed: ' +
            allowedExtensions.join(', '),
        );
    }

    const fileInfo = await fileType.fromBuffer(file.buffer);

    if (!fileInfo) {
        throw new UnsupportedMediaTypeException('Unrecognized file format');
    }

    if (fileInfo.mime.startsWith('image/')) {
        if (!fs.existsSync('public')) {
            fs.mkdirSync('public');
        }

        const filename = uuidv4() + extension;
        const filePath = `public/${filename}`;

        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(file.buffer);
        writeStream.end();

        return filename;
    }  else {
        throw new BadRequestException('Only image files are allowed');
    }
}
}