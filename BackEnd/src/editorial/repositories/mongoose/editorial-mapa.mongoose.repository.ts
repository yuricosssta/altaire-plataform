import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialMapaRepository } from '../editorial-mapa.repository';
import {
  IEditorialMapa,
  ICreateEditorialMapa,
} from '../../schemas/models/editorial-mapa.interface';
import {
  EditorialMapa,
  EditorialMapaDocument,
} from '../../schemas/editorial-mapa.schema';

@Injectable()
export class EditorialMapaMongooseRepository implements EditorialMapaRepository {
  constructor(
    @InjectModel(EditorialMapa.name)
    private readonly mapaModel: Model<EditorialMapaDocument>,
  ) {}

  async findByVersionId(versionId: string): Promise<IEditorialMapa | null> {
    const mapa = await this.mapaModel
      .findOne({ vid: new (Types.ObjectId as any)(versionId) })
      .lean()
      .exec();
    return mapa as unknown as IEditorialMapa | null;
  }

  async create(data: ICreateEditorialMapa): Promise<IEditorialMapa> {
    const mapped: Record<string, unknown> = {
      vid: new (Types.ObjectId as any)(data.versionId),
      vn: data.versionNumber,
      n: data.name,
      mc: data.mensagemCentral,
      pl: data.pilares ?? [],
      tv: data.tomDeVoz ?? { traits: [], rules: [] },
      rt: data.retina ?? [],
    };
    if (data.positioningPhrase) mapped['pp'] = data.positioningPhrase;

    const doc = new this.mapaModel(mapped);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialMapa;
  }

  async deleteByVersionId(versionId: string): Promise<void> {
    await this.mapaModel
      .deleteOne({ vid: new (Types.ObjectId as any)(versionId) })
      .exec();
  }
}
