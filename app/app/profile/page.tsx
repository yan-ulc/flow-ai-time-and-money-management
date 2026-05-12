import { ProfileDashboard } from "@/components/profile/ProfileDashboard";

export const metadata = {
  title: "FlowAi - Profile",
  description: "Manage your account and preferences.",
};

export default function ProfilePage() {
  return (
    <div className="flex-1 h-full overflow-y-auto">
      <ProfileDashboard />
    </div>
  );
}
