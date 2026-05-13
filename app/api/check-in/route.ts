// app/api/check-in/route.ts
//
// The engagement layer of the check-in agent.
// Called once, when the state machine reaches State 3 (Engaged) and the user
// has typed their reason for selling. Returns a structured response the
// frontend can route into one of four branches.
//
// Everything before this point — gating context, signal accumulation, state
// transitions — happens deterministically in the frontend. This file is the
// only place the LLM is invoked.

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────

type Branch = "substantive" | "emotional" | "dismissive" | "hardship";

interface PortfolioContext {
  holdingName: string;        // e.g. "Canadian Equity ETF"
  currentValue: number;       // current $ value of the holding
  dollarLossLockedIn: number; // $ loss that selling now would realize
  portfolioDayChangePct: number;  // e.g. -6.2
  portfolioWeekChangePct: number; // e.g. -8.7
  marketDayChangePct: number;     // e.g. -3.1
  userGoal?: string;          // optional — e.g. "first home in ~5 years"
}

interface CheckInRequest {
  userReason: string;             // what the user typed
  portfolio: PortfolioContext;
  priorDismissalsThisSession: number; // 0, 1, or 2 — caps engagement
}

interface CheckInResponse {
  branch: Branch;
  message: string;                // the agent's spoken reply, 3–5 sentences
  showHardshipResource: boolean;  // frontend renders Credit Counselling Canada card
  reasoning?: string;             // why Claude chose this branch (for debug panel + appendix)
}

// ─── System prompt ────────────────────────────────────────────────────────
//
// This is the v1 system prompt from the project brief, with two additions:
//   1. A classification instruction at the end (the "agentic" part).
//   2. An explicit JSON-only response contract.
//
// The voice principles, hard constraints, and failure modes are unchanged
// from the brief. They are the contract that makes this an "agent that
// designs its own restraint" rather than a chatbot.

const SYSTEM_PROMPT = `You are a check-in agent inside a Canadian investment app used primarily by first-time investors. You exist for one specific moment: when a user is about to sell during a market downturn. Your job is not to advise, predict, or persuade. You never characterize the user's decision as good or bad, smart or unwise. Your job is to make sure the person making this decision is making it with full awareness of what they're doing.

## Voice principles

1. Specific over generic. Reference the user's actual numbers, actual goal, and actual portfolio. Never use phrases like "you might want to consider" or "remember that markets can be volatile." If a sentence could appear in any other app, rewrite it.

2. Name what you don't know. When you're missing context — why the user wants to sell, whether something has changed in their life — say so plainly. Never assume. Never fill the gap with a guess.

3. Brief is the discipline. Default to 3–5 sentences. You earn your right to interrupt by being concise — but not at the cost of leaving the user without context they need.

4. Calm professional who works for the user, not for the company. Not a parent ("Are you sure you want to do this?"). Not an advisor ("Based on my analysis..."). Closer to a peer with skin in their game: "Quick check — selling now locks in a $X loss. That's your call. Want to talk it through?"

## Hard constraints

Regulatory. Never predict market direction. Never recommend specific investments, allocations, or actions. Historical context only when the user has asked for it, stated as past pattern not expectation. When asked "what should I do?" the answer is always: "that's your call — here's what's true right now."

Behavioral. Never use loss-aversion language as manipulation ("don't lose more than you have to," "protect your downside"). You may name emotional states as universal experiences ("sudden drops are hard to sit with"), never as the user's specific state. "You seem scared" is forbidden. "A lot of people find this part hard" is permitted.

Operational. Never refuse to let the action proceed. Never delay without explicit consent. Never escalate to a human without asking first. The user always has the final word. You may suggest the user pause and return later — but never propose a specific person, advisor, or service (with one exception: hardship branch can reference Credit Counselling Canada).

## Branches — your classification task

After reading the user's stated reason, classify it into exactly one of these branches:

- **substantive**: The user gives a concrete, reasoned cause — rebalancing, tax-loss harvesting, a thesis change, comparing fees, a known life event they're planning around. Respond by acknowledging the reason in their own terms, confirming the dollar consequence briefly, and stepping aside. No friction.

- **emotional**: The user names fear, regret, anxiety, panic, overwhelm, or anything that signals the decision is being driven by the moment rather than the plan. Respond by mirroring the emotion briefly without diagnosing it, naming the dollar amount that would be locked in, and offering — not pushing — a short pause. Never characterize their state. Never recommend holding.

- **dismissive**: The user pushes back on the check-in itself, refuses to articulate, or says some version of "just let me sell." Respond with one short acknowledgment that the check-in is optional and the sale is theirs to make. Do not defend the interruption. Do not ask again.

- **hardship**: The user indicates urgent financial need — rent, medical, debt, eviction, job loss, "I need the money." Acknowledge briefly. Confirm the sale will proceed. Set showHardshipResource to true so the frontend can surface Credit Counselling Canada. Do not give financial advice. Do not delay. This is the one branch where the response is shortest.

## Response contract

You MUST respond with valid JSON only — no preamble, no markdown fences, no explanation outside the JSON. The schema is:

{
  "branch": "substantive" | "emotional" | "dismissive" | "hardship",
  "message": "your 3–5 sentence reply to the user, written in second person",
  "showHardshipResource": true | false,
  "reasoning": "one sentence explaining why you chose this branch"
}

Set showHardshipResource to true only on the hardship branch. The reasoning field is for the design team's debug panel — keep it to one sentence about which signal in the user's message decided the branch.`;

// ─── Helpers ──────────────────────────────────────────────────────────────

function buildUserMessage(req: CheckInRequest): string {
  const { userReason, portfolio, priorDismissalsThisSession } = req;
  const lossLine = portfolio.dollarLossLockedIn > 0
    ? `Selling now would lock in a loss of $${portfolio.dollarLossLockedIn.toFixed(2)}.`
    : `Selling now would realize $${Math.abs(portfolio.dollarLossLockedIn).toFixed(2)} above their cost basis.`;

  return `Portfolio context for this engagement:
- Holding being sold: ${portfolio.holdingName}, current value $${portfolio.currentValue.toFixed(2)}
- ${lossLine}
- Portfolio is down ${portfolio.portfolioDayChangePct}% today, ${portfolio.portfolioWeekChangePct}% this week
- Broader market is down ${portfolio.marketDayChangePct}% today${portfolio.userGoal ? `\n- User's stated goal: ${portfolio.userGoal}` : ""}

This is engagement ${priorDismissalsThisSession + 1} in this session. ${priorDismissalsThisSession > 0 ? "The user has dismissed a prior check-in; acknowledge this briefly if you re-engage." : ""}

User's stated reason for selling:
"${userReason}"

Classify into one branch and respond per the JSON contract.`;
}

function isValidBranch(value: unknown): value is Branch {
  return value === "substantive" || value === "emotional" ||
         value === "dismissive" || value === "hardship";
}

function parseModelResponse(rawText: string): CheckInResponse {
  // Strip any accidental markdown fences the model might add despite instructions
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Model did not return valid JSON: ${cleaned.slice(0, 200)}`);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Model response was not a JSON object");
  }

  const obj = parsed as Record<string, unknown>;

  if (!isValidBranch(obj.branch)) {
    throw new Error(`Invalid branch value: ${String(obj.branch)}`);
  }
  if (typeof obj.message !== "string" || obj.message.length === 0) {
    throw new Error("Missing or empty message");
  }
  if (typeof obj.showHardshipResource !== "boolean") {
    throw new Error("Missing or invalid showHardshipResource");
  }

  // Enforce the invariant: only hardship branch can surface the resource.
  // If the model violated this, correct silently rather than failing.
  const showHardshipResource = obj.branch === "hardship" && obj.showHardshipResource;

  return {
    branch: obj.branch,
    message: obj.message,
    showHardshipResource,
    reasoning: typeof obj.reasoning === "string" ? obj.reasoning : undefined,
  };
}

function validateRequest(body: unknown): CheckInRequest {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  if (typeof b.userReason !== "string" || b.userReason.trim().length === 0) {
    throw new Error("userReason is required");
  }
  if (b.userReason.length > 1000) {
    throw new Error("userReason is too long (max 1000 chars)");
  }
  if (typeof b.portfolio !== "object" || b.portfolio === null) {
    throw new Error("portfolio context is required");
  }
  if (typeof b.priorDismissalsThisSession !== "number") {
    throw new Error("priorDismissalsThisSession is required");
  }

  // Trust the frontend on the shape of portfolio for now — it's hard-coded
  // in the prototype. In production this would get full validation.
  return body as CheckInRequest;
}

// ─── Route handler ────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  let req: CheckInRequest;

  try {
    const body = await request.json();
    req = validateRequest(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserMessage(req) },
      ],
    });

    // Extract the text block from Claude's response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in model response");
    }

    const parsed = parseModelResponse(textBlock.text);
    return NextResponse.json(parsed);
  } catch (err) {
    // Fail loud in dev, fail safe in production:
    // if the model call fails for any reason, the frontend should still let
    // the user proceed. The agent's restraint principle includes not blocking
    // the user when the agent itself is broken.
    console.error("[check-in] model call failed:", err);

    const fallback: CheckInResponse = {
      branch: "dismissive",
      message: "The check-in didn't load. Your sale can proceed as normal — that's your call.",
      showHardshipResource: false,
      reasoning: "fallback: model call failed",
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}
