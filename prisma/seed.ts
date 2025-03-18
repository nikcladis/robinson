import {
  PrismaClient,
  RoomType,
  UserRole,
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Password hashing function using bcrypt
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Generate random amenities
const generateAmenities = (count: number = 5): string[] => {
  const allAmenities = [
    "Free WiFi",
    "Pool",
    "Gym",
    "Restaurant",
    "Room Service",
    "Parking",
    "Air Conditioning",
    "Spa",
    "Beachfront",
    "Breakfast",
    "Lounge",
    "Concierge",
    "Business Center",
    "Laundry Service",
    "Kids Club",
    "Tennis Court",
    "Golf Course",
    "Water Sports",
    "Hiking Trails",
    "Ski Access",
  ];
  return faker.helpers.arrayElements(allAmenities, count);
};

// Generate random room type
const generateRoomType = (): RoomType => {
  return faker.helpers.arrayElement(Object.values(RoomType));
};

// Generate random booking status
const generateBookingStatus = (): BookingStatus => {
  return faker.helpers.arrayElement(Object.values(BookingStatus));
};

// Generate random payment status
const generatePaymentStatus = (): PaymentStatus => {
  return faker.helpers.arrayElement(Object.values(PaymentStatus));
};

async function main() {
  console.log("Start seeding database...");

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password: await hashPassword("admin123"),
    },
    create: {
      email: "admin@example.com",
      password: await hashPassword("admin123"),
      firstName: "Admin",
      lastName: "User",
      phoneNumber: faker.phone.number(),
      role: UserRole.ADMIN,
    },
  });

  console.log("Created admin user");

  // Generate customers
  const customerCount = 50;
  const customers = await Promise.all(
    Array.from({ length: customerCount }, async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return prisma.user.create({
        data: {
          email: faker.internet.email({ firstName, lastName }),
          password: await hashPassword("password123"),
          firstName,
          lastName,
          phoneNumber: faker.phone.number(),
          role: UserRole.CUSTOMER,
        },
      });
    })
  );

  console.log(`Created ${customerCount} customers`);

  // Generate hotels
  const hotelCount = 20;
  const hotels = await Promise.all(
    Array.from({ length: hotelCount }, async () => {
      const city = faker.location.city();
      const country = faker.location.country();
      return prisma.hotel.create({
        data: {
          name: faker.company.name(),
          description: faker.lorem.paragraphs(3),
          address: faker.location.streetAddress(),
          city,
          country,
          postalCode: faker.location.zipCode(),
          imageUrl: faker.image.urlPicsumPhotos({ width: 800, height: 600 }),
          starRating: faker.number.int({ min: 1, max: 5 }),
          amenities: generateAmenities(faker.number.int({ min: 5, max: 10 })),
        },
      });
    })
  );

  console.log(`Created ${hotelCount} hotels`);

  // Generate rooms for each hotel
  const rooms = await Promise.all(
    hotels.flatMap((hotel) =>
      Array.from(
        { length: faker.number.int({ min: 10, max: 30 }) },
        (_, index) =>
          prisma.room.create({
            data: {
              hotelId: hotel.id,
              roomNumber: `${index + 1}`.padStart(3, "0"),
              roomType: generateRoomType(),
              price: Number(
                faker.number.float({ min: 100, max: 1000, fractionDigits: 2 })
              ),
              capacity: faker.number.int({ min: 2, max: 6 }),
              available: faker.datatype.boolean(),
              amenities: generateAmenities(
                faker.number.int({ min: 3, max: 6 })
              ),
              imageUrl: faker.image.urlPicsumPhotos({
                width: 800,
                height: 600,
              }),
            },
          })
      )
    )
  );

  console.log(`Created ${rooms.length} rooms`);

  // Generate reviews
  const reviews = await Promise.all(
    hotels.flatMap((hotel) => {
      // Get a random subset of customers for this hotel's reviews
      const reviewers = faker.helpers.arrayElements(
        customers,
        faker.number.int({ min: 5, max: Math.min(20, customers.length) })
      );

      return reviewers.map((user) =>
        prisma.review.create({
          data: {
            hotelId: hotel.id,
            userId: user.id,
            rating: faker.number.int({ min: 1, max: 5 }),
            comment: faker.lorem.paragraph(),
          },
        })
      );
    })
  );

  console.log(`Created ${reviews.length} reviews`);

  // Generate bookings
  const bookings = await Promise.all(
    rooms.flatMap((room) =>
      Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
        const checkInDate = faker.date.future();
        const checkOutDate = faker.date.future({
          years: 1,
          refDate: checkInDate,
        });
        return prisma.booking.create({
          data: {
            roomId: room.id,
            userId: faker.helpers.arrayElement(customers).id,
            checkInDate,
            checkOutDate,
            numberOfGuests: faker.number.int({ min: 1, max: room.capacity }),
            totalPrice: Number(
              faker.number.float({ min: 100, max: 5000, fractionDigits: 2 })
            ),
            status: generateBookingStatus(),
            paymentStatus: generatePaymentStatus(),
            specialRequests: faker.helpers.maybe(() => faker.lorem.paragraph()),
          },
        });
      })
    )
  );

  console.log(`Created ${bookings.length} bookings`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
