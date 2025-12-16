import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Text to synthesize</label>
            <textarea id="tts-input" className="w-full min-h-[80px] rounded border p-3" defaultValue={"Hello from Voxify-ai!"} />
            <div className="flex gap-2">
              <button
                id="synthesize"
                className="rounded bg-foreground px-4 py-2 text-background"
                onClick={async () => {
                  const textarea = document.getElementById("tts-input") as HTMLTextAreaElement;
                  const text = textarea.value;
                  const res = await fetch("/api/tts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                  });
                  if (!res.ok) {
                    alert("Synthesis failed");
                    return;
                  }
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  let player = document.getElementById("tts-player") as HTMLAudioElement | null;
                  if (!player) {
                    player = document.createElement("audio");
                    player.id = "tts-player";
                    player.controls = true;
                    document.getElementById("tts-container")?.appendChild(player);
                  }
                  player.src = url;
                  player.play();
                }}
              >
                Synthesize
              </button>
              <a className="ml-2 self-center text-sm text-zinc-600" href="#" id="tts-download" onClick={(e) => e.preventDefault()}>
                (audio will appear below)
              </a>
            </div>
          </div>
          <div id="tts-container" className="mt-4" />
        </div>
      </main>
    </div>
  );
}
