// src/organization/services/organization.service.ts

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Organization,
  OrganizationDocument,
} from '../schemas/organization.schema';
import {
  OrganizationMember,
  OrganizationMemberDocument,
} from '../schemas/organization-member.schema';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UsersService } from '../../users/services/user.service';
import { resolveAltaireRoleByEmail } from '../../shared/utils/org-role.util';
import { OrganizationFunctionRepository } from '../repositories/organization-function.repository';
import {
  CreateOrganizationFunction,
  UpdateOrganizationFunction,
} from '../validations/organization-function.zod';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private orgModel: Model<OrganizationDocument>,
    @InjectModel(OrganizationMember.name)
    private memberModel: Model<OrganizationMemberDocument>,
    private usersService: UsersService,
    private readonly functionRepo: OrganizationFunctionRepository,
  ) { }

  private async resolveActiveFunctionForOrg(
    orgId: string,
    functionId?: string | null,
  ): Promise<Types.ObjectId | null | undefined> {
    if (functionId === undefined) return undefined;
    if (functionId === null || String(functionId).trim() === '') return null;

    const idStr = String(functionId).trim();
    if (!(Types.ObjectId as any).isValid(idStr)) {
      throw new BadRequestException('ID da função inválido.');
    }

    const fn = await this.functionRepo.findById(idStr);
    if (!fn || String(fn.organizationId) !== String(orgId)) {
      throw new BadRequestException(
        'Função não encontrada ou inativa nesta organização.',
      );
    }

    return new (Types.ObjectId as any)(String(fn._id));
  }

  /**
   * Garante e retorna a organização canônica única "Altaire".
   */
  async getCanonicalAltaireOrganization(fallbackOwnerId?: string): Promise<{
    _id: string;
    name: string;
    slug: string;
    acronym: string;
  }> {
    let altaireOrg = await this.orgModel.findOne({ slug: 'altaire' }).exec();
    if (!altaireOrg) {
      const ownerObjId =
        fallbackOwnerId && (Types.ObjectId as any).isValid(fallbackOwnerId)
          ? new (Types.ObjectId as any)(String(fallbackOwnerId))
          : new (Types.ObjectId as any)();
      try {
        altaireOrg = await this.orgModel.create({
          name: 'Altaire',
          acronym: 'ALT',
          slug: 'altaire',
          ownerId: ownerObjId,
          plan: 'PRO',
          status: 'active',
        });
      } catch {
        altaireOrg = await this.orgModel.findOne({ slug: 'altaire' }).exec();
      }
    }

    if (!altaireOrg) {
      throw new NotFoundException(
        'Organização canônica Altaire não encontrada.',
      );
    }

    return {
      _id: String(altaireOrg._id),
      name: altaireOrg.name,
      slug: altaireOrg.slug,
      acronym: altaireOrg.acronym,
    };
  }

  /**
   * Garante que a organização canônica "Altaire" exista no MongoDB e que o usuário
   * esteja vinculado a ela com o papel definido pelo .env (OWNER/ADMIN) ou preservado no banco (CLIENT/EXTERNAL/MEMBER).
   */
  async ensureDefaultOrganizationForUser(
    userId: string,
    userEmail?: string,
  ): Promise<void> {
    if (!(Types.ObjectId as any).isValid(userId)) {
      return;
    }

    const userObjectId = new (Types.ObjectId as any)(String(userId));
    let email = userEmail;
    let userDoc: any = null;

    try {
      userDoc = await this.usersService.findById(userId);
      if (!email) {
        email = userDoc?.email;
      }
    } catch {
      // segue com default MEMBER se não encontrar
    }

    const altaireOrg = await this.getCanonicalAltaireOrganization(userId);

    const existingMembership = await this.memberModel
      .findOne({
        organizationId: new (Types.ObjectId as any)(String(altaireOrg._id)),
        userId: userObjectId,
      })
      .exec();

    const persistedRole = existingMembership?.role || userDoc?.role;
    const targetRole = resolveAltaireRoleByEmail(email, persistedRole);

    if (!existingMembership) {
      const allowedProjects = Array.isArray(userDoc?.allowedProjects)
        ? userDoc.allowedProjects
          .filter((pid: any) => (Types.ObjectId as any).isValid(String(pid)))
          .map((pid: any) => new (Types.ObjectId as any)(String(pid)))
        : [];
      const permissions = Array.isArray(userDoc?.permissions)
        ? userDoc.permissions.map(String)
        : [];
      const invitedBy =
        userDoc?.invitedBy &&
          (Types.ObjectId as any).isValid(String(userDoc.invitedBy))
          ? new (Types.ObjectId as any)(String(userDoc.invitedBy))
          : undefined;
      const functionId =
        userDoc?.functionId &&
          (Types.ObjectId as any).isValid(String(userDoc.functionId))
          ? new (Types.ObjectId as any)(String(userDoc.functionId))
          : undefined;

      try {
        await this.memberModel.create({
          organizationId: new (Types.ObjectId as any)(String(altaireOrg._id)),
          userId: userObjectId,
          role: targetRole,
          allowedProjects,
          permissions,
          ...(invitedBy ? { invitedBy } : {}),
          ...(functionId ? { functionId } : {}),
        });
      } catch (err: any) {
        if (err?.code !== 11000) {
          throw err;
        }
      }
    } else if (existingMembership.role !== targetRole) {
      existingMembership.role = targetRole;
      await existingMembership.save();
    }
  }

  // 1. CRIAÇÃO BLOQUEADA (A organização Altaire é única; empresas são criadas via POST /companies)
  async create(_createDto: CreateOrganizationDto, _ownerId: string) {
    void _createDto;
    void _ownerId;
    throw new ForbiddenException(
      'A organização Altaire é única. Crie uma nova empresa via POST /companies.',
    );
  }

  // 2. LISTAGEM (Garante vínculo automático na organização "Altaire")
  async findAllForUser(userId: string, userEmail?: string) {
    await this.ensureDefaultOrganizationForUser(userId, userEmail);

    const memberships = await this.memberModel
      .find({ userId: new (Types.ObjectId as any)(userId) })
      .populate({
        path: 'organizationId',
        select: 'name acronym slug ownerId status plan createdAt settings',
      })
      .exec();

    return memberships;
  }

  // 3. BUSCAR MEMBROS DA ORGANIZAÇÃO
  async findMembersByOrganization(
    orgId: string,
    requesterId?: string,
    isRequesterAdmin = true,
  ) {
    if (!(Types.ObjectId as any).isValid(orgId)) {
      throw new BadRequestException(
        'ID da organização inválido ou não fornecido.',
      );
    }

    const filter: Record<string, any> = {
      organizationId: new (Types.ObjectId as any)(orgId),
    };

    // Se for MEMBER (não OWNER/ADMIN), enxerga a si mesmo e os CLIENT/EXTERNAL que ele próprio convidou
    if (
      !isRequesterAdmin &&
      requesterId &&
      (Types.ObjectId as any).isValid(requesterId)
    ) {
      const requesterObjId = new (Types.ObjectId as any)(String(requesterId));
      filter.$or = [
        { userId: requesterObjId },
        {
          invitedBy: requesterObjId,
          role: { $in: ['CLIENT', 'EXTERNAL'] },
        },
      ];
    }

    const memberships = await this.memberModel
      .find(filter)
      .populate({
        path: 'userId',
        select:
          'name email role allowedProjects permissions invitedBy functionId',
      })
      .populate({
        path: 'functionId',
        select: 'name description isActive',
      })
      .exec();

    return memberships
      .filter((m) => m.userId)
      .map((m) => {
        const user = m.userId as any;
        const allowedProjects = (
          m.allowedProjects?.length
            ? m.allowedProjects
            : user.allowedProjects || []
        ).map((id: any) => String(id));
        const permissions = (
          m.permissions?.length ? m.permissions : user.permissions || []
        ).map(String);
        const invitedBy = m.invitedBy
          ? String(m.invitedBy)
          : user.invitedBy
            ? String(user.invitedBy)
            : undefined;
        const fnDoc = m.functionId as any;
        const isFnActive = Boolean(
          fnDoc &&
          typeof fnDoc === 'object' &&
          fnDoc._id &&
          fnDoc.isActive !== false,
        );

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          membership: {
            organizationId: m.organizationId,
            role: m.role,
            allowedProjects,
            permissions,
            invitedBy,
            functionId: isFnActive ? String(fnDoc._id) : null,
            customFunction: isFnActive
              ? {
                _id: String(fnDoc._id),
                name: fnDoc.name,
                description: fnDoc.description,
              }
              : null,
          },
        };
      });
  }

  async addMemberToOrganization(
    orgId: string,
    userData: any,
    inviterId?: string,
    isInviterAdmin = true,
  ) {
    if (!(Types.ObjectId as any).isValid(orgId)) {
      throw new BadRequestException('ID da organização inválido.');
    }

    const requestedRole = String(userData.role || 'MEMBER')
      .trim()
      .toUpperCase();

    if (
      !['OWNER', 'ADMIN', 'MEMBER', 'CLIENT', 'EXTERNAL'].includes(
        requestedRole,
      )
    ) {
      throw new BadRequestException('Cargo inválido.');
    }

    if (!isInviterAdmin && !['CLIENT', 'EXTERNAL'].includes(requestedRole)) {
      throw new ForbiddenException(
        'Membros só podem cadastrar usuários com perfil Cliente (CLIENT) ou Membro Externo (EXTERNAL).',
      );
    }

    const allowedProjectIds: string[] = Array.isArray(userData.allowedProjects)
      ? userData.allowedProjects
        .map(String)
        .filter((pid: string) => (Types.ObjectId as any).isValid(pid))
      : [];
    const permissions: string[] = Array.isArray(userData.permissions)
      ? userData.permissions.map(String)
      : [];
    const inviterValidId =
      inviterId && (Types.ObjectId as any).isValid(inviterId)
        ? String(inviterId)
        : undefined;
    const resolvedFnId = await this.resolveActiveFunctionForOrg(
      orgId,
      userData.functionId,
    );

    let user;

    // 1. Verifica se a Identidade Global já existe
    user = await this.usersService.findOne(userData.email);

    // 2. Se não existir, cria a nova conta global
    if (!user) {
      try {
        user = await this.usersService.createUser({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: requestedRole as any,
          allowedProjects: allowedProjectIds,
          permissions,
          invitedBy: inviterValidId,
          functionId: resolvedFnId ? String(resolvedFnId) : null,
        });
      } catch (error) {
        throw new BadRequestException('Erro ao criar o usuário base.');
      }
    } else {
      const existingUserId = String(user._id || user.id);
      await this.usersService.updateUser(existingUserId, {
        role: requestedRole as any,
        ...(allowedProjectIds.length > 0
          ? { allowedProjects: allowedProjectIds }
          : {}),
        ...(permissions.length > 0 ? { permissions } : {}),
        ...(inviterValidId ? { invitedBy: inviterValidId } : {}),
        ...(resolvedFnId !== undefined
          ? { functionId: resolvedFnId ? String(resolvedFnId) : null }
          : {}),
      });
    }

    const targetUserObjectId = new (Types.ObjectId as any)(
      String(user._id || user.id),
    );

    // 3. Valida se o usuário já não faz parte DESTA empresa
    const existingLink = await this.memberModel.findOne({
      organizationId: new (Types.ObjectId as any)(orgId),
      userId: targetUserObjectId,
    });

    if (existingLink) {
      throw new BadRequestException('Este usuário já é membro desta equipe.');
    }

    // 4. Cria o vínculo na tabela pivô oficial
    await this.memberModel.create({
      organizationId: new (Types.ObjectId as any)(orgId),
      userId: targetUserObjectId,
      role: requestedRole,
      allowedProjects: allowedProjectIds.map(
        (pid) => new (Types.ObjectId as any)(pid),
      ),
      permissions,
      ...(inviterValidId
        ? { invitedBy: new (Types.ObjectId as any)(inviterValidId) }
        : {}),
      ...(resolvedFnId ? { functionId: resolvedFnId } : {}),
    });

    return { message: 'Membro adicionado com sucesso!' };
  }

  async updateMemberRole(
    orgId: string,
    adminId: string,
    targetUserId: string,
    newRole: string,
    extra?: {
      allowedProjects?: string[];
      permissions?: string[];
      functionId?: string | null;
    },
    isActorAdmin = false,
  ) {
    const normalizedRole = String(newRole || '')
      .trim()
      .toUpperCase();
    if (
      !['OWNER', 'ADMIN', 'MEMBER', 'CLIENT', 'EXTERNAL'].includes(
        normalizedRole,
      )
    ) {
      throw new BadRequestException('Cargo inválido.');
    }

    const targetMembership = await this.memberModel.findOne({
      organizationId: new (Types.ObjectId as any)(String(orgId)),
      userId: new (Types.ObjectId as any)(String(targetUserId)),
    });

    if (!targetMembership) {
      throw new NotFoundException('Membro não encontrado nesta organização.');
    }

    if (targetMembership.role === 'OWNER' && normalizedRole !== 'OWNER') {
      throw new ForbiddenException(
        'Não é possível alterar o cargo de sistema do Proprietário.',
      );
    }

    if (!isActorAdmin) {
      // Verifica no banco se quem está pedindo é ADMIN/OWNER ou o MEMBER que convidou este CLIENT/EXTERNAL
      const actorMember = await this.memberModel.findOne({
        organizationId: new (Types.ObjectId as any)(String(orgId)),
        userId: new (Types.ObjectId as any)(String(adminId)),
      });

      const isDbAdmin =
        actorMember?.role === 'ADMIN' || actorMember?.role === 'OWNER';
      const isInviterManagingGuest =
        actorMember?.role === 'MEMBER' &&
        String(targetMembership.invitedBy || '') === String(adminId) &&
        ['CLIENT', 'EXTERNAL'].includes(normalizedRole);

      if (!isDbAdmin && !isInviterManagingGuest) {
        throw new ForbiddenException(
          'Você não tem permissão para alterar este cargo.',
        );
      }
    }

    const updatePayload: Record<string, any> = { role: normalizedRole };
    const userUpdatePayload: Record<string, any> = { role: normalizedRole };

    if (Array.isArray(extra?.allowedProjects)) {
      const validIds = extra.allowedProjects
        .map(String)
        .filter((pid) => (Types.ObjectId as any).isValid(pid));
      updatePayload.allowedProjects = validIds.map(
        (pid) => new (Types.ObjectId as any)(pid),
      );
      userUpdatePayload.allowedProjects = validIds;
    }

    if (Array.isArray(extra?.permissions)) {
      updatePayload.permissions = extra.permissions.map(String);
      userUpdatePayload.permissions = extra.permissions.map(String);
    }

    if (extra?.functionId !== undefined) {
      const resolvedFnId = await this.resolveActiveFunctionForOrg(
        orgId,
        extra.functionId,
      );
      updatePayload.functionId = resolvedFnId ?? null;
      userUpdatePayload.functionId = resolvedFnId ? String(resolvedFnId) : null;
    }

    const updated = await this.memberModel.findOneAndUpdate(
      {
        organizationId: new (Types.ObjectId as any)(String(orgId)),
        userId: new (Types.ObjectId as any)(String(targetUserId)),
      },
      { $set: updatePayload },
      { new: true },
    );

    if (!updated)
      throw new NotFoundException('Membro não encontrado nesta organização.');

    try {
      await this.usersService.updateUser(
        String(targetUserId),
        userUpdatePayload,
      );
    } catch {
      // Mantém resiliência caso o registro de User não exista
    }

    return { message: 'Cargo atualizado com sucesso.' };
  }

  async removeMemberFromOrganization(
    orgId: string,
    adminId: string,
    targetUserId: string,
    isActorAdmin = false,
  ) {
    if (adminId === targetUserId) {
      throw new BadRequestException(
        'Você não pode remover a si mesmo por aqui.',
      );
    }

    const targetMembership = await this.memberModel.findOne({
      organizationId: new (Types.ObjectId as any)(String(orgId)),
      userId: new (Types.ObjectId as any)(String(targetUserId)),
    });

    if (!targetMembership) {
      throw new NotFoundException('Membro não encontrado nesta organização.');
    }

    if (!isActorAdmin) {
      const actorMember = await this.memberModel.findOne({
        organizationId: new (Types.ObjectId as any)(String(orgId)),
        userId: new (Types.ObjectId as any)(String(adminId)),
      });

      const isDbAdmin =
        actorMember?.role === 'ADMIN' || actorMember?.role === 'OWNER';
      const isInviterRemovingGuest =
        actorMember?.role === 'MEMBER' &&
        String(targetMembership.invitedBy || '') === String(adminId) &&
        ['CLIENT', 'EXTERNAL'].includes(targetMembership.role);

      if (!isDbAdmin && !isInviterRemovingGuest) {
        throw new ForbiddenException(
          'Apenas administradores ou o membro responsável pelo convite podem remover este usuário.',
        );
      }
    }

    // Remove o vínculo
    await this.memberModel.findOneAndDelete({
      organizationId: new (Types.ObjectId as any)(String(orgId)),
      userId: new (Types.ObjectId as any)(String(targetUserId)),
      role: { $ne: 'OWNER' }, // Proteção extra: não deixa deletar o dono supremo
    });

    return { message: 'Membro removido da organização.' };
  }

  // ATUALIZA AS CONFIGURAÇÕES VISUAIS (LOGO E PAPEL TIMBRADO)
  async updateSettings(orgId: string, adminId: string, newSettings: any) {
    // Verifica se quem está pedindo é ADMIN ou OWNER
    const adminMember = await this.memberModel.findOne({
      organizationId: new (Types.ObjectId as any)(String(orgId)),
      userId: new (Types.ObjectId as any)(String(adminId)),
      role: { $in: ['ADMIN', 'OWNER'] },
    });

    if (!adminMember) {
      throw new ForbiddenException(
        'Apenas administradores podem alterar as configurações da empresa.',
      );
    }

    // Busca a organização para atualizar.
    const orgToUpdate = await this.orgModel.findById(orgId);

    if (!orgToUpdate) {
      throw new NotFoundException('Organização não encontrada.');
    }

    // Mescla o objeto antigo com as novas propriedades que vieram no payload
    const updatedSettings = {
      ...orgToUpdate.settings,
      ...newSettings,
    };

    // 3. Salva no banco de dados
    const updated = await this.orgModel.findByIdAndUpdate(
      orgId,
      { $set: { settings: updatedSettings } },
      { new: true },
    );

    return {
      message: 'Configurações atualizadas com sucesso.',
      settings: updated.settings,
    };
  }

  // BUSCA POR SLUG
  async findOneBySlug(slug: string) {
    const org = await this.orgModel.findOne({ slug }).exec();
    if (!org) throw new BadRequestException('Organização não encontrada');
    return org;
  }

  // Helper simples para gerar slug
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }

  async findAllForSuperAdmin(): Promise<Organization[]> {
    // Busca todas as organizações com o dono populado
    const orgs = await this.orgModel
      .find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .lean() // O lean() transforma o Documento Mongoose em um Objeto JS
      .exec();

    // 2. Extrai uma lista única com todos os IDs dos donos
    const ownerIds = [
      ...new Set(orgs.map((org) => org.ownerId?._id).filter(Boolean)),
    ];

    // 3. Busca TODAS as participações (memberships) desses donos na plataforma inteira
    const allMemberships = await this.memberModel
      .find({ userId: { $in: ownerIds as any[] } })
      .populate('organizationId', 'name acronym plan')
      .lean()
      .exec();

    // 4. Agrupa as participações por ID do usuário para busca rápida (O(1))
    const membershipsByUser = allMemberships.reduce(
      (acc, membership) => {
        const uid = String(membership.userId);
        if (!acc[uid]) acc[uid] = [];
        acc[uid].push(membership);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    // 5. Injeta o currículo completo de empresas de volta no array original
    return orgs.map((org) => {
      const ownerIdStr = org.ownerId ? String((org.ownerId as any)._id) : null;
      return {
        ...org,
        ownerMemberships: ownerIdStr ? membershipsByUser[ownerIdStr] || [] : [],
      };
    });
  }

  // Altera o plano de qualquer empresa
  async updatePlan(orgId: string, newPlan: string) {
    if (!['FREE', 'PRO', 'ENTERPRISE'].includes(newPlan)) {
      throw new BadRequestException('Plano inválido.');
    }

    const org = await this.orgModel.findByIdAndUpdate(
      orgId,
      { plan: newPlan },
      { new: true },
    );

    if (!org) throw new BadRequestException('Organização não encontrada.');
    return org;
  }

  // --- CATÁLOGO DE FUNÇÕES / CARGOS CUSTOMIZADOS ---
  async listFunctions(
    orgId: string,
    requesterId: string,
    isRequesterAdmin: boolean,
  ) {
    if (!(Types.ObjectId as any).isValid(orgId)) {
      throw new BadRequestException('ID da organização inválido.');
    }

    if (isRequesterAdmin) {
      return this.functionRepo.findAllByOrg(orgId);
    }

    return this.functionRepo.findAllByOrg(orgId, requesterId);
  }

  async createFunction(
    orgId: string,
    data: CreateOrganizationFunction,
    creatorId: string,
  ) {
    if (!(Types.ObjectId as any).isValid(orgId)) {
      throw new BadRequestException('ID da organização inválido.');
    }
    if (!(Types.ObjectId as any).isValid(creatorId)) {
      throw new BadRequestException('ID do usuário criador inválido.');
    }

    return this.functionRepo.create({
      organizationId: orgId,
      name: data.name,
      description: data.description,
      createdBy: creatorId,
    });
  }

  async updateFunction(
    orgId: string,
    functionId: string,
    data: UpdateOrganizationFunction,
    actorId: string,
    isActorAdmin: boolean,
  ) {
    if (
      !(Types.ObjectId as any).isValid(orgId) ||
      !(Types.ObjectId as any).isValid(functionId)
    ) {
      throw new BadRequestException('ID inválido.');
    }

    const fn = await this.functionRepo.findById(functionId);
    if (!fn || String(fn.organizationId) !== String(orgId)) {
      throw new NotFoundException('Função não encontrada nesta organização.');
    }

    if (!isActorAdmin && String(fn.createdBy) !== String(actorId)) {
      throw new ForbiddenException(
        'Você só pode editar funções cadastradas por você.',
      );
    }

    const updated = await this.functionRepo.update(functionId, data);
    if (!updated) {
      throw new NotFoundException('Função não encontrada nesta organização.');
    }
    return updated;
  }

  async deleteFunction(
    orgId: string,
    functionId: string,
    actorId: string,
    isActorAdmin: boolean,
  ) {
    if (
      !(Types.ObjectId as any).isValid(orgId) ||
      !(Types.ObjectId as any).isValid(functionId)
    ) {
      throw new BadRequestException('ID inválido.');
    }

    const fn = await this.functionRepo.findById(functionId);
    if (!fn || String(fn.organizationId) !== String(orgId)) {
      throw new NotFoundException('Função não encontrada nesta organização.');
    }

    if (!isActorAdmin && String(fn.createdBy) !== String(actorId)) {
      throw new ForbiddenException(
        'Você só pode excluir funções cadastradas por você.',
      );
    }

    const linkedMembersCount = await this.memberModel.countDocuments({
      organizationId: new (Types.ObjectId as any)(String(orgId)),
      functionId: new (Types.ObjectId as any)(String(functionId)),
    });

    if (linkedMembersCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir esta função pois existem usuários vinculados a ela. Remova ou altere a função desses usuários primeiro.',
      );
    }

    await this.functionRepo.softDelete(functionId);
    return { message: 'Função removida com sucesso.' };
  }

  async updateOrganizationProfile(
    orgId: string,
    actorId: string,
    data: { name?: string; acronym?: string; billingDocument?: string },
    isActorAdmin = false,
  ) {
    const org = (Types.ObjectId as any).isValid(orgId)
      ? await this.orgModel.findById(orgId).exec()
      : await this.orgModel.findOne({ slug: orgId || 'altaire' }).exec();

    if (!org) {
      throw new NotFoundException('Organização não encontrada.');
    }

    if (!isActorAdmin) {
      const actorMember = await this.memberModel.findOne({
        organizationId: org._id,
        userId: new (Types.ObjectId as any)(String(actorId)),
        role: { $in: ['ADMIN', 'OWNER'] },
      });
      if (!actorMember) {
        throw new ForbiddenException(
          'Apenas administradores podem alterar os dados da organização.',
        );
      }
    }

    const updateSet: Record<string, unknown> = {};
    if (data.name !== undefined) updateSet.name = data.name;
    if (data.acronym !== undefined) updateSet.acronym = data.acronym;
    if (data.billingDocument !== undefined)
      updateSet.billingDocument = data.billingDocument;

    const updated = await this.orgModel
      .findByIdAndUpdate(org._id, { $set: updateSet }, { new: true })
      .lean()
      .exec();

    return updated;
  }
}
