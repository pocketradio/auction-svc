"use client"
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Logout() {
    const router = useRouter();
    return (
        <div className="hover:bg-accent/50 p-2 rounded-md inline-flex ml-auto">
            <button
                onClick={async () => {
                    const response = await fetch("http://localhost:5000/logout")
                    if (response.ok) {
                        router.push("/login");
                    }
                }}
                className="cursor-pointer"
            >
                <LogOut size={20} />
            </button>
        </div>
    )
}
