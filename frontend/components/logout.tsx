"use client"
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Logout() {
    const router = useRouter();
    return (
        <div className="hover:bg-accent/50 p-2 rounded-md inline-flex ml-auto">
            <button
                onClick={async () => {
                    const response = await fetch("http://localhost:5000/logout", {
                        credentials: "include",
                    })
                    if (response.ok) {
                        setTimeout(() => {
                            router.push("/login");
                        }, 1500);
                        toast.success("Logging out...", {
                            richColors: true
                        })
                    }
                }}
                className="cursor-pointer"
            >
                <LogOut size={20} />
            </button>
        </div>
    )
}
