import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Phone,
  Smile,
  Users,
} from 'lucide-react';
import SEO from '../components/SEO';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';

const About: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Population (2024)', value: '624,787' },
    { icon: MapPin, label: 'Land Area', value: '160.71 km²' },
    { icon: Building2, label: 'Barangays', value: '61' },
    { icon: Calendar, label: 'Cityhood', value: '1938' },
  ];

  const hotlines = [
    { name: 'Emergency', number: '911' },
    { name: 'CDRRMO (24/7)', number: '(034) 432-3871' },
    { name: 'City Hall', number: '(034) 434-9122' },
    { name: 'PNP Bacolod', number: '(034) 434-8873' },
  ];

  return (
    <>
      <SEO
        title="About"
        description="Learn about Bacolod City - the City of Smiles, home of the MassKara Festival."
        keywords="Bacolod City, City of Smiles, MassKara Festival, Negros Occidental"
      />
      <Section className="min-h-[60vh]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-primary-600 mb-2">
              <Smile className="h-5 w-5" />
              <span className="text-sm font-medium">City of Smiles</span>
            </div>
            <Heading level={2}>Bacolod City</Heading>
            <Text className="text-gray-600 max-w-2xl mx-auto mt-2">
              Capital of Negros Occidental · Negros Island Region
            </Text>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border rounded-lg p-4 text-center"
              >
                <stat.icon className="h-5 w-5 text-primary-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* About Content */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">About the City</h3>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                Bacolod is a highly urbanized city on the northwestern coast of
                Negros Island, facing the Guimaras Strait. Founded in 1755, it
                became a city in 1938 and serves as the capital of Negros
                Occidental.
              </p>
              <p>
                Known as the "City of Smiles," Bacolod hosts the MassKara
                Festival every October—a celebration born in 1980 to uplift
                spirits during the sugar crisis and the MV Don Juan tragedy. The
                city is the commercial hub of Negros Island and famous for
                piaya, chicken inasal, and napoleones.
              </p>
            </div>
          </div>

          {/* Hotlines */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Emergency Hotlines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hotlines.map((h) => (
                <a
                  key={h.name}
                  href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="h-4 w-4 text-primary-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {h.name}
                    </div>
                    <div className="text-sm text-primary-600">{h.number}</div>
                  </div>
                </a>
              ))}
            </div>
            <a
              href="https://bacolodcity.gov.ph/hotlines/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-3"
            >
              View all hotlines
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Links */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Official Links</h3>
            <div className="space-y-2">
              <a
                href="https://bacolodcity.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                bacolodcity.gov.ph
              </a>
              <a
                href="https://www.facebook.com/BacolodStrongerTogether"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Bacolod City Government (Facebook)
              </a>
            </div>
          </div>

          {/* About This Site */}
          <div className="bg-gray-50 border rounded-lg p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <img
                src="/B-Logo/BetterBacolod Icons_favicon tp.png"
                alt="BetterBacolod"
                className="w-24 h-24 mb-3"
              />
              <h3 className="font-semibold text-gray-900">
                About BetterBacolod
              </h3>
            </div>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                BetterBacolod.org is an open-source civic tech initiative for
                the people of Bacolod City, Negros Occidental, Philippines.
                Inspired by BetterGov.ph, it supports simple, accessible, and
                transparent digital tools for better public service.
              </p>
              <p className="text-xs text-gray-500">
                This is not an official government website. For official
                transactions, visit{' '}
                <a
                  href="https://bacolodcity.gov.ph"
                  className="text-primary-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bacolodcity.gov.ph
                </a>
              </p>
            </div>
          </div>

          {/* Data Sources */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            Population: PSA 2024 Census · Land area: PhilAtlas · Hotlines:
            bacolodcity.gov.ph
          </div>
        </div>
      </Section>
    </>
  );
};

export default About;
