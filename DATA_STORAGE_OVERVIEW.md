# 📊 LuxBid - Unde sunt stocate toate datele?

## 🗄️ BAZA DE DATE PRINCIPALĂ

### **📍 Locația actuală:**
- **Serviciu:** Render.com PostgreSQL Database
- **Nume bază:** `luxbid-database` 
- **Plan:** FREE (90 zile gratuite)
- **URL:** Configurat prin `DATABASE_URL` în render.yaml

### **👥 Ce date sunt stocate în baza de date:**

#### **1. UTILIZATORI (`users` table)**
```sql
- ID-uri unice (cuid)
- Email-uri și parole (hash-uite)
- Date personale: nume, prenume, telefon
- Date persoane juridice: denumire, CUI, Reg. Com.
- Adrese complete de facturare
- Timestamps (createdAt, updatedAt)
```

#### **2. ANUNȚURI (`listings` table)**
```sql
- Titluri și descrieri complete
- Categorii (Ceasuri, Genți, Bijuterii, etc.)
- Prețuri în RON/EUR
- Status (ACTIVE, SOLD, REMOVED)
- Metadata: brand, model, an, condiție
- Link-uri către imagini
- Locații geografice
```

#### **3. OFERTE (`offers` table)**
```sql
- Sumele oferite
- Mesaje asociate ofertelor
- Status (PENDING, ACCEPTED, REJECTED)
- Legături cu utilizatori și anunțuri
```

#### **4. MESAJE (`messages` table)**
```sql
- Conținutul conversațiilor
- Legături sender/receiver
- Mesaje grupate pe oferte
```

---

## 🖼️ IMAGINILE ANUNȚURILOR

### **📍 Locația actuală:**
- **Serviciu:** Render.com File System (temporar)
- **Path:** `/uploads/listings/{listingId}/`
- **Format:** JPEG, PNG, WebP
- **Limit:** 15MB per fișier, max 10 imagini per anunț

### **⚠️ PROBLEMĂ IDENTIFICATĂ:**
**Imaginile se șterg la fiecare restart de server pe Render.com!**

```javascript
// Upload controller actual:
destination: '/uploads/listings/{listingId}/'
// ☝️ Acestea nu sunt persistente pe Render.com
```

### **🔧 SOLUȚIE RECOMANDATĂ:**
Migrarea către **cloud storage** permanent:

#### **Opțiuni recomandate:**
1. **AWS S3** - Cel mai popular, scalabil
2. **Cloudinary** - Optimizat pentru imagini, CDN inclus
3. **Google Cloud Storage** - Cost eficient
4. **DigitalOcean Spaces** - Alternative simplă

---

## 📊 LIMITELE PLANULUI GRATUIT ACTUAL

### **🆓 Render.com FREE Plan:**
- **Baza de date:** 90 zile gratuite, apoi șterge
- **Storage:** 1GB pentru PostgreSQL
- **File system:** NU persistente (se șterge la restart)
- **Backup:** NU incluse în planul gratuit

### **💡 RECOMANDĂRI:**

#### **Pentru producție serioasă:**
1. **Database:** Upgrade la plan Render plătit ($7/lună)
2. **Imagini:** Implementare cloud storage 
3. **Backup:** Setup backup automat zilnic

#### **Pentru development/testing:**
- Planul actual este OK temporar
- Mock data pentru imagini (URL-uri externe)

---

## 🔒 BACKUP ȘI SIGURANȚA DATELOR

### **📋 STATUS ACTUAL:**
- ❌ **Backup automat:** NU (doar pe plan plătit)
- ❌ **Imagini persistente:** NU (se pierd la restart)
- ✅ **SSL:** DA (automat prin Render.com)
- ✅ **Acces restrict:** DA (JWT authentication)

### **🛡️ RECOMANDĂRI PENTRU SIGURANȚĂ:**

#### **Urgent (în 30 zile):**
1. **Upgrade database** la plan plătit ($7/lună)
2. **Backup manual** săptămânal
3. **Implementare cloud storage** pentru imagini

#### **Pentru viitor:**
1. **Backup automat** zilnic
2. **Monitoring** database usage
3. **CDN** pentru imagini (performance)

---

## 💰 COSTURILE ESTIMATIVE

### **Setup recomandat pentru producție:**

| Serviciu | Cost/lună | Descriere |
|----------|-----------|-----------|
| Render Database | $7 | PostgreSQL persistentă |
| Cloudinary | $0-25 | Storage imagini + CDN |
| **TOTAL** | **$7-32** | **Per lună** |

### **Alternative buget:**
- Database: **DigitalOcean** ($4/lună)
- Storage: **AWS S3** (~$1-5/lună)
- **Total:** ~$5-10/lună

---

## 🚨 ACȚIUNI URGENTE NECESARE

### **În următoarele 30 de zile:**
1. ✅ **Backup manual** a bazei de date
2. 🔄 **Migrare storage imagini** către cloud
3. 📈 **Upgrade database** la plan persistent

### **Comenzi pentru backup manual:**
```bash
# Export database
pg_dump DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore din backup  
psql DATABASE_URL < backup_20241201.sql
```

---

## 📞 CONTACT PENTRU SETUP

Pentru implementarea soluțiilor de storage permanente și backup, este necesar:
1. **Cont AWS/Cloudinary** 
2. **Actualizare cod** pentru upload cloud
3. **Migrare imagini** existente
4. **Setup monitoring** și alerte

**Status actual:** ⚠️ **TEMPORAR** - OK pentru development, **NU pentru producție**
