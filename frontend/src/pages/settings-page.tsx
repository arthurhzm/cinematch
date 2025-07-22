import AppLayout from "@/components/app-layout";
import InputPassword from "@/components/input-password";
import InputText from "@/components/input-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UpdateProfilePicture from "@/components/ui/update-profile-picture";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import useUser from "@/hooks/use-user";
import { ROUTES } from "@/utils/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

export default function SettingsPage() {
    const { userData, setUserData } = useAuth();
    const { showSuccess, showError } = useToast();
    const { updateUser } = useUser();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

    const schema = z.object({
        username: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
        email: z.email({ message: "Email inválido" }),
        password: z.string().optional(),
        confirmPassword: z.string().optional(),
        birthdate: z.string().optional(),
        gender: z.enum(["male", "female", "other"]).optional(),
        profilePicture: z.string().optional()
    }).refine((data) => {
        if (data.password && data.password.length > 0) {
            return data.password.length >= 6;
        }
        return true;
    }, {
        message: "A senha deve ter pelo menos 6 caracteres",
        path: ["password"]
    }).refine((data) => {
        if (data.password && data.confirmPassword) {
            return data.password === data.confirmPassword;
        }
        return true;
    }, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"]
    });

    type SettingsFormData = z.infer<typeof schema>;

    const { register, handleSubmit, formState, setValue, watch } = useForm<SettingsFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: userData?.username || "",
            email: userData?.email || "",
            password: "",
            confirmPassword: "",
            birthdate: userData?.birthDate ? (userData.birthDate instanceof Date ? userData.birthDate.toISOString().split('T')[0] : userData.birthDate) : "",
            gender: (userData?.gender as "male" | "female" | "other") || undefined,
            profilePicture: userData?.profilePicture || ""
        }
    });

    useEffect(() => {
        if (userData) {
            setValue("username", userData.username);
            setValue("email", userData.email || "");
            setValue("profilePicture", userData.profilePicture || "");
            setProfileImagePreview(userData.profilePicture || null);
        }
    }, [userData, setValue]);

    const onSubmit = async (data: SettingsFormData) => {
        if (!userData) return;
        setIsSubmitting(true);
        try {
            await updateUser(userData.id, data);
            showSuccess("Perfil atualizado com sucesso!");
            setUserData({
                ...userData,
                username: data.username,
                email: data.email,
                birthDate: data.birthdate ? new Date(data.birthdate) : userData.birthDate,
                gender: data.gender || userData.gender,
                profilePicture: data.profilePicture || userData.profilePicture
            });
            navigate(ROUTES.home);
        } catch (error) {
            showError("Erro ao atualizar perfil. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header do Perfil */}
                <Card className="cinema-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Configurações
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Upload de Foto */}
                        <UpdateProfilePicture
                            onImageChange={(base64Image) => {
                                setValue("profilePicture", base64Image);
                                setProfileImagePreview(base64Image);
                            }}
                            previewImage={profileImagePreview}
                        />

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Informações Básicas */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                                    Informações Básicas
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputText
                                        label="Nome de usuário"
                                        placeholder="Seu nome de usuário"
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-foreground text-sm">
                                            Data de nascimento
                                        </Label>
                                        <Input
                                            type="date"
                                            className="w-full px-3 py-2 bg-input border border-border rounded-md focus:border-primary focus:ring-primary/20 transition-all duration-200"
                                            {...register("birthdate")}
                                        />
                                        {formState.errors.birthdate && (
                                            <span className="text-destructive text-xs">
                                                {formState.errors.birthdate.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-semibold text-foreground text-sm">
                                            Gênero
                                        </Label>
                                        <Select
                                            value={watch("gender") || undefined}
                                            onValueChange={(value) => setValue("gender", value as "male" | "female" | "other")}
                                        >
                                            <SelectTrigger className="bg-input border-border focus:border-primary">
                                                <SelectValue placeholder="Selecione seu gênero" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Masculino</SelectItem>
                                                <SelectItem value="female">Feminino</SelectItem>
                                                <SelectItem value="other">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Segurança */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                                    Segurança
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputPassword
                                        autoComplete="new-password"
                                        label="Nova senha"
                                        placeholder="Deixe em branco para manter a atual"
                                        {...register("password")}
                                        errors={formState.errors.password}
                                    />

                                    <InputPassword
                                        autoComplete="new-password"
                                        label="Confirmar nova senha"
                                        placeholder="Confirme a nova senha"
                                        {...register("confirmPassword")}
                                        errors={formState.errors.confirmPassword}
                                    />
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        💡 <strong>Dica:</strong> Use uma senha forte com pelo menos 6 caracteres, incluindo letras, números e símbolos.
                                    </p>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cinema-glow transition-all duration-300"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <CloudUpload className="w-4 h-4 mr-2" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 sm:flex-none"
                                    disabled={isSubmitting}
                                    onClick={() => navigate(ROUTES.home)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Informações Adicionais */}
                <Card className="cinema-card">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    Suas informações estão seguras
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Utilizamos criptografia avançada para proteger seus dados pessoais e garantir sua privacidade.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}