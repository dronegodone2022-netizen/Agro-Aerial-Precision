
import { Service, Testimonial, NavLink, Team, Industry } from './types';

const asset = (file: string) => new URL(`./src/assets/${file}`, import.meta.url).href;

// Industries we serve, in the order they appear on the site.
// Mining, construction, inspection and environment come first; agriculture is one of several sectors.
export const INDUSTRIES: Industry[] = [
  {
    category: 'Mining',
    slug: 'mining',
    name: 'Mining',
    tagline: 'Pit mapping, stockpile volumes and haul roads',
    description: 'Accurate, frequent survey data for mine planning, production reporting and safety - captured in hours without putting surveyors near benches or haul trucks.',
    image: asset('filming2.jpg'),
    icon: 'ri-hammer-line',
  },
  {
    category: 'Construction',
    slug: 'construction',
    name: 'Construction',
    tagline: 'Site surveys, progress monitoring and LiDAR',
    description: 'Topographic surveys before you build, regular progress flights while you build, and accurate as-built records when you finish.',
    image: asset('filming1.jpg'),
    icon: 'ri-building-2-line',
  },
  {
    category: 'Inspection',
    slug: 'inspection',
    name: 'Infrastructure Inspection',
    tagline: 'Power lines, telecom masts, solar and thermal',
    description: 'Close-up visual and thermal inspection of towers, lines, masts and solar farms - safer, faster and cheaper than climbing or shutting down.',
    image: asset('powerlin.jpg'),
    icon: 'ri-flashlight-line',
  },
  {
    category: 'Environment',
    slug: 'environment',
    name: 'Environment & Public Health',
    tagline: 'Environmental monitoring and mosquito control',
    description: 'Mapping land reclamation, erosion and land-use change for compliance reporting, and targeted mosquito control for healthier communities.',
    image: asset('about.jpg'),
    icon: 'ri-leaf-line',
  },
  {
    category: 'Agriculture',
    slug: 'agriculture',
    name: 'Agriculture',
    tagline: 'Precision spraying, crop health and seeding',
    description: 'Precision spraying, crop health monitoring and seed spreading that cut input costs and help farms make better decisions.',
    image: asset('SWIP2.jpg'),
    icon: 'ri-plant-line',
  },
  {
    category: 'Drone Repairing',
    slug: 'drone-repairing',
    name: 'Drone Repair & Maintenance',
    tagline: 'Keep your fleet flying',
    description: 'Diagnostics, repairs, calibration and preventive maintenance for commercial and industrial drones.',
    image: asset('drone repair.jpg'),
    icon: 'ri-tools-line',
  },
];

export const findIndustry = (slugOrCategory: string | undefined) => {
  const key = (slugOrCategory || '').toLowerCase().replace(/\s+/g, '-');
  // "health" was the old name of the Environment & Public Health page
  return INDUSTRIES.find((i) => i.slug === key || i.category.toLowerCase() === key) || (key === 'health' ? INDUSTRIES[3] : undefined);
};

export const SERVICES: Service[] = [
  // --- Mining ---------------------------------------------------------------
  {
    id: 'mine-mapping',
    category: 'Mining',
    title: 'Mine Pit & Haul Road Mapping',
    description: 'High-accuracy maps and 3D models of pits, benches, haul roads and tailings for mine planning and safety.',
    image: asset('filming2.jpg'),
    longDescription: 'We map active pits, benches, haul roads, waste dumps and tailings facilities with survey-grade accuracy, giving mine planners and surveyors an up-to-date picture of the whole operation. Because the drone does the work from the air, surveys are completed in hours and nobody has to walk unstable ground or work near heavy equipment.\n\n• Orthomosaic maps and 3D models of the full mine site\n• Bench, ramp and haul road profiles and gradients\n• Comparison with mine designs and previous surveys\n• Tailings and waste dump monitoring\n• Data delivered in formats ready for Surpac, Datamine, Micromine and GIS'
  },
  {
    id: 'stockpile-volumes',
    category: 'Mining',
    title: 'Stockpile & Volume Measurement',
    description: 'Fast, repeatable volume measurements of stockpiles, cut and fill, and earthworks for reporting and reconciliation.',
    image: asset('mapping1.jpg'),
    longDescription: 'Drone surveys measure every stockpile on site in a single flight, with far more data points than a ground survey and no need to climb the piles. We deliver clear volume reports you can use for production reporting, inventory reconciliation and contractor payments.\n\n• Stockpile volumes and tonnage estimates (using your material densities)\n• Cut and fill and earthworks quantities\n• Month-on-month change reports\n• Safe: no climbing on stockpiles or working near loaders\n• Results typically within days, not weeks'
  },
  // --- Construction ---------------------------------------------------------
  {
    id: 'site-surveys',
    category: 'Construction',
    title: 'Topographic & Site Surveys',
    description: 'Orthomosaic maps, contours and elevation models for site selection, design and planning.',
    image: asset('mmap.jpeg'),
    longDescription: 'Before design starts, you need an accurate picture of the ground. Our drone topographic surveys use ground control points and RTK positioning to produce detailed maps and elevation data for engineers, architects and planners - covering large or hard-to-reach sites far faster than traditional surveying.\n\n• High-resolution orthomosaic maps\n• Digital surface and terrain models (DSM/DTM) and contour lines\n• Ground control points and RTK for survey-grade accuracy\n• Boundary, road and drainage planning data\n• Outputs for CAD and GIS software'
  },
  {
    id: 'progress-monitoring',
    category: 'Construction',
    title: 'Construction Progress Monitoring',
    description: 'Regular flights that track progress, compare work to plans and keep clients and investors informed.',
    image: asset('filming1.jpg'),
    longDescription: 'Scheduled drone flights give project managers, clients and investors an objective, dated record of how a project is progressing. Compare each flight to the design and to previous flights to spot delays and issues early.\n\n• Weekly or monthly progress flights from the same viewpoints\n• Orthomosaics and 3D models compared against design plans\n• Earthworks and material quantities over time\n• Photo and video reports for clients and investors\n• Permanent visual record for disputes and handover'
  },
  {
    id: 'lidar-surveys',
    category: 'Construction',
    title: 'LiDAR Surveys',
    description: 'LiDAR mapping that sees through vegetation to produce accurate terrain models of difficult sites.',
    image: asset('filming6.jpg'),
    longDescription: 'LiDAR sensors fire laser pulses that reach the ground through gaps in trees and bush, so we can map the true terrain on overgrown sites, road and power-line corridors, and forest-covered concessions where photogrammetry struggles.\n\n• Bare-earth terrain models under vegetation\n• Corridor mapping for roads, pipelines and power lines\n• Dense, classified point clouds\n• Accurate contours for design and drainage\n• Ideal for early-stage mining exploration and route planning'
  },
  // --- Inspection -----------------------------------------------------------
  {
    id: 'asset-inspection',
    category: 'Inspection',
    title: 'Power Line, Telecom & Solar Inspection',
    description: 'Close-up visual inspection of transmission lines, towers, telecom masts and solar farms.',
    image: asset('inspection3.jpg'),
    longDescription: 'High-zoom cameras let us inspect every insulator, bolt, antenna and panel without climbing, scaffolding or shutting assets down. Inspections are faster, safer and well documented for maintenance planning and compliance.\n\n• Transmission and distribution lines, towers and substations\n• Telecom masts and antennas\n• Solar farms: damaged, dirty or shaded panels\n• Geo-tagged photos and defect reports\n• Repeat inspections to track deterioration over time'
  },
  {
    id: 'thermal-inspection',
    category: 'Inspection',
    title: 'Thermal Inspection',
    description: 'Thermal camera surveys that reveal hot spots, faulty connections and failing solar cells.',
    image: asset('powerlin.jpg'),
    longDescription: 'Many faults show up as heat before they fail. Our thermal drones spot overheating connections, faulty solar cells and other temperature problems across large areas in a single flight, so maintenance teams know exactly where to go.\n\n• Hot spots on power lines, joints and substations\n• Defective cells and strings on solar farms\n• Roof, building and equipment heat loss\n• Radiometric thermal images with temperature readings\n• Prioritised fault reports for maintenance teams'
  },
  // --- Environment & public health -----------------------------------------
  {
    id: 'environmental-monitoring',
    category: 'Environment',
    title: 'Environmental Monitoring',
    description: 'Mapping land reclamation, erosion, deforestation and land-use change for compliance and reporting.',
    image: asset('about.jpg'),
    longDescription: 'Mining, construction and agricultural projects all have environmental commitments. Regular drone mapping gives you accurate, dated evidence of land reclamation, erosion control and vegetation change for regulators, investors and communities.\n\n• Mine and quarry rehabilitation progress\n• Erosion, sedimentation and drainage monitoring\n• Deforestation and land-use change mapping\n• Vegetation health analysis with multispectral sensors\n• Reports to support environmental compliance'
  },
  {
    id: 'mosquito-control',
    category: 'Environment',
    title: 'Mosquito Control',
    description: 'Targeted drone treatment of mosquito breeding sites to help communities fight malaria and other diseases.',
    image: asset('mosq1.jpg'),
    longDescription: 'We use drones to reach mosquito breeding sites - swamps, flooded areas and hard-to-reach water bodies - quickly and precisely, helping communities and health programmes fight malaria, dengue and other mosquito-borne diseases.\n\n• Targeted treatment of breeding sites\n• Reaches swamps and flooded areas that are hard to access on foot\n• Reduced chemical exposure for people\n• Rapid response during outbreaks\n• Mapping of breeding sites to plan future campaigns'
  },
  // --- Agriculture ----------------------------------------------------------
  {
    id: 'precision-spraying',
    category: 'Agriculture',
    title: 'Precision Crop Spraying',
    description: 'Accurate, targeted application of crop protection products and fertilisers.',
    image: asset('SWIP2.jpg'),
    longDescription: 'Our spray drones use GPS-guided flight paths and precise flow control to apply crop protection products and fertilisers evenly, with minimal waste and drift - and without exposing workers to chemicals.\n\n• Reduces chemical usage by up to 30% compared to traditional methods\n• Covers large areas in minimal time\n• Precise targeting minimises drift and runoff\n• Access to difficult terrain and flooded fields\n• Application records for every job'
  },
  {
    id: 'crop-health',
    category: 'Agriculture',
    title: 'Crop Health Monitoring',
    description: 'Multispectral surveys that spot pests, disease and stress early, before they spread.',
    image: asset('CROP HEALTH.jpg'),
    longDescription: 'Multispectral cameras see plant stress before it is visible to the eye. We map your fields and turn the data into clear crop-health maps and recommendations for pest management, disease control and nutrient application.\n\n• Early detection of crop diseases and pest infestations\n• NDVI analysis for vegetation health assessment\n• Stress identification and yield prediction\n• Field boundary and area mapping\n• Seasonal monitoring and trend analysis'
  },
  {
    id: 'seed-spreading',
    category: 'Agriculture',
    title: 'Precise Seed Spreading',
    description: 'Uniform spreading of seeds and granular fertilisers across large or wet fields.',
    image: asset('spreader3.jpg'),
    longDescription: 'Our spreading system distributes rice and other seeds, fertilisers and granular materials evenly and quickly, saving time, money and resources - especially in wet or hard-to-reach fields.\n\n• 10-15 hectares coverage per hour\n• Uniform distribution with minimal overlap\n• Reduced seed and fertiliser waste\n• Ideal for large-scale operations'
  },
  // --- Drone repair ---------------------------------------------------------
  {
    id: 'drone-repairing',
    category: 'Drone Repairing',
    title: 'Drone Repair & Maintenance',
    description: 'Comprehensive repair, maintenance, and technical support services for industrial and commercial drones.',
    image: asset('drone repair.jpg'),
    longDescription: 'Our Drone Repairing service delivers fast, reliable repairs and preventive maintenance for professional UAV fleets. We handle hardware repairs, software calibration, battery health checks, and airframe restoration with experienced technicians who understand the demands of industrial drone operations.\n\n• Fast diagnostics and component-level repairs for motors, controllers, cameras, and gimbals\n• Firmware updates, flight controller tuning, and sensor calibration\n• Battery testing, safe charging guidance, and replacement support\n• Crash and impact recovery for frames, arms, and landing gear\n• Preventive maintenance programs to reduce downtime and extend drone life\n• On-site and workshop repair options for fleet operators',
  },
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
    name: 'Eng. Kallie Balla Koroma',
    role: 'Founding Partner',
    image: asset('En_Kaillie.jpg'),
    socials: { facebook: 'https://www.facebook.com/AgroAerialPrecision/', linkedin: 'https://www.linkedin.com/in/kallie-balla-koroma-583828282/' }
  },
  {
    id: 5,
    name: 'Bintu Gbamoi',
    role: 'Admin Finance',
    image: asset('bint.jpg'),
    socials: { facebook: 'https://www.facebook.com/bintu.gbamoi.9/', instagram: 'https://www.instagram.com/bintu_gbamoi/', tiktok: 'https://www.tiktok.com/@missgbamoi/' }
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Samba  Koroma',
    company: 'Fresh Vegetables Farm',
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
    dropdown: INDUSTRIES.map((industry) => ({ label: industry.name, path: `/services/${industry.slug}` })),
  },
  { label: 'About Us', path: '/about' },
  { label: 'OUR ACADEMY', path: '/academy' },
  { label: 'Student Portal', path: '/student' }
];
