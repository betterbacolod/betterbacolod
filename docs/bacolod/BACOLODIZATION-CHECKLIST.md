# Bacolodization Checklist 🎯

## ✅ Completed

- [x] Create Bacolod customization guide
- [x] Collect data from bacolodcity.gov.ph
- [x] Create `.env.local` with Bacolod info
- [x] Add `.kiro/` to gitignore
- [x] Replace "Lapu-Lapu" with "Bacolod" in all content (98 instances, 15 files)
- [x] Git branch created: `bacolod-customization`
- [x] Commits made and tracked

## 🚧 In Progress

- [ ] Test on localhost:5173 to verify changes

## 📋 To Do

### Content Updates

- [ ] Update specific office names (if needed)
- [ ] Update phone numbers in content (if needed)
- [ ] Update addresses in content (if needed)
- [ ] Remove/update Lapu-Lapu specific links (DepEd, etc.)

### Branding

- [ ] Replace logo: `public/logo.svg`
- [ ] Update favicon: `public/favicon.ico`
- [ ] Update colors in `tailwind.config.js` (optional)
- [ ] Create Open Graph image: `public/og-image.jpg`

### Configuration

- [ ] Review `src/data/services.yaml` categories
- [ ] Update navigation if needed
- [ ] Update footer information

### Testing

- [ ] Test all pages load correctly
- [ ] Test navigation works
- [ ] Test mobile responsiveness
- [ ] Verify no broken links
- [ ] Check for remaining Lapu-Lapu references

### Deployment

- [ ] Push to GitHub: `git push origin bacolod-customization`
- [ ] Create pull request (optional)
- [ ] Merge to main
- [ ] Deploy to Vercel/hosting

## 📊 Progress

**Overall: 30% Complete**

- Setup & Config: ✅ 100%
- Content Replacement: ✅ 100%
- Branding: ⏳ 0%
- Testing: ⏳ 0%
- Deployment: ⏳ 0%

## 🎯 Next Steps

1. **Test the site** - Run `npm run dev` and check localhost:5173
2. **Update branding** - Logo, colors, favicon
3. **Final review** - Check for any remaining issues
4. **Deploy** - Push to production

## 📁 Project Structure

```
docs/bacolod/
├── README.md                           # This folder's guide
├── BACOLODIZATION-CHECKLIST.md        # 📋 THE BIBLE - Our todo list
├── BACOLOD-CUSTOMIZATION-GUIDE.md     # How to customize
└── BACOLOD-DATA-COLLECTION.md         # Bacolod data
```

## 🤖 For Kiro CLI

**Always reference `docs/bacolod/` for:**

- Current progress (BACOLODIZATION-CHECKLIST.md)
- Customization steps (BACOLOD-CUSTOMIZATION-GUIDE.md)
- Bacolod data (BACOLOD-DATA-COLLECTION.md)

**Don't hallucinate - check the docs first!**

---

Last updated: January 8, 2026
