import InputPassword from "@/components/input-password";
import InputText from "@/components/input-text";
import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import { CreateUserDTO } from "@/DTO/CreateUserDTO";
import useUser from "@/hooks/use-user";
import { ROUTES } from "@/utils/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

export default function RegisterPage() {

    const { createUser, authenticateUser } = useUser();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const schema = z.object({
        username: z.string().min(3, { message: "Informe um nome com pelo menos 3 caracteres" }),
        email: z.email({ message: "Email inválido" }),
        password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
        confirmPassword: z.string().min(6, { message: "Confirmação de senha é obrigatória" }),
    }).refine(data => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

    type RegisterFormData = z.infer<typeof schema>;

    const { register, handleSubmit, formState } = useForm<RegisterFormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data: RegisterFormData) => {
        const userData = new CreateUserDTO(data.username, data.password, data.email);
        try {
            await createUser(userData);
            await authenticateUser(data.email, data.password);
            navigate(ROUTES.home);
            showSuccess("Usuário criado com sucesso!");
        } catch (error) {
            showError("Erro ao criar usuário. Tente novamente mais tarde.");
        }
    }


    return (
        <PageContainer title="Criar conta" subtitle="Junte-se à nossa comunidade de cinéfilos">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <InputText
                    label="Nome"
                    type="text"
                    placeholder="Seu nome completo"
                    {...register("username")}
                    errors={formState.errors.username}
                />
                <InputText
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    errors={formState.errors.email}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputPassword
                        label="Senha"
                        placeholder="Sua senha"
                        {...register("password")}
                        errors={formState.errors.password}
                    />
                    <InputPassword
                        label="Confirmar Senha"
                        placeholder="Confirme sua senha"
                        {...register("confirmPassword")}
                        errors={formState.errors.confirmPassword}
                    />
                </div>
                <Button
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cinema-glow transition-all duration-300"
                    type="submit"
                    disabled={formState.isSubmitting}
                >
                    {formState.isSubmitting ? "Criando conta..." : "Criar conta"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Link
                        to="/login"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Fazer login
                    </Link>
                </div>
            </form>
        </PageContainer>
    )
}