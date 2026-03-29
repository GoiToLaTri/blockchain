import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/login">Login</Link>
      <Link href="/admin/dashboard">Dashboard</Link>
    </div>
  );
}
