import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Phone,
  Smile,
  Users,
} from 'lucide-react';
// biome-ignore lint/suspicious/noShadowRestrictedNames: Map is exported from react-map-gl
import Map, { Marker } from 'react-map-gl/mapbox';
import { cn } from '../../lib/utils';
import { Heading } from '../ui/Heading';
import Section from '../ui/Section';
import { Text } from '../ui/Text';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const stats = [
  { icon: Users, label: 'Population', value: '624,787' },
  { icon: MapPin, label: 'Land Area', value: '161 km²' },
  { icon: Building2, label: 'Barangays', value: '61' },
  { icon: Calendar, label: 'Founded', value: '1938' },
];

const hotlines = [
  {
    name: 'Emergency',
    number: '911',
    icon: Phone,
    color: 'from-rose-500 to-red-600',
  },
  {
    name: 'CDRRMO',
    number: '(034) 432-3871',
    icon: MapPin,
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'City Hall',
    number: '(034) 434-9122',
    icon: Building2,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'PNP',
    number: '(034) 434-8873',
    icon: Phone,
    color: 'from-emerald-500 to-teal-600',
  },
];

// Animated smile decoration component
function SmileDecoration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <title>Decorative smile face</title>
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.3"
      />
      <circle cx="35" cy="40" r="4" fill="currentColor" opacity="0.5" />
      <circle cx="65" cy="40" r="4" fill="currentColor" opacity="0.5" />
      <path
        d="M 30 60 Q 50 75 70 60"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  return (
    <div
      className="group relative bg-white rounded-2xl p-5 overflow-hidden"
      style={{
        animation: `fadeSlideUp 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        )}
      />
      <div className="relative">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
          <stat.icon className="h-5 w-5 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 tabular-nums">
          {stat.value}
        </div>
        <div className="text-xs text-gray-500 font-medium tracking-wide uppercase">
          {stat.label}
        </div>
      </div>
    </div>
  );
}

function HotlineCard({
  hotline,
  index,
}: {
  hotline: (typeof hotlines)[0];
  index: number;
}) {
  return (
    <a
      key={hotline.name}
      href={`tel:${hotline.number.replace(/[^0-9+]/g, '')}`}
      className="group relative overflow-hidden rounded-2xl bg-gray-50 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
      style={{
        animation: `fadeSlideUp 0.5s ease-out ${0.3 + index * 0.08}s both`,
      }}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300',
          hotline.color,
        )}
      />
      <div className="flex items-center gap-4 p-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg',
            hotline.color,
          )}
        >
          <hotline.icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">
            {hotline.name}
          </div>
          <div className="text-sm text-blue-600 font-medium">
            {hotline.number}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Phone className="h-4 w-4 text-blue-600" />
        </div>
      </div>
    </a>
  );
}

export default function AboutSection() {
  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 7s ease-in-out infinite 1s;
        }
      `}</style>
      <Section
        className="bg-gradient-to-b from-amber-50/30 via-white to-orange-50/20 relative overflow-hidden"
        animate={false}
      >
        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 text-amber-200/40 animate-float">
          <SmileDecoration className="w-24 h-24" />
        </div>
        <div className="absolute bottom-20 right-10 text-orange-200/30 animate-float-delayed">
          <SmileDecoration className="w-32 h-32" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-5 py-2.5 rounded-full mb-5 text-sm font-semibold border border-amber-200/50">
              <Smile className="h-4 w-4" />
              City of Smiles
            </div>
            <Heading
              level={2}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
            >
              Bacolod City
            </Heading>
            <Text className="text-gray-500 max-w-xl mx-auto text-base">
              Capital of Negros Occidental · Home of the MassKara Festival
            </Text>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} />
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left - About + Hotlines */}
            <div className="lg:col-span-7 space-y-6">
              {/* About Card */}
              <div
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                style={{ animation: 'fadeSlideUp 0.5s ease-out 0.4s both' }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Smile className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      About the City
                    </h3>
                    <p className="text-sm text-gray-500">
                      Negros Occidental, Philippines
                    </p>
                  </div>
                </div>
                <div className="text-gray-600 space-y-4 leading-relaxed">
                  <p className="text-base">
                    Bacolod is a highly urbanized city on the northwestern coast
                    of Negros Island, facing the Guimaras Strait. Founded in
                    1755, it became a city in 1938 and serves as the capital of
                    Negros Occidental.
                  </p>
                  <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-5 border border-amber-100/50">
                    <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold">
                      <Smile className="h-5 w-5" />
                      City of Smiles
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      Every October, Bacolod comes alive with the MassKara
                      Festival—a vibrant celebration born in 1980 to uplift
                      spirits during the sugar crisis. Famous for piaya, chicken
                      inasal, and napoleones.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hotlines */}
              <div
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                style={{ animation: 'fadeSlideUp 0.5s ease-out 0.5s both' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Emergency Hotlines
                  </h3>
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hotlines.map((hotline, index) => (
                    <HotlineCard
                      key={hotline.name}
                      hotline={hotline}
                      index={index}
                    />
                  ))}
                </div>
                <a
                  href="https://bacolodcity.gov.ph/hotlines/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mt-5 transition-colors"
                >
                  View all hotlines <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Right - Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              {/* Map */}
              <div
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
                style={{ animation: 'fadeSlideUp 0.5s ease-out 0.6s both' }}
              >
                <div className="px-6 pt-6 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Bacolod City Map
                  </h3>
                </div>
                <div className="h-56 mx-6 my-2 rounded-2xl overflow-hidden border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  {MAPBOX_TOKEN ? (
                    <Map
                      longitude={122.956}
                      latitude={10.676}
                      zoom={11}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                      mapboxAccessToken={MAPBOX_TOKEN}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <Marker
                        longitude={122.956}
                        latitude={10.676}
                        anchor="bottom"
                      >
                        <div className="relative">
                          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold whitespace-nowrap">
                            Bacolod City
                          </div>
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-600 mx-auto" />
                        </div>
                      </Marker>
                    </Map>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-4">
                        <MapPin className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                        <p className="text-sm text-blue-700 font-bold">
                          Bacolod City
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          10.676° N, 122.956° E
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Northwestern coast of Negros Island
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                style={{ animation: 'fadeSlideUp 0.5s ease-out 0.7s both' }}
              >
                <h3 className="font-semibold text-gray-900 mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://bacolodcity.gov.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors group"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">bacolodcity.gov.ph</span>
                  </a>
                  <a
                    href="https://www.facebook.com/BacolodStrongerTogether"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors group"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">City Facebook</span>
                  </a>
                  <a
                    href="/routes"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 transition-colors group"
                  >
                    <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Jeepney Routes</span>
                  </a>
                </div>
              </div>

              {/* BetterBacolod Card */}
              <div
                className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
                style={{ animation: 'fadeSlideUp 0.5s ease-out 0.8s both' }}
              >
                {/* Decorative pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="/images/icons/60x60/BetterBacolod%20Icons_60x60%20blue%20white.png"
                      alt="BetterBacolod"
                      className="w-14 h-14 bg-white rounded-xl p-2 shadow-md"
                    />
                    <div>
                      <h3 className="font-bold text-lg">BetterBacolod</h3>
                      <Text className="text-blue-100 text-xs">
                        Open-source civic tech
                      </Text>
                    </div>
                  </div>
                  <Text className="text-blue-50 text-sm mb-5 leading-relaxed">
                    Simple, accessible digital tools for Bacolod City residents.
                  </Text>
                  <a
                    href="https://github.com/betterbacolod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 text-sm font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="text-center text-xs text-gray-400 mt-12 flex items-center justify-center gap-2"
            style={{ animation: 'fadeSlideUp 0.5s ease-out 0.9s both' }}
          >
            Data sources: PSA 2024 · PhilAtlas · bacolodcity.gov.ph
          </div>
        </div>
      </Section>
    </>
  );
}
