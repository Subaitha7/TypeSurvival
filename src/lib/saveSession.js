import supabase from "./supabaseClient";

export async function saveSession({ wpm, accuracy, kspc, survivalScore }) {

  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        wpm,
        accuracy,
        kspc,
        survival_score: survivalScore,
        heat_mode_duration: 0,
        created_at: new Date()
      }
    ])
    .select();

  if (error) {
    console.error("Supabase error:", error.message);
    return;
  }

  console.log("Session saved:", data);
}