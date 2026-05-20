# LinguaMaster

Zamonaviy ingliz-o'zbek aqlli lug'at va so'zlarni yodlash ilovasi. 
LinguaMaster yordamida har kuni yangi so'zlarni kiritib, ularning AI yordamida aniq ta'rifi hamda misollarini oson o'zlashtirishingiz mumkin. Kiritilgan so'zlarni interaktiv "yodlash" rejimi orqali xotirangizda tezroq mustahkamlang!

## 🚀 Imkoniyatlar

- **Asosiy panel (Dashboard):** Umumnazorat va statistika (jami so'zlar, o'zlashtirilgan, o'rganilayotganlar), progressni kuzatib borish imkoniyati.
- **So'z Qo'shish & AI:** So'z kiritilganda AI (Gemini tipidagi) moslamasi yordamida o'zbekcha tarjimasi, inglizcha izohi va misolni avtomatik tarzda boyitish.
- **Yodlash rejimi (Flashcards):** So'zlarni 3D interaktiv kartalar va chiroyli animatsiyalar orqali yodlash. So'z talaffuzini tinglash funksiyasi.
- **Lug'at ro'yxati:** Kiritilgan barcha so'zlarni qidirish, ro'yxatdan o'chirish va holatini ko'rish imkoniyati.
- **Dark / Light Mode:** Tungi va kunduzgi rejimda muammosiz ishlash imkoniyati, zamonaviy UI.
- **Ovozli talaffuz:** Web Speech API orqali so'zlarni asil holatda qanday o'qilishini tinglash.

## 🛠 Texnologiyalar

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animatsiyalar:** [Motion (Framer Motion)](https://motion.dev/)
- **AI Integratsiya:** Google Gen AI (Gemini 2.5 Flash)
- **Ikonkalar:** [Lucide React](https://lucide.dev/)

## ⚙️ O'rnatish

1. Repozitoriyni yuklab oling:
   ```bash
   git clone https://github.com/your-username/linguamaster.git
   cd linguamaster
   ```

2. Paketlarni o'rnating:
   ```bash
   npm install
   ```

3. Atrof-muhit o'zgaruvchilarini (`.env`) sozlang:
   Loyihaning ildiz qismida `.env` yoki `.env.local` faylini yarating va quyidagini qo'shing:
   ```env
   GEMINI_API_KEY=sizning_api_kodu_shu_yerda
   ```

4. Dasturni ishga tushiring:
   ```bash
   npm run dev
   ```

Ilova brauzerda `http://localhost:3000` manzilida ishga tushadi.

## 🤖 GitHub Actions (CI)

Loyiha uchun GitHub Actions to'liq sozlangan. Har bir `push` yoki `pull request` amalga oshirilganda:
- Kodlar xatosiz ekanligi tekshiriladi
- Loyiha Node.js muhitida muvaffaqiyatli 'build' olinishi sinovdan o'tkaziladi.

## 👨‍💻 Muallif

Loyiha muallifi: **Sanjarbek Otabekov**

## 📄 Litsenziya

Bu loyiha shaxsiy va tajriba maqsadlarida ishlab chiqilgan.
