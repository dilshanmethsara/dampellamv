// School Data - Static data for the school website
// In production, this would come from a database

export interface Announcement {
  id: string
  title: string
  summary: string
  content: string
  category: 'announcement' | 'special-event' | 'upcoming-event' | 'achievement' | 'sports' | 'club'
  image: string
  date: string
  featured: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  image: string
  isPast: boolean
  isHighlighted: boolean
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: string
}

export interface Club {
  id: string
  name: string
  description: string
  activities: string[]
  icon: string
}

export const schoolInfo = {
  name: "MR/ Dampella M.V",
  fullName: "Maha Vidyalaya Dampella",
  motto: "Knowledge is Power, Education is the Key 🔑",
  address: "Dampella, Southern Province, Sri Lanka",
  phone: "+94 XX XXX XXXX",
  email: "info@dampellamv.lk",
  students: 60,
  teachers: 25,
  achievements: 150,
  yearsOfExcellence: 50,
  principalName: "Mr. K. Perera",
  principalMessage: `Welcome to MR/ Dampella M.V, where we believe in nurturing not just academic excellence, but the holistic development of every student. Our dedicated team of teachers works tirelessly to create an environment where learning is engaging, inspiring, and transformative.

As the Principal of this esteemed institution, I am proud of our rich heritage and the values we instill in our students. We focus on character building, critical thinking, and preparing our students for the challenges of the modern world while staying rooted in our cultural values.

Our school is more than just a place of learning; it is a community where every student is valued, every achievement celebrated, and every challenge is met with determination. I invite you to explore our website and discover what makes our school a special place for education and growth.`,
  vision: "To be a center of excellence in education, producing responsible citizens who contribute positively to society.",
  mission: "To provide quality education that develops intellectual abilities, moral values, and life skills, enabling students to become productive members of society.",
  values: [
    "Excellence in Education",
    "Integrity and Honesty",
    "Respect for All",
    "Community Service",
    "Innovation and Creativity",
    "Cultural Heritage"
  ],
  history: `MR/ Dampella M.V was established over 50 years ago with a vision to provide quality education to the children of Dampella and surrounding areas. Starting with just a handful of students and teachers, the school has grown into a respected institution serving the educational needs of the Southern Province.

Throughout its history, the school has maintained its commitment to academic excellence while adapting to the changing educational landscape. Our alumni have gone on to become successful professionals, community leaders, and contributors to society.

Today, we continue to build on this proud legacy, combining traditional values with modern educational approaches to prepare our students for the future.`
}

export const announcements: Announcement[] = [
  {
    id: "1",
    title: "Annual Sports Meet 2024",
    summary: "Join us for the annual sports meet featuring exciting competitions and events.",
    content: "The Annual Sports Meet 2024 will be held on the school grounds. All students are encouraged to participate in various athletic events including track and field, team sports, and individual competitions. Parents are welcome to attend and cheer for their children.",
    category: "sports",
    image: "https://images.unsplash.com/photo-1461896836934- voices-from-the-past?w=800&h=600&fit=crop",
    date: "2024-03-15",
    featured: true
  },
  {
    id: "2",
    title: "Science Exhibition Success",
    summary: "Our students won multiple awards at the regional science exhibition.",
    content: "We are proud to announce that our students have achieved remarkable success at the Regional Science Exhibition. Three projects from our school received top honors, demonstrating the innovative thinking and scientific curiosity of our students.",
    category: "achievement",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
    date: "2024-03-10",
    featured: true
  },
  {
    id: "3",
    title: "New Computer Lab Opening",
    summary: "State-of-the-art computer laboratory now available for students.",
    content: "We are excited to announce the opening of our new computer laboratory equipped with the latest technology. This facility will enhance our ICT education program and provide students with hands-on experience in modern technology.",
    category: "announcement",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    date: "2024-03-05",
    featured: false
  },
  {
    id: "4",
    title: "Cultural Day Celebration",
    summary: "Celebrating our rich cultural heritage with performances and exhibitions.",
    content: "Join us for our annual Cultural Day celebration featuring traditional dances, music performances, and cultural exhibitions. Students will showcase the rich heritage of Sri Lanka through various artistic expressions.",
    category: "special-event",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
    date: "2024-03-20",
    featured: true
  },
  {
    id: "5",
    title: "Parent-Teacher Meeting",
    summary: "Quarterly meeting to discuss student progress and school activities.",
    content: "Parents are invited to attend the quarterly Parent-Teacher Meeting to discuss their child's academic progress, upcoming activities, and any concerns. This is an important opportunity for collaboration between home and school.",
    category: "upcoming-event",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop",
    date: "2024-03-25",
    featured: false
  },
  {
    id: "6",
    title: "Chess Club Championship",
    summary: "Annual chess tournament for club members and enthusiasts.",
    content: "The Chess Club is hosting its annual championship. All students interested in chess are welcome to participate. Prizes will be awarded to the top three winners in each category.",
    category: "club",
    image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&h=600&fit=crop",
    date: "2024-03-18",
    featured: false
  }
]

export const events: Event[] = [
  {
    id: "1",
    title: "Annual Sports Meet 2024",
    description: "The biggest sporting event of the year featuring athletics, team sports, and more. All students and parents are welcome.",
    date: "2024-03-15",
    time: "8:00 AM - 5:00 PM",
    location: "School Sports Ground",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop",
    isPast: false,
    isHighlighted: true
  },
  {
    id: "2",
    title: "Cultural Day Celebration",
    description: "A day filled with cultural performances, traditional dances, and artistic exhibitions celebrating our heritage.",
    date: "2024-03-20",
    time: "9:00 AM - 3:00 PM",
    location: "School Auditorium",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop",
    isPast: false,
    isHighlighted: true
  },
  {
    id: "3",
    title: "Parent-Teacher Meeting",
    description: "Quarterly meeting to discuss student progress and upcoming academic plans.",
    date: "2024-03-25",
    time: "2:00 PM - 5:00 PM",
    location: "School Hall",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600&fit=crop",
    isPast: false,
    isHighlighted: false
  },
  {
    id: "4",
    title: "Annual Prize Giving",
    description: "Celebrating academic excellence and extracurricular achievements of our students.",
    date: "2024-04-10",
    time: "9:00 AM - 12:00 PM",
    location: "School Auditorium",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
    isPast: false,
    isHighlighted: true
  },
  {
    id: "5",
    title: "Independence Day Celebration",
    description: "National Independence Day celebration with flag hoisting and cultural programs.",
    date: "2024-02-04",
    time: "7:00 AM - 11:00 AM",
    location: "School Playground",
    image: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=800&h=600&fit=crop",
    isPast: true,
    isHighlighted: false
  }
]

export const galleryImages: GalleryImage[] = [
  { id: "1", src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop", alt: "Students in classroom", category: "Classroom" },
  { id: "2", src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop", alt: "Science lab experiment", category: "Science" },
  { id: "3", src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop", alt: "Sports day event", category: "Sports" },
  { id: "4", src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop", alt: "Cultural performance", category: "Cultural" },
  { id: "5", src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop", alt: "Library reading", category: "Library" },
  { id: "6", src: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=600&fit=crop", alt: "Art class", category: "Art" },
  { id: "7", src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop", alt: "Computer lab", category: "ICT" },
  { id: "8", src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop", alt: "Prize giving ceremony", category: "Events" },
  { id: "9", src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop", alt: "Students studying", category: "Academics" },
  { id: "10", src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop", alt: "School building", category: "Campus" },
  { id: "11", src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop", alt: "Music class", category: "Music" },
  { id: "12", src: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop", alt: "School playground", category: "Campus" }
]

export const clubs: Club[] = [
  {
    id: "1",
    name: "ICT Club",
    description: "Explore the world of technology, programming, and digital innovation. Learn coding, web development, and computer skills.",
    activities: ["Programming workshops", "Website development", "Computer maintenance", "Digital art"],
    icon: "computer"
  },
  {
    id: "2",
    name: "Science Club",
    description: "Discover the wonders of science through experiments, projects, and scientific exploration.",
    activities: ["Science experiments", "Project competitions", "Nature walks", "Scientific discussions"],
    icon: "flask"
  },
  {
    id: "3",
    name: "Sports Club",
    description: "Develop physical fitness, teamwork, and sportsmanship through various athletic activities.",
    activities: ["Athletics training", "Team sports", "Physical fitness", "Sports competitions"],
    icon: "trophy"
  },
  {
    id: "4",
    name: "Music Club",
    description: "Express creativity through music, learn instruments, and perform at school events.",
    activities: ["Instrumental training", "Choir practice", "Music performances", "Music appreciation"],
    icon: "music"
  },
  {
    id: "5",
    name: "Art Club",
    description: "Unleash artistic creativity through painting, drawing, crafts, and visual arts.",
    activities: ["Drawing and painting", "Craft making", "Art exhibitions", "Creative workshops"],
    icon: "palette"
  },
  {
    id: "6",
    name: "Drama Club",
    description: "Develop acting skills, confidence, and stage presence through theatrical performances.",
    activities: ["Drama practice", "Stage performances", "Script writing", "Public speaking"],
    icon: "theater"
  },
  {
    id: "7",
    name: "Environmental Club",
    description: "Promote environmental awareness and sustainability through eco-friendly initiatives.",
    activities: ["Tree planting", "Clean-up campaigns", "Environmental awareness", "Recycling projects"],
    icon: "leaf"
  },
  {
    id: "8",
    name: "Chess Club",
    description: "Sharpen strategic thinking and concentration through the royal game of chess.",
    activities: ["Chess tournaments", "Strategy training", "Inter-school competitions", "Chess puzzles"],
    icon: "chess"
  }
]

export const academics = {
  grades: [
    { grade: "Grade 1-5", name: "Primary Section", subjects: ["Sinhala", "English", "Mathematics", "Environment", "Religion", "Art", "Health"] },
    { grade: "Grade 6-9", name: "Junior Secondary", subjects: ["Sinhala", "English", "Mathematics", "Science", "History", "Geography", "Religion", "Art", "Health", "ICT"] },
    { grade: "Grade 10-11", name: "Senior Secondary (O/L)", subjects: ["Sinhala", "English", "Mathematics", "Science", "History", "Religion", "ICT", "Commerce", "Art"] }
  ],
  examInfo: [
    { name: "Grade 5 Scholarship Exam", description: "National level examination for Grade 5 students" },
    { name: "G.C.E. Ordinary Level", description: "National examination for Grade 11 students" },
    { name: "Term Examinations", description: "Internal examinations conducted each term" }
  ]
}

export const categories = [
  { value: "all", label: "All Categories" },
  { value: "announcement", label: "Announcements" },
  { value: "special-event", label: "Special Events" },
  { value: "upcoming-event", label: "Upcoming Events" },
  { value: "achievement", label: "Achievements" },
  { value: "sports", label: "Sports" },
  { value: "club", label: "Club Activities" }
]
