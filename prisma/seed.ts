import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create test users
  const shopOwnerUser = await prisma.user.create({
    data: {
      email: "shop@example.com",
      password: await hash("password123", 10),
      name: "Raj's Mobile Repairs",
      userType: "REPAIR_SHOP_OWNER",
      phone: "+919876543210",
    },
  });

  const technicianUser = await prisma.user.create({
    data: {
      email: "tech@example.com",
      password: await hash("password123", 10),
      name: "Ajay Kumar",
      userType: "TECHNICIAN",
      phone: "+919876543211",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@example.com",
      password: await hash("password123", 10),
      name: "Priya Sharma",
      userType: "CUSTOMER",
      phone: "+919876543212",
    },
  });

  const supplierUser = await prisma.user.create({
    data: {
      email: "supplier@example.com",
      password: await hash("password123", 10),
      name: "Tech Parts India",
      userType: "SUPPLIER",
      phone: "+919876543213",
    },
  });

  // Create repair shop
  const shop = await prisma.repairShop.create({
    data: {
      userId: shopOwnerUser.id,
      name: "Raj's Mobile Repairs",
      description: "Expert mobile repair services",
      gstNumber: "18AABCT1234H1Z0",
      phone: "+919876543210",
      email: "shop@example.com",
      street: "123 Market Street",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India",
      rating: 4.8,
    },
  });

  // Create branch
  const branch = await prisma.branch.create({
    data: {
      repairShopId: shop.id,
      name: "Main Branch",
      street: "123 Market Street",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      phone: "+919876543210",
      email: "main@example.com",
      managerName: "Raj Kumar",
      managerPhone: "+919876543210",
    },
  });

  // Create technician
  const technician = await prisma.technician.create({
    data: {
      userId: technicianUser.id,
      repairShopId: shop.id,
      branchId: branch.id,
      specialization: ["iPhone", "Samsung", "OnePlus"],
      certifications: ["Apple Certified", "Samsung Certified"],
      rating: 4.9,
      totalRepairs: 250,
    },
  });

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
      repairShopId: shop.id,
      preferredBrand: "Apple",
      loyaltyPoints: 500,
      totalSpent: 25000,
    },
  });

  // Create device
  const device = await prisma.device.create({
    data: {
      customerId: customer.id,
      brand: "Apple",
      model: "iPhone 14 Pro Max",
      imei: "123456789012345",
      serialNumber: "F123456789",
      color: "Space Black",
      purchaseDate: new Date("2023-01-15"),
      purchasePrice: 129999,
    },
  });

  // Create device health passport
  await prisma.deviceHealthPassport.create({
    data: {
      deviceId: device.id,
      batteryHealth: 85,
      screenCondition: "GOOD",
      cameraQuality: "EXCELLENT",
      repairCount: 1,
      lastRepairDate: new Date(),
      healthScore: 87,
    },
  });

  // Create warranty
  await prisma.warranty.create({
    data: {
      customerId: customer.id,
      deviceId: device.id,
      type: "MANUFACTURER",
      startDate: new Date("2023-01-15"),
      endDate: new Date("2025-01-15"),
      coverage: ["Manufacturing defects", "Hardware failures"],
      isActive: true,
    },
  });

  // Create supplier
  const supplier = await prisma.supplier.create({
    data: {
      userId: supplierUser.id,
      companyName: "Tech Parts India",
      gstNumber: "18AABCS5555H1Z0",
      street: "45 Trade Park",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
      rating: 4.7,
      isVerified: true,
    },
  });

  // Create spare parts
  const screenPart = await prisma.sparePart.create({
    data: {
      name: "iPhone 14 Pro Max Screen",
      category: "Display",
      deviceBrand: ["Apple"],
      partNumber: "A2849",
      description: "Original OEM display replacement",
      supplierId: supplier.id,
      costPrice: 15000,
      sellingPrice: 22000,
    },
  });

  const batteryPart = await prisma.sparePart.create({
    data: {
      name: "iPhone 14 Pro Max Battery",
      category: "Battery",
      deviceBrand: ["Apple"],
      partNumber: "A2850",
      description: "High-capacity replacement battery",
      supplierId: supplier.id,
      costPrice: 3500,
      sellingPrice: 5500,
    },
  });

  // Create inventory
  await prisma.inventoryItem.create({
    data: {
      repairShopId: shop.id,
      sparePartId: screenPart.id,
      quantity: 5,
      reorderLevel: 2,
      location: "Shelf A1",
    },
  });

  await prisma.inventoryItem.create({
    data: {
      repairShopId: shop.id,
      sparePartId: batteryPart.id,
      quantity: 10,
      reorderLevel: 3,
      location: "Shelf B2",
    },
  });

  // Create repair
  const repair = await prisma.repair.create({
    data: {
      repairShopId: shop.id,
      branchId: branch.id,
      customerId: customer.id,
      deviceId: device.id,
      technicianId: technician.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      issue: "Screen cracked and battery draining fast",
      diagnosis: "Display needs replacement, battery degraded",
      solution: "Replace screen and battery",
      estimatedCost: 27500,
      startDate: new Date(),
    },
  });

  // Create estimate
  await prisma.estimate.create({
    data: {
      repairShopId: shop.id,
      estimateNumber: "EST-001",
      customerId: customer.id,
      issueDescription: "Screen cracked and battery draining fast",
      diagnosis: "Display needs replacement, battery degraded",
      estimatedCost: 27500,
      laborCharge: 2500,
      partsCharge: 25000,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "APPROVED",
    },
  });

  // Create repair parts used
  await prisma.repairPart.create({
    data: {
      repairId: repair.id,
      sparePartId: screenPart.id,
      quantity: 1,
      costPerUnit: 22000,
    },
  });

  await prisma.repairPart.create({
    data: {
      repairId: repair.id,
      sparePartId: batteryPart.id,
      quantity: 1,
      costPerUnit: 5500,
    },
  });

  // Create supply order
  await prisma.supplyOrder.create({
    data: {
      supplierId: supplier.id,
      orderNumber: "ORDER-001",
      status: "DELIVERED",
      totalAmount: 150000,
      deliveryDate: new Date(),
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("Shop Owner: shop@example.com / password123");
  console.log("Technician: tech@example.com / password123");
  console.log("Customer: customer@example.com / password123");
  console.log("Supplier: supplier@example.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
