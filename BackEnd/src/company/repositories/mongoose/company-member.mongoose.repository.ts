import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyMemberRepository } from '../company-member.repository';
import {
  ICompanyMember,
  ICompanyMemberView,
  ICreateCompanyMember,
  IUpdateCompanyMember,
} from '../../schemas/models/company-member.interface';
import {
  CompanyMember,
  CompanyMemberDocument,
} from '../../schemas/company-member.schema';
import { resolveAltaireRoleByEmail } from '../../../shared/utils/org-role.util';

const toObjId = (id: string) => new (Types.ObjectId as any)(String(id));

function normalizeMember(doc: any): ICompanyMember {
  return {
    ...doc,
    _id: String(doc._id),
    companyId: String(doc.companyId),
    userId: String(doc.userId),
    functionId: doc.functionId ? String(doc.functionId) : null,
    brandIds: Array.isArray(doc.brandIds) ? doc.brandIds.map(String) : [],
    allowedProjects: Array.isArray(doc.allowedProjects)
      ? doc.allowedProjects.map(String)
      : [],
    permissions: Array.isArray(doc.permissions)
      ? doc.permissions.map(String)
      : [],
    invitedBy: doc.invitedBy ? String(doc.invitedBy) : undefined,
  } as ICompanyMember;
}

@Injectable()
export class CompanyMemberMongooseRepository implements CompanyMemberRepository {
  constructor(
    @InjectModel(CompanyMember.name)
    private readonly memberModel: Model<CompanyMemberDocument>,
  ) {}

  async findByCompanyAndUser(
    companyId: string,
    userId: string,
  ): Promise<ICompanyMember | null> {
    if (
      !(Types.ObjectId as any).isValid(companyId) ||
      !(Types.ObjectId as any).isValid(userId)
    ) {
      return null;
    }

    const doc = await this.memberModel
      .findOne({
        companyId: toObjId(companyId),
        userId: toObjId(userId),
        isActive: { $ne: false },
      })
      .lean()
      .exec();

    return doc ? normalizeMember(doc) : null;
  }

  async findActiveByUser(userId: string): Promise<ICompanyMember[]> {
    if (!(Types.ObjectId as any).isValid(userId)) return [];
    const docs = await this.memberModel
      .find({ userId: toObjId(userId), isActive: { $ne: false } })
      .lean()
      .exec();
    return docs.map(normalizeMember);
  }

  async findAllPopulatedByCompany(
    companyId: string,
  ): Promise<ICompanyMemberView[]> {
    if (!(Types.ObjectId as any).isValid(companyId)) return [];
    const docs = await this.memberModel
      .find({
        companyId: toObjId(companyId),
        isActive: { $ne: false },
      })
      .populate({
        path: 'userId',
        select: 'name email role',
      })
      .populate({
        path: 'functionId',
        select: 'name description isActive',
      })
      .lean()
      .exec();

    return docs
      .filter((m: any) => m.userId && typeof m.userId === 'object')
      .map((m: any) => {
        const user = m.userId;
        const fnDoc = m.functionId;
        const isFnActive = Boolean(
          fnDoc &&
          typeof fnDoc === 'object' &&
          fnDoc._id &&
          fnDoc.isActive !== false,
        );
        const role = resolveAltaireRoleByEmail(user.email, user.role);

        return {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          role,
          membership: {
            companyId: String(m.companyId),
            functionId: isFnActive ? String(fnDoc._id) : null,
            customFunction: isFnActive
              ? {
                  _id: String(fnDoc._id),
                  name: fnDoc.name,
                  description: fnDoc.description,
                }
              : null,
            brandIds: Array.isArray(m.brandIds) ? m.brandIds.map(String) : [],
            allowedProjects: Array.isArray(m.allowedProjects)
              ? m.allowedProjects.map(String)
              : [],
            permissions: Array.isArray(m.permissions)
              ? m.permissions.map(String)
              : [],
            invitedBy: m.invitedBy ? String(m.invitedBy) : undefined,
          },
        };
      });
  }

  async upsertActive(data: ICreateCompanyMember): Promise<ICompanyMember> {
    const brandObjectIds = (data.brandIds || [])
      .filter((id) => (Types.ObjectId as any).isValid(id))
      .map(toObjId);
    const projectObjectIds = (data.allowedProjects || [])
      .filter((id) => (Types.ObjectId as any).isValid(id))
      .map(toObjId);

    const setFields: Record<string, unknown> = {
      isActive: true,
      brandIds: brandObjectIds,
      allowedProjects: projectObjectIds,
      permissions: (data.permissions || []).map(String),
      functionId:
        data.functionId && (Types.ObjectId as any).isValid(data.functionId)
          ? toObjId(data.functionId)
          : null,
    };

    if (data.invitedBy && (Types.ObjectId as any).isValid(data.invitedBy)) {
      setFields.invitedBy = toObjId(data.invitedBy);
    }

    const doc = await this.memberModel
      .findOneAndUpdate(
        {
          companyId: toObjId(data.companyId),
          userId: toObjId(data.userId),
        },
        {
          $set: setFields,
          $setOnInsert: {
            companyId: toObjId(data.companyId),
            userId: toObjId(data.userId),
          },
        },
        { new: true, upsert: true },
      )
      .lean()
      .exec();

    return normalizeMember(doc);
  }

  async update(
    companyId: string,
    userId: string,
    data: IUpdateCompanyMember,
  ): Promise<ICompanyMember | null> {
    if (
      !(Types.ObjectId as any).isValid(companyId) ||
      !(Types.ObjectId as any).isValid(userId)
    ) {
      return null;
    }

    const set: Record<string, unknown> = {};
    if (data.functionId !== undefined) {
      set.functionId =
        data.functionId && (Types.ObjectId as any).isValid(data.functionId)
          ? toObjId(data.functionId)
          : null;
    }
    if (data.brandIds !== undefined) {
      set.brandIds = data.brandIds
        .filter((id) => (Types.ObjectId as any).isValid(id))
        .map(toObjId);
    }
    if (data.allowedProjects !== undefined) {
      set.allowedProjects = data.allowedProjects
        .filter((id) => (Types.ObjectId as any).isValid(id))
        .map(toObjId);
    }
    if (data.permissions !== undefined) {
      set.permissions = data.permissions.map(String);
    }

    const updated = await this.memberModel
      .findOneAndUpdate(
        {
          companyId: toObjId(companyId),
          userId: toObjId(userId),
          isActive: { $ne: false },
        },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();

    return updated ? normalizeMember(updated) : null;
  }

  async softDelete(
    companyId: string,
    userId: string,
  ): Promise<ICompanyMember | null> {
    if (
      !(Types.ObjectId as any).isValid(companyId) ||
      !(Types.ObjectId as any).isValid(userId)
    ) {
      return null;
    }

    const deleted = await this.memberModel
      .findOneAndUpdate(
        {
          companyId: toObjId(companyId),
          userId: toObjId(userId),
          isActive: { $ne: false },
        },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean()
      .exec();

    return deleted ? normalizeMember(deleted) : null;
  }

  async countActiveByFunction(
    companyId: string,
    functionId: string,
  ): Promise<number> {
    if (
      !(Types.ObjectId as any).isValid(companyId) ||
      !(Types.ObjectId as any).isValid(functionId)
    ) {
      return 0;
    }

    return this.memberModel
      .countDocuments({
        companyId: toObjId(companyId),
        functionId: toObjId(functionId),
        isActive: { $ne: false },
      })
      .exec();
  }
}
