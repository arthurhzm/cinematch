import AppLayout from "@/components/app-layout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import usePreferences from "@/hooks/use-preferences";
import { ROUTES } from "@/utils/routes";
import { HttpStatusCode, isAxiosError } from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const { userData } = useAuth();
    const { getUserPreferences } = usePreferences();
    const { showError } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData) return;
        getUserPreferences(userData.id).then((res) => {
            // quando der certo fazer coisas depois
        }).catch((error) => {
            if (!isAxiosError(error)) {
                showError("Erro ao buscar preferências do usuário");
                return;
            }
            if (error.status === HttpStatusCode.NotFound) {
                navigate(ROUTES.addPreferences);
                return;
            }

        });
    }, [userData, getUserPreferences])

    return (
        <AppLayout title="Descubra seus próximos filmes favoritos">
            alo
        </AppLayout>
    );
}