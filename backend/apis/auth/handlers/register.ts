import { t } from "elysia";
import { Kysely } from "kysely";

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
  db: Kysely<DB>,
) {
  try {
    if (password !== confirmPassword) {
      throw Error("Password don't match");
    }

    const id = crypto.randomUUID();
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 4,
    });

    const usersLength = await db
      .selectFrom("users")
      .select(({ fn }) => fn.count<number>("id").as("length"))
      .executeTakeFirstOrThrow();

    if (usersLength.length === 0) {
      await db
        .insertInto("users")
        .values({
          id: id,
          username: username,
          email: email,
          password: hashedPassword,
          role: 6,
          disabled: false,
        })
        .execute();

      return { message: "Created admin user" };
    }

    await db
      .insertInto("users")
      .values({
        id: id,
        username: username,
        email: email,
        password: hashedPassword,
        role: 1,
        disabled: false,
      })
      .execute();

    return { message: "Created user" };
  } catch (e) {
    console.error(e);
  }
}
