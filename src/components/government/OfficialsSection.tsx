import { Phone, Mail, MapPin } from 'lucide-react';

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

export default function OfficialsSection() {
  return (
    <div className="space-y-8">
      {/* Executive Branch */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Executive Branch
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mayor */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              Mayor
            </p>
            <h3 className="text-base font-semibold text-gray-900 mt-1">
              Hon. Greg Gasataya
            </h3>
            <p className="text-sm text-gray-500">44th Mayor of Bacolod City</p>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                (034) 434-9122
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                mayorggasataya@bacolodcity.gov.ph
              </p>
            </div>
          </div>

          {/* Vice Mayor */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              Vice Mayor
            </p>
            <h3 className="text-base font-semibold text-gray-900 mt-1">
              Hon. Claudio "Jojo" Puentevella
            </h3>
            <p className="text-sm text-gray-500">
              Presiding Officer, Sangguniang Panlungsod
            </p>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                (034) 703-1284
              </p>
            </div>
          </div>

          {/* Congressman */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              Congressman
            </p>
            <h3 className="text-base font-semibold text-gray-900 mt-1">
              Hon. Alfredo "Albee" B. Benitez
            </h3>
            <p className="text-sm text-gray-500">Bacolod City Lone District</p>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                House of Representatives, QC
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legislative Branch */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-1 pb-2 border-b border-gray-200">
          Legislative Branch
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Sangguniang Panlungsod — 12 City Councilors
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {councilors.map((c, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
            >
              <h4 className="font-medium text-gray-900 text-sm">{c.name}</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {c.committees.join(' • ')}
              </p>
            </div>
          ))}
        </div>

        {/* SP Secretary */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
          <span className="font-medium text-gray-700">SP Secretary:</span>{' '}
          <span className="text-gray-600">Atty. Vicente Petierre III</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-600">(034) 431-3603</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-600">sprecordsbacolod@gmail.com</span>
        </div>
      </section>

      <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
        Source: bacolodcity.gov.ph/city-councilors
      </p>
    </div>
  );
}
