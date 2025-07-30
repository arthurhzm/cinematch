import InputPassword from "@/components/input-password";
import InputText from "@/components/input-text";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import useUser from "@/hooks/use-user";
import { ROUTES } from "@/utils/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

export default function LoginPage() {
    const { authenticateUser } = useUser();
    const navigate = useNavigate();
    const { showError } = useToast();

    const schema = z.object({
        email: z.email({ message: "Email inválido" }),
        password: z.string().min(1, { message: "Senha é obrigatória" }),
    });

    type LoginFormData = z.infer<typeof schema>;

    const { register, handleSubmit, formState } = useForm<LoginFormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await authenticateUser(data.email, data.password);
            navigate(ROUTES.home);
        } catch (error) {
            showError("Erro ao autenticar usuário, tente novamente.");
        }
    };

    return (
        <PageContainer title="Bem-vindo de volta" subtitle="Entre para descobrir seus próximos filmes favoritos">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <InputText
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    errors={formState.errors.email}
                />
                <InputPassword
                    label="Senha"
                    placeholder="Sua senha"
                    {...register("password")}
                    errors={formState.errors.password}
                />
                <div className="flex items-center justify-between text-sm">
                    <Link
                        to={ROUTES.forgotPassword}
                        className="text-primary hover:text-primary/80 transition-colors"
                    >
                        Esqueceu a senha?
                    </Link>
                </div>
                <Button
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cinema-glow transition-all duration-300"
                    type="submit"
                    disabled={formState.isSubmitting}
                >
                    {formState.isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                    Ainda não tem uma conta?{" "}
                    <Link
                        to="/register"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Criar conta
                    </Link>
                </div>
            </form>
        </PageContainer>
    );
}