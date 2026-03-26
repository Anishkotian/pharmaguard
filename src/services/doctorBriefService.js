export function buildBriefData(formData) {
  return {
    symptoms: formData.symptoms || "",
    medicines: formData.medicines || "",
    age: formData.age || "",
  };
}const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function generateDoctorBrief(data) {
  try {
    const prompt = `
Create a professional patient summary:

Symptoms: ${data.symptoms}
Medicines: ${data.medicines}
Age: ${data.age}
`;


    const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const result = await response.json();

    return (
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary generated"
    );
  } catch (error) {
    console.error("Doctor Brief Error:", error);
    return "Error generating summary";
  }
}
export async function generateBriefWithAI(data) {
  return await generateDoctorBrief(data);
}
