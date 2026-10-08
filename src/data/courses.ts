// Academy courses: used by the Academy page, the course detail pages and the
// admin certificate form. Edit course content, prices and durations here.

const asset = (file: string) => new URL(`../assets/${file}`, import.meta.url).href;

export interface CourseModule {
  title: string;
  topics: string[];
}

export interface Course {
  id: string;
  title: string;
  image: string;
  /** One-line description for the course card */
  summary: string;
  /** Short bullet list for the course card */
  outline: string[];
  duration: string;
  price: string;
  level: string;
  format: string;
  overview: string[];
  audience: string[];
  prerequisites: string[];
  outcomes: string[];
  modules: CourseModule[];
  practical: string[];
  assessment: string[];
  careers: string[];
  faqs: { question: string; answer: string }[];
}

export const COURSES: Course[] = [
  {
    id: 'drone-basics',
    title: 'Basic Drone Training for Multimedia Production Certification',
    image: asset('train.jpg'),
    summary: 'Introduction to drone types, regulations, safety checks, and manual operation for multimedia production.',
    outline: [
      'Regulations & permits',
      'Pre-flight checks',
      'Battery and drone maintenance',
      'Basic flight exercises',
      'Cinematography techniques',
      'Emergency procedures',
    ],
    duration: '1 week',
    price: '$249',
    level: 'Beginner',
    format: 'Classroom + field flying',
    overview: [
      'This is the starting point for anyone who wants to fly drones professionally. In one intensive week you go from never having held a controller to flying confidently, safely and legally - and capturing smooth, professional aerial photos and video.',
      'Every day combines short classroom sessions with plenty of supervised flying time on our training drones. You finish with the skills to take on paid work in events, real estate, tourism, journalism and content creation.',
    ],
    audience: [
      'Complete beginners who want to become drone pilots',
      'Photographers, videographers and content creators adding aerial shots to their work',
      'Media, events, real-estate and tourism businesses',
      'Anyone planning to progress to our spraying or mapping courses',
    ],
    prerequisites: [
      'No previous drone experience needed',
      'Basic smartphone use (drone apps run on phones and tablets)',
      'Minimum age 18',
    ],
    outcomes: [
      'Explain the main drone types, their parts and how they fly',
      'Follow Sierra Leone aviation rules, permits and safe-flying guidelines',
      'Carry out complete pre-flight, in-flight and post-flight checks',
      'Fly confidently in GPS and manual (ATTI) modes, including smooth orbits and reveals',
      'Plan and shoot cinematic aerial photos and video',
      'Look after batteries and equipment to keep them safe and long-lasting',
      'React correctly to emergencies such as signal loss or low battery',
    ],
    modules: [
      {
        title: 'Day 1 - Drone fundamentals & the law',
        topics: [
          'Drone types: multirotor, fixed-wing and hybrid',
          'Parts of a drone: flight controller, GNSS, IMU, compass, motors, ESCs, gimbal',
          'Aviation rules, permits and no-fly zones in Sierra Leone',
          'Privacy, ethics and flying near people',
        ],
      },
      {
        title: 'Day 2 - Safety, checks & first flights',
        topics: [
          'Weather limits: wind, rain, visibility and heat',
          'Site risk assessment and choosing take-off points',
          'Pre-flight, in-flight and post-flight checklists',
          'First supervised take-offs, hovering and landings',
        ],
      },
      {
        title: 'Day 3 - Flight skills',
        topics: [
          'Precise control in GPS mode, then manual ATTI mode',
          'Figure-of-eight, box patterns and controlled descents',
          'Return-to-home settings and how to override them safely',
          'Flight logs and recording your flying hours',
        ],
      },
      {
        title: 'Day 4 - Aerial cinematography',
        topics: [
          'Camera settings: exposure, shutter speed, ND filters, frame rates',
          'Composition from the air',
          'Cinematic moves: reveals, orbits, tracking and fly-throughs',
          'Basic editing workflow and delivering footage to clients',
        ],
      },
      {
        title: 'Day 5 - Maintenance, emergencies & assessment',
        topics: [
          'LiPo battery care, charging, storage and transport',
          'Propeller, motor and gimbal checks; firmware updates',
          'Emergencies: signal loss, low battery, flyaways, compass errors',
          'Practical flight assessment and written exam',
        ],
      },
    ],
    practical: [
      'Daily supervised flying on our training drones - no need to bring your own',
      'Shoot a short aerial video project during the week',
      'Hands-on battery and maintenance workshop',
    ],
    assessment: [
      'Practical flight assessment with an instructor',
      'Written online exam (80% pass mark)',
      'AAP Academy certificate with a QR code that anyone can scan to verify it',
    ],
    careers: [
      'Freelance drone photographer or videographer',
      'Events, weddings and real-estate filming',
      'Media, tourism and marketing content',
      'Next step: our spraying or mapping certifications',
    ],
    faqs: [
      { question: 'Do I need my own drone?', answer: 'No. Training drones are provided for all flying sessions. We can advise you on choosing a drone once you finish.' },
      { question: 'What if the weather is bad?', answer: 'Flying sessions are rescheduled within the course week, and we use bad-weather time for simulator practice and classroom work.' },
    ],
  },
  {
    id: 'precision-spraying',
    title: 'Drone For Precision Aerial Spraying Certification',
    image: asset('spray1.jpg'),
    summary: 'Advanced spraying techniques, nozzle calibration, chemical safety, and precision application planning.',
    outline: [
      'Spray path planning',
      'Droplet size & drift reduction',
      'Product handling',
      'Field verification & reporting',
      'Drone maintenance for spraying',
      'Battery management for spraying operations',
    ],
    duration: '3 weeks',
    price: '$499',
    level: 'Intermediate',
    format: 'Classroom + supervised field operations',
    overview: [
      'Spray drones apply fertilisers and crop protection products faster, more evenly and with far less waste than knapsack spraying - and keep operators away from chemicals. This course trains you to run professional spraying operations from start to finish.',
      'You will learn to plan spray missions, calibrate nozzles and flow rates, control drift, handle products safely and keep heavy-lift spray drones working in the field. Most of the course is spent on real farmland under the supervision of our experienced operators.',
    ],
    audience: [
      'Farmers and farm managers adopting drone spraying',
      'Agricultural service providers and cooperatives',
      'Agronomists and extension officers',
      'Drone pilots moving into agriculture',
    ],
    prerequisites: [
      'Basic drone flying experience (our Basic Drone Training course or equivalent)',
      'Interest in agriculture; farming background helpful but not required',
      'Minimum age 18 and fit for outdoor fieldwork',
    ],
    outcomes: [
      'Plan efficient spray missions using field boundaries, obstacles and buffer zones',
      'Calibrate nozzles, flow rate and droplet size for each product and crop',
      'Reduce drift with the right height, speed, droplet size and weather window',
      'Mix, load and handle agrochemicals safely, with correct protective equipment',
      'Run multi-battery, multi-tank operations efficiently in the field',
      'Maintain spray systems, pumps, nozzles and airframes',
      'Record applications and produce job reports for clients',
    ],
    modules: [
      {
        title: 'Week 1 - Spray drone systems & planning',
        topics: [
          'How agricultural spray drones work: tanks, pumps, nozzles, radar and obstacle sensing',
          'Regulations and best practice for aerial application',
          'Field survey, boundary mapping and obstacle marking',
          'Spray path planning: swath width, overlap, height and speed',
        ],
      },
      {
        title: 'Week 2 - Application science & chemical safety',
        topics: [
          'Droplet size, application rate (litres per hectare) and coverage',
          'Nozzle calibration and flow tests',
          'Drift reduction: weather windows, temperature inversions, buffer zones',
          'Product labels, mixing, loading, PPE, storage and spill response',
        ],
      },
      {
        title: 'Week 3 - Field operations, maintenance & reporting',
        topics: [
          'Supervised spraying on real crops: rice, vegetables and plantations',
          'Battery rotation, charging logistics and generator use in the field',
          'Cleaning, maintenance and troubleshooting of spray systems',
          'Application records, client reports and pricing your services',
        ],
      },
    ],
    practical: [
      'Supervised spraying missions on partner farms',
      'Nozzle calibration and water-sensitive paper coverage tests',
      'Full field-day simulation: survey, plan, mix, spray and report',
    ],
    assessment: [
      'Practical assessment of a complete spray mission',
      'Written online exam (80% pass mark)',
      'AAP Academy certificate with a QR code that anyone can scan to verify it',
    ],
    careers: [
      'Spray drone operator or pilot',
      'Agricultural drone service business owner',
      'Farm technology lead for estates and cooperatives',
    ],
    faqs: [
      { question: 'Will I handle real chemicals?', answer: 'Calibration and most practice runs use water. Any live spraying is done under supervision with full protective equipment and approved products only.' },
      { question: 'Can I start my own spraying business afterwards?', answer: 'Yes. The final week covers job records, client reporting and how to price spraying services.' },
    ],
  },
  {
    id: 'mapping-analytics',
    title: 'Drone For Aerial Mapping & Survey Certification',
    image: asset('mmap.jpeg'),
    summary: 'Comprehensive aerial survey and mapping with orthomosaic, DEM, and crop health layers for smarter field planning.',
    outline: [
      'Flight planning for mapping grids',
      'GCPs & control points',
      'Understanding RTK, GNSS, IMU, and flight logs',
      'Types of drone data: RGB, multispectral, thermal, LiDAR',
    ],
    duration: '3 weeks',
    price: '$310',
    level: 'Intermediate',
    format: 'Classroom + field surveys',
    overview: [
      'Drone mapping produces accurate maps, 3D models and measurements of land in hours instead of weeks. This course teaches you to plan and fly survey missions that produce reliable, accurate data for agriculture, construction, mining and land management.',
      'You will learn how mapping flights work, how to get survey-grade accuracy with ground control points and RTK, and which sensors to use for each job. You will plan and fly real survey missions and take home your own mapping datasets.',
    ],
    audience: [
      'Surveyors, GIS technicians and land officers',
      'Agronomists and plantation managers',
      'Construction, mining and environmental professionals',
      'Drone pilots who want to offer mapping services',
    ],
    prerequisites: [
      'Basic drone flying skills (our Basic Drone Training course or equivalent)',
      'Comfortable using a computer',
      'Basic maths; maps or GIS experience helpful but not required',
    ],
    outcomes: [
      'Plan automated mapping missions with the right altitude, overlap and speed',
      'Understand ground sampling distance (GSD) and choose it for each project',
      'Place and survey ground control points (GCPs) for accurate results',
      'Explain how RTK/PPK, GNSS and IMU affect accuracy, and read flight logs',
      'Choose between RGB, multispectral, thermal and LiDAR sensors for each job',
      'Run complete field surveys and check data quality before leaving site',
    ],
    modules: [
      {
        title: 'Week 1 - Mapping principles & mission planning',
        topics: [
          'How photogrammetry turns photos into maps and 3D models',
          'GSD, front and side overlap, altitude and flight speed',
          'Grid, double-grid and corridor missions for different projects',
          'Coordinate systems and map projections made simple',
        ],
      },
      {
        title: 'Week 2 - Accuracy, positioning & sensors',
        topics: [
          'Ground control points and check points: planning, placing and surveying',
          'GNSS, RTK and PPK positioning; the role of the IMU',
          'Reading flight logs and diagnosing problems',
          'Sensor types: RGB, multispectral, thermal and LiDAR - what each is for',
        ],
      },
      {
        title: 'Week 3 - Field surveys & deliverables',
        topics: [
          'Full survey missions on farmland and building sites',
          'On-site data quality checks before you leave',
          'Introduction to orthomosaics, DEMs and crop-health maps',
          'Survey documentation and client deliverables',
        ],
      },
    ],
    practical: [
      'Plan and fly at least three real survey missions',
      'Lay out and survey ground control points',
      'Take home your own survey datasets for practice',
    ],
    assessment: [
      'Practical assessment: plan and fly a survey that meets an accuracy target',
      'Written online exam (80% pass mark)',
      'AAP Academy certificate with a QR code that anyone can scan to verify it',
    ],
    careers: [
      'Drone survey pilot or mapping technician',
      'GIS and land-survey support',
      'Mapping services for agriculture, construction and mining',
      'Next step: our Drone Data Processing & Analysis course',
    ],
    faqs: [
      { question: 'Does this course cover processing the maps?', answer: 'It introduces the outputs so you can check your data. Full processing and analysis is covered in our Drone Data Processing & Analysis course - many students take both.' },
      { question: 'What equipment do I need?', answer: 'Survey drones, GNSS equipment and ground control targets are provided during the course.' },
    ],
  },
  {
    id: 'data-processing',
    title: 'Drone Data Processing & Analysis Certification',
    image: asset('proce.jpg'),
    summary: 'Transform raw aerial capture into actionable farm intelligence with mapping, analytics, and report-driven decision support.',
    outline: [
      'Data ingestion & quality checks',
      'Orthomosaic and DEM generation',
      'Point cloud processing and 3D modeling',
      'NDVI/NDRE indices and thermal analytics',
      'Field-level recommendations & action plans',
    ],
    duration: '3 weeks',
    price: '$399',
    level: 'Intermediate to advanced',
    format: 'Computer lab + project work',
    overview: [
      'Drone flights are only valuable when the data becomes decisions. This course teaches you to turn raw drone images into accurate maps, 3D models, crop-health analysis and clear reports that clients and managers can act on.',
      'Working on real datasets from Sierra Leonean farms and sites, you will process imagery into orthomosaics and elevation models, measure areas and volumes, analyse crop health with vegetation indices, and present the results as practical recommendations.',
    ],
    audience: [
      'Graduates of our mapping course, and drone pilots who capture survey data',
      'GIS analysts, agronomists and environmental scientists',
      'Consultants and researchers working with aerial data',
    ],
    prerequisites: [
      'Understanding of drone mapping (our Aerial Mapping & Survey course or equivalent)',
      'Confident computer skills',
      'A laptop is useful for practice at home (lab computers are provided in class)',
    ],
    outcomes: [
      'Organise and quality-check drone datasets before processing',
      'Produce orthomosaics, digital surface and terrain models (DSM/DTM) and 3D models',
      'Process and classify point clouds',
      'Measure areas, distances, volumes and elevation changes',
      'Analyse crop health with NDVI, NDRE and thermal data',
      'Build zone maps and turn analysis into field-level recommendations',
      'Present findings in clear, professional client reports',
    ],
    modules: [
      {
        title: 'Week 1 - Data management & photogrammetry processing',
        topics: [
          'Organising imagery, metadata and GCP files',
          'Quality checks: blur, exposure, overlap and coverage gaps',
          'Processing orthomosaics, DSMs and DTMs with photogrammetry software',
          'Using GCPs to check and improve accuracy',
        ],
      },
      {
        title: 'Week 2 - 3D, measurement & crop analytics',
        topics: [
          'Point clouds: cleaning, classification and 3D meshes',
          'Measuring areas, volumes (stockpiles, earthworks) and contours',
          'Multispectral processing and vegetation indices: NDVI, NDRE',
          'Thermal data for irrigation and plant-stress analysis',
        ],
      },
      {
        title: 'Week 3 - GIS analysis, recommendations & reporting',
        topics: [
          'Working with drone outputs in GIS (QGIS)',
          'Zone mapping and variable-rate prescription maps',
          'Turning analysis into practical recommendations and action plans',
          'Final project: process a full dataset and present a client report',
        ],
      },
    ],
    practical: [
      'Hands-on processing of real farm and site datasets',
      'Volume and area measurement exercises',
      'Final project: a full client-ready report from raw images',
    ],
    assessment: [
      'Final project: processed outputs and a written report',
      'Written online exam (80% pass mark)',
      'AAP Academy certificate with a QR code that anyone can scan to verify it',
    ],
    careers: [
      'Drone data analyst or GIS technician',
      'Precision agriculture consultant',
      'Mapping and analytics services for construction, mining and environment',
    ],
    faqs: [
      { question: 'Which software will I use?', answer: 'Industry-standard photogrammetry software for processing, plus QGIS (free) for analysis - so you can keep practising after the course without buying licences.' },
      { question: 'Do I need a powerful computer?', answer: 'Not during the course - lab computers are provided. If you plan to offer processing services afterwards, we will advise you on the right hardware.' },
    ],
  },
];

export const findCourse = (id: string | undefined) => COURSES.find((course) => course.id === id);
