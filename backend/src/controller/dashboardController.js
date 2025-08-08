import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import PatientVisit from '../models/PatientVisit.js';
import Doctor from '../models/Doctor.js';

export const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      status: "scheduled"
    }).sort({ hour: 1 });

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

    // Format response data
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
          fr: apt.status === "scheduled" ? "Planifié" : "Terminé",
          en: apt.status === "scheduled" ? "Scheduled" : "Completed"
        }
      })),

      recentPlans: recentPlans.map(visit => ({
        patient: `${visit.patient.firstname} ${visit.patient.lastname}`,
        age: calculateAge(visit.patient.dateOfBirth),
        goal: {
          fr: visit.patient.goal,
          en: visit.patient.goal
        },
        status: {
          fr: "En cours",
          en: "In progress"
        },
        startWeight: visit.visits?.[1]?.weight || visit.weight,
        currentWeight: visit.weight,
        targetWeight: calculateTargetWeight(visit.weight, visit.patient.goal),
        completion: calculateCompletion(visit.weight, visit.visits?.[1]?.weight, calculateTargetWeight(visit.weight, visit.patient.goal))
      })),

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
          fr: determineStatus(visits),
          en: determineStatus(visits)
        },
        lastVisit: visits[0]?.visitDate.toLocaleDateString() || 'N/A',
        nextVisit: calculateNextVisit(visits[0]?.visitDate)
      })),

      weeklyStats: weeklyStats.map(stat => ({
        day: new Date(stat._id).toLocaleDateString('en-US', { weekday: 'short' }),
        actual: Math.round(stat.avgCalorieIntake),
        target: 2000, // This should be calculated based on patient goals
      }))
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
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