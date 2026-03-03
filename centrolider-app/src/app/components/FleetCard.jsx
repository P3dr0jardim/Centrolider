import { Bell, AlertTriangle, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";


export function FleetCard({
  name,
  description,
  activeVehicles,
  totalVehicles,
  maintenanceAlerts,
  performanceChange,
  imageUrl,
}) {
  const hasAlerts = maintenanceAlerts > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Alert Badge */}
        {hasAlerts && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{maintenanceAlerts}</span>
          </div>
        )}
        
        {/* Notification Icon */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md">
          <Bell className="w-4 h-4 text-gray-700" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Viaturas Ativas</span>
            <span className="text-lg font-semibold text-gray-900">
              {activeVehicles}/{totalVehicles}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{
                width: `${(activeVehicles / totalVehicles) * 100}%`,
              }}
            ></div>
          </div>

          {/* Performance Badge */}
          {performanceChange && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">
                {performanceChange}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {activeVehicles} operacionais
              </span>
            </div>
            {maintenanceAlerts > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">
                  {maintenanceAlerts} alertas
                </span>
              </div>
            )}
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver detalhes →
          </button>
        </div>
      </div>
    </div>
  );
}