export const registerUser = async (data: any) => {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const errorData = await res.json();
			throw new Error(errorData.message || "Error al registrarse");
		}

		return await res.json();
	} catch (error: any) {
		throw new Error(error.message);
	}
};
