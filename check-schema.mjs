import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const r = await p.$queryRawUnsafe(`SELECT id, name, nameKz, descriptionRu FROM University LIMIT 3`);
for (const u of r) console.log(JSON.stringify({id:u.id, name:u.name, nameKz:u.nameKz, descRu:u.descriptionRu?.slice(0,50)}));
await p.$disconnect();
