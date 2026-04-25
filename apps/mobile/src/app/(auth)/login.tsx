import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { z } from "zod";

import { loginRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { primeColors } from "@/theme/primeTheme";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const { token, role, login } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "teacher@prime.edu", password: "password123" }
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await loginRequest(values.email, values.password);
      const accessToken = response.access_token ?? response.token;
      if (!accessToken || !response.role) throw new Error("Authentication failed");
      await login({
        token: accessToken,
        role: response.role,
        email: response.email ?? values.email,
        name: response.name
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  });

  if (token && role) return <Redirect href="/" />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, padding: 24, backgroundColor: primeColors.bg }}
    >
      <View style={{ flex: 1, justifyContent: "center", gap: 14 }}>
        <View>
          <Text variant="headlineMedium" style={{ color: primeColors.primaryDark, fontWeight: "700" }}>
            PRIME Teaching
          </Text>
          <Text style={{ color: primeColors.muted, marginTop: 8 }}>
            Sign in with your school account to open your role workspace.
          </Text>
        </View>
        <Card style={{ backgroundColor: primeColors.card, borderColor: primeColors.border, borderWidth: 1 }}>
          <Card.Content>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  mode="outlined"
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />
            <HelperText type="error" visible={Boolean(errors.email)}>
              {errors.email?.message}
            </HelperText>
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput mode="outlined" label="Password" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry />
              )}
            />
            <HelperText type="error" visible={Boolean(errors.password)}>
              {errors.password?.message}
            </HelperText>
            {error ? <HelperText type="error">{error}</HelperText> : null}
            <Text variant="bodySmall" style={{ marginBottom: 12 }}>
              Demo users: teacher@prime.edu, department@prime.edu, leader@prime.edu, admin@prime.edu (password: password123)
            </Text>
            <Button mode="contained" buttonColor={primeColors.primary} loading={isSubmitting} onPress={onSubmit}>
              Login
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}
