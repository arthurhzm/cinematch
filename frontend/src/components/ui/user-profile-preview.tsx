import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";
import type { UserProfilePreview } from "@/utils/types";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FollowUnfollowButton from "../follow-unfollow-button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

type UserPreviewProps = {
    user: UserProfilePreview;
};

export default function UserPreview({ user }: UserPreviewProps) {
    const navigate = useNavigate();
    const { userData } = useAuth();

    if (!userData) {
        return (
            <div>
                <p>Carregando...</p>
            </div>
        )
    }

    return (
        <div
            className="cinema-card p-4 hover:border-primary/40 transition-all cursor-pointer"
            onClick={() => navigate(ROUTES.profile(user.username), { state: { userId: user.userId } })}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                        {user.profilePicture ? (
                            <AvatarImage
                                src={user.profilePicture}
                                alt={`Avatar de ${user.username}`}
                            />
                        ) : (
                            <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
                                {user.username ? getInitials(user.username) : <User />}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-lg text-foreground">{user.username}</h3>
                    </div>
                </div>
                <FollowUnfollowButton user={user} />
            </div>
        </div>
    );
}