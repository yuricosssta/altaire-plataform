import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EditorialProjectRepository,
  IEditorialProjectFilter,
} from '../../repositories/editorial-project.repository';
import {
  IEditorialProject,
  ICreateEditorialProject,
  IUpdateEditorialProject,
} from '../../schemas/models/editorial-project.interface';
import {
  EditorialProject,
  EditorialProjectDocument,
} from '../../schemas/editorial-project.schema';

const toObjId = (id: string) => new (Types.ObjectId as any)(String(id));

function normalizeProject(doc: any): IEditorialProject {
  return {
    ...doc,
    _id: String(doc._id),
    id: String(doc._id),
    companyId: doc.companyId ? String(doc.companyId) : '',
    brandId: doc.brandId ? String(doc.brandId) : '',
    createdBy: doc.createdBy ? String(doc.createdBy) : '',
  } as IEditorialProject;
}

@Injectable()
export class EditorialProjectMongooseRepository implements EditorialProjectRepository {
  constructor(
    @InjectModel(EditorialProject.name)
    private readonly projectModel: Model<EditorialProjectDocument>,
  ) {}

  async findAll(filter: IEditorialProjectFilter): Promise<IEditorialProject[]> {
    if (!(Types.ObjectId as any).isValid(filter.companyId)) {
      return [];
    }

    const query: Record<string, any> = {
      companyId: toObjId(filter.companyId),
      isActive: { $ne: false },
    };

    if (Array.isArray(filter.allowedProjectIds)) {
      const validIds = filter.allowedProjectIds
        .filter((pid) => (Types.ObjectId as any).isValid(pid))
        .map(toObjId);
      if (validIds.length === 0) {
        return [];
      }
      query._id = { $in: validIds };
    }

    if (Array.isArray(filter.brandIds)) {
      const validBrandIds = filter.brandIds
        .filter((bid) => (Types.ObjectId as any).isValid(bid))
        .map(toObjId);
      if (validBrandIds.length === 0) {
        return [];
      }
      query.brandId = { $in: validBrandIds };
    }

    const projects = await this.projectModel
      .find(query)
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return projects.map(normalizeProject);
  }

  async findById(id: string): Promise<IEditorialProject | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const project = await this.projectModel
      .findOne({
        _id: toObjId(id),
        isActive: { $ne: false },
      })
      .lean()
      .exec();
    return project ? normalizeProject(project) : null;
  }

  async countActiveByBrandId(brandId: string): Promise<number> {
    if (!(Types.ObjectId as any).isValid(brandId)) return 0;
    return this.projectModel
      .countDocuments({
        brandId: toObjId(brandId),
        isActive: { $ne: false },
      })
      .exec();
  }

  async findBrandIdsByProjectIds(
    companyId: string,
    projectIds: string[],
  ): Promise<string[]> {
    if (!(Types.ObjectId as any).isValid(companyId)) return [];
    const validIds = projectIds
      .filter((pid) => (Types.ObjectId as any).isValid(pid))
      .map(toObjId);
    if (validIds.length === 0) return [];

    const brandIds = await this.projectModel
      .distinct('brandId', {
        companyId: toObjId(companyId),
        _id: { $in: validIds },
        isActive: { $ne: false },
      })
      .exec();

    return brandIds.map(String);
  }

  async findByIds(ids: string[]): Promise<IEditorialProject[]> {
    const validIds = ids
      .filter((pid) => (Types.ObjectId as any).isValid(pid))
      .map((pid) => new (Types.ObjectId as any)(pid));
    if (validIds.length === 0) return [];
    const projects = await this.projectModel
      .find({ _id: { $in: validIds }, isActive: { $ne: false } })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return projects.map(normalizeProject);
  }

  async create(data: ICreateEditorialProject): Promise<IEditorialProject> {
    const doc = new this.projectModel({
      name: data.name,
      brandOrClientName: data.brandOrClientName || '',
      niche: data.niche,
      subniche: data.subniche,
      operationTypeLabel: data.operationTypeLabel || 'Orgânico',
      currentObjective: data.currentObjective,
      currentPhaseLabel: data.currentPhaseLabel || 'Estruturação Inicial',
      status: data.status || 'in_setup',
      nextActionLabel: data.nextActionLabel,
      nextActionReason: data.nextActionReason,
      createdBy: toObjId(data.createdBy),
      companyId: toObjId(data.companyId),
      brandId: toObjId(data.brandId),
      orgId: data.orgId || 'altaire',
      isActive: true,
    });
    const saved = await doc.save();
    return normalizeProject(saved.toObject());
  }

  async update(
    id: string,
    data: IUpdateEditorialProject,
  ): Promise<IEditorialProject | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const updated = await this.projectModel
      .findOneAndUpdate(
        { _id: toObjId(id), isActive: { $ne: false } },
        { $set: data },
        { new: true },
      )
      .lean()
      .exec();
    return updated ? normalizeProject(updated) : null;
  }

  async softDelete(id: string): Promise<IEditorialProject | null> {
    if (!(Types.ObjectId as any).isValid(id)) return null;
    const deleted = await this.projectModel
      .findOneAndUpdate(
        { _id: toObjId(id) },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();
    return deleted ? normalizeProject(deleted) : null;
  }
}
