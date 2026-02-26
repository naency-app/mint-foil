"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";

type ViewState = "form" | "magic-link-sent" | "email-input";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [loadingGoogle, setLoadingGoogle] = useState(false);
	const [loadingMagicLink, setLoadingMagicLink] = useState(false);
	const [view, setView] = useState<ViewState>("form");

	const frontendURL = typeof window !== "undefined" ? window.location.origin : "";

	async function handleGoogleSignIn() {
		setError("");
		setLoadingGoogle(true);
		try {
			await signIn.social({
				provider: "google",
				callbackURL: `${frontendURL}/explore`,
			});
		} catch {
			setError("Erro ao conectar com o Google. Tente novamente.");
			setLoadingGoogle(false);
		}
	}

	async function handleMagicLink(e: React.FormEvent) {
		e.preventDefault();
		if (!email.trim()) {
			setError("Digite seu email.");
			return;
		}
		setError("");
		setLoadingMagicLink(true);
		try {
			const { error: magicLinkError } = await signIn.magicLink({
				email,
				callbackURL: `${frontendURL}/explore`,
			});
			if (magicLinkError) {
				setError(magicLinkError.message ?? "Erro ao enviar o magic link.");
				setLoadingMagicLink(false);
				return;
			}
			setView("magic-link-sent");
		} catch {
			setError("Erro ao enviar o magic link. Tente novamente.");
		} finally {
			setLoadingMagicLink(false);
		}
	}

	if (view === "magic-link-sent") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
				<div className="w-full max-w-sm space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-sm">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
						<svg
							className="h-7 w-7 text-emerald-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<title>Email enviado</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
							/>
						</svg>
					</div>

					<h1 className="text-xl font-bold text-white">
						Verifique seu email
					</h1>
					<p className="text-sm text-slate-400">
						Enviamos um link de acesso para{" "}
						<span className="font-medium text-white">{email}</span>.
						<br />
						Clique no link do email para entrar.
					</p>

					<button
						type="button"
						onClick={() => {
							setView("form");
							setEmail("");
						}}
						className="text-sm text-slate-500 transition-colors hover:text-slate-300"
					>
						&larr; Voltar para o login
					</button>
				</div>
			</div>
		);
	}

	if (view === "email-input") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
				<div className="w-full max-w-sm rounded-2xl border border-slate-800/60 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-sm">
					<div className="mb-6 text-center">
						<span className="text-xl font-extrabold tracking-[0.2em] text-white uppercase select-none">
							Minty
						</span>
					</div>

					{error && (
						<div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
							{error}
						</div>
					)}

					<form onSubmit={handleMagicLink} className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="mb-1.5 block text-sm font-medium text-slate-300"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="seu@email.com"
								// biome-ignore lint/a11y/noAutofocus: UX improvement for email input step
								autoFocus
								className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
							/>
						</div>

						<button
							type="submit"
							disabled={loadingMagicLink}
							className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{loadingMagicLink && <Spinner dark />}
							Enviar Magic Link
						</button>
					</form>

					<button
						type="button"
						onClick={() => {
							setView("form");
							setError("");
						}}
						className="mt-4 block w-full text-center text-sm text-slate-500 transition-colors hover:text-slate-300"
					>
						&larr; Voltar
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
			<div className="w-full max-w-sm rounded-2xl border border-slate-800/60 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-sm">
				{/* Logo */}
				<div className="mb-8 text-center">
					<span className="text-xl font-extrabold tracking-[0.2em] text-white uppercase select-none">
						Minty
					</span>
				</div>

				{error && (
					<div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{error}
					</div>
				)}

				{/* Recommended */}
				<div className="mb-5">
					<p className="mb-2.5 text-xs font-semibold text-slate-400">
						Recomendado
					</p>
					<button
						type="button"
						onClick={() => setView("email-input")}
						className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<title>Email</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
							/>
						</svg>
						Continuar com email
					</button>

					<p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
						Recomendamos fortemente esta opção caso tenha problemas com login
						social.
					</p>
				</div>

				{/* Divider */}
				<div className="mb-5 flex items-center gap-3">
					<div className="h-px flex-1 bg-slate-800" />
					<span className="text-xs text-slate-500">Ou continue com</span>
					<div className="h-px flex-1 bg-slate-800" />
				</div>

				{/* OAuth Providers */}
				<div className="space-y-2.5">
					<ProviderButton
						onClick={handleGoogleSignIn}
						loading={loadingGoogle}
						icon={<GoogleIcon />}
						label="Continuar com Google"
					/>
				</div>

				{/* Footer */}
				<div className="mt-6 flex items-start gap-2 rounded-lg border border-slate-800/60 bg-slate-800/30 px-3.5 py-3">
					<svg
						className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.5}
					>
						<title>Info</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
						/>
					</svg>
					<p className="text-[11px] leading-relaxed text-slate-500">
						Ao continuar, você concorda com os{" "}
						<span className="text-slate-400 underline decoration-slate-600 underline-offset-2">
							Termos de Uso
						</span>{" "}
						e{" "}
						<span className="text-slate-400 underline decoration-slate-600 underline-offset-2">
							Política de Privacidade
						</span>
						.
					</p>
				</div>
			</div>
		</div>
	);
}

function ProviderButton({
	onClick,
	loading,
	icon,
	label,
}: {
	onClick: () => void;
	loading?: boolean;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={loading}
			className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? <Spinner /> : icon}
			{label}
		</button>
	);
}

function GoogleIcon() {
	return (
		<svg className="h-4 w-4" viewBox="0 0 24 24">
			<title>Google</title>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	);
}

function Spinner({ dark = false }: { dark?: boolean }) {
	return (
		<svg
			className={`h-4 w-4 animate-spin ${dark ? "text-slate-600" : "text-slate-400"}`}
			fill="none"
			viewBox="0 0 24 24"
		>
			<title>Carregando</title>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
			/>
		</svg>
	);
}
