import EdyRoom from "./EdyRoom";

// Página pensada para servirse dentro del iframe del widget (sin Navbar).
export const metadata = {
  title: "Asistente Edy",
};

export default function AgenteEdyPage() {
  return <EdyRoom />;
}
