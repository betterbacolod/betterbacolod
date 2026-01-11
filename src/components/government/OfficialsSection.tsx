import { Phone, Mail, MapPin } from 'lucide-react';

const executives = [
  {
    role: 'Mayor',
    name: 'Hon. Greg Gasataya',
    desc: '44th Mayor of Bacolod City',
    phone: '(034) 434-9122',
    email: 'mayorggasataya@bacolodcity.gov.ph',
  },
  {
    role: 'Vice Mayor',
    name: 'Hon. Claudio "Jojo" Puentevella',
    desc: 'Presiding Officer, Sangguniang Panlungsod',
    phone: '(034) 703-1284',
  },
  {
    role: 'Congressman',
    name: 'Hon. Alfredo "Albee" B. Benitez',
    desc: 'Bacolod City Lone District',
    location: 'House of Representatives, QC',
  },
];

const councilors = [
  {
    name: 'Hon. Atty. Caesar Distrito',
    committees: [
      'Human Resource and Development',
      'Government Assets',
      'Persons with Disability Affairs',
      'Ways and Means',
    ],
  },
  { name: 'Hon. Israel P. Salanga', committees: ['Government Assets'] },
  {
    name: 'Hon. Em L. Ang',
    committees: ['Health and Sanitation', 'Culture and Arts'],
  },
  {
    name: 'Hon. Jude Thaddeus Sayson',
    committees: [
      'Agriculture and Agrarian Concerns',
      'Appropriation and Finance',
      'Cooperatives and Livelihood Programs',
    ],
  },
  {
    name: 'Hon. Al Victor A. Espino',
    committees: [
      'Education',
      'Laws, Ordinances and Good Governance',
      'Urban Planning, Development, and Basic Facilities',
    ],
  },
  {
    name: 'Hon. Atty. Dindo C. Ramos',
    committees: [
      'Transportation and Traffic',
      'Urban Poor, Housing and Resettlement',
    ],
  },
  {
    name: 'Hon. Bobby Rojas',
    committees: ['Energy and Public Utilities', 'Trade, Commerce and Industry'],
  },
  {
    name: 'Hon. Jason Villarosa',
    committees: [
      'Tourism and Local, National & International Cooperation',
      'Information and Communication Technology',
    ],
  },
  {
    name: 'Hon. Homer Bais',
    committees: [
      'Slaughterhouse/Veterinary Services',
      'Environment and Ecology',
    ],
  },
  {
    name: 'Hon. Wilson Gamboa Jr.',
    committees: ['Veterans and History', 'Human Rights'],
  },
  {
    name: 'Hon. Celia Flor',
    committees: [
      'Markets',
      'Senior Citizens',
      'Women, Gender, Family and Childcare',
    ],
  },
  {
    name: 'Hon. Psyche Marie "Pao" Sy',
    committees: [
      'Public Works and General Services',
      'Police, Security and Jail',
      'Fire and Disaster Management',
    ],
  },
];

interface Props {
  searchQuery?: string;
}

export default function OfficialsSection({ searchQuery = '' }: Props) {
  const q = searchQuery.toLowerCase();

  const filteredExecs = executives.filter(
    e =>
      e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.desc.toLowerCase().includes(q)
  );

  const filteredCouncilors = councilors.filter(
    c =>
      c.name.toLowerCase().includes(q) ||
      c.committees.some(com => com.toLowerCase().includes(q))
  );

  const showExec = !q || filteredExecs.length > 0;
  const showLeg = !q || filteredCouncilors.length > 0;

  if (q && filteredExecs.length === 0 && filteredCouncilors.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No officials found matching "{searchQuery}"
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {showExec && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300 uppercase tracking-wide">
            Executive Branch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(q ? filteredExecs : executives).map((e, i) => (
              <div
                key={i}
                className="bg-white border border-gray-300 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
              >
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                  {e.role}
                </p>
                <h3 className="text-base font-semibold text-gray-900 mt-1">
                  {e.name}
                </h3>
                <p className="text-sm text-gray-600">{e.desc}</p>
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  {e.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary-500" />
                      {e.phone}
                    </p>
                  )}
                  {e.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary-500" />
                      {e.email}
                    </p>
                  )}
                  {e.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary-500" />
                      {e.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showLeg && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300 uppercase tracking-wide">
            Legislative Branch
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Sangguniang Panlungsod — 12 City Councilors
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(q ? filteredCouncilors : councilors).map((c, i) => (
              <div
                key={i}
                className="bg-white border border-gray-300 rounded-lg p-3 hover:border-primary-400 hover:shadow-sm transition-all"
              >
                <h4 className="font-medium text-gray-900 text-sm">{c.name}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {c.committees.join(' • ')}
                </p>
              </div>
            ))}
          </div>
          {!q && (
            <div className="mt-4 bg-gray-100 rounded-lg p-3 text-sm">
              <span className="font-medium text-gray-800">SP Secretary:</span>{' '}
              <span className="text-gray-700">Atty. Vicente Petierre III</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-700">(034) 431-3603</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-700">sprecordsbacolod@gmail.com</span>
            </div>
          )}
        </section>
      )}

      <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
        Source: bacolodcity.gov.ph/city-councilors
      </p>
    </div>
  );
}
