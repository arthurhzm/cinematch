import InputPassword from "@/components/input-password";
import InputText from "@/components/input-text";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import { CreateUserDTO } from "@/DTO/CreateUserDTO";
import useUser from "@/hooks/use-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

export default function RegisterPage() {

    const { createUser } = useUser();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const schema = z.object({
        username: z.string().min(3, { message: "Informe um nome com pelo menos 3 caracteres" }),
        email: z.email({ message: "Email inválido" }),
        password: z.string().min(6, { message: "Senha é obrigatória" }),
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
            showSuccess("Usuário criado com sucesso!");
            navigate("/login");
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            showError("Erro ao criar usuário. Tente novamente mais tarde.");
        }
    }


    return (
        <div>
            <h1>Criar conta</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <InputText
                    label="Nome"
                    type="text"
                    {...register("username")}
                    errors={formState.errors.username}
                />
                <InputText
                    label="Email"
                    type="email"
                    {...register("email")}
                    errors={formState.errors.email}
                />
                <div className="flex">
                    <InputPassword
                        label="Senha"
                        {...register("password")}
                        errors={formState.errors.password}
                    />
                    <InputPassword
                        label="Confirmar Senha"
                        {...register("confirmPassword")}
                        errors={formState.errors.confirmPassword}
                    />
                </div>
                <div>
                    <Button className="mt-4" type="submit">
                        Criar conta
                    </Button>
                </div>
            </form>
        </div>
    )
}