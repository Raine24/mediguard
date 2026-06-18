import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root visitors to the login page
  redirect("/login");
}
