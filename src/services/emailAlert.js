import emailjs from "@emailjs/browser"

const SERVICE_ID           = "service_o9zksg8"
const TEMPLATE_ID_REMINDER = "template_2hjsnqk"
const TEMPLATE_ID_ALERT    = "template_g0fchaf"
const PUBLIC_KEY           = "gHYZLoS5vI64zXioO"

emailjs.init(PUBLIC_KEY)

export const sendReminderToPatient = async ({
  patientEmail,
  patientName,
  medicineName,
  dose,
  reminderTime
}) => {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_REMINDER, {
      patient_email: patientEmail,
      patient_name:  patientName,
      medicine_name: medicineName,
      dose:          dose,
      reminder_time: reminderTime
    })
    console.log("Reminder email sent to", patientEmail)
    return true
  } catch (err) {
    console.error("Reminder email failed:", err)
    return false
  }
}

export const sendMissedMedicineAlert = async ({
  familyEmail,
  familyName,
  patientName,
  medicineName,
  dose,
  reminderTime
}) => {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID_ALERT, {
      family_email:  familyEmail,
      family_name:   familyName,
      patient_name:  patientName,
      medicine_name: medicineName,
      dose:          dose,
      reminder_time: reminderTime
    })
    console.log("Alert email sent to", familyEmail)
    return true
  } catch (err) {
    console.error("Alert email failed:", err)
    return false
  }
}