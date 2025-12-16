"use client";
import React, { useState } from "react";

export default function TtsDemo() {
	const [text, setText] = useState("Hello from Voxify-ai!");
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function synthesize() {
		setLoading(true);
		try {
			const res = await fetch("/api/tts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});
			if (!res.ok) throw new Error("Synthesis failed");
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			setAudioUrl(url);
		} catch (err) {
			// minimal UX for demo
			alert("Synthesis failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex w-full flex-col gap-2">
			<label className="font-medium">Text to synthesize</label>
			<textarea
				className="w-full min-h-[80px] rounded border p-3"
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<div className="flex gap-2">
				<button
					className="rounded bg-foreground px-4 py-2 text-background"
					onClick={synthesize}
					disabled={loading}
				>
					{loading ? "Synthesizing…" : "Synthesize"}
				</button>
				<a className="ml-2 self-center text-sm text-zinc-600" href="#" onClick={(e) => e.preventDefault()}>
					(audio will appear below)
				</a>
			</div>
			<div className="mt-4" id="tts-container">
				{audioUrl ? (
					<audio controls src={audioUrl} />
				) : (
					<div className="text-sm text-zinc-500">No audio yet</div>
				)}
			</div>
		</div>
	);
}

