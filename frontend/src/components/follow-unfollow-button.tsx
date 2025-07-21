import { useAuth } from "@/contexts/AuthContext";
import { FollowUnfollowUserDTO } from "@/DTO/FollowUnfollowUserDTO";
import useUser from "@/hooks/use-user";
import type { UserProfilePreview } from "@/utils/types";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

type FollowUnfollowButtonProps = {
    user: UserProfilePreview;
}

export default function FollowUnfollowButton({ user }: FollowUnfollowButtonProps) {
    const { userData } = useAuth();
    const { getUserFollowers, followUser, unfollowUser } = useUser();

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
            <Button disabled>
                Carregando...
            </Button>
        );
    }

    return user.userId !== userData?.id && (
        <Button
            variant={followers.some(follower => follower.userId === userData.id) ? "outline" : "default"}
            onClick={(e) => {
                e.stopPropagation();
                if (followers.some(follower => follower.userId === userData.id)) {
                    unfollowUser(new FollowUnfollowUserDTO(user.userId, userData.id));
                    setFollowers?.(followers.filter(follower => follower.userId !== userData.id));
                } else {
                    followUser(new FollowUnfollowUserDTO(user.userId, userData.id));
                    setFollowers?.([...followers, { userId: userData.id, username: userData.username, profilePicture: userData.profilePicture ?? null }]);
                }
            }}>
            {followers.some(follower => follower.userId === userData.id) ? <><Check /> Seguindo</> : "Seguir"}
        </Button>
    );

}