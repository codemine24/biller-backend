import {
  transferQueryValidationConfig,
  transferSearchableFields,
} from "./Transfer.constants";
import { TAuthUser } from "../../interfaces/common";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import {
  CreateTransferPayload,
  UpdateTransferPayload,
} from "./Transfer.interfaces";
import { validDateChecker } from "../../utils/checker";
import queryValidator from "../../utils/query-validator";
import paginationMaker from "../../utils/pagination-maker";
import { prisma } from "../../shared/prisma";
import { Prisma } from "../../../../prisma/generated";

// Helper function to generate unique transfer number
const generateTransferNumber = async (): Promise<string> => {
  const prefix = "TRF";
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  // Get count of transfers today
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await prisma.transfer.count({
    where: {
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });
  
  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}-${year}${month}-${sequence}`;
};

// -------------------------------------- CREATE TRANSFER -----------------------------------
const createTransfer = async (data: CreateTransferPayload, user: TAuthUser) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }

  // Validate from_store belongs to company
  const fromStore = await prisma.store.findFirst({
    where: {
      id: data.from_store_id,
      company_id: user.company_id,
    },
  });

  if (!fromStore) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "From store not found");
  }

  // Validate to_store belongs to company
  const toStore = await prisma.store.findFirst({
    where: {
      id: data.to_store_id,
      company_id: user.company_id,
    },
  });

  if (!toStore) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "To store not found");
  }

  // Validate all products and check inventory in from_store
  for (const item of data.items) {
    const product = await prisma.product.findFirst({
      where: {
        id: item.product_id,
      },
    });

    if (!product) {
      throw new CustomizedError(
        httpStatus.NOT_FOUND,
        `Product with ID ${item.product_id} not found`
      );
    }

    // Check inventory availability in from_store
    const inventory = await prisma.inventory.findUnique({
      where: {
        product_id_store_id: {
          product_id: item.product_id,
          store_id: data.from_store_id,
        },
      },
    });

    if (!inventory || inventory.quantity < item.quantity) {
      throw new CustomizedError(
        httpStatus.BAD_REQUEST,
        `Insufficient inventory for product ${product.name} in source store. Available: ${inventory?.quantity || 0}, Required: ${item.quantity}`
      );
    }
  }

  // Generate transfer number
  const transfer_number = await generateTransferNumber();

  // Create transfer with items in a transaction
  const transfer = await prisma.$transaction(async (tx) => {
    // Create transfer
    const newTransfer = await tx.transfer.create({
      data: {
        transfer_number,
        from_store_id: data.from_store_id,
        to_store_id: data.to_store_id,
        transfer_date: data.transfer_date ? new Date(data.transfer_date) : new Date(),
        status: data.status,
        notes: data.notes,
        creator_id: user.id,
      },
      include: {
        from_store: true,
        to_store: true,
        created_by: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create transfer items
    await tx.transferItem.createMany({
      data: data.items.map((item) => ({
        transfer_id: newTransfer.id,
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    });

    // Update inventory: deduct from source store and add to destination store
    for (const item of data.items) {
      // Deduct from source store
      await tx.inventory.update({
        where: {
          product_id_store_id: {
            product_id: item.product_id,
            store_id: data.from_store_id,
          },
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });

      // Add to destination store (upsert in case it doesn't exist)
      await tx.inventory.upsert({
        where: {
          product_id_store_id: {
            product_id: item.product_id,
            store_id: data.to_store_id,
          },
        },
        update: {
          quantity: {
            increment: item.quantity,
          },
        },
        create: {
          product_id: item.product_id,
          store_id: data.to_store_id,
          quantity: item.quantity,
        },
      });
    }

    return newTransfer;
  });

  // Fetch transfer with items
  const result = await prisma.transfer.findUnique({
    where: { id: transfer.id },
    include: {
      from_store: true,
      to_store: true,
      created_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return result;
};

// -------------------------------------- GET TRANSFERS -------------------------------------
const getTransfers = async (user: TAuthUser, query: Record<string, any>) => {
  if (!user?.company_id) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Your company not found");
  }
  
  const {
    search_term,
    page,
    limit,
    sort_by,
    sort_order,
    from_date,
    to_date,
    ...remainingQuery
  } = query;

  if (sort_by) queryValidator(transferQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(transferQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  // Build where conditions for company's transfers
  const andConditions: Prisma.TransferWhereInput[] = [
    {
      from_store: {
        company_id: user.company_id,
      },
    },
  ];

  if (search_term) {
    andConditions.push({
      OR: transferSearchableFields.map((field) => {
        return {
          [field]: {
            contains: search_term.trim(),
            mode: "insensitive",
          },
        };
      }),
    });
  }

  if (from_date) {
    const date = validDateChecker(from_date, "fromDate");
    andConditions.push({
      transfer_date: {
        gte: date,
      },
    });
  }

  if (to_date) {
    const date = validDateChecker(to_date, "toDate");
    andConditions.push({
      transfer_date: {
        lte: date,
      },
    });
  }

  if (Object.keys(remainingQuery).length) {
    for (const [key, value] of Object.entries(remainingQuery)) {
      queryValidator(transferQueryValidationConfig, key, value);
      andConditions.push({
        [key]: value.includes(",") ? { in: value.split(",") } : value,
      });
    }
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.transfer.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
      include: {
        from_store: true,
        to_store: true,
        created_by: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.transfer.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    data: result,
  };
};

// -------------------------------------- GET TRANSFER (SINGLE) -----------------------------
const getTransfer = async (id: string, company_id: string) => {
  const result = await prisma.transfer.findFirst({
    where: {
      id,
      from_store: {
        company_id,
      },
    },
    include: {
      from_store: true,
      to_store: true,
      created_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!result) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Transfer not found");
  }

  return result;
};

// -------------------------------------- UPDATE TRANSFER -----------------------------------
const updateTransfer = async (
  id: string,
  company_id: string,
  payload: UpdateTransferPayload
) => {
  // Check if transfer exists and belongs to company
  const existingTransfer = await prisma.transfer.findFirst({
    where: {
      id,
      from_store: {
        company_id,
      },
    },
  });

  if (!existingTransfer) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Transfer not found");
  }

  // Validate from_store if provided
  if (payload.from_store_id) {
    const fromStore = await prisma.store.findFirst({
      where: {
        id: payload.from_store_id,
        company_id,
      },
    });

    if (!fromStore) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "From store not found");
    }
  }

  // Validate to_store if provided
  if (payload.to_store_id) {
    const toStore = await prisma.store.findFirst({
      where: {
        id: payload.to_store_id,
        company_id,
      },
    });

    if (!toStore) {
      throw new CustomizedError(httpStatus.NOT_FOUND, "To store not found");
    }
  }

  // Update transfer with items in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update transfer
    const updatedTransfer = await tx.transfer.update({
      where: { id },
      data: {
        from_store_id: payload.from_store_id,
        to_store_id: payload.to_store_id,
        transfer_date: payload.transfer_date ? new Date(payload.transfer_date) : undefined,
        status: payload.status,
        notes: payload.notes,
      },
    });

    // Update items if provided
    if (payload.items) {
      // Delete existing items
      await tx.transferItem.deleteMany({
        where: { transfer_id: id },
      });

      // Create new items
      await tx.transferItem.createMany({
        data: payload.items.map((item) => ({
          transfer_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
    }

    return updatedTransfer;
  });

  // Fetch updated transfer with relations
  const updatedResult = await prisma.transfer.findUnique({
    where: { id },
    include: {
      from_store: true,
      to_store: true,
      created_by: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return updatedResult;
};

// -------------------------------------- DELETE TRANSFER -----------------------------------
const deleteTransfer = async (id: string, company_id: string) => {
  // Check if transfer exists and belongs to company
  const existingTransfer = await prisma.transfer.findFirst({
    where: {
      id,
      from_store: {
        company_id,
      },
    },
  });

  if (!existingTransfer) {
    throw new CustomizedError(httpStatus.NOT_FOUND, "Transfer not found");
  }

  // Delete transfer (items will be deleted automatically due to cascade)
  await prisma.transfer.delete({
    where: { id },
  });

  return { message: "Transfer deleted successfully" };
};

export const TransferServices = {
  createTransfer,
  getTransfers,
  getTransfer,
  updateTransfer,
  deleteTransfer,
};
