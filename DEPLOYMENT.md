# 🚀 LuxBid - Ghid de Deploy pentru www.luxbid.ro

## 📋 Pasii pentru deployment production

### 1. Setup Backend pe Render.com

#### A. Crează cont pe Render.com
1. Mergi la [render.com](https://render.com)
2. Crează cont gratuit
3. Conectează-te cu GitHub

#### B. Crează PostgreSQL Database
1. În dashboard Render → "New" → "PostgreSQL"
2. Nume: `luxbid-database`
3. User: `luxbid`
4. Database Name: `luxbid`
5. Plan: Free (pentru început)
6. Crează database

#### C. Deploy Backend Service
1. În dashboard Render → "New" → "Web Service"
2. Conectează repository: `luxbid-backend`
3. Configurații:
   - **Name:** `luxbid-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

#### D. Environment Variables
În setările web service-ului, adaugă:
```
NODE_ENV=production
PORT=4000
DATABASE_URL=[copiază din PostgreSQL dashboard]
JWT_SECRET=luxbid-jwt-secret-production-2024-very-secure
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://luxbid.ro,https://www.luxbid.ro
```

### 2. Setup Frontend pe Vercel

#### A. Environment Variables în Vercel
1. În dashboard Vercel → Project Settings → Environment Variables
2. Adaugă:
```
NEXT_PUBLIC_API_BASE_URL=https://luxbid-backend.onrender.com
```

#### B. Configurează Custom Domain
1. În Vercel dashboard → Project → Settings → Domains
2. Adaugă domeniul: `luxbid.ro`
3. Adaugă și: `www.luxbid.ro`

### 3. Configurare DNS

#### Pentru domeniul luxbid.ro:
1. În panoul de control al domeniului (unde l-ai cumpărat)
2. Adaugă recorduri DNS:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 4. SSL Certificate
- Vercel configurează automat SSL/HTTPS
- Render.com oferă SSL gratuit
- Certificatele se generează automat

### 5. Deploy Workflow

#### Pentru actualizări viitoare:
1. **Frontend:** Push la GitHub → Vercel deploy automat
2. **Backend:** Push la GitHub → Render deploy automat

## 🔧 Testare după deploy

### 1. Testează Backend
```bash
curl https://luxbid-backend.onrender.com/auth/register -d '{
  "email": "test@luxbid.ro",
  "password": "***REMOVED***",
  "personType": "fizica",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+40123456789",
  "address": "Test Address",
  "city": "București",
  "county": "Ilfov", 
  "postalCode": "123456"
}' -H "Content-Type: application/json"
```

### 2. Testează Frontend
- Accesează https://luxbid.ro
- Testează înregistrarea
- Testează autentificarea

## ⚠️ Note importante

### Securitate
- Schimbă `JWT_SECRET` cu ceva foarte sigur
- Activează 2FA pe conturile Render și Vercel
- Monitorizează access logs

### Performance  
- Render Free tier: hibernate după 15 min inactivitate
- Vercel Free tier: bandwidth limitat
- Pentru trafic mare, upgrade la plan plătit

### Database
- Render PostgreSQL Free: 1GB storage
- Fă backup regulat
- Pentru production serios, consideră plan plătit

## 🎯 Rezultat final

După urmarea pașilor:
- ✅ **https://luxbid.ro** - frontend funcțional
- ✅ **https://www.luxbid.ro** - redirect către luxbid.ro  
- ✅ **Backend API** - funcțional pe Render
- ✅ **Database** - PostgreSQL hostat
- ✅ **SSL** - certificat automat
- ✅ **Auto-deploy** - la fiecare push pe GitHub

## 📞 Support

Pentru probleme cu deployment-ul:
1. Verifică logs în Render dashboard
2. Verifică Vercel functions logs  
3. Testează API endpoints individual
4. Verifică environment variables
