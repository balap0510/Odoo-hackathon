export const isCargoValid = (cargoWeight: number, maxCapacityKg: number): boolean => {
    return cargoWeight <= maxCapacityKg;
}

export const isLicenseExpired = (expiryDate: Date, currentDate: Date = new Date()): boolean => {
    return currentDate > expiryDate;
}

export const calculateROI = (revenue: number, maintenanceCost: number, fuelCost: number, acquisitionCost: number): number => {
    if (acquisitionCost <= 0) return 0;
    return ((revenue - (maintenanceCost + fuelCost)) / acquisitionCost) * 100;
}
