
import { Service, Testimonial, NavLink, Team } from './types';

const asset = (file: string) => new URL(`./src/assets/${file}`, import.meta.url).href;

export const SERVICES: Service[] = [
  {
    id: 'precision-spraying',
    category: 'Agriculture',
    title: 'Precision Crop Spraying',
    description: 'Advanced drone technology delivering accurate and targeted application of crop protection products and fertilizers.',
    image: asset('SWIP2.jpg'),
    longDescription: 'We specialize in providing precise aerial spraying solutions for various agricultural needs. Our drones use GPS-guided technology and advanced sensors to deliver accurate and targeted application of crop protection products, fertilizers, and other inputs. This ensures minimal waste, reduced environmental impact, and maximum effectiveness.\n\n• Reduces chemical usage by up to 90% compared to traditional methods\n• Covers large areas in minimal time\n• Precise targeting minimizes drift and runoff\n• Access to difficult terrain and flooded fields\n• Real-time monitoring and reporting capabilities'
  },
  {
    id: 'mapping-survey',
    category: 'Agriculture',
    title: 'Mapping and Survey',
    description: 'Precision mapping and surveying to give you a complete picture of your land with accuracy and insight.',
    image: asset('map.jpg'),
    longDescription: 'At Agro Aerial Precision, we offer comprehensive mapping and surveying services using high-resolution aerial imagery and advanced GIS technology. Our drones capture detailed data of your farmland, enabling informed decision-making for crop management, drainage planning, and resource allocation.\n\n• High-resolution maps with sub-centimeter accuracy\n• Orthomosaic and 3D terrain mapping\n• Boundary demarcation and field analysis\n• Vegetation index mapping and soil moisture assessment\n• Digital records for long-term farm management'
  },
  {
    id: 'seed-spreading',
    category: 'Agriculture',
    title: 'Precise Seed Spreading',
    description: 'Uniform coverage for sowing seeds and distributing granular agricultural inputs efficiently.',
    image: asset('spreader3.jpg'),
    longDescription: 'Agro Aerial Precision offers a rapid and precise spreading system designed to efficiently distribute fertilizers, seeds like rice and beans, and other granular materials on farms. Our advanced spreading technology ensures accurate application rates and even coverage across fields, saving time, money, and resources.\n\n• 10-15 hectares coverage per hour\n• Uniform distribution with minimal overlap\n• Reduced seed and fertilizer waste\n• Ideal for large-scale operations\n• Weather-resistant operations capability'
  },
  {
    id: 'crop-health',
    category: 'Agriculture',
    title: 'Crop Health Monitoring',
    description: 'Leveraging cutting-edge drone technology for rapid, precise data collection and actionable insights.',
    image: asset('CROP HEALTH.jpg'),
    longDescription: 'Our comprehensive crop health management and monitoring services leverage cutting-edge drone technology equipped with multispectral cameras for rapid, precise data collection. This advanced system empowers farmers with actionable insights, enabling informed decisions about pest management, disease control, and nutrient application.\n\n• Early detection of crop diseases and pest infestations\n• NDVI analysis for vegetation health assessment\n• Stress identification and yield prediction\n• Customized intervention recommendations\n• Seasonal monitoring and trend analysis'
  },
  {
    id: 'asset-inspection',
    category: 'Inspection',
    title: 'Asset Inspection',
    description: 'Thorough inspections of power lines, solar farms, and construction sites using specialized sensors.',
    image: asset('inspection3.jpg'),
    longDescription: 'Using drones equipped with specialized cameras and high-resolution sensors, we conduct thorough inspections of critical infrastructure including power lines, solar farms, construction sites, mining pits, and more. Our drones capture precise images and thermal data, allowing for comprehensive examination of assets without manual inspection risks.\n\n• Thermal imaging for infrastructure damage detection\n• High-definition video and photography\n• Quick turnaround on inspection reports\n• Safe access to hazardous or elevated areas\n• Cost-effective compared to traditional methods\n• Detailed documentation for compliance and insurance'
  },
  {
    id: 'mosquito-control',
    category: 'Health',
    title: 'Mosquito Control',
    description: 'Revolutionizing mosquito control to combat disease outbreaks with eco-friendly solutions.',
    image: asset('mosq1.jpg'),
    longDescription: 'We harness cutting-edge drone technology to revolutionize mosquito control, helping communities combat disease outbreaks such as malaria, dengue fever, and Zika virus. Our innovative approach delivers effective and eco-friendly foggling solutions tailored to your community needs.\n\n• Targeted fogging in hard-to-reach areas\n• Reduced chemical exposure to population\n• Rapid response to outbreak situations\n• Large area coverage in short timeframes\n• Environment-conscious and sustainable methods\n• Community health partnership approach'
  }
];

export const TEAM: Team []=[
  {
    id: 1,
    name: 'Sylvester Abu Gbamoi',
    role: 'Founder & Managing Director',
    image: asset('sylv.jpg'),
    socials: { facebook: 'https://www.facebook.com/SEF.abu.gbamoi.9/', instagram: 'https://www.instagram.com/drone_godone/', linkedin: 'https://www.linkedin.com/in/sylvester-abu-gbamoi01/' }
  },
  {
    id: 2,
    name: 'Jestina N. Fillie',
    role: 'Co-Founder / CTO',
    image: asset('team (3).jpg'),
    socials: { facebook: 'https://www.facebook.com/share/1BAAFtYQdY/', instagram: '#' }
  },
  {
    id: 3,
    name: 'Bintu Gbamoi',
    role: 'Admin Finance & Sales',
    image: asset('bint.jpg'),
    socials: { facebook: 'https://www.facebook.com/bintu.gbamoi.9/ ', instagram: 'https://www.instagram.com/bintu_gbamoi/ ', tiktok: 'https://www.tiktok.com/@missgbamoi/' }
  },
  {
    id: 4,
    name: 'John Pamusum Sillah',
    role: 'Marketing Manager & Sales',
    image: asset('john.jpg'),
    socials: { facebook: 'https://www.facebook.com/johnps.kamara.3/', instagram: 'https://www.instagram.com/johngodwin.kamara/' }
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Samba  Koroma',
    company: 'Firsh Vegetables Farm',
    avatar: asset('avata7.jpg'),
    content: '"Implementing Agro Aerial Precision\'s precision agriculture technology has completely transformed our farm\'s productivity. The detailed data and insights we receive have helped us make better decisions, resulting in a 20% increase in our crop yields."'
  },
  {
    id: 2,
    name: 'David Samaka',
    company: 'Harmony Hills Farm',
    avatar: asset('avata8.jpg'),
    content: '"We consider Agro Aerial Precision more than just a service provider; they are a partner in our success. Their commitment to innovation and sustainability aligns perfectly with our values. Their technology has empowered us to achieve new levels of efficiency."'
  },
  {
    id: 3,
    name: 'Mabinti Mansary',
    company: 'Sunrise Farms',
    avatar: asset('avata5.jpg'),
    content: '"The reliable data provided by Agro Aerial Precision has been crucial for our decision-making process. We now have a clear understanding of our fields\' conditions, which has led to more effective management and improved crop health."'
  }
];

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { 
    label: 'Our Services', 
    path: '/services',
    dropdown: [
      { label: 'Agriculture', path: '/services/agriculture' },
      { label: 'Construction', path: '/services/construction' },
      { label: 'Mining', path: '/services/mining' },
      { label: 'Health', path: '/services/health' },
      { label: 'Inspection', path: '/services/inspection' },
      { label: 'Filming', path: '/services/filming' },
    ]
  },
  { label: 'About Us', path: '/about' },
  { label: 'OUR ACODEMY', path: '/academy' }
];
