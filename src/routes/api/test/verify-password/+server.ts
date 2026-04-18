import * as bcrypt from 'bcryptjs';
import { json } from '@sveltejs/kit';
import { getClientsFromStorage } from '$lib/serverStorage';

export async function POST({ request }) {
	const { email, password } = await request.json();

	if (!email || !password) {
		return json({ valid: false, message: 'Email et mot de passe requis' }, { status: 400 });
	}

	const clients = getClientsFromStorage();
	const client = clients.find((c: any) => c.email.toLowerCase() === email.toLowerCase());

	if (!client) {
		return json({ valid: false, message: 'Client not found' }, { status: 404 });
	}

	try {
		const isPasswordValid = await bcrypt.compare(password, client.passwordHash);
		return json({
			valid: isPasswordValid,
			email: client.email,
			name: client.name,
			passwordHash: client.passwordHash.substring(0, 20) + '...',
			message: isPasswordValid ? 'Password is valid' : 'Password is invalid'
		});
	} catch (error) {
		return json({
			valid: false,
			message: 'Error verifying password: ' + error
		}, { status: 500 });
	}
}
