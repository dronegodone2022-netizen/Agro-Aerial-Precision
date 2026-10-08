
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
export interface Team  {
  id: number;
  name: string;
  role: string;
  image: string;
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
