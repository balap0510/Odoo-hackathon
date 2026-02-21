import prisma from './src/prisma';

async function main() {
  console.log('Testing Compliance...');
  const c = await prisma.driver.count({ where: { complianceStatus: 'COMPLIANT' as any } });
  console.log('Compliance count:', c);
  
  console.log('Testing Financials...');
  const vehicles = await prisma.vehicle.findMany();
  console.log('Vehicles:', vehicles.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
