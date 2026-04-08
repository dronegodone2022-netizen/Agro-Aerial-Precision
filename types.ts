
export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'Agriculture' | 'Construction' | 'Mining' | 'Health' | 'Inspection' | 'Filming';
  longDescription?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  company: string;
  avatar: string;
  content: string;
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
