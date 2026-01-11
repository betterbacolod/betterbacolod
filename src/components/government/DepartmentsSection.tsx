import { Phone, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Department {
  name: string;
  head: string;
  phone?: string;
  email?: string;
}

interface DepartmentGroup {
  id: string;
  title: string;
  shortTitle: string;
  departments: Department[];
}

const departmentGroups: DepartmentGroup[] = [
  {
    id: 'executive',
    title: 'Executive Offices',
    shortTitle: 'Executive',
    departments: [
      {
        name: "City Mayor's Office",
        head: 'Hon. Greg Gasataya',
        phone: '(034) 435-5879',
        email: 'mayorggasataya@bacolodcity.gov.ph',
      },
      {
        name: 'City Administrator',
        head: 'Atty. Mark Steven Mayo',
        phone: '(034) 707-433-6191',
        email: 'cmo_admin@bacolodcity.gov.ph',
      },
      {
        name: 'City Legal Office',
        head: 'Atty. Karol Joseph P. Chiu',
        phone: '(034) 708-8208',
        email: 'clo@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'finance',
    title: 'Finance & Administration',
    shortTitle: 'Finance',
    departments: [
      {
        name: 'City Treasurer',
        head: 'Jose Maria Gecosala',
        phone: '(034) 435-0785',
        email: 'cto_admin@bacolodcity.gov.ph',
      },
      {
        name: 'City Assessor',
        head: 'Atty. Maphilindo Polvora',
        phone: '(034) 709-0353',
        email: 'cityassessor@bacolodcity.gov.ph',
      },
      {
        name: 'City Accountant',
        head: 'Atty. Jeremae Ann Ceriaco (Acting)',
        phone: '(034) 433-8286',
        email: 'accountant@bacolodcity.gov.ph',
      },
      {
        name: 'City Budget Office',
        head: 'Maria Imelda A. Williams',
        phone: '(034) 709-1766',
        email: 'citybudget@bacolodcity.gov.ph',
      },
      {
        name: 'Human Resource (HRMS)',
        head: 'Erman A. Aguirre',
        phone: '(034) 432-0664',
        email: 'hrms@bacolodcity.gov.ph',
      },
      {
        name: 'General Services (GSO)',
        head: 'Victor Espina (OIC)',
        phone: '(034) 435-6067',
        email: 'gso@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'planning',
    title: 'Planning & Economic',
    shortTitle: 'Planning',
    departments: [
      {
        name: 'City Planning (CPDO)',
        head: 'Mary Jean L. Ramos',
        phone: '(034) 434-3184',
        email: 'cpdo@bacolodcity.gov.ph',
      },
      {
        name: 'Economic Development (LEDIPO)',
        head: 'Mae Ferrer-Llamas, PhD',
        email: 'bcdledipoffice@bacolodcity.gov.ph',
      },
      {
        name: 'PESO',
        head: 'Mae Ferrer-Llamas, PhD',
        email: 'peso@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'health',
    title: 'Health & Social',
    shortTitle: 'Health',
    departments: [
      {
        name: 'City Health Office',
        head: 'Dr. Ma. Carmela P. Gensoli',
        phone: '(034) 431-3673',
        email: 'cho@bacolodcity.gov.ph',
      },
      {
        name: 'Social Services (DSSD)',
        head: 'Sally Abelarde (OIC)',
        phone: '(034) 432-1602',
        email: 'dssd@bacolodcity.gov.ph',
      },
      {
        name: 'Population Office',
        head: 'Mrs. Gilda F. Lluisma (Acting)',
        phone: '(034) 708-7366',
        email: 'popcom@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure & Environment',
    shortTitle: 'Infra',
    departments: [
      {
        name: 'City Engineer (CEO)',
        head: 'Engr. Luben Rafael D. Ceballos (OIC)',
        phone: '(034) 432-3098',
        email: 'ceo@bacolodcity.gov.ph',
      },
      {
        name: 'Building Official (OBO)',
        head: 'Isidro Sun, Jr. (OIC)',
        phone: '(034) 433-8286',
        email: 'obo@bacolodcity.gov.ph',
      },
      {
        name: 'Environment (ENRO)',
        head: 'Ramel Palalon (OIC)',
        phone: '0995-187-4725',
        email: 'enrobcd@bacolodcity.gov.ph',
      },
      {
        name: 'Public Services (DPS)',
        head: 'Ramel M. Palalon (OIC)',
        phone: '(034) 708-1755',
        email: 'dps@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Public Safety',
    shortTitle: 'Safety',
    departments: [
      {
        name: 'DRRMO',
        head: 'Dr. Anna Maria Laarni Pornan',
        phone: '(034) 432-3871',
        email: 'drrmobacolodcity@yahoo.com',
      },
      {
        name: 'Traffic (BTTMD)',
        head: 'Atty. Reuben Mikhail P. Sabig (OIC)',
        email: 'bttmd@bacolodcity.gov.ph',
      },
      {
        name: 'Bureau of Fire Protection',
        head: 'Chief Inspector Rodel Legaspi (OIC)',
        phone: '(034) 434-5022',
        email: 'bacolodcityfs@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'business',
    title: 'Business & Permits',
    shortTitle: 'Business',
    departments: [
      {
        name: 'Business Permits (BPLO)',
        head: 'Stela Rose J. Rayos',
        email: 'bplo@bacolodcity.gov.ph',
      },
      {
        name: 'Bids and Awards (BAC)',
        head: 'Atty. Hermilo B. Pa-oyon',
        phone: '(034) 707-0008',
        email: 'bac@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'agriculture',
    title: 'Agriculture & Veterinary',
    shortTitle: 'Agri',
    departments: [
      {
        name: 'City Agriculture',
        head: 'Maricar P. Quiro (OIC)',
        email: 'cityagri@bacolodcity.gov.ph',
      },
      {
        name: 'City Veterinary',
        head: 'Dr. Maria Agueda Trinidad F. dela Torre',
        phone: '0921-602-9525',
        email: 'cityvet@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'records',
    title: 'Records & Information',
    shortTitle: 'Records',
    departments: [
      {
        name: 'Civil Registrar',
        head: 'Atty. Hermilo Pao-yon',
        phone: '(034) 435-4790',
        email: 'lcr@bacolodcity.gov.ph',
      },
      {
        name: 'City Library',
        head: 'Greta K. Memoria',
        phone: '(034) 434-4448',
        email: 'citylib@bacolodcity.gov.ph',
      },
      {
        name: 'IT Services (MITCS)',
        head: 'Ramon C. de los Reyes (Acting)',
        phone: '(034) 435-4168',
        email: 'mitcs@bacolodcity.gov.ph',
      },
      {
        name: 'Public Information',
        head: 'Angelo Angolo (OIC)',
        email: 'pio@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'housing',
    title: 'Housing & Community',
    shortTitle: 'Housing',
    departments: [
      {
        name: 'Housing Authority (BHA)',
        head: 'Ma. Victoria Parreñas',
        phone: '(034) 433-7108',
        email: 'bha@bacolodcity.gov.ph',
      },
      {
        name: 'Cooperative & Livelihood (CCLDO)',
        head: 'Brenda C. Burdeos',
        phone: '(034) 469-3768',
        email: 'coop@bacolodcity.gov.ph',
      },
      {
        name: 'Tourism Office',
        head: 'Teresa Q. Manalili',
        phone: '(034) 469-6062',
        email: 'tourism@bacolodcity.gov.ph',
      },
    ],
  },
  {
    id: 'education',
    title: 'Education & Youth',
    shortTitle: 'Education',
    departments: [
      {
        name: 'Bacolod City College',
        head: 'Ma. Johanna Anne R. Bayoneta',
        phone: '(034) 707-7469',
        email: 'bcc@bacolodcity.gov.ph',
      },
      {
        name: 'Youth Development (BCYDO)',
        head: 'Carlo S. Descutido (OIC)',
        phone: '(034) 471-0308',
        email: 'bcydo6100@gmail.com',
      },
    ],
  },
];

interface Props {
  searchQuery?: string;
}

export default function DepartmentsSection({ searchQuery = '' }: Props) {
  const q = searchQuery.toLowerCase();
  const [activeSection, setActiveSection] = useState(departmentGroups[0].id);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredGroups = departmentGroups
    .map(group => ({
      ...group,
      departments: group.departments.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.head.toLowerCase().includes(q) ||
          d.email?.toLowerCase().includes(q)
      ),
    }))
    .filter(group => group.departments.length > 0);

  const groups = q ? filteredGroups : departmentGroups;

  useEffect(() => {
    if (q) return; // disable scroll spy when searching
    const container = contentRef.current;
    if (!container) return;
    const handleScroll = () => {
      const sections = container.querySelectorAll('section[id]');
      let current = departmentGroups[0].id;
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top <= containerRect.top + 100) current = section.id;
      });
      setActiveSection(current);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [q]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    const container = contentRef.current;
    if (element && container) {
      const offsetTop = element.offsetTop - container.offsetTop;
      container.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
    setActiveSection(id);
  };

  if (q && filteredGroups.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No departments found matching "{searchQuery}"
      </p>
    );
  }

  // Mobile: simple list
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return (
      <div className="space-y-6">
        {groups.map(group => (
          <section key={group.id}>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300 uppercase tracking-wide">
              {group.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.departments.map((dept, di) => (
                <div
                  key={di}
                  className="bg-white border border-gray-300 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                >
                  <h3 className="font-medium text-gray-900 text-sm">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{dept.head}</p>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-700">
                    {dept.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                        {dept.phone}
                      </p>
                    )}
                    {dept.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                        <a
                          href={`mailto:${dept.email}`}
                          className="hover:text-primary-600 break-all"
                        >
                          {dept.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          Source: bacolodcity.gov.ph/departments
        </p>
      </div>
    );
  }

  // Desktop: sidebar + scrollable content
  return (
    <div className="flex gap-4 h-[500px]">
      {!q && (
        <nav className="w-44 flex-shrink-0 border-r border-gray-200 pr-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Departments
          </p>
          <div className="space-y-0.5">
            {departmentGroups.map(group => (
              <button
                key={group.id}
                onClick={() => scrollTo(group.id)}
                className={`block w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                  activeSection === group.id
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>
        </nav>
      )}
      <div ref={contentRef} className="flex-1 overflow-y-auto pr-2 space-y-6">
        {groups.map(group => (
          <section key={group.id} id={group.id}>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300 uppercase tracking-wide sticky top-0 bg-white">
              {group.title}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {group.departments.map((dept, di) => (
                <div
                  key={di}
                  className="bg-white border border-gray-300 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                >
                  <h3 className="font-medium text-gray-900 text-sm">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{dept.head}</p>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-700">
                    {dept.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                        {dept.phone}
                      </p>
                    )}
                    {dept.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                        <a
                          href={`mailto:${dept.email}`}
                          className="hover:text-primary-600 break-all"
                        >
                          {dept.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          Source: bacolodcity.gov.ph/departments
        </p>
      </div>
    </div>
  );
}
