import { db } from "../firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

export const getFamily = async (familyId) => {
  const snap = await getDoc(doc(db, "families", familyId))
  if (snap.exists()) {
    return snap.data()
  }
  return null
}

export const saveFamily = async (familyId, data) => {
  await setDoc(doc(db, "families", familyId), data)
}

export const addMedicineToMember = async (familyId, memberId, medicine) => {
  const family = await getFamily(familyId)
  const updatedMembers = family.members.map(member => {
    if (member.id === memberId) {
      return {
        ...member,
        medicines: [...member.medicines, medicine]
      }
    }
    return member
  })
  await updateDoc(doc(db, "families", familyId), {
    members: updatedMembers
  })
}

export const removeMedicineFromMember = async (familyId, memberId, medicineIndex) => {
  const family = await getFamily(familyId)
  const updatedMembers = family.members.map(member => {
    if (member.id === memberId) {
      const updatedMedicines = member.medicines.filter((_, i) => i !== medicineIndex)
      return { ...member, medicines: updatedMedicines }
    }
    return member
  })
  await updateDoc(doc(db, "families", familyId), {
    members: updatedMembers
  })
}
