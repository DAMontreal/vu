import { db } from "./db";
import { contents, venues, events, curations, curationItems, qaSessions, badges, contentEvents } from "@shared/schema";

const seedData = [
  {
    title: "Les Femmes savantes",
    description: "Une relecture contemporaine de la pièce de Molière, transportée dans un Montréal d'aujourd'hui. Cette production audacieuse explore les tensions entre savoir et pouvoir à travers le prisme de femmes modernes qui revendiquent leur place intellectuelle. Mise en scène par Catherine Vidal au Théâtre du Nouveau Monde.",
    type: "video" as const,
    category: "theatre_contemporain" as const,
    thumbnailUrl: "/images/theatre-1.png",
    artist: "Catherine Vidal",
    duration: 120,
    venue: "Théâtre du Nouveau Monde",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.tnm.qc.ca",
    featured: true,
    year: 2025,
  },
  {
    title: "Dialogue des ombres",
    description: "Deux acteurs se confrontent dans un huis clos intense où les non-dits deviennent plus éloquents que les mots. Une pièce sur l'amour, la trahison et le pardon qui touche au plus profond de l'âme humaine. Un texte original de Marc-Antoine Leblanc.",
    type: "video" as const,
    category: "theatre_contemporain" as const,
    thumbnailUrl: "/images/theatre-2.png",
    artist: "Marc-Antoine Leblanc",
    duration: 90,
    venue: "Espace Go",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.espacego.com",
    year: 2025,
  },
  {
    title: "La Communauté",
    description: "Une fresque théâtrale mettant en scène un ensemble de douze artistes qui explorent les tensions et les solidarités au sein d'une communauté multiculturelle de Montréal. Inspirée de témoignages réels recueillis dans les quartiers de la ville.",
    type: "video" as const,
    category: "theatre_contemporain" as const,
    thumbnailUrl: "/images/theatre-3.png",
    artist: "Sophie Larochelle",
    duration: 150,
    venue: "Place des Arts",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.placedesarts.com",
    year: 2024,
  },
  {
    title: "Flux / Reflux",
    description: "Une chorégraphie hypnotisante qui explore le mouvement perpétuel de la vie à travers les vagues, les marées et les cycles naturels. La danseuse principale, Élodie Fontaine, offre une performance d'une grâce et d'une intensité remarquables sur une musique électroacoustique originale.",
    type: "video" as const,
    category: "danse_montreal" as const,
    thumbnailUrl: "/images/dance-1.png",
    artist: "Élodie Fontaine",
    duration: 75,
    venue: "Usine C",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.usine-c.com",
    year: 2025,
  },
  {
    title: "Verticalité",
    description: "Un solo masculin puissant qui défie la gravité et les conventions. Le danseur Karim Belhassan repousse les limites du corps humain dans une performance qui mêle danse contemporaine, acrobatie et arts martiaux. Une méditation physique sur la force et la vulnérabilité.",
    type: "video" as const,
    category: "danse_montreal" as const,
    thumbnailUrl: "/images/dance-2.png",
    artist: "Karim Belhassan",
    duration: 60,
    venue: "Théâtre Denise-Pelletier",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.denise-pelletier.qc.ca",
    year: 2025,
  },
  {
    title: "Entrelacs",
    description: "Un duo chorégraphique fascinant où deux danseuses tissent des liens invisibles entre leurs corps en mouvement. La pièce explore les thèmes de la connexion humaine, de l'intimité et de la séparation à travers un langage gestuel d'une grande beauté.",
    type: "video" as const,
    category: "danse_montreal" as const,
    thumbnailUrl: "/images/dance-3.png",
    artist: "Compagnie Danse Libre",
    duration: 85,
    venue: "Place des Arts",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.placedesarts.com",
    year: 2024,
  },
  {
    title: "Fragments d'un discours amoureux",
    description: "Une exploration poétique de l'œuvre de Roland Barthes, adaptée pour la scène montréalaise. Entre lecture, performance et confession, cette pièce hybride nous plonge dans les méandres du sentiment amoureux à travers les mots d'un des plus grands penseurs du XXe siècle.",
    type: "book" as const,
    category: "litterature_essais" as const,
    thumbnailUrl: "/images/book-1.png",
    artist: "Roland Barthes",
    duration: 240,
    year: 2023,
  },
  {
    title: "Poèmes de la résistance",
    description: "Un recueil de poésie contemporaine qui donne voix aux luttes sociales et environnementales de notre époque. Des textes percutants qui résonnent avec l'urgence du monde actuel, écrits par une nouvelle voix prometteuse de la littérature québécoise.",
    type: "book" as const,
    category: "litterature_essais" as const,
    thumbnailUrl: "/images/book-2.png",
    artist: "Nadia Tremblay",
    duration: 180,
    year: 2024,
  },
  {
    title: "Les Scènes invisibles",
    description: "Un essai magistral sur l'histoire cachée du théâtre québécois, des premières troupes amateurs aux grandes compagnies contemporaines. L'auteure retrace avec passion et érudition les moments clés qui ont façonné l'identité théâtrale du Québec.",
    type: "book" as const,
    category: "litterature_essais" as const,
    thumbnailUrl: "/images/book-3.png",
    artist: "Marie-Claire Dubois",
    duration: 320,
    year: 2024,
  },
  {
    title: "Racines Urbaines",
    description: "Un spectacle de danse urbaine qui célèbre la diversité culturelle de Montréal à travers le hip-hop, le krump et la danse afro-contemporaine. Une troupe de danseurs issus de différentes communautés unissent leurs styles dans une performance explosive et émouvante.",
    type: "video" as const,
    category: "coup_de_coeur_diversite" as const,
    thumbnailUrl: "/images/dance-2.png",
    artist: "Collectif Mouvance",
    duration: 95,
    venue: "Usine C",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.usine-c.com",
    year: 2025,
  },
  {
    title: "Voix du monde",
    description: "Un spectacle pluridisciplinaire mêlant théâtre, musique et danse, porté par des artistes immigrants qui partagent leurs récits d'exil et d'espoir. Une œuvre collective d'une grande humanité qui touche au cœur de l'expérience migratoire.",
    type: "video" as const,
    category: "coup_de_coeur_diversite" as const,
    thumbnailUrl: "/images/theatre-3.png",
    artist: "Ensemble Diaspora",
    duration: 110,
    venue: "Théâtre du Nouveau Monde",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.tnm.qc.ca",
    year: 2025,
  },
  {
    title: "Nocturnes symphoniques",
    description: "L'Orchestre Métropolitain de Montréal présente une soirée exceptionnelle de musique classique sous la direction de Yannick Nézet-Séguin. Au programme : Debussy, Ravel et une création originale du compositeur québécois Éric Champagne. Une expérience sonore immersive dans l'acoustique incomparable de la Maison symphonique.",
    type: "video" as const,
    category: "concerts" as const,
    thumbnailUrl: "/images/concert-1.png",
    artist: "Orchestre Métropolitain",
    duration: 120,
    venue: "Maison symphonique",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.orchestremetropolitain.com",
    year: 2025,
  },
  {
    title: "Jazz sous les étoiles",
    description: "Le saxophoniste virtuose Alain Bédard et son quartet investissent le Dièse Onze pour une nuit de jazz envoûtante. Improvisations libres, standards revisités et compositions originales se mêlent dans une atmosphère feutrée et intimiste. Un rendez-vous incontournable pour les amateurs de jazz montréalais.",
    type: "video" as const,
    category: "concerts" as const,
    thumbnailUrl: "/images/concert-2.png",
    artist: "Alain Bédard Quartet",
    duration: 90,
    venue: "Dièse Onze",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.dieseonze.com",
    year: 2025,
  },
  {
    title: "Rythmes du monde",
    description: "Un concert événement qui rassemble des musiciens de quatre continents pour une célébration musicale de la diversité culturelle de Montréal. Percussions africaines, sitars indiens, flûtes andines et chants autochtones se rencontrent dans un dialogue musical inédit à la Place des Arts.",
    type: "video" as const,
    category: "concerts" as const,
    thumbnailUrl: "/images/concert-3.png",
    artist: "Collectif Métissage",
    duration: 105,
    venue: "Place des Arts",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.placedesarts.com",
    year: 2025,
  },
  {
    title: "Chansons d'ici",
    description: "La chanteuse-auteure-compositrice Ariane Moffatt revient sur scène avec un concert acoustique intimiste. Accompagnée uniquement de sa guitare et d'un piano, elle revisite ses plus grands succès et dévoile des pièces inédites tirées de son prochain album. Un moment de grâce et d'émotion pure.",
    type: "video" as const,
    category: "concerts" as const,
    thumbnailUrl: "/images/concert-4.png",
    artist: "Ariane Moffatt",
    duration: 80,
    venue: "Théâtre Outremont",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.theatreoutremont.ca",
    year: 2025,
  },
  {
    title: "Résonance LIVE",
    description: "Une diffusion en direct depuis la Place des Arts de Montréal. Ce spectacle de danse contemporaine fusionne le mouvement avec des projections vidéo en temps réel, créant une expérience immersive unique. Chorégraphie signée par le célèbre duo Martine & Jean-François.",
    type: "video" as const,
    category: "spectacles_live" as const,
    thumbnailUrl: "/images/dance-1.png",
    artist: "Martine & Jean-François",
    duration: 90,
    venue: "Place des Arts",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.placedesarts.com",
    isLive: true,
    year: 2025,
  },
  {
    title: "Monologue du soir",
    description: "Chaque vendredi soir, un acteur différent prend la scène pour un monologue inédit, diffusé en direct. Ce soir, découvrez la performance captivante de Philippe Beaumont dans un texte autobiographique sur la paternité et le temps qui passe.",
    type: "video" as const,
    category: "spectacles_live" as const,
    thumbnailUrl: "/images/theatre-1.png",
    artist: "Philippe Beaumont",
    duration: 45,
    venue: "Espace Go",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketUrl: "https://www.espacego.com",
    isLive: true,
    year: 2025,
  },
];

const venueData = [
  { name: "Place des Arts", address: "175 Rue Sainte-Catherine O, Montréal", lat: 45.5081, lng: -73.5664 },
  { name: "Théâtre du Nouveau Monde", address: "84 Rue Sainte-Catherine O, Montréal", lat: 45.5088, lng: -73.5638 },
  { name: "Usine C", address: "1345 Avenue Lalonde, Montréal", lat: 45.5285, lng: -73.5521 },
  { name: "Espace Go", address: "4890 Boulevard Saint-Laurent, Montréal", lat: 45.5243, lng: -73.5879 },
  { name: "Théâtre Denise-Pelletier", address: "4353 Rue Sainte-Catherine E, Montréal", lat: 45.5555, lng: -73.5412 },
  { name: "Maison symphonique", address: "1600 Rue Saint-Urbain, Montréal", lat: 45.5076, lng: -73.5677 },
  { name: "Théâtre Outremont", address: "1248 Avenue Bernard, Montréal", lat: 45.5199, lng: -73.6072 },
  { name: "Dièse Onze", address: "4115 Rue Saint-Denis, Montréal", lat: 45.5218, lng: -73.5817 },
];

export async function seedDatabase() {
  const existing = await db.select().from(contents);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping...");

    const existingVenues = await db.select().from(venues);
    if (existingVenues.length === 0) {
      await seedVenuesAndEvents();
    }

    const existingCurations = await db.select().from(curations);
    if (existingCurations.length === 0) {
      await seedCuration();
    }

    const existingQa = await db.select().from(qaSessions);
    if (existingQa.length === 0) {
      await seedQaSessions();
    }

    const existingBadges = await db.select().from(badges);
    if (existingBadges.length === 0) {
      await seedBadges();
    }

    const existingEvents = await db.select().from(contentEvents);
    if (existingEvents.length === 0) {
      await seedSampleAnalytics();
    }

    return;
  }

  console.log("Seeding database with performing arts content...");
  for (const item of seedData) {
    await db.insert(contents).values(item);
  }
  console.log(`Seeded ${seedData.length} content items.`);

  await seedVenuesAndEvents();
  await seedCuration();
  await seedQaSessions();
  await seedBadges();
  await seedSampleAnalytics();
}

async function seedVenuesAndEvents() {
  console.log("Seeding venues and events...");
  const createdVenues: Record<string, string> = {};
  for (const v of venueData) {
    const [created] = await db.insert(venues).values(v).returning();
    createdVenues[v.name] = created.id;
  }

  const allContents = await db.select().from(contents);
  const videoContents = allContents.filter(c => c.type === "video" && c.venue);

  const now = new Date();
  const tonight8pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
  const tonight10pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0);

  for (const content of videoContents) {
    const venueId = createdVenues[content.venue!];
    if (venueId) {
      await db.insert(events).values({
        contentId: content.id,
        venueId,
        startTime: tonight8pm,
        endTime: tonight10pm,
        isTonight: true,
      });
    }
  }
  console.log("Venues and events seeded.");
}

async function seedCuration() {
  console.log("Seeding carte blanche...");
  const allContents = await db.select().from(contents);

  const [curation] = await db.insert(curations).values({
    title: "Carte Blanche",
    artistName: "Robert Lepage",
    artistBio: "Metteur en scène, dramaturge et cinéaste québécois de renommée internationale. Fondateur d'Ex Machina, il est reconnu pour ses créations multidisciplinaires qui repoussent les frontières du théâtre contemporain. Sa vision unique allie technologie et poésie pour créer des expériences scéniques inoubliables.",
    artistImageUrl: "/images/theatre-1.png",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    active: true,
  }).returning();

  const picks = allContents.slice(0, 5);
  const notes = [
    "Une pièce qui m'a profondément touché par sa modernité et son audace.",
    "Un mouvement chorégraphique qui rappelle la beauté de la simplicité.",
    "Une œuvre essentielle pour comprendre notre époque.",
    "La puissance de cette performance m'a laissé sans voix.",
    "Un chef-d'œuvre de sensibilité et d'intelligence artistique.",
  ];

  for (let i = 0; i < picks.length; i++) {
    await db.insert(curationItems).values({
      curationId: curation.id,
      contentId: picks[i].id,
      note: notes[i],
      sortOrder: i,
    });
  }
  console.log("Carte blanche seeded.");
}

async function seedQaSessions() {
  console.log("Seeding Q&A sessions...");
  const allContents = await db.select().from(contents);
  const videoContents = allContents.filter(c => c.type === "video");

  if (videoContents.length >= 2) {
    const now = new Date();
    const in30min = new Date(now.getTime() + 30 * 60 * 1000);
    const in2hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    await db.insert(qaSessions).values({
      contentId: videoContents[0].id,
      hostName: videoContents[0].artist,
      title: `Q&A avec ${videoContents[0].artist}`,
      startsAt: in30min,
      endsAt: new Date(in30min.getTime() + 15 * 60 * 1000),
      isActive: true,
    });

    await db.insert(qaSessions).values({
      contentId: videoContents[1].id,
      hostName: videoContents[1].artist,
      title: `Q&A avec ${videoContents[1].artist}`,
      startsAt: in2hours,
      endsAt: new Date(in2hours.getTime() + 15 * 60 * 1000),
      isActive: true,
    });
  }
  console.log("Q&A sessions seeded.");
}

const badgeData = [
  {
    code: "explorer",
    name: "Explorateur",
    description: "Vous avez découvert 3 genres différents d'arts de la scène.",
    icon: "Compass",
    criteria: { type: "genre_count", count: 3 },
  },
  {
    code: "cinephile",
    name: "Cinéphile des planches",
    description: "Vous avez regardé 5 spectacles sur la plateforme.",
    icon: "Film",
    criteria: { type: "watch_count", count: 5 },
  },
  {
    code: "assidu",
    name: "Spectateur assidu",
    description: "Vous avez regardé 10 spectacles sur la plateforme.",
    icon: "Eye",
    criteria: { type: "watch_count", count: 10 },
  },
  {
    code: "ambassadeur",
    name: "Ambassadeur",
    description: "Vous avez effectué 5 check-ins en salle de spectacle.",
    icon: "Award",
    criteria: { type: "checkin_count", count: 5 },
  },
  {
    code: "premier_pas",
    name: "Premier pas en salle",
    description: "Votre premier check-in dans un lieu de diffusion.",
    icon: "MapPin",
    criteria: { type: "checkin_count", count: 1 },
  },
  {
    code: "melomane",
    name: "Mélomane",
    description: "Vous avez assisté à 3 concerts.",
    icon: "Music",
    criteria: { type: "watch_count", count: 3 },
  },
];

async function seedBadges() {
  console.log("Seeding badges...");
  for (const badge of badgeData) {
    await db.insert(badges).values(badge);
  }
  console.log(`Seeded ${badgeData.length} badges.`);
}

async function seedSampleAnalytics() {
  console.log("Seeding sample analytics data...");
  const allContents = await db.select().from(contents);
  if (allContents.length === 0) return;

  const postalPrefixes = ["H2X", "H2Y", "H3A", "H2L", "H2K", "H3B", "H2T", "H1W", "H3C", "H2J"];
  const eventTypes = ["view_start", "ticket_click", "category_transition"] as const;

  for (let i = 0; i < 80; i++) {
    const content = allContents[Math.floor(Math.random() * allContents.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const postal = postalPrefixes[Math.floor(Math.random() * postalPrefixes.length)];
    await db.insert(contentEvents).values({
      userId: null,
      contentId: content.id,
      eventType,
      postalPrefix: postal,
      metadata: null,
    });
  }
  console.log("Sample analytics data seeded.");
}
