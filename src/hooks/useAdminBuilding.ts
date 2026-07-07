import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBuildings, loadSavedBuilding, saveBuilding, type BuildingOption } from './useBuildings';

export function useAdminBuilding() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { buildings, loading: buildingsLoading } = useBuildings(isAdmin);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingOption | null>(() =>
    isAdmin ? loadSavedBuilding() : null,
  );

  const buildingId = isAdmin ? selectedBuilding?.id : user?.building_id ?? undefined;
  const buildingName = isAdmin ? selectedBuilding?.name : undefined;
  const needsBuilding = isAdmin && !selectedBuilding;

  const selectBuilding = (building: BuildingOption | null) => {
    setSelectedBuilding(building);
    saveBuilding(building);
  };

  return {
    isAdmin,
    buildings,
    buildingsLoading,
    selectedBuilding,
    selectBuilding,
    buildingId,
    buildingName,
    needsBuilding,
  };
}
