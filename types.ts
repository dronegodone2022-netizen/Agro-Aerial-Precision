
export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  category: ServiceCategory;
  longDescription?: string;
}

export type ServiceCategory = 'Mining' | 'Construction' | 'Inspection' | 'Environment' | 'Agriculture' | 'Drone Repairing';

/** An industry we serve - shown on the Home page and as /services/<slug> */
export interface Industry {
  category: ServiceCategory;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  icon: string;
}

export interface Testimonial {
  id: number;
  name: string;
  company: string;
  avatar: string;
  content: string;
  /** Industry label shown with the quote, e.g. 'Mining' or 'Agriculture' */
  sector?: string;
}
export interface TeamSpecialization {
  title: string;
  detail: string;
}

export interface Team  {
  id: number;
  /** Page address: /team/<slug> */
  slug: string;
  name: string;
  role: string;
  image: string;
  /** One or two sentences shown on the About page card */
  summary: string;
  /** Full profile paragraphs for the team member's page */
  bio: string[];
  /** Other current position, if any (e.g. at another company) */
  currentPosition?: string;
  specializations?: TeamSpecialization[];
  expertise?: string[];
  qualifications?: string[];
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
  };

}

export interface NavLink {
  label: string;
  path: string;
  dropdown?: NavLink[];
}
