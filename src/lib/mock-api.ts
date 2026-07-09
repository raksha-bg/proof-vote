/**
 * Mock API — replaces the Django REST backend during local development.
 *
 * Intercepts axios requests via the mockAxios adapter.
 * To disable, set VITE_API_BASE_URL to a real backend URL in .env.
 */

import type { AxiosInstance } from "axios";

// ─── In-memory store ───────────────────────────────────────────────────────────

interface MockUser {
  id: number;
  full_name: string;
  email: string;
  password: string;
  role: "admin" | "voter";
  verified: boolean;
  wallet_address: string | null;
}

const DB: {
  users: MockUser[];
  nextUserId: number;
} = {
  users: [
    {
      id: 1,
      full_name: "Admin User",
      email: "admin@blockvote.com",
      password: "admin123",
      role: "admin",
      verified: true,
      wallet_address: null,
    },
    {
      id: 2,
      full_name: "Demo Voter",
      email: "voter@blockvote.com",
      password: "voter123",
      role: "voter",
      verified: true,
      wallet_address: null,
    },
  ],
  nextUserId: 3,
};

let currentUserId: number | null = null;

// ─── Fake JWT helpers ──────────────────────────────────────────────────────────

function fakeToken(userId: number, type: "access" | "refresh"): string {
  const payload = btoa(JSON.stringify({ sub: userId, type, exp: Date.now() + 3600_000 }));
  return `mock.${payload}.sig`;
}

function userIdFromToken(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.sub === "number" ? payload.sub : null;
  } catch {
    return null;
  }
}

// ─── Mock elections ────────────────────────────────────────────────────────────

const MOCK_ELECTIONS = [
  {
    id: 1,
    title: "Student Council Election 2025",
    description: "Vote for your student council representatives.",
    start_date: new Date(Date.now() - 86400_000).toISOString(),
    end_date: new Date(Date.now() + 3 * 86400_000).toISOString(),
    status: "active",
  },
  {
    id: 2,
    title: "Faculty Senate Vote",
    description: "Annual faculty senate leadership election.",
    start_date: new Date(Date.now() + 2 * 86400_000).toISOString(),
    end_date: new Date(Date.now() + 7 * 86400_000).toISOString(),
    status: "draft",
  },
  {
    id: 3,
    title: "Budget Allocation 2024",
    description: "Community vote on budget priorities.",
    start_date: new Date(Date.now() - 10 * 86400_000).toISOString(),
    end_date: new Date(Date.now() - 2 * 86400_000).toISOString(),
    status: "ended",
  },
];

const MOCK_CANDIDATES: Record<number, Array<{ id: number; election: number; name: string; party: string; votes: number }>> = {
  1: [
    { id: 1, election: 1, name: "Alice Johnson", party: "Progressive Alliance", votes: 142 },
    { id: 2, election: 1, name: "Bob Martinez", party: "Student First", votes: 98 },
    { id: 3, election: 1, name: "Carol Chen", party: "Unity Party", votes: 201 },
  ],
  2: [
    { id: 4, election: 2, name: "Dr. Patel", party: "Independent", votes: 0 },
    { id: 5, election: 2, name: "Prof. Williams", party: "Reform", votes: 0 },
  ],
  3: [
    { id: 6, election: 3, name: "Infrastructure Fund", party: "Proposal A", votes: 310 },
    { id: 7, election: 3, name: "Education Budget", party: "Proposal B", votes: 289 },
  ],
};

const MOCK_VOTES: Record<number, Record<number, number>> = {}; // userId -> electionId -> candidateId

// ─── Route handler ─────────────────────────────────────────────────────────────

type RouteHandler = (body: unknown, token?: string) => { status: number; data: unknown };

const routes: Record<string, Record<string, RouteHandler>> = {
  POST: {
    "/auth/register/": (body) => {
      const { full_name, email, password } = body as Record<string, string>;
      if (!full_name || !email || !password) return { status: 400, data: { detail: "All fields are required." } };
      if (DB.users.find((u) => u.email === email)) return { status: 400, data: { detail: "Email already registered." } };
      const user: MockUser = { id: DB.nextUserId++, full_name, email, password, role: "voter", verified: false, wallet_address: null };
      DB.users.push(user);
      return { status: 201, data: { id: user.id, email: user.email, full_name: user.full_name } };
    },

    "/auth/login/": (body) => {
      const { email, password } = body as Record<string, string>;
      const user = DB.users.find((u) => u.email === email && u.password === password);
      if (!user) return { status: 401, data: { detail: "Invalid credentials." } };
      currentUserId = user.id;
      return { status: 200, data: { access: fakeToken(user.id, "access"), refresh: fakeToken(user.id, "refresh") } };
    },

    "/auth/refresh/": (body) => {
      const { refresh } = body as Record<string, string>;
      const userId = userIdFromToken(refresh);
      if (!userId) return { status: 401, data: { detail: "Invalid refresh token." } };
      const user = DB.users.find((u) => u.id === userId);
      if (!user) return { status: 401, data: { detail: "User not found." } };
      return { status: 200, data: { access: fakeToken(user.id, "access") } };
    },

    "/auth/password/reset/": () => ({ status: 200, data: { detail: "If this email is registered, a reset link was sent." } }),
  },

  GET: {
    "/auth/me/": (_body, token) => {
      const userId = token ? userIdFromToken(token) : null;
      const user = userId ? DB.users.find((u) => u.id === userId) : null;
      if (!user) return { status: 401, data: { detail: "Not authenticated." } };
      return { status: 200, data: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, verified: user.verified, wallet_address: user.wallet_address } };
    },

    "/elections/": () => ({ status: 200, data: MOCK_ELECTIONS }),

    "/dashboard/stats/": () => ({
      status: 200,
      data: { total_elections: 3, active_elections: 1, total_votes: 1040, registered_voters: 256, verified_voters: 201 },
    }),

    "/blockchain/transactions/": () => ({
      status: 200,
      data: [
        { id: 1, voter: "0xabc...001", candidate: "Alice Johnson", election: "Student Council Election 2025", transaction_hash: "0xdeadbeef001", block_number: 19_204_001, timestamp: new Date(Date.now() - 3600_000).toISOString() },
        { id: 2, voter: "0xabc...002", candidate: "Carol Chen", election: "Student Council Election 2025", transaction_hash: "0xdeadbeef002", block_number: 19_204_002, timestamp: new Date(Date.now() - 7200_000).toISOString() },
        { id: 3, voter: "0xabc...003", candidate: "Carol Chen", election: "Student Council Election 2025", transaction_hash: "0xdeadbeef003", block_number: 19_204_003, timestamp: new Date(Date.now() - 10800_000).toISOString() },
      ],
    }),

    "/admin/voters/": () => ({
      status: 200,
      data: DB.users.map(({ id, full_name, email, role, verified }) => ({ id, full_name, email, role, verified })),
    }),
  },

  PATCH: {
    "/auth/me/": (body, token) => {
      const userId = token ? userIdFromToken(token) : null;
      const user = userId ? DB.users.find((u) => u.id === userId) : null;
      if (!user) return { status: 401, data: { detail: "Not authenticated." } };
      Object.assign(user, body);
      return { status: 200, data: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, verified: user.verified, wallet_address: user.wallet_address } };
    },
  },
};

// ─── Dynamic route matching ────────────────────────────────────────────────────

function matchDynamic(method: string, path: string, body: unknown, token?: string): { status: number; data: unknown } | null {
  // GET /elections/:id/
  const elecDetail = path.match(/^\/elections\/(\d+)\/$/);
  if (method === "GET" && elecDetail) {
    const id = parseInt(elecDetail[1]);
    const election = MOCK_ELECTIONS.find((e) => e.id === id);
    return election ? { status: 200, data: election } : { status: 404, data: { detail: "Not found." } };
  }

  // GET /elections/:id/candidates/
  const candidates = path.match(/^\/elections\/(\d+)\/candidates\/$/);
  if (method === "GET" && candidates) {
    const id = parseInt(candidates[1]);
    return { status: 200, data: MOCK_CANDIDATES[id] ?? [] };
  }

  // GET /elections/:id/my-vote/
  const myVote = path.match(/^\/elections\/(\d+)\/my-vote\/$/);
  if (method === "GET" && myVote) {
    const electionId = parseInt(myVote[1]);
    const userId = token ? userIdFromToken(token) : null;
    const voted = userId ? !!(MOCK_VOTES[userId]?.[electionId]) : false;
    const candidateId = userId ? MOCK_VOTES[userId]?.[electionId] : undefined;
    return {
      status: 200,
      data: voted
        ? { voted: true, transaction_hash: `0xmock${userId}${electionId}`, block_number: 19_200_000 + electionId, candidate: candidateId }
        : { voted: false },
    };
  }

  // POST /elections/:id/vote/
  const vote = path.match(/^\/elections\/(\d+)\/vote\/$/);
  if (method === "POST" && vote) {
    const electionId = parseInt(vote[1]);
    const userId = token ? userIdFromToken(token) : null;
    if (!userId) return { status: 401, data: { detail: "Not authenticated." } };
    if (MOCK_VOTES[userId]?.[electionId]) return { status: 400, data: { detail: "You have already voted in this election." } };
    const { candidate } = body as Record<string, number>;
    MOCK_VOTES[userId] = MOCK_VOTES[userId] ?? {};
    MOCK_VOTES[userId][electionId] = candidate;
    return { status: 200, data: { transaction_hash: `0xmock${userId}${electionId}`, block_number: 19_200_000 + electionId } };
  }

  // PATCH /admin/voters/:id/
  const adminVoter = path.match(/^\/admin\/voters\/(\d+)\/$/);
  if (method === "PATCH" && adminVoter) {
    const id = parseInt(adminVoter[1]);
    const user = DB.users.find((u) => u.id === id);
    if (!user) return { status: 404, data: { detail: "Not found." } };
    Object.assign(user, body);
    return { status: 200, data: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, verified: user.verified } };
  }

  return null;
}

// ─── Install onto axios instance ───────────────────────────────────────────────

export function installMockAdapter(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use(async (config) => {
    // Only intercept when using the default localhost backend
    const baseURL = config.baseURL ?? "";
    if (!baseURL.includes("localhost:8000")) return config;

    const method = (config.method ?? "GET").toUpperCase();
    const url = config.url ?? "/";
    const token = typeof config.headers?.Authorization === "string"
      ? config.headers.Authorization.replace("Bearer ", "")
      : undefined;
    let body: unknown = undefined;
    if (config.data) {
      try { body = typeof config.data === "string" ? JSON.parse(config.data) : config.data; } catch { body = config.data; }
    }

    // Look up static route first
    const staticHandler = routes[method]?.[url] ?? routes[method]?.[url.endsWith("/") ? url : `${url}/`];
    let result = staticHandler ? staticHandler(body, token) : matchDynamic(method, url.endsWith("/") ? url : `${url}/`, body, token);

    if (!result) {
      result = { status: 404, data: { detail: `Mock: No handler for ${method} ${url}` } };
    }

    // Throw a fake AxiosError for non-2xx so interceptors/catch blocks work normally
    if (result.status >= 400) {
      const err = Object.assign(new Error(`Request failed with status code ${result.status}`), {
        isAxiosError: true,
        response: { status: result.status, data: result.data, headers: {}, config },
        config,
      });
      return Promise.reject(err);
    }

    // Resolve by returning a special sentinel that the response interceptor will catch
    // We abuse the adapter pattern: throw a "success" sentinel
    const successSentinel = Object.assign(new Error("__MOCK_SUCCESS__"), {
      __mockSuccess: true,
      response: { status: result.status, data: result.data, headers: { "content-type": "application/json" }, config },
    });
    return Promise.reject(successSentinel);
  });

  axiosInstance.interceptors.response.use(undefined, (error) => {
    if (error?.__mockSuccess) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  });
}
