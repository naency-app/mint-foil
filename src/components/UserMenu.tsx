"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function UserMenu() {
	const { data: session, isPending } = useSession();
	const router = useRouter();

	if (isPending) {
		return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
	}

	if (!session) {
		return (
			<Link href="/login">
				<button
					type="button"
					className="h-8 px-4 text-xs font-medium rounded-lg border border-border text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground hover:border-ring transition-colors cursor-pointer"
				>
					Login
				</button>
			</Link>
		);
	}

	const user = session.user;

	async function handleLogout() {
		await signOut();
		router.replace("/login");
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted cursor-pointer outline-none"
				>
					{user.image ? (
						<Image
							src={user.image}
							alt={user.name ?? "Avatar"}
							width={32}
							height={32}
							className="h-8 w-8 rounded-full border border-border object-cover"
						/>
					) : (
						<div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-bold text-foreground">
							{(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
						</div>
					)}
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col gap-1">
						{user.name && (
							<p className="text-sm font-medium text-foreground">
								{user.name}
							</p>
						)}
						{user.email && (
							<p className="text-xs text-muted-foreground truncate">
								{user.email}
							</p>
						)}
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					className="cursor-pointer"
					onClick={() => router.push("/settings")}
				>
					<Settings className="size-4" />
					Configurações
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					variant="destructive"
					className="cursor-pointer"
					onClick={handleLogout}
				>
					<LogOut className="size-4" />
					Sair
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
