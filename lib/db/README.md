# Database Layer Documentation

## Architecture Overview

Cette application utilise le **Repository Pattern** pour abstraire la couche d'accès aux données. Cette architecture permet de facilement changer de base de données (MongoDB → PostgreSQL) sans modifier le code applicatif.

## Structure des dossiers

```
lib/db/
├── db-client.ts              # Connexion MongoDB
├── models/                   # Interfaces TypeScript communes
│   └── index.ts              # Définitions des entités (User, FridgeItem, Recipe, MealLog)
├── schemas/                  # Schémas Mongoose (MongoDB)
│   ├── user.schema.ts
│   ├── fridge-item.schema.ts
│   ├── recipe.schema.ts
│   └── meal-log.schema.ts
└── repositories/             # Implémentations des repositories
    ├── base.repository.ts    # Interfaces génériques
    ├── user.repository.ts    # Implémentation MongoDB pour User
    ├── fridge-item.repository.ts
    └── index.ts              # Export central
```

## Utilisation

### Import des repositories

```typescript
import { db } from '@/lib/db/repositories';

// Créer un utilisateur
const user = await db.users.create({
  email: 'user@example.com',
  name: 'John Doe',
});

// Trouver un utilisateur par email
const user = await db.users.findByEmail('user@example.com');

// Mettre à jour le profil
await db.users.updateProfile(userId, {
  age: 30,
  height: 175,
  weight: 70,
});

// Créer un élément du frigo
const item = await db.fridgeItems.create({
  userId: user.id,
  name: 'Tomatoes',
  quantity: 5,
  unit: 'pieces',
  category: 'vegetables',
  addedDate: new Date(),
});

// Trouver les items qui expirent bientôt
const expiring = await db.fridgeItems.findExpiringSoon(userId, 3); // 3 jours
```

### Dans les API Routes (Next.js)

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repositories';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await db.users.create(body);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (email) {
    const user = await db.users.findByEmail(email);
    return NextResponse.json(user);
  }

  const users = await db.users.findMany();
  return NextResponse.json(users);
}
```

## Modèles disponibles

### User
- `email`, `name`, `profile`, `preferences`, `goals`
- Méthodes spécifiques: `findByEmail()`, `updateProfile()`, `updatePreferences()`, `updateGoals()`

### FridgeItem
- `userId`, `name`, `quantity`, `unit`, `category`, `expirationDate`
- Méthodes spécifiques: `findByUserId()`, `findByUserIdAndCategory()`, `findExpiringSoon()`, `findExpired()`

### Recipe (schéma créé, repository à implémenter)
- `userId`, `name`, `ingredients`, `steps`, `nutritionInfo`, `tags`, `isFavorite`

### MealLog (schéma créé, repository à implémenter)
- `userId`, `date`, `mealType`, `recipeId`, `customNutrition`

## Configuration MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Créer un nouveau cluster (Free tier disponible)
3. Configurer les paramètres de sécurité:
   - Ajouter une adresse IP autorisée (0.0.0.0/0 pour dev)
   - Créer un utilisateur de base de données
4. Obtenir la connection string
5. Copier `.env.example` vers `.env.local`
6. Remplacer `MONGODB_URI` avec votre connection string

```bash
cp .env.example .env.local
# Éditer .env.local et ajouter votre MONGODB_URI
```

## Migration vers PostgreSQL

### Étape 1: Installer les dépendances PostgreSQL

```bash
npm install pg @prisma/client
npm install -D prisma
```

### Étape 2: Initialiser Prisma (ORM recommandé pour PostgreSQL)

```bash
npx prisma init
```

### Étape 3: Créer les nouvelles implémentations

Créer de nouveaux fichiers dans `repositories/`:

```typescript
// lib/db/repositories/postgres/user.repository.ts
import { IUserRepository } from '../user.repository';
import { User } from '../../models';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostgresUserRepository implements IUserRepository {
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return await prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  // ... autres méthodes
}
```

### Étape 4: Créer un factory pattern

```typescript
// lib/db/repositories/factory.ts
import { IUserRepository } from './user.repository';
import { MongoUserRepository } from './user.repository';
import { PostgresUserRepository } from './postgres/user.repository';

const DB_TYPE = process.env.DB_TYPE || 'mongodb';

function createUserRepository(): IUserRepository {
  if (DB_TYPE === 'postgresql') {
    return new PostgresUserRepository();
  }
  return new MongoUserRepository();
}

export const db = {
  users: createUserRepository(),
  // ... autres repositories
};
```

### Étape 5: Mettre à jour les variables d'environnement

```bash
# .env.local
DB_TYPE=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/recipe_health_app
```

### Étape 6: Migrer les données

Utiliser un script de migration pour transférer les données de MongoDB vers PostgreSQL:

```typescript
// scripts/migrate-to-postgres.ts
import { MongoUserRepository } from '@/lib/db/repositories/user.repository';
import { PostgresUserRepository } from '@/lib/db/repositories/postgres/user.repository';

async function migrate() {
  const mongoRepo = new MongoUserRepository();
  const pgRepo = new PostgresUserRepository();

  const users = await mongoRepo.findMany();

  for (const user of users) {
    await pgRepo.create(user);
  }
}
```

## Bonnes pratiques

1. **Toujours utiliser les repositories** - Ne jamais accéder directement aux modèles Mongoose
2. **Typage strict** - Utiliser les interfaces TypeScript définies dans `models/`
3. **Gestion des erreurs** - Toujours wrapper les appels repository dans des try-catch
4. **Connection pooling** - La connexion MongoDB est automatiquement mise en cache
5. **Validation** - Les schémas Mongoose incluent la validation, mais ajouter aussi une validation côté API

## Tests

Pour tester les repositories, créer des tests unitaires:

```typescript
// __tests__/repositories/user.repository.test.ts
import { db } from '@/lib/db/repositories';

describe('UserRepository', () => {
  it('should create a user', async () => {
    const user = await db.users.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

## Ressources

- [MongoDB Atlas](https://cloud.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
