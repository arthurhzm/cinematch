import { FollowUnfollowUserDTO } from "@/DTO/FollowUnfollowUserDTO";
import { useAuth } from "@/contexts/AuthContext";
import useUser from "@/hooks/use-user";
import { ROUTES } from "@/utils/routes";
import type { UserProfilePreview } from "@/utils/types";
import { Check, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";

type UserPreviewProps = {
    user: UserProfilePreview;
};

export default function UserPreview({ user }: UserPreviewProps) {
    const navigate = useNavigate();
    const { getUserFollowers, followUser, unfollowUser } = useUser();
    const { userData } = useAuth();
    const [followers, setFollowers] = useState<UserProfilePreview[] | []>([]);

    useEffect(() => {
        const fetchFollowers = async () => {
            if (!user) return;
            const followersResponse = await getUserFollowers(user.userId);
            setFollowers(followersResponse.data);
        };
        fetchFollowers();
    }, [user]);

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
                            <AvatarFallback>
                                <UserIcon />
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-lg text-foreground">{user.username}</h3>
                    </div>
                </div>
                {user.userId !== userData?.id && (
                    <Button
                        variant={followers.some(follower => follower.userId === userData.id) ? "outline" : "default"}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (followers.some(follower => follower.userId === userData.id)) {
                                unfollowUser(new FollowUnfollowUserDTO(user.userId, userData.id));
                                setFollowers(followers.filter(follower => follower.userId !== userData.id));
                            } else {
                                followUser(new FollowUnfollowUserDTO(user.userId, userData.id));
                                setFollowers([...followers, { userId: userData.id, username: userData.username, profilePicture: userData.profilePicture ?? null }]);
                            }
                        }}>
                        {followers.some(follower => follower.userId === userData.id) ? <><Check /> Seguindo</> : "Seguir"}
                    </Button>
                )}
            </div>
        </div>
    );
}