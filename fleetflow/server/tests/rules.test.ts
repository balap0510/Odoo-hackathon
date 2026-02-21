import { isCargoValid, isLicenseExpired, calculateROI } from '../src/utils/rules'

describe('Business Rules', () => {
    describe('Cargo Validation', () => {
        it('should return true if cargo is under max capacity', () => {
            expect(isCargoValid(500, 1000)).toBe(true)
        })

        it('should return true if cargo is exactly max capacity', () => {
            expect(isCargoValid(1000, 1000)).toBe(true)
        })

        it('should return false if cargo exceeds max capacity', () => {
            expect(isCargoValid(1500, 1000)).toBe(false)
        })
    })

    describe('License Expiry Check', () => {
        it('should return true if license is expired', () => {
            const pastDate = new Date('2020-01-01')
            const currentDate = new Date('2024-01-01')
            expect(isLicenseExpired(pastDate, currentDate)).toBe(true)
        })

        it('should return false if license is still valid', () => {
            const futureDate = new Date('2028-01-01')
            const currentDate = new Date('2024-01-01')
            expect(isLicenseExpired(futureDate, currentDate)).toBe(false)
        })
    })

    describe('Vehicle ROI Calculation', () => {
        it('should calculate ROI correctly', () => {
            const roi = calculateROI(10000, 1000, 500, 50000)
            // Revenue=10000, Ops=1500, Net=8500
            // 8500 / 50000 = 0.17 * 100 = 17
            expect(roi).toBe(17)
        })

        it('should return 0 when acquisition cost is 0', () => {
            expect(calculateROI(10000, 1000, 500, 0)).toBe(0)
        })
    })
})
