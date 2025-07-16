import AppLayout from "@/components/app-layout";
import { useParams } from "react-router-dom";

export default function ProfilePage() {
    const { username } = useParams();

    return (
        <AppLayout>
            <h1>Profile Page</h1>
            <p>Username: {username}</p>
        </AppLayout>
    )
}