# Licenfy

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Google e OCR na Vercel

Crie um cliente OAuth do tipo Web no Google Cloud e registre o URI de redirecionamento exato `https://licenfy.vercel.app/api/auth?action=callback`. Para outro domínio, use a origem HTTPS correspondente tanto no Google Cloud quanto na Vercel. Use uma origem HTTPS fixa para cada ambiente onde o login precisa funcionar.

Configure as variáveis abaixo no servidor da Vercel e faça um novo deploy.

| Variável | Valor |
| --- | --- |
| `APP_ORIGIN` | Origem HTTPS do site, como `https://licenfy.vercel.app`, sem barra final. |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth Web. |
| `GOOGLE_CLIENT_SECRET` | Segredo do cliente OAuth Web. |
| `AUTH_SESSION_SECRET` | Valor aleatório com no mínimo 32 bytes, gerado por exemplo com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. |
| `GEMINI_API_KEY` | Chave do Gemini usada pelo OCR. |
| `OCR_ALLOWED_GOOGLE_SUBS` | IDs Google autorizados para o piloto, separados por vírgula. O campo `id` da resposta de `GET /api/auth?action=session` após login mostra o ID da própria conta. |

O OCR aceita PDF, JPG e PNG de até 3 MB. Para liberar o OCR em escala, adicione cotas por empresa ou usuário com armazenamento compartilhado.

## Banco de dados Supabase

O projeto `licenfy` usa o Supabase Free em São Paulo. Os esquemas em [supabase/workspaces.sql](supabase/workspaces.sql) e [supabase/accounts.sql](supabase/accounts.sql) foram aplicados ao projeto nessa ordem. Cada identidade Google tem um espaço de trabalho privado. O banco bloqueia acesso direto dos papéis da Data API e limita o papel do backend à identidade configurada dentro da transação.

O site encaminha pedidos de acesso ao WhatsApp do Licenfy e mantém o login para contas existentes por Google ou e-mail e senha. Contas com o mesmo e-mail, criadas por métodos diferentes, têm espaços separados. A migração [supabase/password_accounts.sql](supabase/password_accounts.sql) adiciona a autenticação com senha ao banco.

No Supabase, crie uma credencial de login dedicada e conceda a ela o papel `licenfy_app`. Guarde o valor de conexão de **Transaction pooler** na variável de servidor `LICENFY_DATABASE_URL`, com o usuário dedicado e `sslmode=verify-full`. Configure o certificado CA fornecido pelo Supabase em `LICENFY_DATABASE_CA` se o pooler exigir uma CA explícita. Use segredos do ambiente de hospedagem para o URI, a senha e o segredo de sessão.

O painel salva unidades, licenças, ativos, regras e histórico no banco. A gravação usa uma revisão para impedir que duas abas sobrescrevam os dados uma da outra. Os binários dos documentos e o perfil ainda não são persistidos, e o acesso compartilhado por equipe ainda precisa de convites e permissões. Planeje exportações seguras e testes de restauração para operar no plano gratuito.

## QR Codes

Os QR Codes apontam para `https://licenfy.vercel.app/asset/<patrimonio>`. O `vercel.json` redireciona essa URL para a página pública de identificação do ativo. Os ativos de demonstração já são consultáveis dessa forma.

Os ativos cadastrados por clientes aparecem apenas no espaço privado. A consulta pública por QR ainda só serve os ativos de demonstração.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
