"use client";

import { useState } from "react";

export default function TtsDemo() {
	const [text, setText] = useState("");
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function generateVoice() {
		setLoading(true);
		setAudioUrl(null);

		const res = await fetch("/api/tts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text }),
		});

		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		setAudioUrl(url);
		setLoading(false);
	}

	return (
		<div style={{ maxWidth: 600, margin: "40px auto" }}>
			<h2>Voxify AI — Text to Speech</h2>

			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Enter text to convert to voice..."
				rows={5}
				style={{ width: "100%", padding: 10 }}
			/>

			<button
				onClick={generateVoice}
				disabled={loading || !text}
				style={{ marginTop: 10, padding: "10px 20px" }}
			>
				{loading ? "Generating..." : "Generate Voice"}
			</button>

			{audioUrl && (
				<audio controls src={audioUrl} style={{ marginTop: 20 }} />
			)}
		</div>
	);
}

