import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import {
  CreateOrderBody,
  UpdateOrderBody,
  GetOrderParams,
  UpdateOrderParams,
  DeleteOrderParams,
} from "@workspace/api-zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 8)}${ext}`);
  },
});
const upload = multer({ storage });

const router: IRouter = Router();

router.post("/upload", upload.array("photos"), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const urls = files.map((f) => `${baseUrl}/api/uploads/${f.filename}`);
    res.json({ urls });
  } catch (err) {
    req.log.error({ err }, "Failed to upload files");
    res.status(500).json({ error: "Failed to upload files" });
  }
});

router.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.sendFile(filePath);
});

router.get("/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    res.json(
      orders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        discountAmount: o.discountAmount !== null ? Number(o.discountAmount) : undefined,
        createdAt: o.createdAt.toISOString(),
        photoUrls: o.photoUrls ?? undefined,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const body = CreateOrderBody.parse(req.body);
    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: body.customerName,
        whatsappNumber: body.whatsappNumber,
        orderDate: body.orderDate,
        estimatedReadyDate: body.estimatedReadyDate ?? null,
        items: body.items,
        totalAmount: String(body.totalAmount),
        discountAmount: body.discountAmount !== undefined ? String(body.discountAmount) : null,
        status: "pending",
        notes: body.notes ?? null,
        photoUrls: body.photoUrls ?? null,
      })
      .returning();
    res.status(201).json({
      ...order,
      totalAmount: Number(order.totalAmount),
      discountAmount: order.discountAmount !== null ? Number(order.discountAmount) : undefined,
      createdAt: order.createdAt.toISOString(),
      photoUrls: order.photoUrls ?? undefined,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(400).json({ error: "Failed to create order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = GetOrderParams.parse(req.params);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({
      ...order,
      totalAmount: Number(order.totalAmount),
      discountAmount: order.discountAmount !== null ? Number(order.discountAmount) : undefined,
      createdAt: order.createdAt.toISOString(),
      photoUrls: order.photoUrls ?? undefined,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(400).json({ error: "Failed to get order" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const { id } = UpdateOrderParams.parse(req.params);
    const body = UpdateOrderBody.parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    const [order] = await db
      .update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, id))
      .returning();
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({
      ...order,
      totalAmount: Number(order.totalAmount),
      discountAmount: order.discountAmount !== null ? Number(order.discountAmount) : undefined,
      createdAt: order.createdAt.toISOString(),
      photoUrls: order.photoUrls ?? undefined,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update order");
    res.status(400).json({ error: "Failed to update order" });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    const { id } = DeleteOrderParams.parse(req.params);
    await db.delete(ordersTable).where(eq(ordersTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete order");
    res.status(400).json({ error: "Failed to delete order" });
  }
});

export default router;
