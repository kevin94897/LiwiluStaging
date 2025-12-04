import { RegisterPayload } from "@/types/Auth";
import { RegisterResponse } from "@/types/Auth";

export const registerUser = async (data: RegisterPayload): Promise<RegisterResponse> => {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		const json = await res.json().catch(() => null);

		if (!res.ok) {
			throw new Error(json?.message ?? "Error al registrarse");
		}

		return json as RegisterResponse;

	} catch (err: unknown) {
		if (err instanceof Error) {
			throw new Error(err.message);
		}
		throw new Error("Error desconocido al registrar");
	}
};
