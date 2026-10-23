# 1. שלב הבנייה (Build Stage) - משתמש ב-Node 20 המעודכן
FROM node:20-alpine AS builder
WORKDIR /app




# קליטת ה-ARGS שמועברים מה-docker-compose.yml
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_GENERATION_CONFIG_API_KEY
ARG NEXT_PUBLIC_OPENWEATHER_API_KEY
ARG NEXT_PUBLIC_COUNTRYSTATECITY_API_KEY

# הזרקת משתני צד-הלקוח הציבוריים ישירות לבילד
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_GENERATION_CONFIG_API_KEY=$NEXT_PUBLIC_GOOGLE_GENERATION_CONFIG_API_KEY
ENV NEXT_PUBLIC_OPENWEATHER_API_KEY=$NEXT_PUBLIC_OPENWEATHER_API_KEY
ENV NEXT_PUBLIC_COUNTRYSTATECITY_API_KEY=$NEXT_PUBLIC_COUNTRYSTATECITY_API_KEY


# העתקת קבצי התלויות
COPY package.json package-lock.json ./
RUN npm ci


# העתקת שאר קבצי הפרויקט
COPY . .




# בניית האפליקציה ל-Production
RUN npm run build

# 2. שלב הרצת האפליקציה (Runner Stage)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# העתקת הקבצים החיוניים בלבד ממצב ה-Standalone של Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]