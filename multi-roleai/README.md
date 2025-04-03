# Multi-RoleAI

Multi-RoleAI is an autonomous AI agent web application that supports:
- Autonomous AI agent capabilities with independent task execution
- Multi-modal processing (text, code, web browsing, image analysis)
- Tool integration (web browser, code editor, file system)
- Advanced document management with versioning and collaboration
- Deployment system for web applications via "Spaces"
- User accounts with private workspaces
- Asynchronous task processing in the cloud

## Features

### Autonomous AI Agent
- Multi-agent architecture with specialized agents
- Task planning and decomposition
- Asynchronous execution
- Context and memory management

### Multi-Modal Capabilities
- Image processing and generation
- Data visualization tools (charts, graphs, maps)
- Document analysis and extraction
- Code analysis and generation

### Advanced Document Management
- Rich text editing with TipTap
- Document versioning and history
- Document collaboration and sharing
- Document templates

### Deployment System
- "Spaces" for deploying web applications
- Containerization for isolation
- Custom domain management
- Monitoring and logs

## Tech Stack

- **Frontend:** React with Next.js, TypeScript, Tailwind CSS
- **Editor Components:** TipTap for rich text editing, Monaco for code editing
- **Backend:** Next.js API Routes with Node.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth
- **AI Integration:** Anthropic Claude API (or similar LLM with tool-use capabilities)
- **File Storage:** Local file system (for VPS deployment) or S3-compatible storage
- **Deployment:** VPS with Nginx as a reverse proxy and SSL (using Let's Encrypt)

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Next, set up your environment variables by creating a `.env.local` file:

```
DATABASE_URL="postgresql://multiroleai:multiroleai_password@localhost:5432/multiroleai"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
ANTHROPIC_API_KEY="your-anthropic-api-key"
STORAGE_PATH="./storage"
```

Run the database migrations:

```bash
npx prisma migrate dev
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js application routes and pages
- `/components` - React components
- `/lib` - Utility functions and tools
  - `/tools` - Tool integration system for AI agents
  - `/agents` - Agent implementation and orchestration
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/services` - Backend services and API handlers
- `/types` - TypeScript type definitions

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org/getting-started/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Anthropic Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [TipTap Editor Documentation](https://tiptap.dev/introduction)
