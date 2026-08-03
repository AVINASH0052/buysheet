import { DeviceSheet } from "@/components/DeviceSheet";

export default async function DevicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DeviceSheet id={id} />;
}
