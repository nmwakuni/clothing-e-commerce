# Contributing to Mteja

Thank you for your interest in contributing to Mteja! This guide will help you get started.

---

## Development Setup

See [SETUP.md](./SETUP.md) for complete setup instructions.

**Quick start:**
```bash
pnpm install
cp apps/web/.env.local.example apps/web/.env.local
# Fill in environment variables
pnpm db:migrate
pnpm dev
```

---

## Code Quality Standards

### Before Committing

We use automated tools to maintain code quality:

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **TypeScript** - Type checking
4. **Vitest** - Testing
5. **Husky** - Pre-commit hooks

**Pre-commit hooks will automatically:**
- Fix ESLint errors
- Format code with Prettier
- Run type checks

### Manual Checks

```bash
# Lint
pnpm lint
pnpm lint:fix

# Format
pnpm format
pnpm format:check

# Type check
pnpm type-check

# Test
pnpm test
pnpm test:coverage

# Run all checks (recommended before PR)
pnpm validate
```

---

## Project Structure

```
mteja/
├── apps/
│   └── web/              # Next.js application
│       ├── src/
│       │   ├── app/      # App router pages
│       │   ├── components/  # React components
│       │   └── lib/      # Utilities
│       └── public/       # Static assets
├── packages/
│   ├── database/         # Drizzle ORM schemas
│   ├── ai-engine/        # Claude AI integration
│   ├── linkedin-scraper/ # Profile scraping
│   └── payments/         # M-Pesa + Pesapal
└── ...config files
```

---

## Writing Code

### TypeScript Guidelines

- **Always use TypeScript** (no `.js` files)
- **Enable strict mode** (already configured)
- **Export types** from packages
- **No `any` types** (use `unknown` if needed)

**Good:**
```typescript
interface User {
  id: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // implementation
}
```

**Bad:**
```typescript
function getUser(id: any): any {
  // Don't do this
}
```

### Naming Conventions

- **Files**: kebab-case (`profile-optimizer.ts`)
- **Components**: PascalCase (`ProfileOptimizer.tsx`)
- **Functions**: camelCase (`generateOutreach()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`ProfileData`)

### Code Style

We use Prettier for consistent formatting:
- **Indent**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Yes
- **Line width**: 100 characters
- **Trailing commas**: ES5

---

## Writing Tests

### Test Files

Place tests next to the code they test:
```
src/
├── profile-optimizer.ts
└── profile-optimizer.test.ts
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = someFunction(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle error cases', () => {
      expect(() => someFunction(null)).toThrow();
    });
  });
});
```

### Coverage Requirements

- **Minimum**: 70% coverage for lines, functions, branches
- **Goal**: 80%+ coverage for business logic
- **Focus**: Test business logic, not framework code

### Running Tests

```bash
# Run once
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage

# Specific file
pnpm test profile-optimizer
```

---

## Git Workflow

### Branch Naming

- **Features**: `feature/description`
- **Bugfixes**: `fix/description`
- **Chores**: `chore/description`
- **Docs**: `docs/description`

**Examples:**
```bash
feature/add-whatsapp-integration
fix/mpesa-callback-parsing
chore/update-dependencies
docs/improve-setup-guide
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Tooling, dependencies

**Examples:**
```
feat(ai-engine): add prospect analysis

Add AI-powered prospect analysis to identify pain points,
interests, and buying signals from LinkedIn profiles.

Closes #123
```

```
fix(payments): handle M-Pesa timeout errors

Add retry logic for M-Pesa API timeouts and improve error messages.
```

```
docs(setup): add Pesapal setup instructions
```

### Pull Request Process

1. **Create feature branch**
```bash
git checkout -b feature/your-feature
```

2. **Make changes and commit**
```bash
git add .
git commit -m "feat: add feature"
```

3. **Push to remote**
```bash
git push origin feature/your-feature
```

4. **Create Pull Request** on GitHub

5. **PR Checklist:**
   - [ ] Tests pass (`pnpm test`)
   - [ ] Linting passes (`pnpm lint`)
   - [ ] Type check passes (`pnpm type-check`)
   - [ ] Code is formatted (`pnpm format`)
   - [ ] Documentation updated (if needed)
   - [ ] No breaking changes (or clearly documented)

6. **Wait for review** - Address feedback

7. **Merge** - Squash and merge (preferred)

---

## Adding New Features

### 1. Database Changes

If adding new tables/columns:

1. **Update schema** in `packages/database/src/schema/`
```typescript
// packages/database/src/schema/new-table.ts
export const newTable = pgTable('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ...columns
});
```

2. **Export from index**
```typescript
// packages/database/src/schema/index.ts
export * from './new-table';
```

3. **Generate migration**
```bash
pnpm db:generate
```

4. **Review migration** in `packages/database/drizzle/`

5. **Apply migration**
```bash
pnpm db:migrate
```

### 2. API Routes

Add routes in `apps/web/src/app/api/`:

```typescript
// apps/web/src/app/api/feature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Implementation
  return NextResponse.json({ success: true });
}
```

### 3. UI Components

Add to `apps/web/src/components/`:

```typescript
// apps/web/src/components/feature-component.tsx
'use client';

interface FeatureComponentProps {
  title: string;
}

export function FeatureComponent({ title }: FeatureComponentProps) {
  return <div>{title}</div>;
}
```

### 4. Tests

Always add tests for new features:

```typescript
// feature.test.ts
describe('NewFeature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

---

## Common Tasks

### Add New Dependency

```bash
# To web app
pnpm add package-name --filter @mteja/web

# To specific package
pnpm add package-name --filter @mteja/payments

# Dev dependency (root)
pnpm add -D package-name -w
```

### Update Dependencies

```bash
# Check outdated
pnpm outdated

# Update all
pnpm update

# Update specific package
pnpm update package-name
```

### Debug Issues

```bash
# Clear everything and reinstall
rm -rf node_modules .next dist build
pnpm install

# Check for TypeScript errors
pnpm type-check

# Check for unused exports
pnpm ts-prune # (if installed)
```

---

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit: `chore: release v1.2.0`
4. Tag: `git tag v1.2.0`
5. Push: `git push --tags`
6. Deploy to production

---

## Getting Help

- **Questions**: Create a GitHub Discussion
- **Bugs**: Create a GitHub Issue
- **Security**: Email security@mteja.africa

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Assume good intentions

---

**Thank you for contributing to Mteja! 🚀**
