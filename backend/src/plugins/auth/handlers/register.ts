import { t } from 'elysia';
import { Kysely } from 'kysely';

export const registerBody = t.Object({
  username: t.String(),
  email: t.String(),
  password: t.String(),
  confirmPassword: t.String(),
});

export async function register(
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  db: Kysely<DB>
) {
  try {
    const id = crypto.randomUUID();
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: 'bcrypt',
      cost: 4,
    });

    if (password !== confirmPassword) {
      throw Error("Password don't match");
    }

    await db
      .insertInto('users')
      .values({
        id: id,
        username: username,
        email: email,
        password: hashedPassword,
        role: 1,
        disabled: false,
      })
      .execute();
  } catch (e) {
    console.error(e);
  }
}
