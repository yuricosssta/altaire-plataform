# Escola Desafio FrontEnd

Aplicação web para administração e publicação de posts educacionais, construída com [Next.js](https://nextjs.org), [Redux Toolkit](https://redux-toolkit.js.org/), [Axios](https://axios-http.com/) e [TailwindCSS](https://tailwindcss.com/).

---

## 🚀 Como começar

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Configure a URL da API**
   - Edite o arquivo `.env`:
     ```
     NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
     ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js** (App Router)
- **React 19**
- **Redux Toolkit** (`@reduxjs/toolkit`, `react-redux`)
- **Axios** (requisições HTTP)
- **TailwindCSS** (estilização)
- **TypeScript**

---

## 📁 Estrutura de Pastas

```
src/
  app/           # Páginas e layouts do Next.js
  components/    # Componentes reutilizáveis (Navbar, PostForm, etc)
  lib/           # Configurações de API e Redux
  types/         # Tipos TypeScript (ex: IPost)
```

---

## 🧩 Funcionalidades

- Autenticação e logout via Redux
- Cadastro, edição e listagem de posts
- Integração com backend via Axios
- Formulários dinâmicos e responsivos
- Navegação protegida para administradores

---

## 📦 Variáveis de Ambiente

- `NEXT_PUBLIC_API_BASE_URL`: URL base da API backend

---

## 🐳 Docker

Para rodar com Docker:

1. **Build e execute o container**
   ```bash
   docker-compose up --build
   ```
2. O app estará disponível em [http://localhost:8080](http://localhost:8080)

---

## 📄 Licença

MIT

---

> Desenvolvido para fins educacionais.