export interface SeoGuide {
  path: string;
  title: string;
  heading: string;
  description: string;
  keywords: string;
  intro: string;
  primaryLinks: Array<{
    label: string;
    href: string;
    description: string;
  }>;
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
}

export const seoGuides: SeoGuide[] = [
  {
    path: '/bacolod-government-services',
    title: 'Bacolod Government Services',
    heading: 'Bacolod City Government Services',
    description:
      'Find Bacolod City government services, permits, documents, assistance programs, and local office information through BetterBacolod.',
    keywords:
      'Bacolod government services, Bacolod City services, Bacolod permits, Bacolod City Hall, Bacolod public services',
    intro:
      'Start here for common Bacolod City public services, from business permits and civil documents to health, education, transport, and social welfare support.',
    primaryLinks: [
      {
        label: 'All Services',
        href: '/services',
        description:
          'Browse every service category currently organized on BetterBacolod.',
      },
      {
        label: 'Legal & Civil Services',
        href: '/services/legal-civil',
        description:
          'Birth, marriage, death certificates, cedula, notarization, and legal assistance.',
      },
      {
        label: 'Business and Livelihood',
        href: '/services/business',
        description:
          'Business permits, renewals, local taxes, markets, trade fairs, and livelihood programs.',
      },
    ],
    relatedLinks: [
      { label: 'Bacolod City Government', href: '/government' },
      { label: 'Bacolod Barangays', href: '/bacolod-barangays' },
      { label: 'Search BetterBacolod', href: '/search' },
    ],
  },
  {
    path: '/bacolod-fuel-prices',
    title: 'Bacolod Fuel Prices',
    heading: 'Bacolod Fuel Prices',
    description:
      'Check Bacolod City fuel price trends and weekly DOE retail pump price reports for gasoline, diesel, and diesel plus.',
    keywords:
      'Bacolod fuel prices, Bacolod gas prices, Bacolod diesel price, DOE fuel prices Bacolod, Bacolod pump prices',
    intro:
      'BetterBacolod tracks weekly DOE Visayas fuel price reports for Bacolod City and summarizes recent price ranges by fuel type.',
    primaryLinks: [
      {
        label: 'Fuel Price Watch',
        href: '/transparency',
        description:
          'View the latest Bacolod fuel price trend chart and cheapest reported prices by fuel type.',
      },
      {
        label: 'Transparency Data',
        href: '/transparency',
        description:
          'Explore public data dashboards for Bacolod, including fuel prices and government project information.',
      },
    ],
    relatedLinks: [
      { label: 'Transportation Services', href: '/services/transportation' },
      {
        label: 'Public Transport Routes',
        href: '/transportation/check-public-transport-routes-and-schedules',
      },
      { label: 'DOE Oil Monitor', href: 'https://www.doe.gov.ph/oil-monitor' },
    ],
  },
  {
    path: '/bacolod-health-services',
    title: 'Bacolod Health Services',
    heading: 'Bacolod Health Services',
    description:
      'Find Bacolod health services, free check-ups, vaccines, maternal care, medicines, and local hospital information.',
    keywords:
      'Bacolod health services, Bacolod free check up, Bacolod vaccines, Bacolod hospital, Bacolod medicines',
    intro:
      'Use this guide to find health-related services in Bacolod City, including basic care, medicines, vaccination, maternal care, and local programs.',
    primaryLinks: [
      {
        label: 'Health Services',
        href: '/services/health-services',
        description:
          'Browse health service guides for check-ups, medicines, vaccines, hospitals, and local programs.',
      },
      {
        label: 'Free Check-ups, Medicines, and Vaccines',
        href: '/health-services/get-free-check-ups-basic-medicines-and-vaccines',
        description:
          'Learn where to ask about basic medicines, immunization, and free or low-cost check-ups.',
      },
      {
        label: 'Maternal Care and Child Immunization',
        href: '/health-services/access-maternal-care-and-child-immunization',
        description:
          'Find information on maternal care, prenatal services, and child immunization support.',
      },
    ],
    relatedLinks: [
      {
        label: 'Emergency Hotlines',
        href: '/public-safety/access-emergency-hotlines-and-disaster-response',
      },
      { label: 'Social Welfare Assistance', href: '/services/social-welfare' },
      { label: 'About Bacolod', href: '/about' },
    ],
  },
  {
    path: '/bacolod-transportation',
    title: 'Bacolod Transportation',
    heading: 'Bacolod Transportation',
    description:
      'Find Bacolod transportation services, public routes, airport information, traffic violations, parking permits, and franchise guides.',
    keywords:
      'Bacolod transportation, Bacolod jeepney routes, Bacolod public transport, Bacolod traffic violations, Bacolod airport',
    intro:
      'This guide groups Bacolod transport information for commuters, drivers, operators, and residents looking for route and permit details.',
    primaryLinks: [
      {
        label: 'Transportation Services',
        href: '/services/transportation',
        description:
          'Browse transport routes, permits, parking, traffic violations, and airport information.',
      },
      {
        label: 'Public Transport Routes & Schedules',
        href: '/transportation/check-public-transport-routes-and-schedules',
        description:
          'Find public route and commute information currently collected for Bacolod.',
      },
      {
        label: 'Bacolod-Silay International Airport',
        href: '/transportation/bacolod-silay-airport',
        description:
          'Airport guide, flight information, and transportation options to and from Bacolod.',
      },
    ],
    relatedLinks: [
      { label: 'Fuel Price Watch', href: '/bacolod-fuel-prices' },
      {
        label: 'Traffic Violations',
        href: '/transportation/report-traffic-violations-and-check-penalties',
      },
      {
        label: 'Parking Zones & Permits',
        href: '/transportation/find-parking-zones-and-apply-for-parking-permits',
      },
    ],
  },
  {
    path: '/bacolod-scholarships',
    title: 'Bacolod Scholarships',
    heading: 'Bacolod Scholarships and Education Support',
    description:
      'Find Bacolod scholarship information, education assistance, daycare and preschool programs, and school support services.',
    keywords:
      'Bacolod scholarships, Bacolod education assistance, Bacolod PESO scholarship, Bacolod daycare, Bacolod schools',
    intro:
      'Use this guide to find Bacolod education support, local scholarship information, student programs, daycare, and school directories.',
    primaryLinks: [
      {
        label: 'Education Services',
        href: '/services/education',
        description:
          'Browse education-related services for scholarships, daycare, school support, and student activities.',
      },
      {
        label: 'Local Scholarships',
        href: '/education/apply-for-local-scholarships',
        description:
          'Learn about Bacolod scholarship information and education support options.',
      },
      {
        label: 'Schools Directory',
        href: '/education/schools-directory',
        description:
          'Find public and private schools in Bacolod City with basic directory information.',
      },
    ],
    relatedLinks: [
      {
        label: 'Daycare & Preschool',
        href: '/education/enroll-children-in-lgu-daycare-or-preschool-programs',
      },
      {
        label: 'Educational Support Programs',
        href: '/education/access-educational-support-programs-from-the-lgu',
      },
      { label: 'Government Services', href: '/bacolod-government-services' },
    ],
  },
  {
    path: '/bacolod-barangays',
    title: 'Bacolod Barangays',
    heading: 'Bacolod Barangays',
    description:
      'Find Bacolod barangay information, local government contacts, barangay services, and links to city government resources.',
    keywords:
      'Bacolod barangays, Bacolod barangay list, Bacolod barangay hall, Bacolod barangay clearance, Bacolod City barangays',
    intro:
      'Bacolod City has 61 barangays. This guide points residents to barangay information, local services, and related city government resources.',
    primaryLinks: [
      {
        label: 'Barangays Directory',
        href: '/government?section=barangays',
        description:
          'View Bacolod barangays and available local contact information.',
      },
      {
        label: 'Bacolod City Government',
        href: '/government',
        description:
          'Find city officials, departments, and barangays in one government directory.',
      },
      {
        label: 'Barangay Clearance and Business Permits',
        href: '/business/apply-for-barangay-clearance-and-mayors-business-permits',
        description:
          'See requirements and steps connected to barangay clearance and business permit applications.',
      },
    ],
    relatedLinks: [
      { label: 'All Services', href: '/services' },
      { label: 'Legal & Civil Services', href: '/services/legal-civil' },
      { label: 'Public Safety', href: '/services/public-safety' },
    ],
  },
];
