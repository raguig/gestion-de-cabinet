import jsPDF from "jspdf";
import { useState } from "react";

interface Patient {
  sex: string;
  nom?: string;
  prenom?: string;
}

interface TrainingTabProps {
  patient: Patient;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  note?: string;
}

interface TrainingDay {
  title: string;
  exercises: Exercise[];
}

interface SpecializedDay {
  day: string;
  session: string;
  objective: string;
  duration?: string;
}

export default function TrainingTab({ patient }: TrainingTabProps) {
  const [trainingType, setTrainingType] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState("");
  const [generatedProgram, setGeneratedProgram] = useState<
    TrainingDay[] | SpecializedDay[]
  >([]);
  const [language, setLanguage] = useState("fr"); // Default to French

  const [isSpecialized, setIsSpecialized] = useState(false);
  console.log("Patient data:", patient);
  const trainingTypes = ["prise de masse", "endurance musculaire"];
  const equipmentOptions = [
    "haltères",
    "bandes élastiques",
    "machines",
    "poids du corps",
    "Yoga",
    "Pilates",
    "Tai-chi",
    "Qi Gong",
    "Stretching",
    "Karate",
    "Boxe",
    "Taekwondo",
    "Judo",
    "Kung-Fu / Wushu",
    "Ju-jitsu",
  ];
  const activityLevels = ["débutant", "intermédiaire", "avancé"];

  // Specialized programs (same for both genders)
  const generateSpecializedProgram = (type: string): SpecializedDay[] => {
    switch (type) {
      case "Yoga":
        return [
          {
            day: "Lundi",
            session: "Hatha Yoga Doux",
            objective: "Éveil du corps, respiration",
            duration: "30-45 min",
          },
          {
            day: "Mardi",
            session: "Vinyasa Flow Débutant",
            objective: "Renforcement doux, mobilité",
            duration: "30-45 min",
          },
          {
            day: "Mercredi",
            session: "Yoga pour le dos et la posture",
            objective: "Soulager tensions, redresser la posture",
            duration: "30-45 min",
          },
          {
            day: "Jeudi",
            session: "Yin Yoga",
            objective: "Étirement profond, relâchement",
            duration: "30-45 min",
          },
          {
            day: "Vendredi",
            session: "Power Yoga léger",
            objective: "Tonification douce, équilibre",
            duration: "30-45 min",
          },
          {
            day: "Samedi",
            session: "(Optionnel) Méditation + Pranayama",
            objective: "Calme mental, contrôle du souffle",
            duration: "30-45 min",
          },
          {
            day: "Dimanche",
            session: "Repos ou balade en conscience",
            objective: "Récupération active",
            duration: "30-45 min",
          },
        ];
      case "Pilates":
        return [
          {
            day: "Lundi",
            session: "Pilates de base – Centre & respiration",
            objective: "Renforcement du « core », contrôle du souffle",
            duration: "30-45 min",
          },
          {
            day: "Mardi",
            session: "Pilates bas du corps",
            objective: "Cuisses, fessiers, stabilité pelvienne",
            duration: "30-45 min",
          },
          {
            day: "Mercredi",
            session: "Stretching & mobilité en Pilates",
            objective: "Étirements actifs, mobilité articulaire",
            duration: "30-45 min",
          },
          {
            day: "Jeudi",
            session: "Pilates haut du corps & posture",
            objective: "Épaules, dos, bras, posture",
            duration: "30-45 min",
          },
          {
            day: "Vendredi",
            session: "Pilates complet + gainage",
            objective: "Travail global, ceinture abdominale",
            duration: "30-45 min",
          },
          {
            day: "Samedi",
            session: "(optionnel) Routine douce avec ballon",
            objective: "Stabilité et contrôle",
            duration: "30-45 min",
          },
          {
            day: "Dimanche",
            session: "Repos actif ou marche consciente",
            objective: "Récupération et détente",
            duration: "30-45 min",
          },
        ];
      case "Karate":
        return [
          {
            day: "Lundi",
            session: "Kihon (techniques de base)",
            objective: "Apprentissage des coups de poing, blocages, positions",
            duration: "30-45 min",
          },
          {
            day: "Mardi",
            session: "Enchaînements + déplacements (Kihon Waza)",
            objective: "Coordination, équilibre, enchaînements fluides",
            duration: "30-45 min",
          },
          {
            day: "Mercredi",
            session: "Kata de base (ex. : Heian Shodan)",
            objective: "Mémorisation, précision, respiration",
            duration: "30-45 min",
          },
          {
            day: "Jeudi",
            session: "Kumite sans contact (combat simulé)",
            objective: "Vitesse, distance, timing, respect",
            duration: "30-45 min",
          },
          {
            day: "Vendredi",
            session: "Renforcement + souplesse spécifique",
            objective: "Gainage, jambes, étirements, explosivité",
            duration: "30-45 min",
          },
          {
            day: "Samedi",
            session: "Révision libre + shadow karaté",
            objective: "Maîtrise personnelle",
            duration: "30-45 min",
          },
          {
            day: "Dimanche",
            session: "Repos ou méditation Zen",
            objective: "Esprit du karaté, recentrage",
            duration: "30-45 min",
          },
        ];
      case "Tai-chi":
        return [
          {
            day: "Lundi",
            session: "Postures de base + respiration consciente",
            objective: "Ancrage, conscience du souffle",
            duration: "20-30 min",
          },
          {
            day: "Mardi",
            session: "Enchaînement 'Forme 8' (forme courte)",
            objective: "Fluidité, mémorisation des gestes simples",
            duration: "20-30 min",
          },
          {
            day: "Mercredi",
            session: "Mouvement lent + ancrage dans le sol",
            objective: "Équilibre, mobilité articulaire",
            duration: "20-30 min",
          },
          {
            day: "Jeudi",
            session: "Application martiale lente (Tai-Chi Chuan)",
            objective: "Concentration, gestuelle maîtrisée",
            duration: "20-30 min",
          },
          {
            day: "Vendredi",
            session: "Forme complète + Qi Gong d’éveil",
            objective: "Circulation énergétique, sérénité mentale",
            duration: "20-30 min",
          },
          {
            day: "Samedi",
            session: "(Optionnel) Tai-Chi méditatif en plein air",
            objective: "Méditation en mouvement, apaisement",
            duration: "20-30 min",
          },
          {
            day: "Dimanche",
            session: "Repos ou marche lente consciente",
            objective: "Récupération naturelle",
            duration: "20-30 min",
          },
        ];
      case "Qi Gong":
        return [
          {
            day: "Lundi",
            session: "Échauffement énergétique + 8 pièces de Brocart",
            objective: "Éveil du corps, tonification des organes",
            duration: "20-30 min",
          },
          {
            day: "Mardi",
            session: "Qi Gong des 5 animaux (Wu Qin Xi) – partie 1",
            objective: "Mobilité, fluidité, activation douce",
            duration: "20-30 min",
          },
          {
            day: "Mercredi",
            session: "Respiration abdominale + mouvements statiques",
            objective: "Détente du système nerveux, enracinement",
            duration: "20-30 min",
          },
          {
            day: "Jeudi",
            session: "Qi Gong pour renforcer les reins et l'immunité",
            objective: "Énergie vitale, longévité",
            duration: "20-30 min",
          },
          {
            day: "Vendredi",
            session: "Qi Gong des méridiens + automassages",
            objective: "Circulation énergétique, détente musculaire",
            duration: "20-30 min",
          },
          {
            day: "Samedi",
            session: "Qi Gong méditatif debout (Zhan Zhuang)",
            objective: "Concentration, ancrage, puissance interne",
            duration: "20-30 min",
          },
          {
            day: "Dimanche",
            session: "Marche Qi Gong lente ou repos",
            objective: "Récupération énergétique, conscience du souffle",
            duration: "20-30 min",
          },
        ];

      case "Stretching":
        return [
          {
            day: "Lundi",
            session: "Stretching global du corps (full body)",
            objective: "Détente générale, allongement musculaire",
            duration: "20-30 min",
          },
          {
            day: "Mardi",
            session: "Étirements du bas du corps",
            objective: "Fessiers, quadriceps, ischios, mollets",
            duration: "20-30 min",
          },
          {
            day: "Mercredi",
            session: "Étirements du haut du corps",
            objective: "Dos, épaules, nuque, bras",
            duration: "20-30 min",
          },
          {
            day: "Jeudi",
            session: "Stretching actif + mobilité articulaire",
            objective: "Souplesse dynamique, fluidité",
            duration: "20-30 min",
          },
          {
            day: "Vendredi",
            session: "Stretching profond & relaxation",
            objective: "Postures longues tenues (Yin-like)",
            duration: "20-30 min",
          },
          {
            day: "Samedi",
            session: "Stretching matinal 10-15 min",
            objective: "Éveil musculaire en douceur",
            duration: "10-15 min",
          },
          {
            day: "Dimanche",
            session: "Repos ou étirements libres",
            objective: "Auto-écoute et libération corporelle",
            duration: "20-30 min",
          },
        ];

      case "Boxe":
        return [
          {
            day: "Lundi",
            session: "Cardio + shadow boxing",
            objective: "Endurance cardiovasculaire et fluidité technique",
            duration: "45-60 min",
          },
          {
            day: "Mardi",
            session: "Techniques de poings/pieds + sac de frappe",
            objective: "Perfectionnement technique et puissance",
            duration: "45-60 min",
          },
          {
            day: "Mercredi",
            session: "Renfo musculaire + gainage",
            objective: "Renforcement global et stabilité",
            duration: "45-60 min",
          },
          {
            day: "Jeudi",
            session: "Sparring (léger ou simulation)",
            objective: "Application technique et distance",
            duration: "45-60 min",
          },
          {
            day: "Vendredi",
            session: "Coordination + esquives + souplesse",
            objective: "Agilité et défense",
            duration: "45-60 min",
          },
        ];

      case "Taekwondo":
        return [
          {
            day: "Lundi",
            session: "Techniques de jambes (Chagi)",
            objective: "Maîtrise des coups de pied fondamentaux",
            duration: "45-60 min",
          },
          {
            day: "Mardi",
            session: "Séquences de combat + flexibilité",
            objective: "Enchaînements et souplesse",
            duration: "45-60 min",
          },
          {
            day: "Mercredi",
            session: "Poomsae (formes) + équilibre",
            objective: "Formes techniques et stabilité",
            duration: "45-60 min",
          },
          {
            day: "Jeudi",
            session: "Cardio + travail des réflexes",
            objective: "Vitesse et réactivité",
            duration: "45-60 min",
          },
          {
            day: "Vendredi",
            session: "Simulations de combat + renforcement jambes",
            objective: "Application combat et puissance",
            duration: "45-60 min",
          },
        ];

      case "Judo":
        return [
          {
            day: "Lundi",
            session: "Ukemi (chutes) + déplacements",
            objective: "Sécurité et mobilité de base",
            duration: "45-60 min",
          },
          {
            day: "Mardi",
            session: "Techniques de projection (nage waza)",
            objective: "Maîtrise des projections fondamentales",
            duration: "45-60 min",
          },
          {
            day: "Mercredi",
            session: "Renforcement + gainage",
            objective: "Force fonctionnelle et stabilité",
            duration: "45-60 min",
          },
          {
            day: "Jeudi",
            session: "Combat au sol (ne waza)",
            objective: "Techniques de contrôle au sol",
            duration: "45-60 min",
          },
          {
            day: "Vendredi",
            session: "Randori (combat libre contrôlé)",
            objective: "Application pratique des techniques",
            duration: "45-60 min",
          },
        ];

      case "Kung-Fu / Wushu":
        return [
          {
            day: "Lundi",
            session: "Postures + techniques de base",
            objective: "Fondamentaux et alignement",
            duration: "45-60 min",
          },
          {
            day: "Mardi",
            session: "Formes traditionnelles (taolu)",
            objective: "Enchaînements codifiés",
            duration: "45-60 min",
          },
          {
            day: "Mercredi",
            session: "Souplesse + Qi Gong",
            objective: "Mobilité et énergie interne",
            duration: "45-60 min",
          },
          {
            day: "Jeudi",
            session: "Sanda (combat avec règles)",
            objective: "Application martiale",
            duration: "45-60 min",
          },
          {
            day: "Vendredi",
            session: "Enchaînements + saut + arme légère",
            objective: "Techniques avancées selon niveau",
            duration: "45-60 min",
          },
        ];

      case "Ju-jitsu":
        return [
          {
            day: "Lundi",
            session: "Mouvements au sol (escapes, gardes)",
            objective: "Défense et contrôle au sol",
            duration: "45-60 min",
          },
          {
            day: "Mardi",
            session: "Techniques de soumission",
            objective: "Maîtrise des clés et étranglements",
            duration: "45-60 min",
          },
          {
            day: "Mercredi",
            session: "Sparring technique",
            objective: "Application contrôlée des techniques",
            duration: "45-60 min",
          },
          {
            day: "Jeudi",
            session: "Tactique en combat réel",
            objective: "Stratégie et adaptation",
            duration: "45-60 min",
          },
          {
            day: "Vendredi",
            session: "Mobilité, respiration, récupération",
            objective: "Maintien et régénération",
            duration: "45-60 min",
          },
        ];

      default:
        return [];
    }
  };

  // Male training programs
  const generateMaleProgram = (
    level: string,
    equipment: string[]
  ): TrainingDay[] => {
    const isWeightsMachines =
      equipment.includes("haltères") || equipment.includes("machines");
    const isBodyweightBands =
      equipment.includes("poids du corps") ||
      equipment.includes("bandes élastiques");

    if (isWeightsMachines) {
      switch (level) {
        case "débutant":
          return [
            {
              title: "Jour 1 – Haut du corps",
              exercises: [
                { name: "Chest press (machine)", sets: 4, reps: "8-12" },
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                {
                  name: "Développé épaules (machine ou haltères)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Curl biceps (haltères ou poulie basse)",
                  sets: 3,
                  reps: "10-12",
                },
                {
                  name: "Extension triceps à la poulie",
                  sets: 3,
                  reps: "10-12",
                },
              ],
            },
            {
              title: "Jour 2 – Bas du corps + abdos",
              exercises: [
                { name: "Leg press (machine)", sets: 4, reps: "10-15" },
                { name: "Leg curl (ischio) – machine", sets: 4, reps: "10-15" },
                {
                  name: "Extension mollets debout (machine)",
                  sets: 4,
                  reps: "12-20",
                },
                { name: "Crunchs au sol", sets: 3, reps: "20-25" },
                {
                  name: "Planche",
                  sets: 3,
                  reps: "",
                  duration: "30-60 secondes",
                },
              ],
            },
            {
              title: "Jour 3 – Full body",
              exercises: [
                { name: "Chest press (machine)", sets: 3, reps: "8-12" },
                { name: "Squat avec haltères", sets: 4, reps: "8-12" },
                { name: "Rowing un bras avec haltère", sets: 3, reps: "10-12" },
                { name: "Shoulder press (haltères)", sets: 3, reps: "8-12" },
                {
                  name: "Gainage (planche ou planche latérale)",
                  sets: 3,
                  reps: "15-20",
                  duration: "30-45 secondes",
                },
              ],
            },
          ];
        case "intermédiaire":
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                { name: "Chest press", sets: 4, reps: "8-12" },
                { name: "Écarté couché avec haltères", sets: 3, reps: "10-12" },
                { name: "Dips assistés", sets: 3, reps: "6-10" },
                { name: "Extension triceps poulie", sets: 3, reps: "10-12" },
                { name: "Kickback triceps (haltère)", sets: 3, reps: "12-15" },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                { name: "Tirage vertical (machine)", sets: 4, reps: "8-12" },
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                { name: "Curl biceps haltères", sets: 3, reps: "10-12" },
                { name: "Curl marteau (haltères)", sets: 3, reps: "10-12" },
                { name: "Curl poulie basse", sets: 3, reps: "12-15" },
              ],
            },
            {
              title: "Jour 3 – Jambes + Abdos",
              exercises: [
                { name: "Leg press", sets: 4, reps: "10-15" },
                { name: "Leg curl (machine)", sets: 4, reps: "10-12" },
                { name: "Fentes avec haltères", sets: 3, reps: "10 par jambe" },
                { name: "Crunch au sol ou machine", sets: 3, reps: "20-25" },
                { name: "Relevé de jambes suspendu", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 4 – Épaules + Full body",
              exercises: [
                { name: "Shoulder press", sets: 4, reps: "8-12" },
                { name: "Élévations latérales", sets: 3, reps: "10-12" },
                { name: "Élévations frontales", sets: 3, reps: "10-12" },
                { name: "Squats haltères", sets: 4, reps: "8-12" },
                {
                  name: "Planche (core)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
          ];
        case "avancé":
          return [
            {
              title: "Jour 1 – Poitrine",
              exercises: [
                { name: "Chest press", sets: 4, reps: "8-12" },
                { name: "Développé incliné (machine)", sets: 3, reps: "8-12" },
                { name: "Écarté couché (haltères)", sets: 3, reps: "10-12" },
                { name: "Pompes (si possible)", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 2 – Dos",
              exercises: [
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                { name: "Tirage horizontal (poulie)", sets: 3, reps: "8-12" },
                { name: "Rowing un bras haltère", sets: 3, reps: "10-12" },
                {
                  name: "Gainage lombaire (hyperextensions)",
                  sets: 3,
                  reps: "15-20",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes",
              exercises: [
                { name: "Leg press", sets: 4, reps: "10-15" },
                { name: "Fentes avec haltères", sets: 3, reps: "10 par jambe" },
                { name: "Leg curl", sets: 4, reps: "10-12" },
                { name: "Mollets assis (machine)", sets: 4, reps: "12-20" },
                { name: "Crunchs", sets: 3, reps: "20-25" },
              ],
            },
            {
              title: "Jour 4 – Épaules + abdos",
              exercises: [
                { name: "Développé épaules (haltères)", sets: 4, reps: "8-12" },
                { name: "Élévations latérales", sets: 3, reps: "10-12" },
                {
                  name: "Élévations postérieures (oiseaux)",
                  sets: 3,
                  reps: "10-12",
                },
                { name: "Crunchs", sets: 3, reps: "20-25" },
                {
                  name: "Planche",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 5 – Bras (biceps & triceps)",
              exercises: [
                { name: "Curl biceps haltères", sets: 4, reps: "10-12" },
                { name: "Curl marteau", sets: 3, reps: "10-12" },
                { name: "Triceps à la poulie", sets: 3, reps: "10-12" },
                { name: "Dips assistés", sets: 3, reps: "6-10" },
                { name: "Kickback triceps", sets: 3, reps: "12-15" },
              ],
            },
          ];
      }
    }

    if (isBodyweightBands) {
      switch (level) {
        case "débutant":
          return [
            {
              title: "Jour 1 – Haut du corps (Poitrine, épaules, triceps)",
              exercises: [
                {
                  name: "Pompes (poids du corps)",
                  sets: 3,
                  reps: "8-12",
                  note: "Si trop difficile, fais-les sur les genoux ou contre un mur",
                },
                {
                  name: "Pompes avec bande élastique (sur le dos)",
                  sets: 3,
                  reps: "10-12",
                },
                {
                  name: "Élévations latérales avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Extensions triceps avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Planche (gainage)",
                  sets: 3,
                  reps: "",
                  duration: "20-30 secondes",
                },
              ],
            },
            {
              title: "Jour 2 – Bas du corps (Jambes, fessiers, mollets)",
              exercises: [
                { name: "Squats au poids du corps", sets: 3, reps: "12-15" },
                {
                  name: "Fentes avant (poids du corps)",
                  sets: 3,
                  reps: "10-12 par jambe",
                },
                {
                  name: "Pont fessier avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout avec bande élastique",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Planche latérale (gainage)",
                  sets: 3,
                  reps: "",
                  duration: "15-20 secondes de chaque côté",
                },
              ],
            },
            {
              title: "Jour 3 – Full body (Totalité du corps)",
              exercises: [
                {
                  name: "Pompes inclinées avec bande élastique",
                  sets: 3,
                  reps: "8-12",
                },
                { name: "Squats avec bande élastique", sets: 3, reps: "12-15" },
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Fentes latérales avec bande élastique",
                  sets: 3,
                  reps: "12 par jambe",
                },
                {
                  name: "Planche (gainage dynamique)",
                  sets: 3,
                  reps: "",
                  duration: "20-30 secondes",
                },
              ],
            },
          ];
        case "intermédiaire":
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Pompes classiques avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Écarté couché avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Dips assistés avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Extensions triceps avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Kickback triceps avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Tirage horizontal avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Curl biceps avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Curl marteau avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Planche dynamique",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes + Abdos",
              exercises: [
                {
                  name: "Squats avec bande élastique autour des genoux",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Fentes avant avec bande élastique",
                  sets: 4,
                  reps: "10-12 par jambe",
                },
                {
                  name: "Pont fessier avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Crunchs avec bande élastique",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Relevé de jambes suspendu (si possible)",
                  sets: 3,
                  reps: "15-20",
                },
              ],
            },
            {
              title: "Jour 4 – Full body",
              exercises: [
                { name: "Pompes avec bande élastique", sets: 4, reps: "8-12" },
                {
                  name: "Squats sautés avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Fentes latérales avec bande élastique",
                  sets: 4,
                  reps: "12 par jambe",
                },
                {
                  name: "Planche dynamique avec mouvement de bras et jambes",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
          ];
        case "avancé":
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Pompes classiques avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Pompes inclinées avec bande élastique",
                  sets: 4,
                  reps: "10-12",
                },
                {
                  name: "Écarté couché avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Dips assistés avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Extensions triceps à la poulie avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Kickback triceps avec bande élastique",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Tirage horizontal avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Curl biceps avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Curl marteau avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Planche dynamique avec mouvement de bras",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes + Abdos",
              exercises: [
                {
                  name: "Squats avec bande élastique autour des genoux",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Fentes avant avec bande élastique",
                  sets: 4,
                  reps: "10-12 par jambe",
                },
                {
                  name: "Pont fessier avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout avec bande élastique",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Crunchs avec bande élastique",
                  sets: 4,
                  reps: "15-20",
                },
                { name: "Relevé de jambes suspendu", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 4 – Épaules + Abdos",
              exercises: [
                {
                  name: "Développé épaules avec bande élastique",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Élévations frontales avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Oiseaux (élévations postérieures) avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Planche dynamique (gainage)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 5 – Full body (Totalité du corps)",
              exercises: [
                {
                  name: "Pompes avec bande élastique autour du dos",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Squats sautés avec bande élastique",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Rowing avec bande élastique (debout)",
                  sets: 4,
                  reps: "12-15",
                },
                {
                  name: "Fentes latérales avec bande élastique",
                  sets: 4,
                  reps: "12 par jambe",
                },
                {
                  name: "Gainage dynamique (planche avec rotations)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
          ];
      }
    }

    return [];
  };

  // Female training programs
  const generateFemaleProgram = (
    level: string,
    equipment: string[]
  ): TrainingDay[] => {
    const isWeightsMachines =
      equipment.includes("haltères") || equipment.includes("machines");
    const isBodyweightBands =
      equipment.includes("poids du corps") ||
      equipment.includes("bandes élastiques");

    if (isWeightsMachines) {
      switch (level) {
        case "débutant":
          return [
            {
              title: "Jour 1 – Haut du corps",
              exercises: [
                {
                  name: "Chest press (machine)",
                  sets: 4,
                  reps: "8-12",
                  note: "Repos : 60-90s entre chaque série",
                },
                { name: "Écarté couché haltères", sets: 3, reps: "12-15" },
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                {
                  name: "Développé épaules (haltères)",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Curl biceps (haltères)", sets: 3, reps: "10-12" },
                {
                  name: "Extension triceps à la poulie",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Bas du corps + Core",
              exercises: [
                { name: "Goblet squat (haltère)", sets: 4, reps: "8-12" },
                {
                  name: "Hip thrust (machine ou barre + banc)",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Leg curl (machine ischio)", sets: 4, reps: "10-12" },
                { name: "Mollets debout (machine)", sets: 3, reps: "15-20" },
                { name: "Crunchs au sol", sets: 3, reps: "20" },
                {
                  name: "Planche",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 3 – Full Body",
              exercises: [
                {
                  name: "Soulevé de terre jambes tendues (haltères)",
                  sets: 3,
                  reps: "8-12",
                },
                { name: "Développé couché haltères", sets: 3, reps: "8-12" },
                { name: "Rowing un bras (haltère)", sets: 3, reps: "10-12" },
                {
                  name: "Élévations latérales (haltères)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Gainage dynamique (planche + lever de bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes",
                },
              ],
            },
          ];
        case "intermédiaire":
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Chest press (machine)",
                  sets: 4,
                  reps: "8-12",
                  note: "Repos : 60-90s (composés) / 45-60s (isolations)",
                },
                { name: "Écarté incliné (haltères)", sets: 3, reps: "12-15" },
                {
                  name: "Dips assistés (machine ou banc)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Extension triceps à la poulie haute",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Kickback triceps (haltère)", sets: 3, reps: "12-15" },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                { name: "Tirage vertical (machine)", sets: 4, reps: "8-12" },
                { name: "Rowing assis (machine)", sets: 4, reps: "8-12" },
                { name: "Rowing un bras (haltère)", sets: 3, reps: "10-12" },
                { name: "Curl biceps (haltères)", sets: 3, reps: "12-15" },
                { name: "Curl marteau (haltères)", sets: 3, reps: "12-15" },
              ],
            },
            {
              title: "Jour 3 – Jambes + Abdos",
              exercises: [
                { name: "Leg press (machine)", sets: 4, reps: "10-12" },
                {
                  name: "Hip thrust (machine ou barre + banc)",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Leg curl (machine ischio)", sets: 3, reps: "10-12" },
                { name: "Mollets debout (machine)", sets: 4, reps: "12-15" },
                { name: "Crunchs au sol (ou machine)", sets: 3, reps: "15-20" },
                {
                  name: "Planche (gainage)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 4 – Épaules + Full Body",
              exercises: [
                {
                  name: "Shoulder press (machine ou haltères)",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales (haltères)",
                  sets: 3,
                  reps: "12-15",
                },
                { name: "Goblet squat (haltère)", sets: 3, reps: "8-12" },
                {
                  name: "Rowing inversé (machine ou poulie basse)",
                  sets: 3,
                  reps: "10-12",
                },
                {
                  name: "Gainage dynamique (planche + lever bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes",
                },
              ],
            },
          ];
        case "avancé":
          return [
            {
              title: "Jour 1 – Poitrine",
              exercises: [
                { name: "Chest press (machine)", sets: 4, reps: "15-20" },
                {
                  name: "Développé incliné (haltères)",
                  sets: 3,
                  reps: "15-20",
                },
                { name: "Écarté couché (haltères)", sets: 3, reps: "15-20" },
                { name: "Pompes pieds surélevés", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 2 – Dos",
              exercises: [
                { name: "Tirage horizontal (poulie)", sets: 4, reps: "15-20" },
                { name: "Rowing assis (machine)", sets: 3, reps: "15-20" },
                {
                  name: "Tirage vertical prise neutre (machine)",
                  sets: 3,
                  reps: "15-20",
                },
                { name: "Rowing un bras (haltère)", sets: 3, reps: "15-20" },
              ],
            },
            {
              title: "Jour 3 – Jambes",
              exercises: [
                {
                  name: "Squat hack (machine) ou squat libre léger",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Hip thrust (machine ou barre + banc)",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Fentes marchées (haltères légers)",
                  sets: 3,
                  reps: "15-20 par jambe",
                },
                { name: "Leg curl (machine ischio)", sets: 3, reps: "15-20" },
                { name: "Mollets debout (machine)", sets: 4, reps: "20-25" },
              ],
            },
            {
              title: "Jour 4 – Épaules + Abdos",
              exercises: [
                {
                  name: "Développé épaules (haltères ou machine légère)",
                  sets: 4,
                  reps: "15-20",
                },
                {
                  name: "Élévations latérales (haltères légers)",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Élévations postérieures (haltères ou machine)",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Crunchs à la machine ou au sol",
                  sets: 3,
                  reps: "20-25",
                },
                {
                  name: "Planche dynamique (alternance bras/jambe)",
                  sets: 3,
                  reps: "",
                  duration: "45-60 secondes",
                },
              ],
            },
            {
              title: "Jour 5 – Bras + Full Body Léger",
              exercises: [
                {
                  name: "Curl biceps (haltères légers)",
                  sets: 3,
                  reps: "15-20",
                },
                { name: "Curl incliné (haltères)", sets: 3, reps: "15-20" },
                {
                  name: "Extension triceps à la poulie",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Dips assistés (banc ou machine)",
                  sets: 3,
                  reps: "15-20",
                },
                {
                  name: "Goblet squat léger (haltère)",
                  sets: 2,
                  reps: "20-25",
                  note: "Active recovery",
                },
              ],
            },
          ];
      }
    }

    if (isBodyweightBands) {
      switch (level) {
        case "débutant":
          return [
            {
              title: "Jour 1 – Haut du corps",
              exercises: [
                { name: "Pompes genoux (ou mur)", sets: 3, reps: "8-12" },
                {
                  name: "Rowing debout avec bande (tirage vers le bas)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales (bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Extensions triceps debout (bande sous un pied, bras tendu)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Planche (gainage statique)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 2 – Bas du corps + Core",
              exercises: [
                {
                  name: "Squat poids du corps (bandes autour des cuisses)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Fentes avant (alternées, bande sous le pied arrière)",
                  sets: 3,
                  reps: "8-12 par jambe",
                },
                {
                  name: "Pont fessier au sol (bandes autour des genoux)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout unipodaux (bande sous le pied de support)",
                  sets: 3,
                  reps: "12-15 par jambe",
                },
                {
                  name: "Planche latérale",
                  sets: 3,
                  reps: "",
                  duration: "20-30 secondes par côté",
                },
              ],
            },
            {
              title: "Jour 3 – Full Body",
              exercises: [
                {
                  name: "Pompes inclinées (mains sur banc/chair + bande autour du dos)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Soulevé de terre jambes tendues poids du corps",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Rowing un bras (bande fixée bas)",
                  sets: 3,
                  reps: "8-12 par bras",
                },
                {
                  name: "Fentes latérales (bande autour des genoux)",
                  sets: 3,
                  reps: "12-15 par jambe",
                },
                {
                  name: "Gainage dynamique (planche + lever bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes",
                },
              ],
            },
          ];
        case "intermédiaire":
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Pompes classiques ou sur les genoux",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Dips assistés (banc / chaise + bande sous les genoux)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Écarté debout avec bande (axe horizontal)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Extension triceps à la bande (bande sous un pied)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Kickback triceps (bande sous un pied, buste penché)",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                {
                  name: "Rowing debout avec bande (tirage bas → poitrine)",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Tirage horizontal avec bande (bande fixée bas)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Band pull-apart (écarté dos)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Curl biceps avec bande (pieds sur la bande)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Curl marteau (prise neutre, bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes + Core",
              exercises: [
                {
                  name: "Squat poids du corps + bande autour des cuisses",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Bulgarian split squat (pied arrière surélevé + bande sous le pied avant)",
                  sets: 3,
                  reps: "8-12 par jambe",
                },
                {
                  name: "Hip thrust au sol ou banc (bande autour des genoux)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Good morning jambes tendues (bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout unipodaux (bande sous le pied de support)",
                  sets: 3,
                  reps: "12-15 par jambe",
                },
                {
                  name: "Planche latérale",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes par côté",
                },
              ],
            },
            {
              title: "Jour 4 – Épaules + Full Body",
              exercises: [
                {
                  name: "Pompes inclinées (mains surélevées + bande autour du dos)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Développé épaules debout (bande sous les pieds)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales (bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Rowing un bras (bande fixée basse)",
                  sets: 3,
                  reps: "8-12 par bras",
                },
                {
                  name: "Gainage dynamique (planche + lever bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes",
                },
              ],
            },
          ];
        case "avancé":
          return [
            {
              title: "Jour 1 – Poitrine + Triceps",
              exercises: [
                {
                  name: "Pompes classiques + bande autour du dos",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Dips assistés entre deux chaises + bande sous les genoux",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Écarté debout à la bande (axe horizontal)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Extension triceps à la bande (bande sous un pied)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Kickback triceps (buste penché + bande sous un pied)",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 2 – Dos + Biceps",
              exercises: [
                {
                  name: "Rowing debout à la bande (tirage bas → poitrine)",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Tirage horizontal à la bande (bande fixée bas)",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Band pull apart (écarté dos)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Curl biceps à la bande (pieds sur la bande)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Curl marteau à la bande (prise neutre)",
                  sets: 3,
                  reps: "12-15",
                },
              ],
            },
            {
              title: "Jour 3 – Jambes + Core",
              exercises: [
                {
                  name: "Squat poids du corps + bande autour des cuisses",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Bulgarian split squat + bande sous le pied avant",
                  sets: 3,
                  reps: "8-12 par jambe",
                },
                {
                  name: "Hip thrust (dos sur banc ou sol) + bande autour des genoux",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Good morning jambes tendues + bande sous les pieds",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Mollets debout unipodaux + bande sous le pied de support",
                  sets: 3,
                  reps: "12-15 par jambe",
                },
                {
                  name: "Planche latérale",
                  sets: 3,
                  reps: "",
                  duration: "30 secondes par côté",
                },
              ],
            },
            {
              title: "Jour 4 – Épaules + Abdos",
              exercises: [
                {
                  name: "Développé épaules debout à la bande (bande sous les pieds)",
                  sets: 4,
                  reps: "8-12",
                },
                {
                  name: "Élévations latérales à la bande (bande sous les pieds)",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Oiseaux (élévations postérieures) à la bande",
                  sets: 3,
                  reps: "12-15",
                },
                {
                  name: "Crunchs au sol ou à la bande (bande derrière la tête)",
                  sets: 3,
                  reps: "15",
                },
                {
                  name: "Gainage dynamique (planche + lever bras/jambe opposés)",
                  sets: 3,
                  reps: "",
                  duration: "30-45 secondes",
                },
              ],
            },
            {
              title: "Jour 5 – Full Body Avancé",
              exercises: [
                {
                  name: "Pompes archers assistées à la bande",
                  sets: 3,
                  reps: "6-8 par jambe",
                },
                {
                  name: "Pistol squat assisté à la bande (surélever l'autre jambe)",
                  sets: 3,
                  reps: "6-8 par jambe",
                },
                {
                  name: "Rowing un bras à la bande (bande fixée basse)",
                  sets: 3,
                  reps: "8-12 par bras",
                },
                {
                  name: "Dips profonds assistés (entre deux chaises) + bande",
                  sets: 3,
                  reps: "8-12",
                },
                {
                  name: "Hip thrust unilatéral + bande",
                  sets: 3,
                  reps: "8-12 par jambe",
                },
                {
                  name: "Gainage planche statique",
                  sets: 3,
                  reps: "",
                  duration: "45-60 secondes",
                },
              ],
            },
          ];
      }
    }

    return [];
  };

  // Main program generator
  const generateProgram = (
    level: string,
    isMale: boolean,
    equipment: string[]
  ): TrainingDay[] | SpecializedDay[] => {
    // Check for specialized programs first
    const specializedTypes = [
      "Yoga",
      "Pilates",
      "Tai-chi",
      "Qi Gong",
      "Stretching",
      "Karate",
      "Boxe",
      "Taekwondo",
      "Judo",
      "Kung-Fu / Wushu",
      "Ju-jitsu",
    ];

    const specializedProgram = equipment.find((eq) =>
      specializedTypes.includes(eq)
    );
    if (specializedProgram) {
      setIsSpecialized(true);
      return generateSpecializedProgram(specializedProgram);
    }

    setIsSpecialized(false);

    // Generate regular training programs based on gender
    if (patient.sex == "male") {
      return generateMaleProgram(level, equipment);
    } else {
      return generateFemaleProgram(level, equipment);
    }
  };

  const handleTrainingSubmit = () => {
    if (!trainingType || equipment.length === 0 || !activityLevel) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    const isMale = patient.sex === "male";
    const program = generateProgram(activityLevel, isMale, equipment);
    setGeneratedProgram(program);

    // Generate PDF
    generatePDF(program, isMale);
  };

  const generatePDF = (
    program: TrainingDay[] | SpecializedDay[],
    isMale: boolean
  ) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;

    // Enhanced colors
    const colors = {
      primary: [41, 128, 185], // Nice blue
      secondary: [46, 204, 113], // Green
      accent: [230, 126, 34], // Orange
      text: [44, 62, 80], // Dark blue-grey
      lightGray: [236, 240, 241], // Light gray
      white: [255, 255, 255],
      headerBg: [52, 152, 219], // Bright blue
    };

    // Enhanced Header with Logo/Design
    const drawHeader = () => {
      doc.setFillColor(...colors.headerBg);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Add subtle design element
      doc.setFillColor(...colors.accent);
      doc.circle(pageWidth - 20, 20, 15, "F");

      doc.setFontSize(24);
      doc.setTextColor(...colors.white);
      doc.setFont("helvetica", "bold");
      const title =
        language === "fr" ? "PROGRAMME D'ENTRAÎNEMENT" : "TRAINING PROGRAM";
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, 25);
    };

    // Enhanced Patient Info Section
    const drawPatientInfo = () => {
      const infoX = margin;
      let infoY = 50;

      // Info box background
      doc.setFillColor(...colors.lightGray);
      doc.roundedRect(
        margin - 5,
        45,
        pageWidth - 2 * margin + 10,
        50,
        3,
        3,
        "F"
      );

      // Title
      doc.setFontSize(14);
      doc.setTextColor(...colors.primary);
      doc.setFont("helvetica", "bold");
      doc.text(
        language === "fr" ? "INFORMATIONS PATIENT" : "PATIENT INFORMATION",
        infoX,
        infoY
      );

      // Patient details in two columns
      infoY += 10;
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);

      const patientInfo = {
        name: `${patient?.firstname} ${patient?.lastname}`,
        age: patient?.age || "--",
        weight: patient?.latestVisit[0]?.weight
          ? `${patient.latestVisit[0].weight} kg`
          : "--",
        height: patient?.height ? `${patient.height} cm` : "--",
        level: activityLevel,
        type: trainingType,
        date: new Date().toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US"
        ),
      };

      const leftColumn = [
        [`${language === "fr" ? "Nom:" : "Name:"} ${patientInfo.name}`],
        [
          `${language === "fr" ? "Âge:" : "Age:"} ${patientInfo.age} ${
            language === "fr" ? "ans" : "years"
          }`,
        ],
        [`${language === "fr" ? "Taille:" : "Height:"} ${patientInfo.height}`],
      ];

      const rightColumn = [
        [`${language === "fr" ? "Poids:" : "Weight:"} ${patientInfo.weight}`],
        [`${language === "fr" ? "Niveau:" : "Level:"} ${patientInfo.level}`],
        [`${language === "fr" ? "Type:" : "Type:"} ${patientInfo.type}`],
      ];

      leftColumn.forEach((line, index) => {
        doc.text(line, infoX, infoY + index * 8);
      });

      rightColumn.forEach((line, index) => {
        doc.text(line, pageWidth / 2 + margin, infoY + index * 8);
      });
    };

    // Draw program content
    const drawProgramContent = () => {
      let currentY = 110;

      if (isSpecialized) {
        // Draw specialized program
        (program as SpecializedDay[]).forEach((day, index) => {
          if (currentY > pageHeight - 50) {
            doc.addPage();
            drawHeader();
            currentY = 50;
          }

          // Day header
          doc.setFillColor(...colors.primary);
          doc.roundedRect(
            margin,
            currentY - 5,
            pageWidth - 2 * margin,
            12,
            2,
            2,
            "F"
          );

          doc.setFontSize(16);
          doc.setTextColor(...colors.white);
          doc.setFont("helvetica", "bold");
          doc.text(day.day, margin + 5, currentY + 4);

          currentY += 20;

          // Session details
          doc.setFontSize(12);
          doc.setTextColor(...colors.text);
          doc.setFont("helvetica", "normal");

          // Session box
          doc.setFillColor(...colors.lightGray);
          doc.roundedRect(
            margin + 10,
            currentY - 3,
            pageWidth - 2 * margin - 20,
            35,
            1,
            1,
            "F"
          );

          doc.text(
            `${language === "fr" ? "Séance:" : "Session:"} ${day.session}`,
            margin + 15,
            currentY + 3
          );
          doc.text(
            `${language === "fr" ? "Objectif:" : "Objective:"} ${
              day.objective
            }`,
            margin + 15,
            currentY + 13
          );
          if (day.duration) {
            doc.text(
              `${language === "fr" ? "Durée:" : "Duration:"} ${day.duration}`,
              margin + 15,
              currentY + 23
            );
          }

          currentY += 45;
        });
      } else {
        // Draw regular training program
        (program as TrainingDay[]).forEach((day, index) => {
          if (currentY > pageHeight - 50) {
            doc.addPage();
            drawHeader();
            currentY = 50;
          }

          // Day header
          doc.setFillColor(...colors.primary);
          doc.roundedRect(
            margin,
            currentY - 5,
            pageWidth - 2 * margin,
            12,
            2,
            2,
            "F"
          );

          doc.setFontSize(16);
          doc.setTextColor(...colors.white);
          doc.setFont("helvetica", "bold");
          doc.text(day.title, margin + 5, currentY + 4);

          currentY += 20;

          // Exercises
          day.exercises.forEach((exercise) => {
            if (currentY > pageHeight - 50) {
              doc.addPage();
              drawHeader();
              currentY = 50;
            }

            // Exercise box
            doc.setFillColor(...colors.lightGray);
            doc.roundedRect(
              margin + 10,
              currentY - 3,
              pageWidth - 2 * margin - 20,
              35,
              1,
              1,
              "F"
            );

            doc.setFontSize(12);
            doc.setTextColor(...colors.text);
            doc.setFont("helvetica", "bold");
            doc.text(exercise.name, margin + 15, currentY + 3);

            doc.setFont("helvetica", "normal");
            doc.text(
              `${exercise.sets} × ${exercise.reps}${
                exercise.duration ? ` (${exercise.duration})` : ""
              }`,
              margin + 15,
              currentY + 13
            );

            if (exercise.note) {
              doc.setFontSize(10);
              doc.text(exercise.note, margin + 15, currentY + 23);
            }

            currentY += 45;
          });

          currentY += 10;
        });
      }
    };

    // Generate the PDF
    drawHeader();
    drawPatientInfo();
    drawProgramContent();

    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(...colors.text);
      doc.text(
        `${
          language === "fr" ? "Date:" : "Date:"
        } ${new Date().toLocaleDateString(
          language === "fr" ? "fr-FR" : "en-US"
        )}`,
        margin,
        pageHeight - margin
      );
      doc.text(
        `${language === "fr" ? "Page" : "Page"} ${i}/${pageCount}`,
        pageWidth - margin - 30,
        pageHeight - margin
      );
    }

    doc.save(`programme-entrainement-${patient?.firstname || "patient"}.pdf`);
  };

  const handleEquipmentChange = (equipmentItem: string) => {
    setEquipment((prev) =>
      prev.includes(equipmentItem)
        ? prev.filter((item) => item !== equipmentItem)
        : [...prev, equipmentItem]
    );
  };

  return (
    <div className="bg-card rounded-xl shadow-lg p-8 mb-8 max-w-4xl mx-auto border border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
        Assigner un entraînement - {patient.sex === "male" ? "Homme" : "Femme"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Training Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Type d'entraînement
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none bg-background hover:bg-background/80 text-foreground"
              value={trainingType}
              onChange={(e) => setTrainingType(e.target.value)}
              required
            >
              <option value="" className="text-muted-foreground">
                Sélectionner un type
              </option>
              {trainingTypes.map((type) => (
                <option key={type} value={type} className="text-foreground">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Matériel disponible
            </label>
            <div className="border-2 border-border rounded-lg p-4 bg-background/50 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {equipmentOptions.map((eq) => (
                  <label
                    key={eq}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors duration-150"
                  >
                    <input
                      type="checkbox"
                      checked={equipment.includes(eq)}
                      onChange={() => handleEquipmentChange(eq)}
                      className="w-4 h-4 text-primary border-2 border-border rounded focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-foreground select-none">
                      {eq}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sélectionnez tout le matériel disponible
            </p>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Niveau d'activité
            </label>
            <div className="grid grid-cols-1 gap-3">
              {activityLevels.map((level) => (
                <label
                  key={level}
                  className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    activityLevel === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background/50 hover:border-border/80 hover:bg-background"
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level}
                    checked={activityLevel === level}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="sr-only"
                    required
                  />
                  <span className="text-sm font-medium capitalize">
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleTrainingSubmit}
            className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:from-primary/90 hover:to-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Générer le programme d'entraînement
          </button>
        </div>

        {/* Right Column - Program Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Aperçu du programme
          </h3>

          {generatedProgram.length > 0 ? (
            <div className="bg-background/50 rounded-lg p-4 max-h-96 overflow-y-auto border border-border/50">
              {isSpecialized
                ? // Specialized program display
                  (generatedProgram as SpecializedDay[]).map((day, index) => (
                    <div
                      key={index}
                      className="mb-4 p-3 bg-card rounded-lg shadow-sm border border-border/50"
                    >
                      <h4 className="font-semibold text-primary">{day.day}</h4>
                      <p className="text-sm font-medium text-foreground">
                        {day.session}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {day.objective}
                      </p>
                      {day.duration && (
                        <p className="text-xs text-primary font-medium">
                          {day.duration}
                        </p>
                      )}
                    </div>
                  ))
                : // Regular program display
                  (generatedProgram as TrainingDay[]).map((day, index) => (
                    <div
                      key={index}
                      className="mb-4 p-3 bg-card rounded-lg shadow-sm border border-border/50"
                    >
                      <h4 className="font-semibold text-primary mb-2">
                        {day.title}
                      </h4>
                      <ul className="space-y-1">
                        {day.exercises.slice(0, 3).map((exercise, exIndex) => (
                          <li
                            key={exIndex}
                            className="text-xs text-muted-foreground"
                          >
                            • {exercise.name} - {exercise.sets}x
                            {exercise.reps || exercise.duration}
                          </li>
                        ))}
                        {day.exercises.length > 3 && (
                          <li className="text-xs text-muted-foreground italic">
                            ... et {day.exercises.length - 3} exercices de plus
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
            </div>
          ) : (
            <div className="bg-background/50 rounded-lg p-8 text-center border border-border/50">
              <p className="text-muted-foreground">
                Sélectionnez les paramètres et cliquez sur "Générer" pour voir
                le programme
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
