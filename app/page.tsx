import { redirect } from "next/navigation";

export default function Home() {
  redirect("/admin/dashboard");
  // This redirect will happen before the component renders
}

