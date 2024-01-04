import { PrismaClient } from "@prisma/client";

const dbConfig = {
  host: "16.171.149.63",
  user: "user",
  password: "password",
  database: "searchagent",
};

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `mysql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}`,
    },
  },
});

export default prisma;
