# Bacolod City Website - Project Status

**Last Updated:** January 12, 2026

---

## ✅ COMPLETED

### Services Section (100%)

- 45 service files across 12 categories
- All Bacolod-specific data from bacolodcity.gov.ph
- Working routing and category cards

### Government Section (100%)

- **Officials**: Mayor, Vice Mayor, Congressman, 12 Councilors with committees
- **Departments**: 35 departments in 11 functional groups with scroll spy
- **Barangays**: All 61 barangays with captain names and phone numbers
- Mobile: List tiles | Desktop: Card grid with sidebar
- Search functionality in all sections

### Transparency Section (100%)

- **Flood Control**: 39 DPWH projects with filterable table (2021-2024)
- **Budget**: Region VI GAA data with bar chart (₱169B-₱192B)
- **Procurement**: Links to PhilGEPS Negros Occidental
- **Infrastructure**: Links to DIME filtered for Bacolod
- **Audit**: COA and FOI links
- Source attribution + sumbongsapangulo.ph reporting link

### Navigation

- Services, Government, Transparency in main nav
- About page placeholder exists

---

## ⏳ REMAINING / NICE TO HAVE

### About Page

- Currently placeholder at `/about`
- Could add: City history, vision/mission, city seal meaning

### Minor Polish

- Update index.yaml descriptions (replace "your LGU" with "Bacolod City")
- Add structured data (JSON-LD) for SEO
- Add more photos/images

### Future Enhancements

- News/Announcements section
- Events calendar (MassKara Festival, etc.)
- Emergency alerts integration
- Multi-language support (Hiligaynon)

---

## 📊 Data Sources

| Section        | Source                                | Status         |
| -------------- | ------------------------------------- | -------------- |
| Services       | bacolodcity.gov.ph                    | ✅ Complete    |
| Officials      | bacolodcity.gov.ph/city-councilors    | ✅ Complete    |
| Departments    | bacolodcity.gov.ph/departments        | ✅ Complete    |
| Barangays      | bacolodcity.gov.ph/barangay-officials | ✅ Complete    |
| Flood Control  | DPWH via BetterGov.ph                 | ✅ 39 projects |
| Budget         | DBM GAA via BetterGov.ph              | ✅ 2020-2025   |
| Procurement    | PhilGEPS                              | ✅ Links       |
| Infrastructure | DPWH DIME                             | ✅ Links       |

---

## 🔧 Technical Stack

- React + TypeScript + Vite
- Tailwind CSS with primary blue theme
- YAML-based content management
- Responsive design (mobile-first)
- SEO optimized with react-helmet

---

## 📁 Key Files

```
src/
├── pages/
│   ├── Government.tsx      # Officials, Departments, Barangays
│   ├── Transparency.tsx    # Flood control, Budget, Procurement
│   └── Services.tsx        # 12 service categories
├── components/
│   ├── government/         # Section components with scroll spy
│   └── transparency/       # FloodControlSection with filters
└── data/
    ├── transparency/       # flood-control.json, budget-region6.json
    └── government.yaml     # Category definitions
```

---

**Report Generated:** January 12, 2026
