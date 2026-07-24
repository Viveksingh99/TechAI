/**
 * Frontend mock mode (no backend required)
 * ========================================
 *
 * Enabled when:
 *   NEXT_PUBLIC_USE_MOCK=true
 *
 * What this folder does:
 * - Serves dummy data for every dashboard / panel API call
 * - Lets you log in with demo accounts (any password ≥ 6 chars for listed emails)
 * - Mutations update an in-memory store until page refresh
 *
 * Demo logins:
 *   admin@techai.com       / Admin@12345     → Admin
 *   sales@techai.com       / Sales@12345     → CRM
 *   hr@techai.com          / Hr@12345        → HR
 *   pm@techai.com          / Manager@12345   → Project Management
 *   developer@techai.com   / Developer@12345 → Employee
 *   client@techai.com      / Client@12345    → Client portal
 *
 * When backend is ready:
 * 1. Set NEXT_PUBLIC_USE_MOCK=false (or remove the line) in `.env.local`
 * 2. Point NEXT_PUBLIC_API_URL at your API
 * 3. Delete this entire `src/mock` folder
 * 4. Marketing site content in `src/data/` can stay (static SEO pages)
 */
