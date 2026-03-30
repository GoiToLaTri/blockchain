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
      {/* Phần bản điều khiển */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-card border rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Tổng người dùng</p>
          <h3 className="text-2xl font-bold">1,234</h3>
          <p className="text-xs text-green-600">+12% từ tháng trước</p>
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Giao dịch</p>
          <h3 className="text-2xl font-bold">5,678</h3>
          <p className="text-xs text-green-600">+8% từ tháng trước</p>
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Tổng giá trị</p>
          <h3 className="text-2xl font-bold">$45.2K</h3>
          <p className="text-xs text-green-600">+5% từ tháng trước</p>
        </div>
        <div className="bg-card border rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Trạng thái hệ thống</p>
          <h3 className="text-2xl font-bold">98.5%</h3>
          <p className="text-xs text-green-600">Hoạt động bình thường</p>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium">Giao dịch #{1000 + item}</p>
                  <p className="text-sm text-muted-foreground">2 giờ trước</p>
                </div>
                <span className="text-green-600 font-semibold">+$500</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Thống kê nhanh</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Người dùng hoạt động</span>
              <span className="font-bold">892</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2"></div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tỷ lệ hoạt động</span>
              <span className="font-bold">72%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
