import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { users } from '../database/schema/users';
import { ConflictError } from '../common/exceptions/app-errors';
import { RegisterDto } from './dto/register.dto';

export interface RegisteredUser {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'webmaster';
  createdAt: Date;
}

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async register(dto: RegisterDto): Promise<RegisteredUser> {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const [created] = await this.db
      .insert(users)
      .values({ email: dto.email, passwordHash })
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return created;
  }
}
