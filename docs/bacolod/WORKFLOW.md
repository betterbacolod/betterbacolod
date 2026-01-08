# Bacolod Project Workflow 🔄

## 📋 Simple Approach

**Focus: Get the site working with Bacolod content**

## 🎯 Phase 1: Scrape Key Info

Scrape what we need from bacolodcity.gov.ph:

- Contact info (phones, emails, addresses)
- Department names
- Service descriptions (general)

**Save to:** `docs/bacolod/BACOLOD-DATA-COLLECTION.md`

## 🎯 Phase 2: Update Site Content

Update the actual content files with Bacolod info:

- `content/services/health-services/*.md`
- `content/services/business/*.md`
- `content/services/education/*.md`
- etc.

**This is what matters - what shows on the site!**

## 📝 Git Workflow

**Only commit when:**

- ✅ Content files updated (what shows on site)
- ✅ Site tested and working
- ❌ Not every doc change
- ❌ Not every scraping session

```bash
# After updating actual content
git add content/services/
git commit -m "feat: Update health services with Bacolod info"

# Test first!
npm run dev
```

## 🔄 Work Process

1. **Scrape** - Get info from Bacolod site (save notes)
2. **Update** - Change content files
3. **Test** - Check localhost:5173
4. **Commit** - If it looks good
5. **Repeat** - Next category

## 🎯 What Matters

**Important:**

- ✅ Site content (what users see)
- ✅ Working links
- ✅ Correct info displayed

**Less Important:**

- ❌ Perfect documentation
- ❌ Tracking every scrape
- ❌ Detailed notes

## 📊 Success = Site Works

When done:

- Site shows Bacolod info
- No broken links
- Looks professional
- Ready to deploy

---

**Keep it simple. Focus on the site, not the docs.**

Last updated: January 8, 2026
