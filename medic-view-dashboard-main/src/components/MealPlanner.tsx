import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLanguage } from "@/context/LanguageContext";

// Add to the existing translations or create a new one
const mealPlannerTranslations = {
  foodCatalog: {
    title: { fr: "Catalogue aliments", en: "Food Catalog" },
    subtitle: { fr: "Ajoutez des aliments au plan", en: "Add foods to the plan" },
    newFood: { fr: "Nouvel aliment", en: "New Food" },
    search: { fr: "Rechercher un aliment...", en: "Search food..." },
    addTo: { fr: "Ajouter à...", en: "Add to..." },
    meals: {
      breakfast: { fr: "Petit-déjeuner", en: "Breakfast" },
      lunch: { fr: "Déjeuner", en: "Lunch" },
      dinner: { fr: "Dîner", en: "Dinner" },
      snacks: { fr: "Collations", en: "Snacks" }
    }
  },
  summary: {
    week: { fr: "Semaine", en: "Week" },
    activeDay: { fr: "Jour actif", en: "Active Day" },
    kcal: { fr: "kcal", en: "kcal" },
    allGroups: {fr : "Tous les groupes", en: "All groups"},
  },
  foodGroups: {
    all: { fr: "Tous les groupes", en: "All groups" },
    cereals: { fr: "Céréales", en: "Cereals" },
    proteins: { fr: "Protéines", en: "Proteins" },
    legumes: { fr: "Légumineuses", en: "Legumes" },
    dairy: { fr: "Laitiers", en: "Dairy" },
    fruits: { fr: "Fruits", en: "Fruits" },
    vegetables: { fr: "Légumes", en: "Vegetables" },
    fats: { fr: "Matières grasses", en: "Fats" },
    drinks: { fr: "Boissons", en: "Drinks" }
  },
  mealPlan: {
    title: { fr: "Plan Alimentaire – 7 Jours", en: "Meal Plan - 7 Days" },
    subtitle: { 
      fr: "Ajoutez des aliments dans les repas, ajustez la quantité → calories & macros automatiques.", 
      en: "Add foods to meals, adjust quantity → automatic calories & macros." 
    },
    dropHint: { fr: "Déposez un aliment ici…", en: "Drop food here..." },
    noFood: { fr: "Aucun aliment", en: "No food" },
    remove: { fr: "Suppr", en: "Remove" },
    breakfast: { fr: "Petit-déjeuner", en: "Breakfast" },
    lunch: { fr: "Déjeuner", en: "Lunch" },
    dinner: { fr: "Dîner", en: "Dinner" },
    snacks: { fr: "Collations", en: "Snacks" },
  },
  macros: {
    calories: { fr: "Calories", en: "Calories" },
    proteins: { fr: "Protéines", en: "Proteins" },
    fats: { fr: "Lipides", en: "Fats" },
    carbs: { fr: "Glucides", en: "Carbs" }
  },
  actions: {
    generate: { fr: "Générer le régime", en: "Generate Diet" },
    save: { fr: "Enregistrer le régime", en: "Save Diet" },
    clearDay: { fr: "Vider jour", en: "Clear Day" },
    download: { fr: "Télécharger PDF", en: "Download PDF" }
  },
  messages: {
    saved: { fr: "Plan alimentaire enregistré", en: "Meal plan saved" },
    generated: { fr: "Régime généré", en: "Diet generated" },
    dayCleared: { fr: "Jour vidé", en: "Day cleared" },
    selectPatient: { fr: "Veuillez sélectionner un patient", en: "Please select a patient" },
    error: { fr: "Erreur lors de l'enregistrement", en: "Error while saving" },
    pdfGenerating: { fr: "Génération du PDF...", en: "Generating PDF..." },
    pdfSuccess: { fr: "PDF téléchargé avec succès", en: "PDF downloaded successfully" },
    pdfError: { fr: "Erreur lors de la génération du PDF", en: "Error generating PDF" }
  },
  nutritionProgram: {
    title: { fr: "Programme Nutritionnel", en: "Nutrition Program" },
    subtitle: { 
      fr: "Résumé hebdomadaire personnalisé • 4 repas équilibrés", 
      en: "Personalized weekly summary • 4 balanced meals" 
    },
    patientInfo: {
      title: { fr: "Informations Patient", en: "Patient Information" },
      name: { fr: "Nom", en: "Name" },
      age: { fr: "Âge", en: "Age" },
      years: { fr: "ans", en: "years" },
      doctor: { fr: "Praticien", en: "Doctor" },
      weight: { fr: "Poids", en: "Weight" },
      height: { fr: "Taille", en: "Height" },
      bmi: { fr: "IMC", en: "BMI" },
      bodyFat: { fr: "% Masse Grasse", en: "Body Fat %" },
      dailyCalories: { fr: "Calories/Jour", en: "Daily Calories" },
      date: { fr: "Date", en: "Date" }
    }
  },
    patientSelection: {
    button: { fr: "Sélectionner un patient", en: "Select patient" },
    modal: {
      title: { fr: "Sélection du Patient", en: "Patient Selection" },
      searchPlaceholder: { fr: "Rechercher un patient...", en: "Search patient..." },
      loading: { fr: "Chargement...", en: "Loading..." },
      error: { fr: "Erreur lors du chargement", en: "Error loading data" },
      age: { fr: "ans", en: "years" }
    }
  },
  addFoodForm: {
    title: { fr: "Ajouter un aliment", en: "Add Food" },
    foodName: { fr: "Nom de l'aliment", en: "Food Name" },
    unit: { fr: "Unité", en: "Unit" },
    group: { fr: "Groupe", en: "Group" },
    units: {
      grams: { fr: "Grammes (g)", en: "Grams (g)" },
      milliliters: { fr: "Millilitres (ml)", en: "Milliliters (ml)" },
      portion: { fr: "Portion", en: "Portion" }
    },
    nutrition: {
      calories: { fr: "Calories (kcal/100", en: "Calories (kcal/100" },
      proteins: { fr: "Protéines (g/100", en: "Proteins (g/100" },
      carbs: { fr: "Glucides (g/100", en: "Carbs (g/100" },
      fats: { fr: "Lipides (g/100", en: "Fats (g/100" }
    },
    buttons: {
      cancel: { fr: "Annuler", en: "Cancel" },
      add: { fr: "Ajouter", en: "Add" }
    }
  },
   actions: {
    generate: { fr: "Générer le régime", en: "Generate Diet" },
    save: { fr: "Enregistrer le régime", en: "Save Diet" },
    clearDay: { fr: "Vider jour", en: "Clear Day" },
     download: { fr: "Télécharger PDF", en: "Download PDF" }
  },
  messages: {
    dayCleared: { fr: "Jour vidé", en: "Day cleared" }
  },
   dailyTotal: {
    title: { fr: "Total jour", en: "Daily total" },
    calories: { fr: "kcal", en: "kcal" }
  },
  nutritionalAdvice: {
    title: { fr: "Conseils Nutritionnels", en: "Nutritional Advice" },
    tips: {
      water: { 
        fr: "Boire régulièrement de l'eau tout au long de la journée",
        en: "Drink water regularly throughout the day"
      },
      chewing: {
        fr: "Mâcher lentement et savourer chaque bouchée",
        en: "Chew slowly and savor each bite"
      },
      processed: {
        fr: "Privilégier les aliments peu transformés",
        en: "Choose minimally processed foods"
      },
      sugaryDrinks: {
        fr: "Éviter les boissons sucrées et les sodas",
        en: "Avoid sugary drinks and sodas"
      }
    }
  },
    days: {
    monday: { fr: "Lundi", en: "Monday" },
    tuesday: { fr: "Mardi", en: "Tuesday" },
    wednesday: { fr: "Mercredi", en: "Wednesday" },
    thursday: { fr: "Jeudi", en: "Thursday" },
    friday: { fr: "Vendredi", en: "Friday" },
    saturday: { fr: "Samedi", en: "Saturday" },
    sunday: { fr: "Dimanche", en: "Sunday" }
  }
};
// Default foods data
const defaultFoods = [
  // CÉRÉALES & FÉCULENTS
  { id:'riz-cuit', name:'Riz blanc cuit', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:130, protPer100:2.4, carbsPer100:28.2, fatPer100:0.3 },
  { id:'riz-brun-cuit', name:'Riz brun cuit', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:123, protPer100:2.7, carbsPer100:25.6, fatPer100:1.0 },
  { id:'quinoa-cuit', name:'Quinoa cuit', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:120, protPer100:4.4, carbsPer100:21.3, fatPer100:1.9 },
  { id:'pates-compl-cuites', name:'Pâtes complètes cuites', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:150, protPer100:5.8, carbsPer100:29.0, fatPer100:0.9 },
  { id:'couscous-cuit', name:'Couscous (cuit)', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:112, protPer100:3.8, carbsPer100:23.2, fatPer100:0.2 },
  { id:'boulgour-cuit', name:'Boulgour (cuit)', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:83, protPer100:3.1, carbsPer100:18.8, fatPer100:0.2 },
  { id:'pain-complet', name:'Pain complet', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:247, protPer100:9.4, carbsPer100:41.0, fatPer100:4.4 },
  { id:'flocons-avoine', name:'Flocons d\'avoine (secs)', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:389, protPer100:16.9, carbsPer100:66.3, fatPer100:6.9 },
  { id:'pomme-terre-cuite', name:'Pomme de terre (cuite)', groups:['Céréales','Cereals'], unitType:'g', kcalPer100:87, protPer100:2.0, carbsPer100:20.0, fatPer100:0.1 },

  // PROTÉINES
  { id:'poulet-grille', name:'Poulet grillé (sans peau)', groups:['Protéines','Proteins'], unitType:'g', kcalPer100:165, protPer100:31.0, carbsPer100:0.0, fatPer100:3.6 },
  { id:'dinde', name:'Escalope de dinde', groups:['Protéines','Proteins'], unitType:'g', kcalPer100:135, protPer100:29.0, carbsPer100:0.0, fatPer100:1.5 },
  { id:'boeuf-5', name:'Steak 5% MG', groups:['Protéines','Proteins'], unitType:'g', kcalPer100:137, protPer100:20.7, carbsPer100:0.0, fatPer100:5.0 },
  { id:'saumon', name:'Saumon', groups:['Protéines','Proteins'], unitType:'g', kcalPer100:208, protPer100:20.0, carbsPer100:0.0, fatPer100:13.0 },
  { id:'sardines', name:'Sardines (boîte)', groups:['Protéines','Proteins'], unitType:'g', kcalPer100:208, protPer100:24.6, carbsPer100:0.0, fatPer100:11.5 },
  { id:'thon-nature', name:'Thon (boîte, nature)', groups:['Protéines','Proteins'], unitType:'g', kcalPer100:116, protPer100:26.0, carbsPer100:0.0, fatPer100:1.0 },
  { id:'oeuf', name:'Œuf (moyen)', groups:['Protéines','Proteins'], unitType:'portion', kcalPerPortion:78, protPerPortion:6.3, carbsPerPortion:0.6, fatPerPortion:5.3 },

  // LÉGUMINEUSES
  { id:'pois-chiches', name:'Pois chiches (cuits)', groups:['Légumineuses','Legumes'], unitType:'g', kcalPer100:164, protPer100:8.9, carbsPer100:27.4, fatPer100:2.6 },
  { id:'lentilles', name:'Lentilles (cuites)', groups:['Légumineuses','Legumes'], unitType:'g', kcalPer100:116, protPer100:9.0, carbsPer100:20.0, fatPer100:0.4 },
  { id:'haricots-noirs', name:'Haricots noirs (cuits)', groups:['Légumineuses','Legumes'], unitType:'g', kcalPer100:132, protPer100:8.9, carbsPer100:23.7, fatPer100:0.5 },
  { id:'petits-pois', name:'Petits pois (cuits)', groups:['Légumineuses','Legumes'], unitType:'g', kcalPer100:84, protPer100:5.4, carbsPer100:15.0, fatPer100:0.4 },

  // LAITIERS
  { id:'yaourt-nat', name:'Yaourt nature 0%', groups:['Laitiers','Dairy'], unitType:'g', kcalPer100:55, protPer100:10.0, carbsPer100:3.6, fatPer100:0.2 },
  { id:'yaourt-grec-0', name:'Yaourt grec 0%', groups:['Laitiers','Dairy'], unitType:'g', kcalPer100:59, protPer100:10.0, carbsPer100:3.6, fatPer100:0.4 },
  { id:'lait', name:'Lait demi-écrémé', groups:['Laitiers','Dairy'], unitType:'ml', kcalPer100:47, protPer100:3.3, carbsPer100:4.8, fatPer100:1.6 },
  { id:'fromage-blanc', name:'Fromage blanc', groups:['Laitiers','Dairy'], unitType:'g', kcalPer100:85, protPer100:8.0, carbsPer100:3.9, fatPer100:3.2 },

  // FRUITS
  { id:'banane', name:'Banane', groups:['Fruits'], unitType:'g', kcalPer100:89, protPer100:1.1, carbsPer100:22.8, fatPer100:0.3 },
  { id:'pomme', name:'Pomme', groups:['Fruits'], unitType:'g', kcalPer100:52, protPer100:0.3, carbsPer100:14.0, fatPer100:0.2 },
  { id:'orange', name:'Orange', groups:['Fruits'], unitType:'g', kcalPer100:47, protPer100:0.9, carbsPer100:11.8, fatPer100:0.1 },
  { id:'fraises', name:'Fraises', groups:['Fruits'], unitType:'g', kcalPer100:32, protPer100:0.7, carbsPer100:7.7, fatPer100:0.3 },
  { id:'avocat', name:'Avocat', groups:['Fruits'], unitType:'g', kcalPer100:160, protPer100:2.0, carbsPer100:8.5, fatPer100:14.7 },

  // LÉGUMES
  { id:'legumes-verts', name:'Légumes verts (mélange)', groups:['Légumes','Vegetables'], unitType:'g', kcalPer100:30, protPer100:2.0, carbsPer100:5.0, fatPer100:0.2 },
  { id:'tomate', name:'Tomate', groups:['Légumes','Vegetables'], unitType:'g', kcalPer100:18, protPer100:0.9, carbsPer100:3.9, fatPer100:0.2 },
  { id:'carotte', name:'Carotte', groups:['Légumes','Vegetables'], unitType:'g', kcalPer100:41, protPer100:0.9, carbsPer100:10.0, fatPer100:0.2 },
  { id:'brocoli', name:'Brocoli', groups:['Légumes','Vegetables'], unitType:'g', kcalPer100:34, protPer100:2.8, carbsPer100:6.6, fatPer100:0.4 },
  { id:'epinards', name:'Épinards', groups:['Légumes','Vegetables'], unitType:'g', kcalPer100:23, protPer100:2.9, carbsPer100:3.6, fatPer100:0.4 },

  // MATIÈRES GRASSES
  { id:'amandes', name:'Amandes', groups:['Matières grasses','Fats'], unitType:'g', kcalPer100:579, protPer100:21.2, carbsPer100:21.6, fatPer100:49.9 },
  { id:'noix', name:'Noix', groups:['Matières grasses','Fats'], unitType:'g', kcalPer100:654, protPer100:15.2, carbsPer100:13.7, fatPer100:65.2 },
  { id:'huile-olive', name:"Huile d'olive", groups:['Matières grasses','Fats'], unitType:'ml', kcalPer100:884, protPer100:0.0, carbsPer100:0.0, fatPer100:100.0 },

  // BOISSONS
  { id:'eau', name:'Eau', groups:['Boissons','Drinks'], unitType:'ml', kcalPer100:0, protPer100:0.0, carbsPer100:0.0, fatPer100:0.0 },
  { id:'jus-orange', name:"Jus d'orange (100%)", groups:['Boissons','Drinks'], unitType:'ml', kcalPer100:45, protPer100:0.7, carbsPer100:10.4, fatPer100:0.2 },
  { id:'cafe-noir', name:'Café noir (sans sucre)', groups:['Boissons','Drinks'], unitType:'ml', kcalPer100:2, protPer100:0.1, carbsPer100:0.0, fatPer100:0.0 }
];

// Utility functions
const newDay = () => ({ petit: [], dej: [], diner: [], snack: [] });
const today = () => new Date().toISOString().slice(0, 10);

const macrosFor = (item) => {
  const qty = Number(item.qty) || 0;
  let p = 0, c = 0, f = 0;
  if (item.unitType === 'portion') {
    p = (item.protPerPortion || 0) * qty;
    c = (item.carbsPerPortion || 0) * qty;
    f = (item.fatPerPortion || 0) * qty;
  } else {
    const k = qty / 100;
    p = (item.protPer100 || 0) * k;
    c = (item.carbsPer100 || 0) * k;
    f = (item.fatPer100 || 0) * k;
  }
  return { p: Math.round(p * 10) / 10, c: Math.round(c * 10) / 10, f: Math.round(f * 10) / 10 };
};

const kcalFor = (item) => {
  const m = macrosFor(item);
  const kcalFromMacros = m.p * 4 + m.c * 4 + m.f * 9;
  if (kcalFromMacros > 0) return Math.round(kcalFromMacros);
  if (item.unitType === 'portion') return Math.max(0, Math.round((item.kcalPerPortion || 0) * (Number(item.qty) || 0)));
  return Math.max(0, Math.round((item.kcalPer100 || 0) * (Number(item.qty) || 0) / 100));
};

const sumMacros = (list) => list.reduce((acc, i) => {
  const m = macrosFor(i);
  acc.p += m.p;
  acc.c += m.c;
  acc.f += m.f;
  return acc;
}, { p: 0, c: 0, f: 0 });

const fmtMacros = (m) => `P: ${m.p.toFixed(1)} g • G: ${m.c.toFixed(1)} g • L: ${m.f.toFixed(1)} g`;
const sumKcal = (list) => Math.round(list.reduce((n, i) => n + kcalFor(i), 0));
const sumDay = (d) => sumKcal(d.petit) + sumKcal(d.dej) + sumKcal(d.diner) + sumKcal(d.snack);

const Toast = ({ message, show, onHide }) => (
  <div className={`fixed right-4 bottom-4 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg ${show ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-2'}`}>
    {message}
  </div>
);

const IconButton = ({ onClick, title, children, className = "" }) => (
  <button 
    onClick={onClick} 
    title={title}
    className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 ${className}`}
  >
    {children}
  </button>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

export default function MealPlanner() {
  // Get language from context instead of hardcoding
  const { language } = useLanguage();

  // Translation function
  const getT = (obj: any, lang: string) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj[lang]) return obj[lang];
    if (obj.fr) return obj.fr;
    if (obj.en) return obj.en;
    return '';
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = mealPlannerTranslations;
    
    for (const key of keys) {
      if (!current || !current[key]) {
        console.warn(`Translation missing for path: ${path}`);
        return path;
      }
      current = current[key];
    }
    
    return getT(current, language);
  };

  // State management
  
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [db, setDb] = useState({
    day: 'J1',
    foods: defaultFoods,
    config: { targetKcal: 2000, pctP: 30, pctF: 30, pctC: 40 },
    week: {
      J1: newDay(), J2: newDay(), J3: newDay(), J4: newDay(),
      J5: newDay(), J6: newDay(), J7: newDay()
    }
  });

  const [patient, setPatient] = useState({
  nom: '', 
  age: '', 
  poids: '', 
  taille: '', 
  date: today(),
  sexe: 'M', 
  act: '1.55', 
  obj: '1', 
  prat: '', 
  ref: '',
  latestVisit: {
    bf: null,
    calorieintake: null
  }
});

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [toast, setToast] = useState({ show: false, message: 'Enregistré' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTargetMeal, setAddTargetMeal] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Save/load data
 
const downloadPDF = async () => {
  try {
    const nutritionSection = document.getElementById('nutrition-program');
    if (!nutritionSection) return;

    setToast({ show: true, message: 'Génération du PDF...' });

    const canvas = await html2canvas(nutritionSection, {
      scale: 2,
      backgroundColor: '#ffffff'
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    
    pdf.save(`plan-nutritionnel-${patient.nom.replace(/\s+/g, '-')}.pdf`);
    
    setToast({ show: true, message: 'PDF téléchargé avec succès' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1200);
  } catch (error) {
    console.error('Error generating PDF:', error);
    setToast({ show: true, message: 'Erreur lors de la génération du PDF' });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1200);
  }
};
  // Patient functions
  const calcIMC = useCallback(() => {
    const kg = parseFloat(patient.poids);
    const cm = parseFloat(patient.taille);
    if (!isNaN(kg) && !isNaN(cm) && cm > 0) {
      const m = cm / 100;
      return (kg / (m * m)).toFixed(1);
    }
    return '';
  }, [patient.poids, patient.taille]);

  const computeTargetKcal = useCallback(() => {
    const kg = parseFloat(patient.poids) || 0;
    const cm = parseFloat(patient.taille) || 0;
    const age = parseFloat(patient.age) || 0;
    const sex = patient.sexe || 'M';
    let bmr = 10 * kg + 6.25 * cm - 5 * age + (sex === 'M' ? 5 : -161);
    const act = parseFloat(patient.act) || 1.55;
    const obj = parseFloat(patient.obj) || 1;
    return Math.max(0, Math.round(bmr * act * obj));
  }, [patient]);

 

  // Food management
  // First, create a mapping of food groups between French and English
const groupTranslations = {
  'Céréales': 'Cereals',
  'Protéines': 'Proteins',
  'Légumineuses': 'Legumes',
  'Laitiers': 'Dairy',
  'Fruits': 'Fruits',
  'Légumes': 'Vegetables',
  'Matières grasses': 'Fats',
  'Boissons': 'Drinks'
};

  const filteredFoods = db.foods.filter(food => {
    // Text search in name and groups
    const matchText = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.groups.join(' ').toLowerCase().includes(searchQuery.toLowerCase());

    // Group filter with translation handling
    const matchGroup = !filterGroup || food.groups.some(group => {
      // Check if the group matches directly
      if (group === filterGroup) return true;
      
      // Check if the English version matches
      if (groupTranslations[filterGroup] === group) return true;
      
      // Check if the French version matches
      if (Object.entries(groupTranslations).find(([fr, en]) => 
        (en === filterGroup && fr === group) || 
        (fr === filterGroup && en === group)
      )) return true;
      
      return false;
    });

    return matchText && matchGroup;
  });

  const addFoodToMeal = (food, meal) => {
    const entry = {
      id: crypto.randomUUID(),
      foodId: food.id,
      name: food.name,
      unitType: food.unitType,
      qty: (food.unitType === 'portion' ? 1 : 100),
      kcalPer100: food.kcalPer100 ?? null,
      kcalPerPortion: food.kcalPerPortion ?? null,
      protPer100: food.protPer100 ?? null,
      carbsPer100: food.carbsPer100 ?? null,
      fatPer100: food.fatPer100 ?? null,
      protPerPortion: food.protPerPortion ?? null,
      carbsPerPortion: food.carbsPerPortion ?? null,
      fatPerPortion: food.fatPerPortion ?? null
    };

    setDb(prev => ({
      ...prev,
      week: {
        ...prev.week,
        [prev.day]: {
          ...prev.week[prev.day],
          [meal]: [...prev.week[prev.day][meal], entry]
        }
      }
    }));
  };

 // Update the updateFoodQty function
const updateFoodQty = useCallback((mealType, entryId, newQty) => {
  requestAnimationFrame(() => {
    setDb(prev => ({
      ...prev,
      week: {
        ...prev.week,
        [prev.day]: {
          ...prev.week[prev.day],
          [mealType]: prev.week[prev.day][mealType].map(entry =>
            entry.id === entryId ? { ...entry, qty: Number(newQty) || 0 } : entry
          )
        }
      }
    }));
  });
}, []);

  const removeFoodFromMeal = (mealType, entryId) => {
    setDb(prev => ({
      ...prev,
      week: {
        ...prev.week,
        [prev.day]: {
          ...prev.week[prev.day],
          [mealType]: prev.week[prev.day][mealType].filter(entry => entry.id !== entryId)
        }
      }
    }));
  };

  // Meal totals
  const currentDay = db.week[db.day];
  const dayTotals = {
    petit: { kcal: sumKcal(currentDay.petit), macros: sumMacros(currentDay.petit) },
    dej: { kcal: sumKcal(currentDay.dej), macros: sumMacros(currentDay.dej) },
    diner: { kcal: sumKcal(currentDay.diner), macros: sumMacros(currentDay.diner) },
    snack: { kcal: sumKcal(currentDay.snack), macros: sumMacros(currentDay.snack) }
  };

  const totalDayKcal = sumDay(currentDay);
  const totalWeekKcal = Object.keys(db.week).reduce((total, day) => total + sumDay(db.week[day]), 0);

  // Generate diet function
  const generateDiet = () => {
    const d = db.week[db.day];
    const currentKcal = sumDay(d);
    if (currentKcal <= 0) {
      setToast({ show: true, message: 'Ajoutez des aliments au jour actif' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1200);
      return;
    }

    let p = db.config.pctP, f = db.config.pctF, c = db.config.pctC;
    const sumPct = p + f + c;
    if (sumPct <= 0) { p = 30; f = 30; c = 40; }
    p = Math.round(p / sumPct * 100);
    f = Math.round(f / sumPct * 100);
    c = Math.max(0, 100 - p - f);

    const targetKcal = db.config.targetKcal;
    if (targetKcal <= 0) {
      setToast({ show: true, message: 'Définissez des calories cibles' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1200);
      return;
    }

    const targetP_g = (p / 100) * targetKcal / 4;
    const targetF_g = (f / 100) * targetKcal / 9;
    const targetC_g = (c / 100) * targetKcal / 4;

    const mPetit = sumMacros(d.petit), mDej = sumMacros(d.dej);
    const mDiner = sumMacros(d.diner), mSnack = sumMacros(d.snack);
    const cur = { p: mPetit.p + mDej.p + mDiner.p + mSnack.p, c: mPetit.c + mDej.c + mDiner.c + mSnack.c, f: mPetit.f + mDej.f + mSnack.f + mDiner.f };

    const eps = 0.0001;
    const sP = targetP_g / Math.max(cur.p, eps);
    const sF = targetF_g / Math.max(cur.f, eps);
    const sC = targetC_g / Math.max(cur.c, eps);

    const newWeek = { ...db.week };
    ['petit', 'dej', 'diner', 'snack'].forEach(meal => {
      newWeek[db.day][meal] = newWeek[db.day][meal].map(item => {
        const m = macrosFor(item);
        const w = m.p + m.c + m.f;
        if (w <= 0) return item;
        const fp = m.p / w, fc = m.c / w, ff = m.f / w;
        const sItem = fp * sP + fc * sC + ff * sF;
        return { ...item, qty: Math.max(0, Math.round(((Number(item.qty) || 0) * sItem) / 5) * 5) };
      });
    });

    setDb(prev => ({ ...prev, week: newWeek }));
    setToast({ show: true, message: `Régime généré: ${targetKcal} kcal` });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1200);
  };

  const MealSection = ({ mealType, title, entries, totals, readOnly = false }) => {
  
    const [inputValues, setInputValues] = useState({});

  // Update input values when entries change
  useEffect(() => {
    const newValues = {};
    entries.forEach(entry => {
      newValues[entry.id] = entry.qty;
    });
    setInputValues(newValues);
  }, [entries]);
  
   const handleInputChange = (entryId, value) => {
    setInputValues(prev => ({
      ...prev,
      [entryId]: value
    }));

    // Update parent state after a small delay
    const timeoutId = setTimeout(() => {
      updateFoodQty(mealType, entryId, value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };
  
  return (
  <section 
    className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800"
    onDragOver={(e) => {
      e.preventDefault();
      e.currentTarget.classList.add('bg-gray-100', 'dark:bg-gray-700');
    }}
    onDragLeave={(e) => {
      e.currentTarget.classList.remove('bg-gray-100', 'dark:bg-gray-700');
    }}
    onDrop={(e) => {
      e.currentTarget.classList.remove('bg-gray-100', 'dark:bg-gray-700');
      if (!readOnly) {
        onDrop(e, mealType, addFoodToMeal);
      }
    }}
  >
    <h4 className="m-0 p-3 border-b border-gray-300 dark:border-gray-600 flex justify-between items-center">
      <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">{title}</span>
      <span className="flex items-center gap-2">
        {!readOnly && (
          <IconButton
            onClick={() => {
              setAddTargetMeal(mealType);
              setShowAddModal(true);
            }}
            title={`Ajouter un aliment au ${title.toLowerCase()}`}
          >
            <PlusIcon />
          </IconButton>
        )}
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {totals.kcal} kcal — {fmtMacros(totals.macros)}
        </span>
      </span>
    </h4>
    <div className={`p-2 min-h-[100px] ${!readOnly ? 'bg-gray-50/50 dark:bg-gray-700/50' : ''}`}>
      {entries.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400 p-4 text-center">
          {readOnly ? t('mealPlan.noFood') : t('mealPlan.dropHint')}
        </div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg my-2">
            <div className="flex justify-between items-center">
              <div className="font-medium text-gray-900 dark:text-gray-100">{entry.name}</div>
              <div className="flex items-center gap-2">
         <input
                    type="number"
                    value={inputValues[entry.id] || ''}
                    onChange={(e) => handleInputChange(entry.id, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    min="0"
                    step={entry.unitType === 'portion' ? '1' : '5'}
                  />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.unitType}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {kcalFor(entry)} kcal • {fmtMacros(macrosFor(entry))}
            </div>
            {!readOnly && (
              <button
                onClick={() => removeFoodFromMeal(mealType, entry.id)}
                className="mt-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-none rounded-lg px-3 py-1 text-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Suppr
              </button>
            )}
          </div>
        ))
      )}
    </div>
  </section>
  )
};

  const AddFoodModal = () => {
    const [modalSearch, setModalSearch] = useState('');
    const [modalFilter, setModalFilter] = useState('');

    const modalFilteredFoods = db.foods.filter(food => {
      const matchText = food.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        food.groups.join(' ').toLowerCase().includes(modalSearch.toLowerCase());
      const matchGroup = (!modalFilter || food.groups.includes(modalFilter));
      return matchText && matchGroup;
    });

    const mealNames = {
      petit: 'Petit-déjeuner',
      dej: 'Déjeuner',
      diner: 'Dîner',
      snack: 'Collations'
    };

    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-600">
            <strong className="text-gray-900 dark:text-gray-100">Ajouter un aliment — {mealNames[addTargetMeal]}</strong>
            <IconButton onClick={() => setShowAddModal(false)} title="Fermer">
              <CloseIcon />
            </IconButton>
          </div>
          
          <div className="p-4">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Rechercher (nom, groupe)"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <select
                value={modalFilter}
                onChange={(e) => setModalFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Tous</option>
                <option>Céréales</option>
                <option>Protéines</option>
                <option>Légumineuses</option>
                <option>Laitiers</option>
                <option>Fruits</option>
                <option>Légumes</option>
                <option>Matières grasses</option>
                <option>Boissons</option>
              </select>
            </div>
            
            <div className="max-h-96 overflow-auto border border-gray-300 dark:border-gray-600 rounded-xl">
              {modalFilteredFoods.map(food => {
                const unitLabel = food.unitType === 'portion' ? 'portion' : food.unitType;
                const kcalBaseNum = food.unitType === 'portion'
                  ? (food.kcalPerPortion ?? Math.round((food.protPerPortion || 0) * 4 + (food.carbsPerPortion || 0) * 4 + (food.fatPerPortion || 0) * 9))
                  : (food.kcalPer100 ?? Math.round((food.protPer100 || 0) * 4 + (food.carbsPer100 || 0) * 4 + (food.fatPer100 || 0) * 9));
                const kcalLabel = food.unitType === 'portion' ? `${kcalBaseNum} kcal/portion` : `${kcalBaseNum} kcal/100${unitLabel}`;

                return (
                  <div key={food.id} className="flex justify-between items-center gap-3 p-3 border-b border-gray-300 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">{food.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {food.groups.join(' • ')} • {kcalLabel}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addFoodToMeal(food, addTargetMeal);
                        setShowAddModal(false);
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-lg px-4 py-2 font-bold cursor-pointer transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 p-4 border-t border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setShowAddModal(false)}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-none rounded-lg px-4 py-2 font-bold cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PatientSelection = ({ onPatientSelect }) => {
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const patientsPerPage = 8;

    useEffect(() => {
      const fetchPatients = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}api/mealplanner/patients`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setPatients(response.data);
          setIsLoading(false);
        } catch (err) {
          console.error('Error fetching patients:', err);
          setError(err.message);
          setIsLoading(false);
        }
      };

      fetchPatients();
    }, []);

    const handlePatientClick = (patient) => {
      onPatientSelect(patient);
      setShowModal(false);
    };

    // Filter patients based on search query
    const filteredPatients = patients.filter(patient => 
      `${patient.firstname} ${patient.lastname}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate pagination
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

    // Selection Button Component
    const SelectionButton = () => (
        <button
    onClick={() => setShowModal(true)}
    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
  >
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    <span>{t('patientSelection.button')}</span>
  </button>
    );

    // Modal Component
    const SelectionModal = () => {
      if (!showModal) return null;

      return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('patientSelection.modal.title')}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('patientSelection.modal.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        </div>

        {/* Patients List */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {t('patientSelection.modal.loading')}
              </span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">
              {t('patientSelection.modal.error')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentPatients.map(patient => (
                <button
                  key={patient._id}
                  onClick={() => handlePatientClick(patient)}
                  className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {patient.firstname} {patient.lastname}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} {t('patientSelection.modal.age')}
                    {patient.height && ` • ${patient.height}cm`}
                    {patient.latestVisit?.weight && ` • ${patient.latestVisit.weight}kg`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === index + 1
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    };

    return (
      <>
        <SelectionButton />
        <SelectionModal />
      </>
    );
  };

  const loadMealPlan = async (patient) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/mealplanner/patients/${patient._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
 const doctorResponse = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}api/auth/me`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const doctorName = doctorResponse.data.firstname + ' ' + doctorResponse.data.lastname;

      // Set patient info
        setPatient({
      nom: `${patient.firstname} ${patient.lastname}`,
      age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
      poids: patient.latestVisit?.weight || '',
      taille: patient.height || '',
      date: today(),
      sexe: patient.sex === 'male' ? 'M' : 'F',
      act: getActivityMultiplier(patient.activityLevel),
      obj: getObjectiveMultiplier(patient.latestVisit?.goal),
      prat: doctorName, // Use the doctor's name here
      ref: patient._id,
      latestVisit: {
        bf: patient.latestVisit?.bf || null,
        calorieintake: patient.latestVisit?.calorieintake || null
      }
    });

      // Calculate target calories
      const targetKcal = patient.latestVisit?.calorieintake || computeTargetKcal();

      // Initialize new week structure
      const newWeek = {
        J1: newDay(), J2: newDay(), J3: newDay(), 
        J4: newDay(), J5: newDay(), J6: newDay(), J7: newDay()
      };

      // If patient has existing diet in latest visit, parse and populate it
      if (response.data.dietPlan?.meals) {
        const meals = response.data.dietPlan.meals;
        
        // Helper function to parse meal string
        // Inside the loadMealPlan function, update the parseMeal function:

const parseMeal = (mealStr) => {
  if (!mealStr) return {};
  const result = {};
  
  mealStr.split('\n\n').forEach(entry => {
    const [day, items] = entry.split(': ');
    if (!items) return;
    
    const foodItems = items.split(' + ').map(item => {
      // Improved regex to handle more cases
      const match = item.match(/(.*?)\s*\((\d+(?:\.\d+)?)\s*(g|ml|unité|portion|c\.c\.|c\.s\.)\)?/i);
      if (!match) return null;
      
      const [, name, qty, unit] = match;
      let unitType = unit.toLowerCase();
      
      // Handle special cases for unit types
      if (unitType === 'c.c.' || unitType === 'c.s.') {
        unitType = 'ml';
      }
      if (unitType === 'unité') {
        unitType = 'portion';
      }
      
      // Clean up the name
      const cleanName = name.trim();
      
      // Try to find matching food in defaultFoods
      const food = defaultFoods.find(f => 
        f.name.toLowerCase().trim() === cleanName.toLowerCase()
      );
      
      // Create food item entry, using default food data if available
      return {
        id: crypto.randomUUID(),
        foodId: food?.id || `custom-${crypto.randomUUID()}`,
        name: cleanName, // Use the original name from the diet plan
        unitType: food?.unitType || unitType,
        qty: Number(qty),
        kcalPer100: food?.kcalPer100 || null,
        kcalPerPortion: food?.kcalPerPortion || null,
        protPer100: food?.protPer100 || null,
        carbsPer100: food?.carbsPer100 || null,
        fatPer100: food?.fatPer100 || null,
        protPerPortion: food?.protPerPortion || null,
        carbsPerPortion: food?.carbsPerPortion || null,
        fatPerPortion: food?.fatPerPortion || null
      };
    }).filter(Boolean);
    
    if (foodItems.length > 0) {
      result[day.trim()] = foodItems;
    }
  });
  
  return result;
};

      // Parse each meal type
      const breakfast = parseMeal(meals.breakfast);
      const lunch = parseMeal(meals.lunch);
      const dinner = parseMeal(meals.dinner);
      const morningSnack = parseMeal(meals.morningSnack);
      const afternoonSnack = parseMeal(meals.afternoonSnack);

      // Populate the week structure
      Object.keys(newWeek).forEach(day => {
        if (breakfast[day]) {
          newWeek[day].petit = breakfast[day];
        }
        if (lunch[day]) {
          newWeek[day].dej = lunch[day];
        }
        if (dinner[day]) {
          newWeek[day].diner = dinner[day];
        }
        // Combine morning and afternoon snacks
        newWeek[day].snack = [
          ...(morningSnack[day] || []),
          ...(afternoonSnack[day] || [])
        ];
      });
    }

    // Update state with new data
    setDb(prev => ({
      ...prev,
      week: newWeek,
      config: {
        targetKcal,
        pctP: 30,
        pctF: 30,
        pctC: 40
      }
    }));

    setToast({ 
      show: true, 
      message: `Patient ${patient.firstname} ${patient.lastname} sélectionné${response.data.dietPlan ? ' (régime existant chargé)' : ''}`
    });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1200);

  } catch (error) {
    console.error('Error loading patient data:', error);
    setToast({ 
      show: true, 
      message: 'Erreur lors du chargement des données' 
    });
  }
};

  const initializeNewPlan = () => {
    setDb(prev => ({
      ...prev,
      week: {
        J1: newDay(), J2: newDay(), J3: newDay(), 
        J4: newDay(), J5: newDay(), J6: newDay(), J7: newDay()
      },
      config: { targetKcal: 2000, pctP: 30, pctF: 30, pctC: 40 }
    }));
    setToast({ show: true, message: 'Nouveau plan initialisé' });
  };

  // Helper functions
  const getActivityMultiplier = (level) => {
    const multipliers = {
      sedentary: '1.2',
      light: '1.375',
      moderate: '1.55',
      active: '1.725',
      'very active': '1.9'
    };
    return multipliers[level] || '1.55';
  };

  const getObjectiveMultiplier = (goal) => {
    const multipliers = {
      'weight loss': '0.85',
      'muscle gain': '1.1',
      maintenance: '1'
    };
    return multipliers[goal] || '1';
  };

  const saveDietPlan = async () => {
    try {
      if (!patient.ref) {
        setToast({ show: true, message: 'Veuillez sélectionner un patient' });
        return;
      }

      // Format meals data
      const formatMealItems = (items) => {
        return items.map(item => 
          `${item.name} (${item.qty}${item.unitType === 'portion' ? 'unité' : item.unitType})`
        ).join(' + ');
      };

      const formatDayMeals = (dayKey, mealType) => {
        const items = db.week[dayKey][mealType];
        if (items.length === 0) return '';
        return `${dayKey}: ${formatMealItems(items)}`;
      };

      const meals = {
        breakfast: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map(day => 
          formatDayMeals(day, 'petit')
        ).filter(Boolean).join('\n\n'),
        
        lunch: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map(day => 
          formatDayMeals(day, 'dej')
        ).filter(Boolean).join('\n\n'),
        
        dinner: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map(day => 
          formatDayMeals(day, 'diner')
        ).filter(Boolean).join('\n\n'),
        
        morningSnack: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map(day => {
          const snacks = db.week[day].snack;
          if (snacks.length === 0) return '';
          return `${day}: ${formatMealItems(snacks.slice(0, Math.ceil(snacks.length/2)))}`;
        }).filter(Boolean).join('\n\n'),
        
        afternoonSnack: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map(day => {
          const snacks = db.week[day].snack;
          if (snacks.length === 0) return '';
          return `${day}: ${formatMealItems(snacks.slice(Math.ceil(snacks.length/2)))}`;
        }).filter(Boolean).join('\n\n')
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}api/mealplanner/diet`,
        {
          patientId: patient.ref,
          meals
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToast({ show: true, message: 'Plan alimentaire enregistré' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1200);

    } catch (error) {
      console.error('Error saving diet plan:', error);
      setToast({ 
        show: true, 
        message: 'Erreur lors de l\'enregistrement' 
      });
    }
  };

  const AddFoodForm = ({ onClose, onAdd }) => {
    const [newFood, setNewFood] = useState({
      name: '',
      unitType: 'g',
      kcalPer100: '',
      protPer100: '',
      carbsPer100: '',
      fatPer100: '',
      groups: []
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const foodId = `custom-${crypto.randomUUID()}`;
      onAdd({
        id: foodId,
        name: newFood.name,
        unitType: newFood.unitType,
        groups: newFood.groups,
        kcalPer100: Number(newFood.kcalPer100),
        protPer100: Number(newFood.protPer100),
        carbsPer100: Number(newFood.carbsPer100),
        fatPer100: Number(newFood.fatPer100)
      });
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
               {t('addFoodForm.title')}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('addFoodForm.foodName')}
            </label>
            <input
              type="text"
              required
              value={newFood.name}
              onChange={(e) => setNewFood(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
            />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('addFoodForm.unit')}
            </label>
            <select
              value={newFood.unitType}
              onChange={(e) => setNewFood(prev => ({ ...prev, unitType: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
            >
              <option value="g">{t('addFoodForm.units.grams')}</option>
              <option value="ml">{t('addFoodForm.units.milliliters')}</option>
              <option value="portion">{t('addFoodForm.units.portion')}</option>
            </select>
            </div>

            <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('addFoodForm.group')}
            </label>
            <select
              multiple
              value={newFood.groups}
              onChange={(e) => setNewFood(prev => ({ 
                ...prev, 
                groups: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
              size={4}
            >
              <option value="Céréales">{t('foodGroups.cereals')}</option>
              <option value="Protéines">{t('foodGroups.proteins')}</option>
              <option value="Légumineuses">{t('foodGroups.legumes')}</option>
              <option value="Laitiers">{t('foodGroups.dairy')}</option>
              <option value="Fruits">{t('foodGroups.fruits')}</option>
              <option value="Légumes">{t('foodGroups.vegetables')}</option>
              <option value="Matières grasses">{t('foodGroups.fats')}</option>
              <option value="Boissons">{t('foodGroups.drinks')}</option>
            </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
  {[
    { 
      key: 'kcalPer100',
      label: 'nutrition.calories',
      value: newFood.kcalPer100,
      onChange: (e) => setNewFood(prev => ({ ...prev, kcalPer100: e.target.value }))
    },
    { 
      key: 'protPer100',
      label: 'nutrition.proteins',
      value: newFood.protPer100,
      onChange: (e) => setNewFood(prev => ({ ...prev, protPer100: e.target.value }))
    },
    { 
      key: 'carbsPer100',
      label: 'nutrition.carbs',
      value: newFood.carbsPer100,
      onChange: (e) => setNewFood(prev => ({ ...prev, carbsPer100: e.target.value }))
    },
    { 
      key: 'fatPer100',
      label: 'nutrition.fats',
      value: newFood.fatPer100,
      onChange: (e) => setNewFood(prev => ({ ...prev, fatPer100: e.target.value }))
    }
  ].map(field => (
    <div key={field.key}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t(`addFoodForm.${field.label}`)}
        {newFood.unitType})}
      </label>
      <input
        type="number"
        required
        min="0"
        step="0.1"
        value={field.value}
        onChange={field.onChange}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
      />
    </div>
  ))}
</div>

            <div className="flex justify-end gap-2 mt-6">
              <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              {t('addFoodForm.buttons.cancel')}
            </button>
             <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              {t('addFoodForm.buttons.add')}
            </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

// In your MealPlanner component
const addCustomFood = async (newFood) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}api/mealplanner/custom-foods`,
      newFood,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setDb(prev => ({
      ...prev,
      foods: [...prev.foods, response.data]
    }));

    setToast({ 
      show: true, 
      message: 'Aliment ajouté avec succès' 
    });
  } catch (error) {
    console.error('Error adding custom food:', error);
    setToast({ 
      show: true, 
      message: 'Erreur lors de l\'ajout de l\'aliment' 
    });
  }
};

  useEffect(() => {
    const loadCustomFoods = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}api/mealplanner/custom-foods`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setDb(prev => ({
          ...prev,
          foods: [...defaultFoods, ...response.data]
        }));
      } catch (error) {
        console.error('Error loading custom foods:', error);
      }
    };

    loadCustomFoods();
  }, []); // Runs once when component mounts

  const onDragStart = (e, food) => {
    e.dataTransfer.setData('application/json', JSON.stringify(food));
  };

  const onDrop = (e, mealType, addFoodToMeal) => {
    e.preventDefault();
    try {
      const food = JSON.parse(e.dataTransfer.getData('application/json'));
      addFoodToMeal(food, mealType);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Patient Selection Component */}
      <PatientSelection 
        onPatientSelect={loadMealPlan} 
        onNewPlan={initializeNewPlan}
      />

      {/* Main App Grid - Make it responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-4">
        {/* Sidebar - Food Catalog */}
        <aside className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg h-fit lg:sticky lg:top-4">
          <div className="p-3 sm:p-4 border-b border-gray-300 dark:border-gray-700">
            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-1 text-gray-900 dark:text-white">
                  {t('foodCatalog.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {t('foodCatalog.subtitle')}
                </p>
              </div>
              <button
                onClick={() => setShowAddFoodModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 shrink-0"
              >
                <PlusIcon />
                <span>{t('foodCatalog.newFood')}</span>
              </button>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            {/* Calories summary - Better responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <div className="text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-full px-2 sm:px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center">
                {t('summary.week')}: {totalWeekKcal} {t('macros.calories')}
              </div>
              <div className="text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-full px-2 sm:px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center">
                {t('summary.activeDay')}: {totalDayKcal} {t('macros.calories')}
              </div>
            </div>

            {/* Search and filter - Stacked on mobile */}
            <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2 mb-3">
              <input
                placeholder={t('foodCatalog.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg px-2 py-2 text-sm"
              >
                <option value="">{t('summary.allGroups')}</option>
                <option>{t('foodGroups.cereals')}</option>
                <option>{t('foodGroups.proteins')}</option>
                <option>{t('foodGroups.legumes')}</option>
                <option>{t('foodGroups.dairy')}</option>
                <option>{t('foodGroups.fruits')}</option>
                <option>{t('foodGroups.vegetables')}</option>
                <option>{t('foodGroups.fats')}</option>
                <option>{t('foodGroups.drinks')}</option>
              </select>
            </div>

            {/* Food list - Adaptive height */}
            <div className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-15rem)] overflow-auto border border-gray-300 dark:border-gray-700 rounded-xl">
              {filteredFoods.map(food => (
                <div
                  key={food.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, food)}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 border-b border-gray-300 
                  dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-move"
                >
                  {/* Food info - Better responsive layout */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {food.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {food.groups.join(' • ')} • {food.kcalPer100}
                    </div>
                  </div>
                  
                  {/* Add button - Full width on mobile */}
                  <select

                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addFoodToMeal(food, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full sm:w-auto bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-none rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    <option value="">{t('foodCatalog.addTo')}</option>
                    <option value="petit">{t('foodCatalog.meals.breakfast')}</option>
                    <option value="dej">{t('foodCatalog.meals.lunch')}</option>
                    <option value="diner">{t('foodCatalog.meals.dinner')}</option>
                    <option value="snack">{t('foodCatalog.meals.snacks')}</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content - Meal Planner */}
        <main className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
          <div className="p-4 border-b border-gray-300 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              {t('mealPlan.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('mealPlan.subtitle')}
            </p>
          </div>
          <div className="p-4">
            {/* Day Selection */}
            <div className="flex gap-2 flex-wrap mb-4">
              {['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'].map(day => (
               
                <button
                  key={day}
                  onClick={() => setDb(prev => ({ ...prev, day }))}
                   className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full cursor-pointer transition-colors ${
    db.day === day 
      ? 'bg-primary text-primary-foreground border-primary' // Changed from blue-600/500
      : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200'
  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Goals Configuration */}
            <div className="flex gap-4 items-center flex-wrap mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Calories</label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="ex: 2000"
                value={db.config.targetKcal}
                onChange={(e) => setDb(prev => ({
                  ...prev,
                  config: { ...prev.config, targetKcal: Number(e.target.value) || 0 }
                }))}
                className="w-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-3 py-2"
              />
              
              <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">P %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={db.config.pctP}
                onChange={(e) => setDb(prev => ({
                  ...prev,
                  config: { ...prev.config, pctP: Number(e.target.value) || 0 }
                }))}
                className="w-20 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-lg px-3 py-2"
              />
              
              <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">L %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={db.config.pctF}
                onChange={(e) => setDb(prev => ({
                  ...prev,
                  config: { ...prev.config, pctF: Number(e.target.value) || 0 }
                }))}
                className="w-20 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-lg px-3 py-2"
              />
              
              <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">G %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={db.config.pctC}
                onChange={(e) => setDb(prev => ({
                  ...prev,
                  config: { ...prev.config, pctC: Number(e.target.value) || 0 }
                }))}
                className="w-20 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-lg px-3 py-2"
              />
              
              <span className="text-sm border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                Somme: {db.config.pctP + db.config.pctF + db.config.pctC}%
              </span>
              
              <button
                onClick={generateDiet}
  className="bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-lg px-4 py-2 font-bold cursor-pointer transition-colors"
              >
                {t('actions.generate')}
              </button>
            </div>

            {/* Action Buttons */}
           <div className="flex gap-2 flex-wrap mb-4">
  <button
    onClick={saveDietPlan}
    className="bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-lg px-4 py-2 font-bold cursor-pointer transition-colors"
  >
    {t('actions.save')}
  </button>
  <button
    onClick={() => {
      setDb(prev => ({
        ...prev,
        week: {
          ...prev.week,
          [prev.day]: newDay()
        }
      }));
      setToast({ 
        show: true, 
        message: `${t('messages.dayCleared')} ${db.day}` 
      });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1200);
    }}
    className="bg-transparent border border-dashed border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded-lg px-4 py-2 font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
  >
    {t('actions.clearDay')}
  </button>
</div>

            {/* Meals */}
            <div className="grid gap-3">
  <MealSection
    mealType="petit"
    title={t('mealPlan.breakfast')}
    entries={currentDay.petit}
    totals={dayTotals.petit}
    readOnly={Boolean(patient?.latestVisit?.diet)}
  />
  <MealSection
    mealType="dej"
    title={t('mealPlan.lunch')}
    entries={currentDay.dej}
    totals={dayTotals.dej}
    readOnly={Boolean(patient?.latestVisit?.diet)}
  />
  <MealSection
    mealType="snack"
    title={t('mealPlan.snacks')}
    entries={currentDay.snack}
    totals={dayTotals.snack}
    readOnly={Boolean(patient?.latestVisit?.diet)}
  />
  <MealSection
    mealType="diner"
    title={t('mealPlan.dinner')}
    entries={currentDay.diner}
    totals={dayTotals.diner}
    readOnly={Boolean(patient?.latestVisit?.diet)}
  />
</div>

            {/* Daily Total */}
            <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 border border-primary/20 dark:border-primary/20">
              <div className="font-bold text-lg text-gray-900 dark:text-white">
                    {t('dailyTotal.title')}: {totalDayKcal} {t('dailyTotal.calories')}

              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {fmtMacros({
                  p: dayTotals.petit.macros.p + dayTotals.dej.macros.p + dayTotals.diner.macros.p + dayTotals.snack.macros.p,
                  c: dayTotals.petit.macros.c + dayTotals.dej.macros.c + dayTotals.diner.macros.c + dayTotals.snack.macros.c,
                  f: dayTotals.petit.macros.f + dayTotals.dej.macros.f + dayTotals.diner.macros.f + dayTotals.snack.macros.f
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Printable Section */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl mt-6 overflow-hidden">
  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-gray-200 dark:border-gray-600">
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{t('nutritionProgram.title')}</h2>
          <p className="text-emerald-700 dark:text-emerald-300 font-medium">
            {t('nutritionProgram.subtitle')}
          </p>
        </div>
      </div>
      <button
        onClick={downloadPDF}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none rounded-xl px-6 py-3 font-semibold cursor-pointer transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {t('actions.download')}
      </button>
    </div>
  </div>

  <div id="nutrition-program" className="bg-white dark:bg-gray-800 p-6">
    {/* Patient Information Grid */}
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {t('nutritionProgram.patientInfo.title')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
  { label: t('nutritionProgram.patientInfo.name'), value: patient.nom },
  { label: t('nutritionProgram.patientInfo.age'), value: `${patient.age} ${t('nutritionProgram.patientInfo.years')}` },
  { label: t('nutritionProgram.patientInfo.doctor'), value: `Dr. ${patient.prat}` },
  { label: t('nutritionProgram.patientInfo.weight'), value: `${patient.poids} kg` },
  { label: t('nutritionProgram.patientInfo.height'), value: `${patient.taille} cm` },
  { label: t('nutritionProgram.patientInfo.bmi'), value: calcIMC() },
  { label: t('nutritionProgram.patientInfo.bodyFat'), value: `${patient.latestVisit?.bf || '-'} %` },
  { label: t('nutritionProgram.patientInfo.dailyCalories'), value: `${db.config.targetKcal} kcal` },
  { label: t('nutritionProgram.patientInfo.date'), value: patient.date }
].map((field, index) => (
  <div key={`field-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{field.label}</div>
    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{field.value}</div>
  </div>
))}
      </div>
    </div>

    {/* Weekly Program Table */}
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t('nutritionProgram.title')}
        </h3>
        <p className="text-emerald-100 text-sm">{t('nutritionProgram.subtitle')}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 w-32 min-w-[120px]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('summary.week')}
                </div>
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                  {t('mealPlan.breakfast')}
                </div>
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  {t('mealPlan.snacks')}
                </div>
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                  </svg>
                  {t('mealPlan.lunch')}
                </div>
              </th>
              <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  {t('mealPlan.dinner')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ['days.monday', 'J1'], ['days.tuesday', 'J2'], ['days.wednesday', 'J3'],
              ['days.thursday', 'J4'], ['days.friday', 'J5'], ['days.saturday', 'J6'], 
              ['days.sunday', 'J7']
            ].map(([label, key], index) => {
              const day = db.week[key];
              const formatItems = (items) => items.map(e => {
                if (e.unitType === 'portion') {
                  return `${e.name} (${e.qty} ${e.unitType}${e.qty > 1 ? 's' : ''})`;
                } else {
                  return `${e.name} (${e.qty}${e.unitType})`;
                }
              }).join(' + ');

              return (
                <tr key={key} className={`border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/30'} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
                  <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-400 border-r border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                     { t(label)}
                    </div>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">
                    <div className="text-sm leading-relaxed">{formatItems(day.petit)}</div>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">
                    <div className="text-sm leading-relaxed">{formatItems(day.snack)}</div>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">
                    <div className="text-sm leading-relaxed">{formatItems(day.dej)}</div>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    <div className="text-sm leading-relaxed">{formatItems(day.diner)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* Enhanced Advice Section */}
    {/* Enhanced Advice Section */}
<div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5 border border-blue-200 dark:border-gray-600">
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
        {t('nutritionalAdvice.title')}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800 dark:text-blue-200">
        {[
          'water',
          'chewing',
          'processed',
          'sugaryDrinks'
        ].map((tip) => (
          <div key={tip} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span>{t(`nutritionalAdvice.tips.${tip}`)}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
  </div>
</section>

      {/* Add Food Modal */}
      {showAddModal && <AddFoodModal />}

      {/* Add Food Form Modal */}
      {showAddFoodModal && (
        <AddFoodForm
          onClose={() => setShowAddFoodModal(false)}
          onAdd={addCustomFood}
        />
      )}

      {/* Toast */}
        <Toast 
        message={toast.message} 
        show={toast.show} 
        onHide={() => setToast(prev => ({ ...prev, show: false }))} 
      />
    </div>
  );
};

// Add to the existing translations or create a new one
