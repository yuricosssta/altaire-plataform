// src/users/services/user.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../repositories/user.repository';
import {
  CreateUser,
  OAuthUser,
  UpdateUser,
} from '../validations/users.zod';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IUser, UserRule } from '../schemas/models/user.interface';
import { MailService } from '../../shared/services/mail.service';
import { resolveAltaireRoleByEmail } from '../../shared/utils/org-role.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}

  async findOne(email: string): Promise<IUser | undefined> {
    return this.userRepository.findOneByEmail(email.trim().toLowerCase());
  }

  async createUser(user: CreateUser) {
    const normalizedEmail = user.email.trim().toLowerCase();
    const existing = await this.userRepository.findOneByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const orgRole = resolveAltaireRoleByEmail(normalizedEmail);
    const isAdmin = orgRole === 'OWNER' || orgRole === 'ADMIN';
    const hashedPassword = await bcrypt.hash(user.password, 10);
    try {
      const created = await this.userRepository.createUser({
        ...user,
        email: normalizedEmail,
        password: hashedPassword,
        authProvider: 'local',
        isAdmin,
        rule: isAdmin ? UserRule.Admin : UserRule.Organization,
      } as Partial<IUser>);
      const { password: _, ...safeUser } = created;
      return { ...safeUser, role: orgRole.toLowerCase() };
    } catch (e: any) {
      console.error('Erro ao criar usuário:', e);
      if (e.code === 11000) {
        throw new ConflictException('Este e-mail já está em uso.');
      }
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async validateCredentials(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findOneByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Esta conta foi criada com o Google. Use o botão "Entrar com o Google" ou redefina sua senha.',
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const orgRole = resolveAltaireRoleByEmail(normalizedEmail);
    const isAdmin = orgRole === 'OWNER' || orgRole === 'ADMIN';
    const { password: _, ...safeUser } = user;
    return { ...safeUser, isAdmin, role: orgRole.toLowerCase() };
  }

  async upsertOAuthUser(data: OAuthUser) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const orgRole = resolveAltaireRoleByEmail(normalizedEmail);
    const isAdmin = orgRole === 'OWNER' || orgRole === 'ADMIN';
    const existing = await this.userRepository.findOneByEmail(normalizedEmail);

    if (existing) {
      const userId = String(existing._id || existing.id);
      const shouldUpdate =
        (data.googleId && existing.googleId !== data.googleId) ||
        (data.avatarUrl && !existing.avatarUrl) ||
        existing.isAdmin !== isAdmin;

      if (shouldUpdate) {
        const updated = await this.userRepository.updateUser(userId, {
          googleId: data.googleId || existing.googleId,
          avatarUrl: existing.avatarUrl || data.avatarUrl,
          isAdmin,
          rule: isAdmin ? UserRule.Admin : UserRule.Organization,
        });
        if (updated) {
          return { ...updated, isAdmin, role: orgRole.toLowerCase() };
        }
      }

      const { password: _, ...safeExisting } = existing;
      return { ...safeExisting, isAdmin, role: orgRole.toLowerCase() };
    }

    try {
      const created = await this.userRepository.createUser({
        email: normalizedEmail,
        name: data.name.trim(),
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
        authProvider: 'google',
        isAdmin,
        rule: isAdmin ? UserRule.Admin : UserRule.Organization,
      } as Partial<IUser>);
      const { password: _, ...safeCreated } = created;
      return { ...safeCreated, isAdmin, role: orgRole.toLowerCase() };
    } catch (e: any) {
      if (e.code === 11000) {
        const raceUser =
          await this.userRepository.findOneByEmail(normalizedEmail);
        if (raceUser) {
          const { password: _, ...safeRaceUser } = raceUser;
          return { ...safeRaceUser, isAdmin, role: orgRole.toLowerCase() };
        }
      }
      throw new InternalServerErrorException(
        'Erro ao autenticar conta Google.',
      );
    }
  }

  async getAllUsers() {
    return this.userRepository.getAllUsers();
  }

  async searchUser(term: string) {
    return this.userRepository.searchUser(term);
  }

  async getUser(userId: string) {
    const user = await this.userRepository.getUser(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findById(id: string) {
    return this.userRepository.getUser(id);
  }

  async updateUser(userId: string, user: UpdateUser) {
    const updateUser = await this.userRepository.updateUser(
      userId,
      user as Partial<IUser>,
    );
    if (!updateUser) throw new NotFoundException('Usuário não encontrado');
    return updateUser;
  }

  async deleteUser(userId: string) {
    const deletedUser = await this.userRepository.deleteUser(userId);
    if (!deletedUser) throw new NotFoundException('Usuário não encontrado');
    return { message: `Usuário com id ${userId} deletado com sucesso.` };
  }

  async changeUserPassword(
    userId: string,
    currentPass: string,
    newPass: string,
  ) {
    if (!currentPass || !newPass) {
      throw new BadRequestException(
        'A senha atual e a nova senha são obrigatórias.',
      );
    }

    const user = await this.userRepository.getUserWithPassword(userId);
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const passwordMatch = await bcrypt.compare(currentPass, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('A senha atual está incorreta.');
    }

    const hashedNewPassword = await bcrypt.hash(newPass, 10);

    await this.userRepository.updateUser(userId, {
      password: hashedNewPassword,
    } as Partial<IUser>);

    return { message: 'Senha atualizada com sucesso.' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneByEmail(email);
    const successMessage = {
      message:
        'Se o e-mail existir em nossa base, um link de recuperação será enviado.',
    };

    if (!user) {
      return successMessage;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);

    await this.userRepository.updateUser(String(user._id || user.id), {
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: expireDate,
    } as Partial<IUser>);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return successMessage;
  }

  async resetPassword(token: string, newPass: string) {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.userRepository.findOneByResetToken(resetTokenHash);

    // Validação de segurança: verificar existência do usuário e se o token expirou
    if (
      !user ||
      (user.resetPasswordExpires &&
        new Date(user.resetPasswordExpires).getTime() < Date.now())
    ) {
      throw new BadRequestException(
        'Token de recuperação inválido ou expirado. Solicite um novo link.',
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPass, 10);

    await this.userRepository.updateUser(String(user._id || user.id), {
      password: hashedNewPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    } as any);

    return {
      message:
        'Sua senha foi redefinida com sucesso! Você já pode fazer o login.',
    };
  }
}
