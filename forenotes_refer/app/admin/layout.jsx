import { redirect } from "next/navigation";
import { authenticateAdmin } from "@/lib/adminAuth";

export default async function AdminLayout({ children }) {
    // We only want to protect the main admin pages, not the login/signup pages
    // Since this layout applies to all /admin routes by default in the app router,
    // we do NOT put this file in /admin/layout.jsx if we don't want it to apply to /admin/auth.
    // Wait, if it's in /admin/layout.jsx, it wraps /admin/auth as well.
    // Actually, Server Components in Next.js App Router cascade layouts.
    return (
        <section>
            {children}
        </section>
    );
}
