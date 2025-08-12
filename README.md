# LuxBid Backend

Backend NestJS pentru platforma LuxBid - aplicație de vânzare obiecte de lux cu sistem de oferte.

## Features implementate

✅ **Autentificare completă**
- Register cu opțiuni Persoană Fizică / Juridică
- Login cu JWT
- Validări complete pentru toate câmpurile

✅ **Modelul User extins**
- Date pentru persoane fizice (nume, prenume, CNP)
- Date pentru persoane juridice (denumire, CUI, reg. com.)
- Adresă completă de facturare
- Toate câmpurile necesare pentru emiterea facturilor

✅ **Database Schema**
- PostgreSQL cu Prisma ORM
- Tabele: Users, Listings, Offers, Messages
- Relații complete pentru funcționalitatea platformei

## Setup

### 1. Database (PostgreSQL)
```bash
# Instalează PostgreSQL local sau folosește un service cloud
# Actualizează DATABASE_URL în .env cu credențialele tale
```

### 2. Environment Variables
```bash
cp .env.example .env
# Editează .env cu valorile tale
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Database
```bash
# Generează clientul Prisma
npm run db:generate

# Push schema la database (pentru development)
npm run db:push

# Sau pentru production, folosește migrations:
# npx prisma migrate dev --name init
```

### 5. Start Development Server
```bash
npm run start:dev
# sau cu watch mode:
npm run start:watch
```

## API Endpoints

### Auth
- `POST /auth/register` - Înregistrare utilizator
- `POST /auth/login` - Autentificare utilizator

### Users  
- `GET /users/profile` - Profilul utilizatorului curent (protejat cu JWT)

## Database Schema

### User Model
```prisma
model User {
  // Date comune
  id, email, password, personType, phone
  
  // Persoană fizică
  firstName, lastName, cnp
  
  // Persoană juridică  
  companyName, cui, regCom
  
  // Adresă facturare
  address, city, county, postalCode, country
  
  // Relații
  listings, offers, messages
}
```

## Următorii pași

Pentru a completa platforma:

1. **Listings Management** - CRUD pentru anunțuri
2. **Offers System** - Sistem de oferte și negociere  
3. **Chat System** - WebSocket pentru comunicare privată
4. **File Upload** - Imagini pentru anunțuri (Cloudinary)
5. **Payments** - Integrare Stripe pentru comisioane
6. **Notifications** - Email și push notifications

## Development

```bash
# Watch mode pentru development
npm run start:watch

# Prisma Studio pentru management DB
npm run db:studio

# Build pentru production  
npm run build
npm start
```

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/luxbid"
JWT_SECRET="your-secure-secret"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```
# Force rebuild
