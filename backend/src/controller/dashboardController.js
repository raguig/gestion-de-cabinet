import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import PatientVisit from '../models/PatientVisit.js';
import Doctor from '../models/Doctor.js';

// Add this new function to calculate weekly patient stats
const getWeeklyPatientStats = async (doctorId) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // Calculate start of week (Monday 00:00)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Calculate end of week (Sunday 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Get new patients created this week
  const newPatients = await Patient.find({
    doctor: doctorId,
    createdAt: {
      $gte: startOfWeek,
      $lte: endOfWeek
    }
  });

  // Get all visits this week
  const visits = await PatientVisit.find({
    patient: { $in: await Patient.find({ doctor: doctorId }).distinct('_id') },
    visitDate: {
      $gte: startOfWeek,
      $lte: endOfWeek
    }
  });

  // Calculate daily breakdown
  const dailyBreakdown = [];
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(startOfWeek.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayPatients = newPatients.filter(patient => 
      patient.createdAt >= dayStart && patient.createdAt <= dayEnd
    ).length;

    dailyBreakdown.push({
      day: days[i],
      count: dayPatients
    });
  }

  // Calculate average per day
  const totalNewPatients = newPatients.length;
  const averagePerDay = totalNewPatients / 7;

  // Get previous week's stats
  const previousWeekTotal = await getPreviousWeekStats(doctorId, startOfWeek);
  
  // Calculate growth rate
  let growthRate;
  if (totalNewPatients === 0) {
    growthRate = 0;
  } else if (previousWeekTotal === 0) {
    growthRate = 100;
  } else {
    growthRate = Math.round(((totalNewPatients - previousWeekTotal) / previousWeekTotal) * 100);
    if (growthRate < 0) growthRate = 0;
  }

  return {
    totalNewPatients,
    totalVisits: visits.length,
    averagePerDay: Math.round(averagePerDay * 100) / 100,
    dailyBreakdown,
    growthRate,
    previousWeekTotal
  };
};

// Add this to the getWeeklyPatientStats function
const getPreviousWeekStats = async (doctorId, startOfWeek) => {
  const startOfPreviousWeek = new Date(startOfWeek);
  startOfPreviousWeek.setDate(startOfWeek.getDate() - 7);
  
  const endOfPreviousWeek = new Date(startOfWeek);
  endOfPreviousWeek.setSeconds(endOfPreviousWeek.getSeconds() - 1);

  const previousWeekPatients = await Patient.countDocuments({
    doctor: doctorId,
    createdAt: {
      $gte: startOfPreviousWeek,
      $lt: endOfPreviousWeek
    }
  });

  return previousWeekPatients;
};

export const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's appointments - Updated query
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      // Use the correct status
      status: { $in: ["confirme", "reprogramme"] }
    }).sort({ hour: 1 });

    // Log appointments for debugging
    console.log('Found appointments:', todayAppointments);

    // Get recent patient visits with diet plans
    const recentPlans = await PatientVisit.find({
      patient: { $in: await Patient.find({ doctor: doctorId }).distinct('_id') }
    })
    .populate('patient')
    .populate('diet')
    .sort({ visitDate: -1 })
    .limit(3);

    // Get patient progress data
    const patients = await Patient.find({ doctor: doctorId })
      .sort({ createdAt: -1 })
      .limit(4);

    // Get patient visits for progress calculation
    const patientVisits = await Promise.all(
      patients.map(async (patient) => {
        const visits = await PatientVisit.find({ patient: patient._id })
          .sort({ visitDate: -1 })
          .limit(2);
        return {
          patient,
          visits
        };
      })
    );

    // Calculate weekly stats for the chart
    const sevenDaysAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const weeklyStats = await PatientVisit.aggregate([
      {
        $match: {
          patient: { 
            $in: await Patient.find({ doctor: doctorId }).distinct('_id') 
          },
          visitDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitDate" } },
          avgCalorieIntake: { $avg: "$calorieintake" },
          avgWeight: { $avg: "$weight" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Get weekly patient stats
    const weeklyPatientStats = await getWeeklyPatientStats(doctorId);

    // Format response data with updated appointment translation
    const dashboardData = {
      appointments: todayAppointments.map(apt => ({
        name: apt.fullname,
        phone: apt.number,
        time: apt.hour,
        objective: {
          fr: apt.objectives,
          en: apt.objectives
        },
        type: {
          fr: getAppointmentStatusFr(apt.status),
          en: getAppointmentStatusEn(apt.status)
        }
      })),  // Added missing closing parenthesis here

      recentPlans: recentPlans.map(visit => ({
        patient: `${visit.patient.firstname} ${visit.patient.lastname}`,
        age: calculateAge(visit.patient.dateOfBirth),
        goal: {
          fr: visit.patient.goal,
          en: visit.patient.goal
        },
        status: visit.patient.status,
        startWeight: visit.visits?.[1]?.weight || visit.weight,
        currentWeight: visit.weight,
        targetWeight: calculateTargetWeight(visit.weight, visit.patient.goal),
        completion: calculateCompletion(visit.weight, visit.visits?.[1]?.weight, calculateTargetWeight(visit.weight, visit.patient.goal))
      })),  // Added missing closing parenthesis here

      patientProgress: patientVisits.map(({ patient, visits }) => ({
        name: `${patient.firstname} ${patient.lastname}`,
        age: calculateAge(patient.dateOfBirth),
        plan: {
          fr: patient.goal,
          en: patient.goal
        },
        startDate: patient.createdAt.toLocaleDateString(),
        progress: calculateProgress(visits),
        status: {
          fr: patient.status || "en cours",
          en: translateStatus(patient.status || "en cours")
        },
        lastVisit: visits[0]?.visitDate.toLocaleDateString() || 'N/A',
        nextVisit: calculateNextVisit(visits[0]?.visitDate)
      })),

      weeklyStats: weeklyStats.map(stat => ({
        day: new Date(stat._id).toLocaleDateString('en-US', { weekday: 'short' }),
        actual: Math.round(stat.avgCalorieIntake),
        target: 2000, // This should be calculated based on patient goals
      })),

      // Add the new weekly patient stats
      weeklyPatientStats
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      message: "Error fetching dashboard data",
      error: error.message 
    });
  }
};

// Add these helper functions
const getAppointmentStatusFr = (status) => {
  const statusMap = {
    'confirme': 'Confirmé',
    'reprogramme': 'Reprogrammé',
    'arrive': 'Arrivé',
    'termine': 'Terminé'
  };
  return statusMap[status] || status;
};

const getAppointmentStatusEn = (status) => {
  const statusMap = {
    'confirme': 'Confirmed',
    'reprogramme': 'Rescheduled',
    'arrive': 'Arrived',
    'termine': 'Completed'
  };
  return statusMap[status] || status;
};

// Helper functions
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const calculateTargetWeight = (currentWeight, goal) => {
  switch(goal) {
    case 'weight loss':
      return currentWeight * 0.9;
    case 'muscle gain':
      return currentWeight * 1.1;
    default:
      return currentWeight;
  }
};

const calculateCompletion = (current, start, target) => {
  if (!start || !target) return 0;
  const totalChange = Math.abs(target - start);
  const currentChange = Math.abs(current - start);
  return Math.min(Math.round((currentChange / totalChange) * 100), 100);
};

const calculateProgress = (visits) => {
  if (visits.length < 2) return 0;
  const initial = visits[visits.length - 1].weight;
  const current = visits[0].weight;
  const target = calculateTargetWeight(initial, visits[0].patient.goal);
  return calculateCompletion(current, initial, target);
};

const determineStatus = (visits) => {
  if (!visits.length) return "Nouveau";
  const daysSinceLastVisit = (new Date() - new Date(visits[0].visitDate)) / (1000 * 60 * 60 * 24);
  if (daysSinceLastVisit > 30) return "En pause";
  return "En cours";
};

const calculateNextVisit = (lastVisit) => {
  if (!lastVisit) return 'Non planifié';
  const nextVisit = new Date(lastVisit);
  nextVisit.setDate(nextVisit.getDate() + 14); // Assuming bi-weekly visits
  return nextVisit.toLocaleDateString();
};

const translateStatus = (status) => {
  const statusMap = {
    'en cours': 'In Progress',
    'inactif': 'Inactive',
    'reussi': 'Success',
    'abandonne': 'Abandoned',
    'abandonnee': 'Abandoned'
  };

  const normalizedStatus = status.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return statusMap[normalizedStatus] || status;
};