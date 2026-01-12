import type { NavigationItem } from '../types';
import { serviceCategories as servicesData } from './yamlLoader';

interface Subcategory {
  name: string;
  slug: string;
}

interface Category {
  category: string;
  slug: string;
  subcategories: Subcategory[];
}

export const mainNavigation: NavigationItem[] = [
  {
    label: 'Services',
    href: '/services',
    children: (servicesData.categories as Category[]).map((category) => ({
      label: category.category,
      href: `/services/${category.slug}`,
    })),
  },
  {
    label: 'Government',
    href: '/government',
  },
  {
    label: 'Transparency',
    href: '/transparency',
  },
];

export const footerNavigation = {
  mainSections: [
    {
      title: 'About',
      links: [
        { label: 'About BetterBacolod', href: '/about' },
        { label: 'Bacolod City Website', href: 'https://bacolodcity.gov.ph' },
        { label: 'Contact Us', href: '/about' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'All Services', href: '/services' },
        ...(servicesData.categories as Category[])
          .slice(0, 5)
          .map((category) => ({
            label: category.category,
            href: `/services/${category.slug}`,
          })),
      ],
    },
    {
      title: 'Government',
      links: [
        { label: 'City Officials', href: '/government' },
        { label: 'Departments', href: '/government' },
        { label: 'Barangays', href: '/government' },
        { label: 'Transparency', href: '/transparency' },
      ],
    },
  ],
  socialLinks: [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/BacolodStrongerTogether',
    },
  ],
};
