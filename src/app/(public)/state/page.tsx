import type { Metadata } from "next";
import StatesView from "./StatesView";

export const metadata: Metadata = {
  title: "States",
  description: "Browse news by state.",
};

export default function StatesPage() {
  return <StatesView />;
}
