export default function CustomerDashboard() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Store Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">My Orders</h2>
          <p className="text-gray-600">View and manage your orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Stock Levels</h2>
          <p className="text-gray-600">Update Pommy product stock</p>
        </div>
      </div>
    </div>
  )
}

