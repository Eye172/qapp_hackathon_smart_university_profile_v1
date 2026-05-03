import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

interface RegisterBody {
  name?: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = (await req.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name: name?.trim() || email.split("@")[0],
      email,
      password: hashedPassword,
      // seed an empty profile immediately
      profile: {
        create: {
          fullName: name?.trim() || email.split("@")[0],
          interests: "[]",
          preferredCountries: JSON.stringify(["Kazakhstan"]),
          documents: {
            create: [
              { kind: "transcript", status: "pending" },
              { kind: "passport", status: "pending" },
              { kind: "ielts", status: "pending" },
              { kind: "sop", status: "pending" },
              { kind: "recommendation", status: "pending" },
            ],
          },
        },
      },
    },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({ ok: true, user }, { status: 201 });
}
