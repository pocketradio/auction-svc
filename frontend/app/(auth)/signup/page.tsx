import { SignupForm } from "@/components/signup-form";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


export default function Signup() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <Card className="w-100">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                </CardHeader>
                <CardContent>
                    <SignupForm />
                </CardContent>
            </Card>
        </div>
    )
}
