"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// zod schema 
const formSchema = z
    .object({
        title: z.string().min(3, "Title too short"),
        desc: z.string().min(1, "Add a description for your auction."),
        startingPrice: z.string().min(1, "Required"),
        endTime: z.string().min(1, "End time required"),
    })
    .refine(
        (data) => new Date(data.endTime).getTime() > Date.now(),
        {
            message: "End time must be in the future",
            path: ["endTime"],
        }
    )

export default function Create() {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            startingPrice: "",
            endTime: "",
            desc: ""
        },
    })
    const { isSubmitting } = form.formState;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = { // payload matching zodauctionchema in backend
            title: values.title,
            description: values.desc,
            startingBid: Number(values.startingPrice),
            endsAt: new Date(values.endTime).toISOString()
        }

        const res = await fetch("http://localhost:5000/auctions/create", {
            // body, header etc.
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        })

        if (res.ok) {
            console.log("SUCCESS");
            toast.success("Added auction successfully!");
            router.push("/auctions");
            return;
        }

        // else 
        toast("Failed to add auction. Please try again. ", {
            action: {
                label: "Ok",
                onClick: () => { },
            },
        })

    }

    return (

        <div className="flex min-h-screen items-center justify-center">
            <Toaster />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Auction</CardTitle>
                    <CardDescription>
                        Enter auction details
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="desc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel> Description </FormLabel>
                                        <FormControl>
                                            {/* <Input {...field} /> */}
                                            <Textarea {...field} placeholder="Enter auction description here" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startingPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Starting Price ($) </FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
