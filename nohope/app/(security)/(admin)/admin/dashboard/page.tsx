import CustomConnectButton from "@/components/custom-connect-button";

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            Bảng điều khiển
          </h1>
          <p className="text-muted-foreground italic">
            Quản lý tài sản phi tập trung và lịch sử nghiên cứu chuỗi khối.
          </p>
        </div>
        <div className="min-w-52">
          <CustomConnectButton />
        </div>
      </div>
    </div>
  );
}
