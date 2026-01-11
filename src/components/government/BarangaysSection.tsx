import { Phone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Barangay {
  name: string;
  captain: string;
  phone?: string;
}

interface BarangayGroup {
  id: string;
  title: string;
  barangays: Barangay[];
}

const barangayGroups: BarangayGroup[] = [
  {
    id: 'urban-1-10',
    title: 'Brgy. 1-10',
    barangays: [
      { name: 'Barangay 1', captain: 'Cesar B. Rellos, Jr.' },
      { name: 'Barangay 2', captain: 'Imelda J. Banguanga', phone: '431-1986' },
      { name: 'Barangay 3', captain: 'Leonidas S. Asan', phone: '709-0439' },
      { name: 'Barangay 4', captain: 'Antonio B. Ongsinco', phone: '703-2051' },
      { name: 'Barangay 5', captain: 'Rosanna C. Lamanosa', phone: '433-3112' },
      {
        name: 'Barangay 6',
        captain: 'Arnaldo T. Almendras',
        phone: '434-5851',
      },
      { name: 'Barangay 7', captain: 'Hercy S. Sibug' },
      { name: 'Barangay 8', captain: 'Evelyn D. Donesa', phone: '433-2402' },
      { name: 'Barangay 9', captain: 'Anthony P. Quilla', phone: '708-0171' },
      { name: 'Barangay 10', captain: 'Melvin L. Bravo' },
    ],
  },
  {
    id: 'urban-11-20',
    title: 'Brgy. 11-20',
    barangays: [
      { name: 'Barangay 11', captain: 'Evelyn C. Ta-asan', phone: '708-4992' },
      {
        name: 'Barangay 12',
        captain: 'Ely C. Alcantara, Jr.',
        phone: '435-9006',
      },
      {
        name: 'Barangay 13',
        captain: 'Tanya T. Familiaran',
        phone: '433-5794',
      },
      { name: 'Barangay 14', captain: 'Carl John P. Magno', phone: '434-8797' },
      {
        name: 'Barangay 15',
        captain: 'Anthony Jose Loth Alfredo I. Ayco',
        phone: '432-3206',
      },
      { name: 'Barangay 16', captain: 'Jason L. Ligaya' },
      {
        name: 'Barangay 17',
        captain: 'Rogelio A. Pabiania, Jr.',
        phone: '709-8082',
      },
      { name: 'Barangay 18', captain: 'Madeline B. Diaz', phone: '441-3369' },
      { name: 'Barangay 19', captain: 'Jim Piramo', phone: '435-2200' },
      {
        name: 'Barangay 20',
        captain: 'Mark Lester M. Abancio',
        phone: '707-9460',
      },
    ],
  },
  {
    id: 'urban-21-30',
    title: 'Brgy. 21-30',
    barangays: [
      {
        name: 'Barangay 21',
        captain: 'Azucena L. Estrella',
        phone: '431-1546',
      },
      { name: 'Barangay 22', captain: 'Diosdado C. Mayo' },
      { name: 'Barangay 23', captain: 'Johnny L. Esmil' },
      {
        name: 'Barangay 24',
        captain: 'Lope A. Ledesma, Jr.',
        phone: '707-0482',
      },
      {
        name: 'Barangay 25',
        captain: 'Joseph Anthony F. Ortillo',
        phone: '433-4475',
      },
      { name: 'Barangay 26', captain: 'Jhun Mharby D. Orola' },
      { name: 'Barangay 27', captain: 'Freeman N. Madalag', phone: '431-0716' },
      { name: 'Barangay 28', captain: 'Francisco C. Ilon III' },
      { name: 'Barangay 29', captain: 'Leonard J. Pascua', phone: '700-9769' },
      {
        name: 'Barangay 30',
        captain: 'Jan Mark C. Petierre',
        phone: '435-3774',
      },
    ],
  },
  {
    id: 'urban-31-41',
    title: 'Brgy. 31-41',
    barangays: [
      {
        name: 'Barangay 31',
        captain: 'German T. Bullolaza, Jr.',
        phone: '441-1525',
      },
      { name: 'Barangay 32', captain: 'John Nico E. Yap', phone: '704-6746' },
      { name: 'Barangay 33', captain: 'Karen J. Pineda', phone: '435-3233' },
      { name: 'Barangay 34', captain: 'Teodoro H. Yulo', phone: '435-8137' },
      {
        name: 'Barangay 35',
        captain: 'Ruben James H. Miranda',
        phone: '436-5414',
      },
      { name: 'Barangay 36', captain: 'Joemarie F. Biasca', phone: '434-3785' },
      { name: 'Barangay 37', captain: 'Hernani Jalandoon' },
      { name: 'Barangay 38', captain: 'Gener B. Agpalo' },
      { name: 'Barangay 39', captain: 'Dante S. Danoy' },
      {
        name: 'Barangay 40',
        captain: 'Elmer T. Villanueva',
        phone: '435-1815',
      },
      { name: 'Barangay 41', captain: 'Kevin C. Rivera' },
    ],
  },
  {
    id: 'named-a-g',
    title: 'A - G',
    barangays: [
      { name: 'Alangilan', captain: 'Roy C. Retiza', phone: '708-9458' },
      { name: 'Alijis', captain: 'Deogracias De La Vega', phone: '432-3908' },
      { name: 'Banago', captain: 'Arnel E. Benjamin', phone: '435-0453' },
      { name: 'Bata', captain: 'Remus G. Abaring', phone: '458-4393' },
      { name: 'Cabug', captain: 'Jennifer T. Pintucan', phone: '458-2195' },
      { name: 'Estefania', captain: 'Jerry P. Tingson', phone: '433-5108' },
      { name: 'Felisa', captain: 'Francisco L. Hilado', phone: '460-1803' },
      { name: 'Granada', captain: 'Armando M. Vito', phone: '435-2286' },
    ],
  },
  {
    id: 'named-h-p',
    title: 'H - P',
    barangays: [
      { name: 'Handumanan', captain: 'Ma. Febe F. Legaspi', phone: '445-1711' },
      { name: 'Mandalagan', captain: 'Paul B. Anieve', phone: '709-1963' },
      {
        name: 'Mansilingan',
        captain: 'France Hughanne R. Tionko',
        phone: '446-0421',
      },
      { name: 'Montevista', captain: 'Glo Ann T. Tambasen', phone: '434-0563' },
      { name: 'Pahanocoy', captain: 'Yolanda T. Noble', phone: '444-1478' },
      {
        name: 'Punta Taytay',
        captain: 'Cliff Orando C. Palma',
        phone: '444-0130',
      },
    ],
  },
  {
    id: 'named-s-v',
    title: 'S - V',
    barangays: [
      {
        name: 'Singcang-Airport',
        captain: 'Atty. Caesar Z. Distrito',
        phone: '434-5649',
      },
      { name: 'Sum-ag', captain: 'Rodney D. Carmona', phone: '704-2708' },
      {
        name: 'Taculing',
        captain: 'Lady Gles Gonzales-Pallen',
        phone: '434-8658',
      },
      { name: 'Tangub', captain: 'Noli B. Villarosa', phone: '444-0052' },
      { name: 'Villamonte', captain: 'Rommel T. Flores', phone: '707-0157' },
      {
        name: 'Vista Alegre',
        captain: 'Jose Ma. Leandro Norberto L. De Leon',
        phone: '476-6197',
      },
    ],
  },
];

interface Props {
  searchQuery?: string;
}

export default function BarangaysSection({ searchQuery = '' }: Props) {
  const q = searchQuery.toLowerCase();
  const [activeSection, setActiveSection] = useState(barangayGroups[0].id);
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredGroups = barangayGroups
    .map(group => ({
      ...group,
      barangays: group.barangays.filter(
        b =>
          b.name.toLowerCase().includes(q) ||
          b.captain.toLowerCase().includes(q)
      ),
    }))
    .filter(group => group.barangays.length > 0);

  const groups = q ? filteredGroups : barangayGroups;

  useEffect(() => {
    if (q) return;
    const container = contentRef.current;
    if (!container) return;
    const handleScroll = () => {
      const sections = container.querySelectorAll('section[id]');
      let current = barangayGroups[0].id;
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
        No barangays found matching "{searchQuery}"
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
            <div className="grid grid-cols-2 gap-3">
              {group.barangays.map((brgy, bi) => (
                <div
                  key={bi}
                  className="bg-white border border-gray-300 rounded-lg p-3 hover:border-primary-400 hover:shadow-sm transition-all"
                >
                  <h3 className="font-medium text-gray-900 text-sm">
                    {brgy.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-tight">
                    {brgy.captain}
                  </p>
                  {brgy.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-700 mt-2">
                      <Phone className="h-3 w-3 text-primary-500" />
                      {brgy.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          All phone numbers use area code (034). Source:
          bacolodcity.gov.ph/barangay-officials
        </p>
      </div>
    );
  }

  // Desktop: sidebar + scrollable content
  return (
    <div className="flex gap-4 h-[500px]">
      {!q && (
        <nav className="w-36 flex-shrink-0 border-r border-gray-200 pr-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            61 Barangays
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wide mt-3 mb-1">
            Urban
          </p>
          {barangayGroups.slice(0, 4).map(group => (
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
          <p className="text-xs text-gray-400 uppercase tracking-wide mt-3 mb-1">
            Named
          </p>
          {barangayGroups.slice(4).map(group => (
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
        </nav>
      )}
      <div ref={contentRef} className="flex-1 overflow-y-auto pr-2 space-y-6">
        {groups.map(group => (
          <section key={group.id} id={group.id}>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300 uppercase tracking-wide sticky top-0 bg-white">
              {group.title}
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {group.barangays.map((brgy, bi) => (
                <div
                  key={bi}
                  className="bg-white border border-gray-300 rounded-lg p-3 hover:border-primary-400 hover:shadow-sm transition-all"
                >
                  <h3 className="font-medium text-gray-900 text-sm">
                    {brgy.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-tight">
                    {brgy.captain}
                  </p>
                  {brgy.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-700 mt-2">
                      <Phone className="h-3 w-3 text-primary-500" />
                      {brgy.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          All phone numbers use area code (034). Source:
          bacolodcity.gov.ph/barangay-officials
        </p>
      </div>
    </div>
  );
}
