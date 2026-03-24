import { db } from "../firebase"
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove
} from "firebase/firestore"

// ── Get family data ───────────────────────────────────────────────
export const getFamily = async (familyId) => {
  try {
    const ref  = doc(db, "families", familyId)
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data()
    return null
  } catch (err) {
    console.error("Error getting family:", err)
    return null
  }
}

// ── Save entire family ────────────────────────────────────────────
export const saveFamily = async (familyId, familyData) => {
  try {
    await setDoc(doc(db, "families", familyId), familyData)
    return true
  } catch (err) {
    console.error("Error saving family:", err)
    return false
  }
}

// ── Add medicine to a member ──────────────────────────────────────
export const addMedicineToMember = async (familyId, memberId, medicine) => {
  try {
    const family = await getFamily(familyId)
    if (!family) return false
    const updatedMembers = family.members.map(m =>
      m.id === memberId
        ? { ...m, medicines: [...(m.medicines || []), medicine] }
        : m
    )
    await setDoc(doc(db, "families", familyId), {
      ...family,
      members: updatedMembers
    })
    return true
  } catch (err) {
    console.error("Error adding medicine:", err)
    return false
  }
}

// ── Remove medicine from a member ────────────────────────────────
export const removeMedicineFromMember = async (familyId, memberId, medicineIndex) => {
  try {
    const family = await getFamily(familyId)
    if (!family) return false
    const updatedMembers = family.members.map(m => {
      if (m.id !== memberId) return m
      const updatedMeds = m.medicines.filter((_, i) => i !== medicineIndex)
      return { ...m, medicines: updatedMeds }
    })
    await setDoc(doc(db, "families", familyId), {
      ...family,
      members: updatedMembers
    })
    return true
  } catch (err) {
    console.error("Error removing medicine:", err)
    return false
  }
}

// ── Clear all medicines from a member ────────────────────────────
export const clearMemberMedicines = async (familyId, memberId) => {
  try {
    const family = await getFamily(familyId)
    if (!family) return false
    const updatedMembers = family.members.map(m =>
      m.id === memberId ? { ...m, medicines: [] } : m
    )
    await setDoc(doc(db, "families", familyId), {
      ...family,
      members: updatedMembers
    })
    return true
  } catch (err) {
    console.error("Error clearing medicines:", err)
    return false
  }
}

// ── Remove a family member ────────────────────────────────────────
export const removeFamilyMember = async (familyId, memberId) => {
  try {
    const family = await getFamily(familyId)
    if (!family) return false
    const updatedMembers = family.members.filter(m => m.id !== memberId)
    await setDoc(doc(db, "families", familyId), {
      ...family,
      members: updatedMembers
    })
    return true
  } catch (err) {
    console.error("Error removing member:", err)
    return false
  }
}

// ── Add a new family member ───────────────────────────────────────
export const addFamilyMember = async (familyId, newMember) => {
  try {
    const family = await getFamily(familyId)
    if (!family) return false
    const updatedMembers = [...family.members, newMember]
    await setDoc(doc(db, "families", familyId), {
      ...family,
      members: updatedMembers
    })
    return true
  } catch (err) {
    console.error("Error adding member:", err)
    return false
  }
}

// ── Delete entire family ──────────────────────────────────────────
export const deleteFamily = async (familyId) => {
  try {
    const { deleteDoc } = await import("firebase/firestore")
    await deleteDoc(doc(db, "families", familyId))
    localStorage.removeItem("pharmaguard_family_id")
    return true
  } catch (err) {
    console.error("Error deleting family:", err)
    return false
  }
}
