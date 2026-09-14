// Prisma 7 Configuration file for VS Code Prisma Extension compatibility
export default {
  earlyAccess: true,
  schema: {
    kind: 'single',
    filePath: './schema.prisma',
  },
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
};
