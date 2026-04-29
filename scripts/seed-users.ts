import { createClient } from "@supabase/supabase-js";

type Role = "instructor" | "student";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const defaultPassword = process.env.SEED_USER_PASSWORD ?? "Password123!";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const seedUsers: Array<{ email: string; role: Role }> = [
  { email: "instructor@test.com", role: "instructor" },
  { email: "student@test.com", role: "student" },
];

async function upsertSeedUser(email: string, role: Role) {
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  const existingUser = usersData.users.find((user) => user.email === email);

  if (existingUser) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: defaultPassword,
      user_metadata: { role },
      email_confirm: true,
    });

    if (updateError) {
      throw updateError;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: existingUser.id,
      email,
      role,
    });

    if (profileError) {
      throw profileError;
    }

    console.log(`updated ${email}`);
    return;
  }

  const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: defaultPassword,
    email_confirm: true,
    user_metadata: { role },
  });

  if (createError) {
    throw createError;
  }

  console.log(`created ${createdUser.user?.email}`);
}

async function main() {
  for (const user of seedUsers) {
    await upsertSeedUser(user.email, user.role);
  }

  console.log(`seed complete (password: ${defaultPassword})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
