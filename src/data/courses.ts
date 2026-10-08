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
      'Next step: our mapping, data processing or spraying certifications',
    ],
    faqs: [
      { question: 'Do I need my own drone?', answer: 'No. Training drones are provided for all flying sessions. We can advise you on choosing a drone once you finish.' },
      { question: 'What if the weather is bad?', answer: 'Flying sessions are rescheduled within the course week, and we use bad-weather time for simulator practice and classroom work.' },
    ],
  },
  {
    id: 'mapping-analytics',
    title: 'Drone For Aerial Mapping & Survey Certification',
    image: asset('mmap.jpeg'),
    summary: 'Plan and fly survey-grade mapping missions for mining, construction and land projects, with GCPs, RTK and the right sensor for every job.',
    outline: [
      'Flight planning for mapping grids and corridors',
      'GCPs, RTK/PPK and survey accuracy',
      'Mine, stockpile and construction site surveys',
      'Sensors: RGB, thermal, multispectral, LiDAR',
    ],
    duration: '3 weeks',
    price: '$310',
    level: 'Intermediate',
    format: 'Classroom + field surveys',
    overview: [
      'Drone mapping produces accurate maps, 3D models and measurements in hours instead of weeks - which is why mining companies, contractors and surveyors across Sierra Leone are adopting it. This course teaches you to plan and fly survey missions that produce reliable, survey-grade data.',
      'You will learn how mapping flights work, how to reach centimetre-level accuracy with ground control points and RTK, and how to survey mine pits, stockpiles, construction sites and corridors safely. You will plan and fly real survey missions and take home your own datasets.',
    ],
    audience: [
      'Mine surveyors, technicians and engineers',
      'Construction, civil engineering and quarry professionals',
      'Land surveyors, GIS technicians and land officers',
      'Drone pilots who want to offer survey services',
    ],
    prerequisites: [
      'Basic drone flying skills (our Basic Drone Training course or equivalent)',
      'Comfortable using a computer',
      'Basic maths; surveying or GIS experience helpful but not required',
    ],
    outcomes: [
      'Plan automated mapping and corridor missions with the right altitude, overlap and speed',
      'Choose a ground sampling distance (GSD) to meet a project accuracy target',
      'Place and survey ground control and check points',
      'Explain how RTK/PPK, GNSS and IMU affect accuracy, and read flight logs',
      'Survey mine pits, stockpiles and construction sites safely',
      'Choose between RGB, thermal, multispectral and LiDAR sensors for each job',
      'Check data quality on site before leaving',
    ],
    modules: [
      {
        title: 'Week 1 - Mapping principles & mission planning',
        topics: [
          'How photogrammetry turns photos into maps and 3D models',
          'GSD, front and side overlap, altitude and flight speed',
          'Grid, double-grid and corridor missions (roads, power lines, haul roads)',
          'Coordinate systems and map projections used in Sierra Leone',
        ],
      },
      {
        title: 'Week 2 - Accuracy, positioning & sensors',
        topics: [
          'Ground control and check points: planning, placing and surveying',
          'GNSS, RTK and PPK positioning; the role of the IMU',
          'Reading flight logs and diagnosing problems',
          'Sensors: RGB, thermal, multispectral and LiDAR - what each is for',
        ],
      },
      {
        title: 'Week 3 - Industry surveys & deliverables',
        topics: [
          'Mine pit, bench and stockpile surveys - safety around active operations',
          'Construction site and progress surveys',
          'On-site data quality checks before you leave',
          'Introduction to orthomosaics, surface models and volume reports',
        ],
      },
    ],
    practical: [
      'Plan and fly at least three real survey missions, including a stockpile survey',
      'Lay out and survey ground control points with GNSS equipment',
      'Take home your own survey datasets for practice',
    ],
    assessment: [
      'Practical assessment: plan and fly a survey that meets an accuracy target',
      'Written online exam (80% pass mark)',
      'AAP Academy certificate with a QR code that anyone can scan to verify it',
    ],
    careers: [
      'Drone survey pilot for mining and construction',
      'Mine survey or GIS technician',
      'Independent drone survey services',
      'Next step: our Data Processing and Mining Software courses',
    ],
    faqs: [
      { question: 'Does this course cover processing the data?', answer: 'It introduces the outputs so you can check your data in the field. Full processing - orthomosaics, volumes, 3D models - is covered in our Drone Data Processing & Analysis course, and mine design software in our Mining Software course.' },
      { question: 'What equipment do I need?', answer: 'Survey drones, GNSS equipment and ground control targets are provided during the course.' },
    ],
  },
  {
    id: 'data-processing',
    title: 'Drone Data Processing & Analysis Certification',
    image: asset('proce.jpg'),
    summary: 'Turn raw drone imagery into survey-grade maps, 3D models, volumes and reports for mining, construction, environment and agriculture.',
    outline: [
      'Data ingestion & quality checks',
      'Orthomosaic, DSM/DTM and contour generation',
      'Point clouds, 3D models and LiDAR data',
      'Volumes, cut/fill and progress comparisons',
      'Thermal and multispectral analysis',
      'Client-ready reports',
    ],
    duration: '3 weeks',
    price: '$399',
    level: 'Intermediate to advanced',
    format: 'Computer lab + project work',
    overview: [
      'Drone flights are only valuable when the data becomes decisions. This course teaches you to turn raw drone images and LiDAR data into accurate maps, 3D models, volume reports and analysis that mine managers, engineers and clients can act on.',
      'Working on real datasets from Sierra Leonean mine sites, construction projects and farms, you will process imagery into orthomosaics and elevation models, measure stockpiles and earthworks, compare progress over time, analyse thermal and multispectral data, and present the results in professional reports.',
    ],
    audience: [
      'Graduates of our mapping course, and drone pilots who capture survey data',
      'Mine surveyors, engineers and GIS analysts',
      'Construction and environmental consultants',
      'Agronomists and researchers working with aerial data',
    ],
    prerequisites: [
      'Understanding of drone mapping (our Aerial Mapping & Survey course or equivalent)',
      'Confident computer skills',
      'A laptop is useful for practice at home (lab computers are provided in class)',
    ],
    outcomes: [
      'Organise and quality-check drone datasets before processing',
      'Produce orthomosaics, digital surface and terrain models (DSM/DTM) and contours',
      'Process, clean and classify photogrammetry and LiDAR point clouds',
      'Measure stockpile volumes, cut and fill, and earthworks quantities',
      'Compare surveys over time to track mining and construction progress',
      'Analyse thermal and multispectral data (including NDVI for vegetation)',
      'Present findings in clear, professional client reports',
    ],
    modules: [
      {
        title: 'Week 1 - Data management & photogrammetry processing',
        topics: [
          'Organising imagery, metadata and GCP files',
          'Quality checks: blur, exposure, overlap and coverage gaps',
          'Processing orthomosaics, DSMs, DTMs and contours',
          'Using GCPs and check points to prove accuracy',
        ],
      },
      {
        title: 'Week 2 - 3D, volumes & change detection',
        topics: [
          'Point clouds and LiDAR data: cleaning, classification and 3D meshes',
          'Stockpile volumes, cut and fill and earthworks reports',
          'Comparing surveys over time: mining advance and construction progress',
          'Exporting data for CAD, GIS and mine planning software',
        ],
      },
      {
        title: 'Week 3 - Thermal, multispectral & reporting',
        topics: [
          'Thermal data for inspection: hot spots and faults',
          'Multispectral data and vegetation indices (NDVI) for environment and agriculture',
          'Working with drone outputs in GIS (QGIS)',
          'Final project: process a full dataset and present a client report',
        ],
      },
    ],
    practical: [
      'Hands-on processing of real mine, construction and farm datasets',
      'Stockpile volume and cut/fill measurement exercises',
      'Final project: a full client-ready report from raw images',
    ],
    assessment: [
      'Final project: processed outputs and a written report',
      'Written online exam (80% pass mark)',
      'AAP Academy certificate with a QR code that anyone can scan to verify it',
    ],
    careers: [
      'Drone data analyst or GIS technician',
      'Mine survey and production reporting support',
      'Mapping and analytics services for construction, environment and agriculture',
      'Next step: our Mining Software course',
    ],
    faqs: [
      { question: 'Which software will I use?', answer: 'Industry-standard photogrammetry software for processing, plus QGIS (free) for analysis - so you can keep practising after the course without buying licences.' },
      { question: 'Do I need a powerful computer?', answer: 'Not during the course - lab computers are provided. If you plan to offer processing services afterwards, we will advise you on the right hardware.' },
    ],
  },
  {
    id: 'mining-software',
    title: 'Mining Software & Drone Survey Data Certification',
    image: asset('mapping.jpg'),
    summary: 'Hands-on training in drone mapping software, Surpac, Datamine/Micromine and QGIS/ArcGIS for mine surveying, design and planning.',
    outline: [
      'Drone mapping software for mine surveys',
      'Surpac: survey data, surfaces and volumes',
      'Datamine / Micromine: models and mine planning',
      'QGIS / ArcGIS for concessions and reporting',
      'From drone survey to mine plan',
    ],
    duration: '3 weeks',
    price: '$399',
    level: 'Intermediate',
    format: 'Computer lab + project work',
    overview: [
      'Mines run on software. This course teaches the tools used by mine surveyors, geologists and planners - and how to feed them with accurate drone survey data.',
      'You will process drone surveys in mapping software, bring the results into Surpac and Datamine/Micromine to build surfaces, calculate volumes and support mine design, and use QGIS/ArcGIS to manage concessions and produce maps. The course ends with a complete project: from a drone survey of a mine site to a volume report and an updated plan.',
    ],
    audience: [
      'Mine surveyors, geologists and mining engineers',
      'Mining and geology graduates preparing for industry jobs',
      'GIS technicians working with mining concessions',
      'Drone pilots and analysts serving mining clients',
    ],
    prerequisites: [
      'Confident computer skills',
      'Basic understanding of maps and coordinates',
      'Mining, geology or surveying background helpful; our mapping course recommended',
    ],
    outcomes: [
      'Process drone imagery into orthomosaics, surfaces and point clouds for mine surveys',
      'Import survey data into Surpac and build surfaces (DTMs) and strings',
      'Calculate stockpile, pit and cut/fill volumes and reconcile against plans',
      'Work with block models and basic mine planning in Datamine / Micromine',
      'Manage concession boundaries, drill-hole locations and maps in QGIS / ArcGIS',
      'Move data cleanly between drone, mining and GIS software',
      'Produce professional survey and volume reports',
    ],
    modules: [
      {
        title: 'Week 1 - Drone survey data & GIS',
        topics: [
          'Drone mapping software (e.g. DJI Terra, Pix4D, Agisoft Metashape): processing mine surveys',
          'Coordinate systems, datums and survey control for mine sites',
          'QGIS / ArcGIS: concession boundaries, layers and map production',
          'Exporting surfaces, contours and point clouds for mining software',
        ],
      },
      {
        title: 'Week 2 - Surpac for survey and design',
        topics: [
          'Importing drone and ground survey data into Surpac',
          'Strings, DTMs and surface creation',
          'Volume calculations: stockpiles, pits and cut/fill',
          'Basic pit and haul road design',
        ],
      },
      {
        title: 'Week 3 - Datamine / Micromine & final project',
        topics: [
          'Drill-hole data, geological interpretation and block model basics',
          'Pit optimisation and planning concepts',
          'Reconciliation: comparing surveys with plans',
          'Final project: drone survey to volume report and updated mine plan',
        ],
      },
    ],
    practical: [
      'Lab work on real (anonymised) mine survey datasets',
      'Volume and reconciliation exercises',
      'Final project from raw drone survey to mine report',
    ],
    assessment: [
      'Final project: survey processing, volumes and a mine report',
      'Written online exam (80% pass mark)',
      'AAP Academy certificate with a QR code that anyone can scan to verify it',
    ],
    careers: [
      'Mine surveyor or survey technician',
      'Mine planning or geology technician',
      'GIS officer for mining companies and regulators',
      'Drone survey analyst for mining clients',
    ],
    faqs: [
      { question: 'Do I need my own software licences?', answer: 'No. Software is provided on our lab computers during the course. QGIS is free, so you can keep practising GIS at home.' },
      { question: 'Do I need to be a mining engineer?', answer: 'No, but you should be comfortable with computers, maps and coordinates. A mining, geology or surveying background helps you get the most from Weeks 2 and 3.' },
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
];

export const findCourse = (id: string | undefined) => COURSES.find((course) => course.id === id);
