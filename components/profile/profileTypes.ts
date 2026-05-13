import { buildProfileAggregation } from "@/lib/profile-aggregation";

export type ProfileAggregation = ReturnType<typeof buildProfileAggregation>;

export type UserTone = "neutral" | "supportive" | "savage";
