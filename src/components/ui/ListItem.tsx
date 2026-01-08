import React from 'react';
import { Link } from 'react-router-dom';

interface ListItemProps {
  title: string;
  category: string;
  description: string;
  onView?: () => void;
  href?: string;
}

// Utility function to check if URL is external
const isExternalUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

// External Link Icon Component
const ExternalLinkIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-external-link h-5 w-5 text-gray-400"
    aria-hidden="true"
  >
    <path d="M15 3h6v6"></path>
    <path d="M10 14 21 3"></path>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
  </svg>
);

const ListItem: React.FC<ListItemProps> = ({
  title,
  category,
  description,
  onView,
  href,
}) => {
  const content = (
    <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900">{title}</h4>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
          <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
            {category}
          </span>
        </div>
        <ExternalLinkIcon />
      </div>
    </div>
  );

  if (!href) {
    return (
      <button onClick={onView} className="block w-full text-left">
        {content}
      </button>
    );
  }

  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={href} onClick={onView} className="block">
      {content}
    </Link>
  );
};

export default ListItem;
