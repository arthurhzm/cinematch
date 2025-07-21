import { ROUTES } from "@/utils/routes";
import type { UserProfilePreview } from "@/utils/types";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { UserIcon } from "lucide-react";

type UserPreviewProps = {
    user: UserProfilePreview;
};

export default function UserPreview({ user }: UserPreviewProps) {
    const navigate = useNavigate();
    return (
        <div
            className="cinema-card p-4 hover:border-primary/40 transition-all cursor-pointer"
            onClick={() => navigate(ROUTES.profile(user.username), { state: { userId: user.userId } })}
        >
            <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                    {user.profilePicture ? (
                        <AvatarImage
                            src={user.profilePicture}
                            alt={`Avatar de ${user.username}`}
                        />
                    ) : (
                        <AvatarFallback>
                            <UserIcon />
                        </AvatarFallback>
                    )}
                </Avatar>
                <div>
                    <h3 className="font-bold text-lg text-foreground">{user.username}</h3>
                </div>
            </div>
        </div>
    );
}