import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EditorialMapaRepository } from '../editorial-mapa.repository';
import {
  IEditorialMapa,
  ICreateEditorialMapa,
  IUpdateEditorialMapa,
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
      .findOne({ versionId: new (Types.ObjectId as any)(versionId) })
      .lean()
      .exec();
    return mapa as unknown as IEditorialMapa | null;
  }

  async create(data: ICreateEditorialMapa): Promise<IEditorialMapa> {
    const mapped: Record<string, unknown> = {
      versionId: new (Types.ObjectId as any)(data.versionId),
      versionNumber: data.versionNumber,
      name: data.name,
      mensagemCentral: data.mensagemCentral,
      pilares: data.pilares ?? [],
      tomDeVoz: data.tomDeVoz ?? { traits: [], rules: [] },
      retina: data.retina ?? [],
    };
    if (data.positioningPhrase)
      mapped['positioningPhrase'] = data.positioningPhrase;

    const doc = new this.mapaModel(mapped);
    const saved = await doc.save();
    return saved.toObject() as unknown as IEditorialMapa;
  }

  async update(
    versionId: string,
    data: IUpdateEditorialMapa,
  ): Promise<IEditorialMapa | null> {
    const set: Record<string, unknown> = {};
    if (data.name !== undefined) set['name'] = data.name;
    if (data.positioningPhrase !== undefined)
      set['positioningPhrase'] = data.positioningPhrase;
    if (data.mensagemCentral !== undefined)
      set['mensagemCentral'] = data.mensagemCentral;
    if (data.pilares !== undefined) set['pilares'] = data.pilares;
    if (data.tomDeVoz !== undefined) set['tomDeVoz'] = data.tomDeVoz;
    if (data.retina !== undefined) set['retina'] = data.retina;

    const updated = await this.mapaModel
      .findOneAndUpdate(
        { versionId: new (Types.ObjectId as any)(versionId) },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
    return updated as unknown as IEditorialMapa | null;
  }

  async deleteByVersionId(versionId: string): Promise<void> {
    await this.mapaModel
      .deleteOne({ versionId: new (Types.ObjectId as any)(versionId) })
      .exec();
  }
}
