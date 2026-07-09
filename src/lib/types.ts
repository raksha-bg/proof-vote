export type Role = "admin" | "voter";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  verified: boolean;
  wallet_address?: string | null;
}

export interface Election {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "ended";
}

export interface Candidate {
  id: number;
  election: number;
  name: string;
  party: string;
  symbol: string;
  photo?: string | null;
  manifesto: string;
  votes?: number;
}

export interface Vote {
  id: number;
  voter: number;
  candidate: number;
  transaction_hash: string;
  block_number: number;
  timestamp: string;
}
