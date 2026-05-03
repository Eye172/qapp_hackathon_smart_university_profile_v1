"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "@/components/ui/button";
import { TagPill } from "@/components/ui/badge";
import { ChevronRight, XCircle } from "@/components/ui/icon";
import { cn } from "@/lib/tailwind-utils";

const SUGGESTION_PILLS = [
  "Which program fits me?",
  "What docs am I missing?",
  "How do I lift my IELTS writing?",
  "Compare KBTU vs Nazarbayev University",
  "Best US bachelor programs under $30k",
] as const;

function extractText(message: UIMessage): string {
  const parts = message.parts ?? [];
  return parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

interface AIChatSheetProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

export function AIChatSheet({ trigger, defaultOpen = false }: AIChatSheetProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [draft, setDraft] = React.useState("");

  const transport = React.useMemo(
    () => new DefaultChatTransport({ api: "/api/llm/chat" }),
    [],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    transport,
  });

  const isStreaming = status === "submitted" || status === "streaming";
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  function dispatchMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setDraft("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ zIndex: 50 }}
        />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 flex flex-col",
            "h-full w-full sm:max-w-md md:max-w-lg",
            "bg-[color:var(--color-background)] shadow-glass border-l border-[color:var(--color-border)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-200 ease-snappy outline-none",
          )}
          style={{ zIndex: 50 }}
          aria-describedby={undefined}
        >
          <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-[color:var(--color-border)]">
            <div>
              <Dialog.Title className="font-display text-[length:var(--text-fluid-xl)]">
                QApp Advisor
              </Dialog.Title>
              <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Multilingual study-abroad mentor · streams from Claude
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close advisor"
                className="rounded-full p-2 hover:bg-black/5 ease-snappy"
              >
                <XCircle />
              </button>
            </Dialog.Close>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
          >
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-[length:var(--text-fluid-sm)] text-[color:var(--color-muted)]">
                  Ask anything about your applications, deadlines, or fit
                  scores. The advisor knows your profile.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTION_PILLS.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => dispatchMessage(pill)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[length:var(--text-fluid-xs)]",
                        "border border-[color:var(--color-border)] bg-white/70 backdrop-blur-md",
                        "hover:bg-white ease-snappy text-left",
                      )}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-[length:var(--text-fluid-sm)] leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-[color:var(--color-accent)] text-white rounded-br-md"
                        : "bg-white border border-[color:var(--color-border)] rounded-bl-md",
                    )}
                  >
                    {extractText(m) ||
                      (m.role === "assistant" && isStreaming ? "…" : "")}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isStreaming ? (
              <p className="text-[length:var(--text-fluid-xs)] text-[color:var(--color-muted)]">
                Streaming…
              </p>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-[#9E6464]/40 bg-[#9E6464]/8 p-3 text-[length:var(--text-fluid-xs)] text-[#6E3D3D]">
                {error.message}
                <p className="mt-1 opacity-70">
                  Most likely: missing ANTHROPIC_API_KEY in .env.local.
                </p>
              </div>
            ) : null}

            {messages.length > 0 && !isStreaming ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTION_PILLS.slice(0, 3).map((pill) => (
                  <TagPill
                    key={pill}
                    variant="neutral"
                    role="button"
                    tabIndex={0}
                    onClick={() => dispatchMessage(pill)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        dispatchMessage(pill);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {pill}
                  </TagPill>
                ))}
              </div>
            ) : null}
          </div>

          <form
            className="flex items-end gap-2 border-t border-[color:var(--color-border)] p-4"
            onSubmit={(e) => {
              e.preventDefault();
              dispatchMessage(draft);
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  dispatchMessage(draft);
                }
              }}
              placeholder="Ask the advisor…"
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-2xl border border-[color:var(--color-border)]",
                "bg-white/85 backdrop-blur-md px-4 py-2.5",
                "text-[length:var(--text-fluid-sm)] outline-none",
                "focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/20",
                "max-h-32",
              )}
              aria-label="Message advisor"
            />
            {isStreaming ? (
              <ActionButton
                type="button"
                variant="outline"
                size="md"
                onClick={() => stop()}
              >
                Stop
              </ActionButton>
            ) : (
              <ActionButton
                type="submit"
                variant="primary"
                size="md"
                disabled={draft.trim().length === 0}
              >
                Send <ChevronRight />
              </ActionButton>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
