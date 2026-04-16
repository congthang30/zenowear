import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  create(order: Order): Promise<string>;
  deleteById(id: string): Promise<void>;
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: Order[]; total: number }>;
  findByPaymentReference(reference: string): Promise<Order | null>;
}
