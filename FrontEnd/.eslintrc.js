module.exports = {
  extends: 'next/core-web-vitals',
  root: true,
  env: { browser: true, es2021: true, node: true },
  rules: {
    'no-restricted-imports': [
      'warn',
      {
        patterns: [
          {
            group: ['@/app/api/axiosInstance'],
            message:
              'axiosInstance é legado. Use BFF: axios.create({ baseURL: "/api" }) + route handler em src/app/api/',
          },
          {
            group: ['mongoose'],
            message:
              'Não importar mongoose no frontend. Valide ObjectId com regex 24 hex (src/lib/dto/editorial.schema.ts)',
          },
        ],
      },
    ],
  },
};