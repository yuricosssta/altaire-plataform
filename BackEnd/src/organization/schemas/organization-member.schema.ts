//src/organization/schemas/organization-member.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrganizationMemberDocument = HydratedDocument<OrganizationMember>;

@Schema({
  timestamps: true,
  collection: 'organization_members',
})
export class OrganizationMember {
  // Vínculo com a Organização
  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organizationId: Types.ObjectId;

  // Vínculo com o Usuário
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // O "Cargo" neste contexto específico
  @Prop({
    type: String,
    enum: ['OWNER', 'ADMIN', 'MEMBER', 'CLIENT', 'EXTERNAL'],
    default: 'MEMBER',
    required: true,
  })
  role: string;

  // Projetos aos quais CLIENT ou EXTERNAL têm acesso permitido
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'EditorialProject' }],
    default: [],
  })
  allowedProjects: Types.ObjectId[];

  // Escopos granulares de permissão (abertos para expansão nas telas exclusivas)
  @Prop({ type: [String], default: [] })
  permissions: string[];

  // Usuário (OWNER, ADMIN ou MEMBER) que convidou este membro/cliente/externo
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  invitedBy?: Types.ObjectId;

  // Função / Cargo customizado atribuído ao usuário (não interfere na role de sistema)
  @Prop({
    type: Types.ObjectId,
    ref: 'OrganizationFunction',
    required: false,
    default: null,
  })
  functionId?: Types.ObjectId | null;

  @Prop({ required: false })
  function: string;
}

export const OrganizationMemberSchema =
  SchemaFactory.createForClass(OrganizationMember);

// Impede que o mesmo usuário seja adicionado 2x na mesma empresa.
OrganizationMemberSchema.index(
  { organizationId: 1, userId: 1 },
  { unique: true },
);
