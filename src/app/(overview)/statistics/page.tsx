"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "../../../Context/AuthContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, PieChart, Pie, Cell, Legend } from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  ArrowDownLeftIcon,
  ShoppingBagIcon,
  Trash2
} from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useEvents, useEventStats } from "@/features/events/hooks/useEvents"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Statistics() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [selectedEventId, setSelectedEventId] = useState<string>("")

  const { data: events } = useEvents()

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) setSelectedEventId(events[0].id)
  }, [events, selectedEventId])

  const { data: statistics } = useEventStats(selectedEventId, !!selectedEventId)

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  // Data preparation for charts
  const salesByMethodData = statistics ? Object.entries(statistics.summary.salesByMethod).map(([method, data]) => ({
    name: method,
    value: data.net
  })) : [];

  const topSellingData = statistics?.products.topSelling.slice(0, 5) || [];

  console.log('topSellingData --> ', topSellingData)

  const profitabilityData = statistics?.products.topProfitable.slice(0, 5).map(item => ({
    name: item.product,
    revenue: item.revenue,
    cost: item.cost,
    profit: item.profit
  })) || [];

  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <main className="flex-1 p-6 space-y-8 bg-background min-h-screen pb-20">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            Estadísticas del Evento
          </h1>
        </div>

        <div className="backdrop-blur-lg bg-gradient-blue border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300">
          <div className="space-y-1 mb-4 md:mb-0">
            <h3 className="text-3xl font-bold text-blue-100 flex items-center">
              {events?.find((e) => e.id === selectedEventId)?.name}
            </h3>
            <p className="text-sm text-gray-200 ">
              {statistics?.event.startDate && new Date(statistics.event.startDate).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-400 hidden sm:block">Cambiar Evento:</label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full md:w-[250px] bg-white/10 border-white/30 text-white hover:bg-white/20 transition-colors duration-200">
                <SelectValue placeholder="Seleccionar otro evento..." />
              </SelectTrigger>
              <SelectContent className="bg-[var(--color-brand-black)] border-white/20">
                {events?.map((event) => (
                  <SelectItem
                    key={event.id}
                    value={event.id}
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {statistics && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card className="backdrop-blur-xl bg-gradient-to-br from-black to-gray-700/50 border border-gray-500/30 hover:border-gray-500/50 transition-all shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Pedidos</CardTitle>
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{statistics.summary.totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {statistics.summary.completedOrders} completados / {statistics.summary.cancelledOrders} cancelados
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1E2C6D]/30 to-[#1E2C6D]/10 border border-[#1E2C6D]/50 hover:border-[#1E2C6D]/70 transition-all shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Inversión Total</CardTitle>
                  <ArrowDownLeftIcon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">${statistics.summary.totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <p className="text-xs text-muted-foreground mt-1">{statistics.summary.totalProducts} productos / {statistics.summary.totalSupplies} insumos</p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 hover:border-orange-500/50 transition-all shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Netos</CardTitle>
                  <DollarSign className="h-5 w-5 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">${statistics.summary.netRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    -${statistics.summary.totalRefunds.toLocaleString(undefined, { maximumFractionDigits: 0 })} en reembolsos
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/30 hover:border-sky-500/5 transition-all shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                  <ShoppingBagIcon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    ${statistics.summary.completedOrders > 0
                      ? (statistics.summary.netRevenue / statistics.summary.completedOrders).toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Por pedido completado</p>
                </CardContent>
              </Card>

              <Card
                className={`backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 hover:border-green-500/50 transition-all shadow-xl`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ganancia Neta</CardTitle>
                  {(statistics.summary.netRevenue - statistics.summary.totalInvestment) >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${(statistics.summary.netRevenue - statistics.summary.totalInvestment) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    ${(statistics.summary.netRevenue - statistics.summary.totalInvestment).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ingresos - Inversión
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">

              {/* Sales by Method */}
              <Card className="border border-white-1 bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Ventas por Método de Pago</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesByMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {salesByMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid #ffffff", borderRadius: "10px" }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    {Object.entries(statistics.summary.salesByMethod).map(([method, data]) => (
                      <div key={method} className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">{method}</span>
                        <span className="text-lg font-bold">${data.net.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">{data.completed.count} ventas</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Selling Products */}
              <Card className="border border-white-1 bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Top 5 Productos Más Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topSellingData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <XAxis type="number" stroke="#ffffff" />
                      <YAxis dataKey="product" type="category" width={100} stroke="#ffffff" fontSize={12} />
                      <RechartsTooltip
                        contentStyle={{ background: "rgba(29, 44, 109, 0.9)", border: "1px solid #ffffff", borderRadius: "10px" }}
                        cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                        formatter={(value: number, name: string) => [name === 'revenue' ? `$${value.toLocaleString()}` : value, name === 'revenue' ? 'Ingresos' : 'Cantidad']}
                      />
                      <Bar dataKey="qtySold" fill="#00C49F" name="Cantidad" radius={[0, 4, 4, 0]} barSize={20} />
                      <Bar dataKey="revenue" fill="#8884d8" name="Ingresos" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Profitability Chart */}
            <Card className="border border-white-1 bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Rentabilidad por Producto (Top 5)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={profitabilityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <RechartsTooltip
                      contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid #ffffff", borderRadius: "10px" }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Ingresos" />
                    <Bar dataKey="cost" fill="#ff7300" name="Costo" />
                    <Bar dataKey="profit" fill="#82ca9d" name="Ganancia" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>


            {/* Inventory & Waste Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Remaining */}
              <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">Mayor Sobrante (Unidades)</CardTitle>
                  <Package className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {statistics.products.topRemaining.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <p className="font-medium">{item.product}</p>
                          <p className="text-xs text-muted-foreground">Inicial: {item.initialQty} | Vendido: {item.sold}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-400">{item.remaining}</span>
                          <p className="text-xs text-muted-foreground">sobrantes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Most Wasted */}
              <Card className="border border-white-1 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">Mayor Desperdicio (%)</CardTitle>
                  <Trash2 className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {statistics.products.mostWasted.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <p className="font-medium">{item.product}</p>
                          <p className="text-xs text-muted-foreground">Inicial: {item.initialQty} | Restante: {item.remaining}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-red-400">{item.wastedPercentage.toFixed(1)}%</span>
                          <p className="text-xs text-muted-foreground">desperdicio</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  )
}
