import AppLayout from "@/components/app-layout";
import UserPreview from "@/components/ui/user-profile-preview";
import type { UserProfilePreview } from "@/utils/types";
import { useLocation, useNavigate } from "react-router-dom";

export default function FollowersPage() {

    type Page = 'followers' | 'following';

    const { users } = useLocation().state as { users: UserProfilePreview[] | [] };
    const page = location.pathname.split('/').pop() as Page;
    const navigate = useNavigate();

    return (
        <AppLayout title={page === 'followers' ? 'Seguidores' : 'Seguindo'}>
            <div className="space-y-4">
                {users.length > 0 ? (
                    users.map(user => (
                        <UserPreview
                            key={user.userId}
                            user={user}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium text-muted-foreground">
                                {page === 'followers' ? 'Nenhum seguidor' : 'Não segue ninguém'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Este usuário ainda não {page === 'followers' ? 'possui seguidores' : 'segue outras pessoas'}.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Voltar ao Perfil
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}