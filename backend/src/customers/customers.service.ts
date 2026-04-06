import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string, companyId: string): Promise<Customer> {
    const customer = this.customersRepository.create({
      ...createCustomerDto,
      created_by: { id: userId } as any,
      company_id: companyId,
    } as any);
    return this.customersRepository.save(customer as any);
  }

  async findAll(companyId: string, search?: string, page = 1, limit = 10): Promise<{ data: Customer[]; total: number }> {
    const skip = (page - 1) * limit;
    const where = search
      ? [
          { company_id: companyId, name: Like(`%${search}%`) },
          { company_id: companyId, company_name: Like(`%${search}%`) },
          { company_id: companyId, email: Like(`%${search}%`) },
        ]
      : { company_id: companyId };

    const [data, total] = await this.customersRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['created_by'],
    });

    return { data, total };
  }

  async findOne(id: string, companyId: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id, company_id: companyId },
      relations: ['created_by'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, companyId: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id, companyId);
    Object.assign(customer, updateCustomerDto);
    return this.customersRepository.save(customer);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const customer = await this.findOne(id, companyId);
    customer.is_active = false;
    await this.customersRepository.save(customer);
  }
}
